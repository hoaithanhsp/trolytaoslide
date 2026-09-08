import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Code2, Maximize2, Minimize2, Download, Sparkles, Zap, FileText, Star, FileSliders, Calculator, Eye } from 'lucide-react';
import { CodeEditor } from './CodeEditor';
import { Header } from './Header';
import { ApiKeyModal } from './ApiKeyModal';
import { AIInputPanel } from './AIInputPanel';
import { defaultSlides } from '../data/slides';
import { useApiKey } from '../hooks/useApiKey';
import { generatePptx, generatePptxWithMath, filterSlidesForPptx } from '../services/pptxService';
import { ensureStepItemsInHtml } from '../services/geminiService';

declare global {
  interface Window {
    renderMathInElement?: (
      element: Element,
      options?: {
        delimiters?: Array<{ left: string; right: string; display: boolean }>;
        throwOnError?: boolean;
      }
    ) => void;
    MathJax?: {
      typesetPromise?: (elements?: Element[]) => Promise<void>;
      typeset?: () => void;
      startup?: {
        promise?: Promise<void>;
      };
    };
    renderMathContent?: (element?: Element | null) => void;
    reRenderMath?: (element?: Element | null) => void;
  }
}

export function SlidePresentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState(defaultSlides);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editorContent, setEditorContent] = useState(
    slides.map(s => `<section class="slide">${s.content}</section>`).join('\n')
  );
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isAIInputOpen, setIsAIInputOpen] = useState(false);
  const [isExportingMath, setIsExportingMath] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [activeTotalSteps, setActiveTotalSteps] = useState<number>(0);

  const slideWrapperRef = useRef<HTMLDivElement>(null);
  const presentationAreaRef = useRef<HTMLDivElement>(null);

  const {
    apiKey,
    selectedModel,
    provider,
    geminiKey,
    agentPlatformKey,
    hasValidKey,
    isLoaded,
    setApiKey,
    setSelectedModel,
    setProvider,
  } = useApiKey();

  // Hiển thị modal API key nếu chưa có key (chỉ sau khi đã load từ localStorage)
  useEffect(() => {
    if (isLoaded && !hasValidKey && !isApiKeyModalOpen) {
      setIsApiKeyModalOpen(true);
    }
  }, [isLoaded, hasValidKey]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Chuyển sang slide tiếp theo
  const nextSlide = useCallback(() => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      setCurrentStep(0);
    }
  }, [slides.length]);

  // Lùi về slide trước đó
  const prevSlide = useCallback(() => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      setCurrentStep(0);
    }
  }, [slides.length]);

  // Hiện dòng tiếp theo hoặc sang slide tiếp nếu đã hiện hết dòng
  const nextStepOrSlide = useCallback(() => {
    if (slides.length === 0) return;
    if (!slideWrapperRef.current) return;

    const slideDivs = slideWrapperRef.current.querySelectorAll('[data-slide-index]');
    const activeSlideDiv = slideDivs[currentSlide] as HTMLElement;
    const steps = (activeSlideDiv && currentSlide !== 0)
      ? Array.from(activeSlideDiv.querySelectorAll('.step-item'))
      : [];
    const totalSteps = steps.length;

    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      if (currentSlide < slides.length - 1) {
        setCurrentSlide((prev) => prev + 1);
        setCurrentStep(0);
      }
    }
  }, [currentSlide, currentStep, slides.length]);

  // Lùi lại dòng trước đó hoặc lùi về slide trước
  const prevStepOrSlide = useCallback(() => {
    if (slides.length === 0) return;

    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      if (currentSlide > 0) {
        const prevIdx = currentSlide - 1;
        setCurrentSlide(prevIdx);
        if (slideWrapperRef.current && prevIdx !== 0) {
          const slideDivs = slideWrapperRef.current.querySelectorAll('[data-slide-index]');
          const prevSlideDiv = slideDivs[prevIdx] as HTMLElement;
          const prevSteps = prevSlideDiv ? Array.from(prevSlideDiv.querySelectorAll('.step-item')) : [];
          setCurrentStep(prevSteps.length);
        } else {
          setCurrentStep(0);
        }
      }
    }
  }, [currentSlide, currentStep, slides.length]);

  // Mở toàn bộ nội dung của slide hiện tại
  const revealAllSteps = useCallback(() => {
    if (!slideWrapperRef.current || slides.length === 0) return;
    const slideDivs = slideWrapperRef.current.querySelectorAll('[data-slide-index]');
    const activeSlideDiv = slideDivs[currentSlide] as HTMLElement;
    const steps = activeSlideDiv ? Array.from(activeSlideDiv.querySelectorAll('.step-item')) : [];
    setCurrentStep(steps.length);
  }, [currentSlide, slides.length]);

  // Tự động đếm số step của slide hiện tại
  useEffect(() => {
    if (!slideWrapperRef.current || slides.length === 0) {
      setActiveTotalSteps(0);
      return;
    }
    const timer = setTimeout(() => {
      const slideDivs = slideWrapperRef.current?.querySelectorAll('[data-slide-index]');
      const activeSlideDiv = slideDivs ? (slideDivs[currentSlide] as HTMLElement) : null;
      if (!activeSlideDiv || currentSlide === 0) {
        setActiveTotalSteps(0);
      } else {
        const count = activeSlideDiv.querySelectorAll('.step-item').length;
        setActiveTotalSteps(count);
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [currentSlide, slides]);

  // Cập nhật phím tắt: Space/Enter/Mũi tên Phải/Xuống -> Dòng tiếp; Mũi tên Trái/Lên -> Lùi; A -> Hiện hết
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (isEditorOpen && (e.target as HTMLElement)?.closest('.monaco-editor')) return;

      if (slides.length > 0) {
        if (e.key === 'PageDown' || (e.key === 'ArrowRight' && e.shiftKey)) {
          e.preventDefault();
          nextSlide();
        } else if (e.key === 'PageUp' || (e.key === 'ArrowLeft' && e.shiftKey)) {
          e.preventDefault();
          prevSlide();
        } else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown') {
          e.preventDefault();
          nextStepOrSlide();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          prevStepOrSlide();
        } else if (e.key === 'a' || e.key === 'A') {
          revealAllSteps();
        } else if (e.key === 'f' || e.key === 'F') {
          toggleFullscreen();
        }
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [slides.length, nextStepOrSlide, prevStepOrSlide, nextSlide, prevSlide, revealAllSteps, isEditorOpen]);

  // Kích hoạt KaTeX & MathJax typeset cho slide preview
  const triggerMathJax = (targetElement?: Element | null) => {
    if (typeof window === 'undefined') return;
    const el = targetElement || slideWrapperRef.current;
    if (!el) return;

    // 1. Render KaTeX tức thời nếu có
    if (window.renderMathInElement) {
      try {
        window.renderMathInElement(el, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true },
          ],
          throwOnError: false,
        });
      } catch (err) {
        console.warn('KaTeX preview render error:', err);
      }
    }

    // 2. Gọi MathJax typesetPromise bổ trợ cho công thức phức tạp
    try {
      if (window.MathJax?.typesetPromise) {
        window.MathJax.typesetPromise([el]).catch((err) => {
          console.warn('MathJax preview typeset warning:', err);
        });
      } else if (window.MathJax?.typeset) {
        window.MathJax.typeset();
      }
    } catch (e) {
      console.warn('MathJax preview typeset error:', e);
    }
  };

  // Cung cấp hàm toàn cục cho các script tương tác inline trong slide
  useEffect(() => {
    window.renderMathContent = (el?: Element | null) => triggerMathJax(el);
    window.reRenderMath = (el?: Element | null) => triggerMathJax(el);
  }, []);

  // Tự động lắng nghe thay đổi DOM (như khi click hiện đáp án, đổi innerHTML) để render MathJax ngay lập tức
  useEffect(() => {
    if (!slideWrapperRef.current) return;
    const container = slideWrapperRef.current;

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const scheduleMathJax = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        triggerMathJax(container);
      }, 50);
    };

    const observer = new MutationObserver((mutations) => {
      const isInternalMathMutation = mutations.every((m) => {
        const target = m.target as HTMLElement;
        return (
          target?.tagName?.toLowerCase()?.startsWith('mjx') ||
          target?.classList?.contains('MathJax') ||
          target?.classList?.contains('katex') ||
          target?.closest?.('mjx-container') ||
          target?.closest?.('.MathJax') ||
          target?.closest?.('.katex')
        );
      });

      if (!isInternalMathMutation) {
        scheduleMathJax();
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    // Lắng nghe click: vừa hỗ trợ render MathJax cho nút tương tác, vừa hỗ trợ click chuột trái để hiện dòng tiếp / chuyển slide tiếp
    const handleInteraction = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest('button, .btn, [onclick], input, textarea, select, label, a, [role="button"], .sim-controls');
      if (interactive) {
        setTimeout(scheduleMathJax, 60);
        setTimeout(scheduleMathJax, 200);
        return;
      }

      // Nếu click chuột trái trên slide (không chạm nút tương tác và không mở editor) -> hiện dòng tiếp / chuyển tiếp slide
      if (e.button === 0 && !isEditorOpen) {
        const sel = window.getSelection();
        if (sel && sel.toString().trim().length > 0) return;
        nextStepOrSlide();
      }
    };

    container.addEventListener('click', handleInteraction);

    return () => {
      observer.disconnect();
      container.removeEventListener('click', handleInteraction);
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [currentSlide, slides, isEditorOpen, nextStepOrSlide]);

  // Re-typeset mỗi khi currentSlide, slides hoặc editor thay đổi
  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setTimeout(() => {
      triggerMathJax();
    }, 80);
    return () => clearTimeout(timer);
  }, [currentSlide, slides, isEditorOpen]);

  // Typeset khi MathJax vừa sẵn sàng
  useEffect(() => {
    if (window.MathJax?.startup?.promise) {
      window.MathJax.startup.promise.then(() => {
        triggerMathJax();
      });
    }
  }, []);

  const handleEditorChange = (newContent: string) => {
    setEditorContent(newContent);
    if (slideWrapperRef.current) {
      slideWrapperRef.current.innerHTML = newContent;

      // Re-render MathJax
      triggerMathJax();

      // Update slides array
      const slideElements = slideWrapperRef.current.querySelectorAll('.slide');
      const newSlides = Array.from(slideElements).map((el) => ({
        id: Math.random(),
        title: el.querySelector('h1, h2')?.textContent || 'Untitled',
        content: el.innerHTML,
      }));
      setSlides(newSlides);
      setCurrentSlide(Math.min(currentSlide, newSlides.length - 1));
    }
  };

  const handleSlidesGenerated = (slidesHtml: string) => {
    // Chuẩn hóa đảm bảo các slide nội dung đều có step-item
    const normalizedHtml = ensureStepItemsInHtml(slidesHtml);

    // Update editor content
    setEditorContent(normalizedHtml);

    // Parse slides from HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${normalizedHtml}</div>`, 'text/html');
    const slideElements = doc.querySelectorAll('.slide');

    const newSlides = Array.from(slideElements).map((el, index) => ({
      id: index + 1,
      title: el.querySelector('h1, h2')?.textContent || `Slide ${index + 1}`,
      content: el.innerHTML,
    }));

    if (newSlides.length > 0) {
      setSlides(newSlides);
      setCurrentSlide(0);
      setCurrentStep(0);

      // Re-render MathJax after state update
      setTimeout(() => {
        triggerMathJax();
      }, 100);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && presentationAreaRef.current) {
      presentationAreaRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const downloadHTML = () => {
    const lectureTitle = slides[0]?.title || 'Bài Giảng Slide Tương Tác';
    const slidesDataJson = JSON.stringify(
      slides.map((s, idx) => ({
        id: idx + 1,
        title: s.title || `Slide ${idx + 1}`,
      }))
    );

    const renderedSlidesHtml = slides
      .map((s, idx) => {
        const processedContent = idx === 0 ? s.content : ensureStepItemsInHtml(s.content);
        return `      <!-- ==================== SLIDE ${idx + 1}: ${s.title.replace(/</g, '&lt;')} ==================== -->
      <section class="slide-page absolute inset-0 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-start gap-4 sm:gap-6 overflow-y-auto bg-white text-slate-800 transition-all duration-300 ${
        idx === 0 ? 'active' : ''
      }" data-slide="${idx + 1}" style="${
          idx === 0
            ? 'opacity: 1; pointer-events: auto; z-index: 10;'
            : 'opacity: 0; pointer-events: none; z-index: 0;'
        }">
        ${processedContent}
      </section>`;
      })
      .join('\n\n');

    const htmlTemplate = `<!DOCTYPE html>
<html lang="vi" class="h-full">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${lectureTitle}</title>

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- Font Awesome 6 CDN -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

  <!-- Google Fonts: Be Vietnam Pro & Space Grotesk -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">

  <!-- KaTeX for fast & crisp math rendering -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>

  <!-- MathJax 3 fallback for complex formulas -->
  <script>
    window.MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
        displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
        processEscapes: true,
        processEnvironments: true
      },
      options: {
        skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
      },
      startup: {
        pageReady: () => {
          return MathJax.startup.defaultPageReady();
        }
      }
    };
  </script>
  <script defer id="MathJax-script" src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>

  <style>
    /* Base Presentation Styles */
    body {
      user-select: none;
      -webkit-user-select: none;
      touch-action: pan-y;
      background-color: #020617;
      color: #1e293b;
      font-family: 'Be Vietnam Pro', sans-serif;
    }

    /* 16:9 Presentation Stage - Tự động bung tối đa theo tỉ lệ 16:9 trên màn hình */
    .slide-viewport {
      width: 100%;
      max-width: calc((100vh - 76px) * 16 / 9);
      max-height: calc(100vh - 76px);
      aspect-ratio: 16 / 9;
    }
    :fullscreen .slide-viewport,
    :-webkit-full-screen .slide-viewport {
      max-width: calc((100vh - 66px) * 16 / 9);
      max-height: calc(100vh - 66px);
    }

    /* Glassmorphism Styles */
    .glass-dark {
      background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1px solid rgba(255, 255, 255, 0.14);
    }

    .glass-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(226, 232, 240, 0.85);
    }

    /* Step-by-step reveal: CHỈ ẩn các phần tử có sẵn class .step-item */
    .step-item {
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      opacity: 0;
      transform: translateY(14px);
      pointer-events: none;
    }

    .step-item.revealed {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }

    .step-item.current-focus {
      box-shadow: 0 0 0 2px #6366f1, 0 8px 20px -4px rgba(99, 102, 241, 0.3);
    }

    /* Laser Pointer Dot */
    #laser-pointer {
      position: fixed;
      width: 14px;
      height: 14px;
      background-color: #ef4444;
      border-radius: 50%;
      pointer-events: none;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 12px 4px rgba(239, 68, 68, 0.85), 0 0 24px 8px rgba(239, 68, 68, 0.45);
      z-index: 99999;
      display: none;
      transition: width 0.1s, height 0.1s;
    }

    /* Math Formula Highlight Box */
    .math-box {
      font-family: 'Space Grotesk', sans-serif;
      letter-spacing: 0.02em;
    }

    /* Content styling elements & Dynamic Vertical Distribution */
    .slide-page > h1,
    .slide-page > h2,
    .slide-page > .header-badge {
      flex-shrink: 0;
      margin-bottom: 0;
    }

    /* Triệt tiêu hoàn toàn margin-top: auto và my-auto để không bị đẩy nội dung xuống đáy slide */
    .slide-page .my-auto,
    .slide-page .mt-auto,
    .slide-page [class*="my-auto"],
    .slide-page [class*="mt-auto"] {
      margin-top: 0.5rem !important;
      margin-bottom: 0.5rem !important;
    }

    /* Tự động kéo dãn nội dung lấp đầy không gian slide, không để khoảng trống lớn ở giữa */
    .slide-page > .grid,
    .slide-page > [class*="grid"],
    .slide-page > .two-columns,
    .slide-page > .content-wrapper,
    .slide-page > .simulation,
    .slide-page > ul,
    .slide-page > ol {
      flex: 1 1 0% !important;
      min-height: 0 !important;
    }

    .slide-page > .grid,
    .slide-page > [class*="grid"] {
      display: grid !important;
      align-content: stretch !important;
      align-items: stretch !important;
      gap: 1.5rem !important;
      margin-top: 0.5rem !important;
      margin-bottom: 0.25rem !important;
    }

    .slide-page > .grid > div,
    .slide-page > [class*="grid"] > div {
      height: 100% !important;
      min-height: 0 !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: stretch !important;
      gap: 1rem !important;
    }

    .slide-page > .grid > div > div,
    .slide-page > [class*="grid"] > div > div,
    .slide-page .step-item {
      flex: 1 1 0% !important;
      min-height: 0 !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: center !important;
    }

    /* Typography cân xứng, to rõ ràng cho bài giảng */
    .slide-page h1 {
      font-size: clamp(2.2rem, 3.4vw, 3.2rem);
      font-weight: 800;
      line-height: 1.25;
      color: #0f172a;
      margin-bottom: 0.5rem;
    }
    .slide-page h2 {
      font-size: clamp(1.75rem, 2.5vw, 2.4rem);
      font-weight: 700;
      line-height: 1.3;
      color: #0d9488;
      margin-bottom: 0.5rem;
      border-bottom: 3px solid #14b8a6;
      display: inline-block;
      padding-bottom: 4px;
    }
    .slide-page h3 {
      font-size: clamp(1.3rem, 1.8vw, 1.65rem);
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 0.5rem;
    }
    .slide-page ul, .slide-page ol {
      font-size: clamp(1.2rem, 1.5vw, 1.45rem);
      line-height: 1.8;
      padding-left: 1.75rem;
      margin-bottom: 0.75rem;
    }
    .slide-page li {
      margin-bottom: 0.5rem;
    }
    .slide-page p {
      font-size: clamp(1.2rem, 1.5vw, 1.45rem);
      line-height: 1.75;
      margin-bottom: 0.75rem;
    }

    /* Bảng chân lý / Bảng dữ liệu Toán học */
    .slide-page table {
      width: 100% !important;
      font-size: clamp(1.05rem, 1.3vw, 1.25rem) !important;
      margin: 0.5rem 0 !important;
    }

    .slide-page th {
      padding: 10px 14px !important;
      font-size: clamp(1.1rem, 1.35vw, 1.25rem) !important;
      font-weight: 700 !important;
    }

    .slide-page td {
      padding: 10px 14px !important;
      font-size: clamp(1.05rem, 1.3vw, 1.2rem) !important;
    }

    /* Override các cỡ chữ nhỏ trong slide bài giảng */
    .slide-page .text-xs,
    .slide-page [class*="text-[10px]"],
    .slide-page [class*="text-[11px]"] {
      font-size: clamp(0.95rem, 1.2vw, 1.15rem) !important;
      line-height: 1.6 !important;
    }

    .slide-page .text-sm {
      font-size: clamp(1.1rem, 1.35vw, 1.25rem) !important;
      line-height: 1.65 !important;
    }

    .slide-page .text-base {
      font-size: clamp(1.2rem, 1.5vw, 1.4rem) !important;
      line-height: 1.7 !important;
    }

    .slide-page button {
      font-size: clamp(1.05rem, 1.3vw, 1.2rem) !important;
      padding: 10px 22px !important;
      font-weight: 700 !important;
    }

    .box, [style*="border-left"], [class*="border-l-"] {
      background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%) !important;
      border-left: 5px solid #14b8a6 !important;
      padding: clamp(14px, 1.8vw, 22px) !important;
      border-radius: 0 12px 12px 0;
      margin: 10px 0;
      color: #0f172a !important;
      font-size: clamp(1.15rem, 1.4vw, 1.35rem);
      box-shadow: 0 4px 14px rgba(20, 184, 166, 0.14);
    }

    /* Text emphasis helper classes */
    .text-primary { color: #0284c7 !important; }
    .text-secondary { color: #6366f1 !important; }
    .text-success { color: #059669 !important; }
    .text-warning { color: #d97706 !important; }
    .text-danger { color: #dc2626 !important; }
    .text-pink { color: #db2777 !important; }

    .highlight { background: #fef08a; padding: 2px 6px; border-radius: 4px; }
    .highlight-blue { background: #bae6fd; padding: 2px 6px; border-radius: 4px; }
    .highlight-green { background: #bbf7d0; padding: 2px 6px; border-radius: 4px; }

    .keyword {
      display: inline-block;
      background: #0284c7;
      color: white;
      padding: 3px 10px;
      border-radius: 6px;
      font-weight: 600;
      margin: 2px 4px;
    }

    /* Custom Scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.05);
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(99, 102, 241, 0.4);
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(99, 102, 241, 0.7);
    }
  </style>
</head>
<body class="h-full flex flex-col items-center justify-center overflow-hidden antialiased select-none">

  <!-- Laser Pointer Dot -->
  <div id="laser-pointer"></div>

  <!-- Top Progress Bar -->
  <div class="fixed top-0 left-0 right-0 h-1.5 bg-slate-900 z-50">
    <div id="progress-bar" class="h-full bg-gradient-to-r from-teal-400 via-indigo-500 to-pink-500 w-0 transition-all duration-300 ease-out shadow-sm shadow-indigo-500/50"></div>
  </div>

  <!-- Notification Toast Component -->
  <div id="toast-msg" class="fixed top-5 right-5 z-50 transform -translate-y-24 transition-transform duration-300 glass-dark text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-indigo-500/40">
    <i id="toast-icon" class="fa-solid fa-circle-info text-indigo-400 text-lg"></i>
    <span id="toast-text" class="text-sm font-medium">Thông báo</span>
  </div>

  <!-- Drawer Menu - Danh sách mục lục Slide -->
  <div id="drawer-menu" class="fixed top-0 bottom-0 left-0 w-80 max-w-[85vw] glass-dark text-white z-50 transform -translate-x-full transition-transform duration-300 flex flex-col shadow-2xl border-r border-slate-700/60">
    <div class="p-5 border-b border-slate-700/60 flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <i class="fa-solid fa-list-ul text-teal-400"></i>
        <h3 class="font-bold text-base">Mục Lục Bài Giảng</h3>
      </div>
      <button onclick="toggleDrawer(false)" class="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" title="Đóng menu (Phím M)">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
    <div id="drawer-slide-list" class="flex-1 overflow-y-auto p-4 space-y-2">
      <!-- Generated dynamically in JS -->
    </div>
    <div class="p-4 border-t border-slate-700/60 text-xs text-slate-400 flex items-center justify-between">
      <span>Trợ Lý Tạo Slide Thông Minh</span>
      <kbd class="px-2 py-1 bg-slate-800 rounded border border-slate-700 font-mono">Phím M</kbd>
    </div>
  </div>

  <main class="w-full h-full p-2 sm:p-3 flex-1 flex flex-col items-center justify-center min-h-0">
    <div id="slide-stage" class="slide-viewport w-full bg-slate-900 rounded-3xl shadow-2xl overflow-hidden relative flex flex-col border border-slate-800/80">
${renderedSlidesHtml}
    </div>
  </main>

  <!-- Presenter Toolbar (Floating Control Bar at bottom) -->
  <nav class="fixed bottom-3 sm:bottom-4 z-40 glass-dark text-white px-4 sm:px-6 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 sm:gap-4 border border-slate-700/70">
    <!-- Left Group: Drawer Toggle, Navigation & Slide Counter -->
    <div class="flex items-center gap-2">
      <button onclick="toggleDrawer()" class="p-2.5 rounded-xl hover:bg-slate-800/80 active:scale-95 transition-all text-slate-300 hover:text-teal-400" title="Mở Mục Lục Slide (Phím M)">
        <i class="fa-solid fa-bars text-sm"></i>
      </button>
      <div class="w-px h-5 bg-slate-700/60 hidden sm:block"></div>
      <button onclick="prevStepOrSlide()" class="p-2.5 rounded-xl hover:bg-slate-800/80 active:scale-95 transition-all text-slate-300 hover:text-white" title="Trang trước / Lùi 1 dòng (Mũi tên Trái / Lên)">
        <i class="fa-solid fa-chevron-left text-xs"></i>
      </button>
      <div class="font-math font-semibold text-xs sm:text-sm px-2 min-w-[70px] text-center select-none">
        <span id="slide-num-current" class="text-teal-400 font-bold">01</span> / <span id="slide-num-total">${slides.length}</span>
      </div>
      <button onclick="nextStepOrSlide()" class="p-2.5 rounded-xl hover:bg-slate-800/80 active:scale-95 transition-all text-slate-300 hover:text-white" title="Trang tiếp / Dòng tiếp (Mũi tên Phải / Enter)">
        <i class="fa-solid fa-chevron-right text-xs"></i>
      </button>
    </div>

    <!-- Center Primary Action: Dòng Tiếp Button & Step Indicator -->
    <div class="flex items-center gap-2">
      <button onclick="nextStepOrSlide()" class="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 via-indigo-600 to-teal-600 hover:from-teal-600 hover:to-indigo-700 text-white font-bold transition-all shadow-lg shadow-teal-500/25 flex items-center gap-2 active:scale-95 border border-white/20" title="Hiện dòng tiếp / Trang tiếp (Click chuột trái trên slide / Space / Enter / Mũi tên Xuống)">
        <span>Dòng Tiếp</span>
        <i class="fa-solid fa-forward-step text-xs"></i>
      </button>
      <div class="px-3 py-2 rounded-xl glass-dark font-medium text-[11px] border border-slate-700/60 shadow-lg text-slate-300 hidden sm:flex items-center gap-1">
        <i class="fa-solid fa-bars-progress text-teal-400"></i>
        <span>Dòng: <span id="step-counter-text" class="font-math font-bold text-white">0 / 0</span></span>
      </div>
    </div>

    <!-- Right Group: Teacher Toolset (Hiện Hết, Laser, Toàn màn hình) -->
    <div class="flex items-center gap-1 sm:gap-2">
      <button onclick="revealAllCurrentSlide()" class="px-3 py-2 rounded-xl hover:bg-slate-800/80 transition-all font-medium border border-slate-700/60 shadow-lg active:scale-95 flex items-center gap-1.5 text-xs text-emerald-300" title="Hiện toàn bộ nội dung slide hiện tại (Phím A)">
        <i class="fa-solid fa-eye text-emerald-400"></i>
        <span class="hidden md:inline">Hiện Hết</span>
      </button>
      <button id="btn-laser" onclick="toggleLaser()" class="px-3 py-2 rounded-xl hover:bg-slate-800/80 transition-all font-medium border border-slate-700/60 shadow-lg active:scale-95 flex items-center gap-1.5 text-xs text-rose-300" title="Bật/Tắt Con trỏ Laser ảo (Phím L)">
        <i class="fa-solid fa-crosshairs text-red-400"></i>
        <span class="hidden md:inline">Laser</span>
      </button>
      <button onclick="toggleFullScreen()" class="p-2.5 rounded-xl hover:bg-slate-800/80 transition-all font-medium border border-slate-700/60 shadow-lg active:scale-95 text-amber-400 text-xs" title="Toàn màn hình (Phím F)">
        <i class="fa-solid fa-expand"></i>
      </button>
    </div>
  </nav>

  <script>
    /* ==========================================================================
       1. WEB AUDIO API SYNTHESIS (Zero External Audio File Dependencies)
       ========================================================================== */
    let audioCtx = null;
    function getAudioContext() {
      if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    }

    function playStepSound() {
      try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.06);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
      } catch (e) {
        console.warn('Audio play restricted:', e);
      }
    }

    /* ==========================================================================
       2. PRESENTATION ENGINE & STATE MANAGEMENT
       ========================================================================== */
    const slidePages = Array.from(document.querySelectorAll('.slide-page'));
    const totalSlides = slidePages.length;
    let currentSlideIndex = 0;
    let currentStepOnSlide = 0;
    let isLaserActive = false;

    const slidesMetadata = ${slidesDataJson};

    function initDrawer() {
      const listContainer = document.getElementById('drawer-slide-list');
      if (!listContainer) return;
      listContainer.innerHTML = '';
      slidesMetadata.forEach((s, idx) => {
        const btn = document.createElement('button');
        const isActive = idx === currentSlideIndex;
        btn.className = 'w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors ' +
          (isActive
            ? 'bg-teal-600 text-white font-bold shadow-md'
            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white');
        btn.innerHTML =
          '<span class="truncate pr-2"><span class="font-mono text-xs opacity-75 mr-2">' +
          String(idx + 1).padStart(2, '0') + '.</span>' +
          (s.title || 'Slide ' + (idx + 1)) +
          '</span>' +
          '<i class="fa-solid fa-arrow-right text-xs opacity-50"></i>';
        btn.onclick = () => {
          goToSlide(idx);
          toggleDrawer(false);
        };
        listContainer.appendChild(btn);
      });
    }

    function toggleDrawer(forceState) {
      const drawer = document.getElementById('drawer-menu');
      if (!drawer) return;
      const isClosed = drawer.classList.contains('-translate-x-full');
      const shouldOpen = forceState !== undefined ? forceState : isClosed;
      if (shouldOpen) {
        drawer.classList.remove('-translate-x-full');
      } else {
        drawer.classList.add('-translate-x-full');
      }
    }

    function getStepsForSlide(slideEl) {
      if (!slideEl) return [];
      // CHỈ lấy các phần tử có class step-item được đánh dấu sẵn
      return Array.from(slideEl.querySelectorAll('.step-item'));
    }

    function updateStepBadge(totalSteps) {
      const counterEl = document.getElementById('step-counter-text');
      if (counterEl) {
        counterEl.innerText = currentStepOnSlide + ' / ' + totalSteps;
      }
    }

    function updateSlideView() {
      if (totalSlides === 0) return;

      slidePages.forEach((page, idx) => {
        if (idx === currentSlideIndex) {
          page.style.opacity = '1';
          page.style.pointerEvents = 'auto';
          page.style.zIndex = '10';
          page.classList.add('active');
        } else {
          page.style.opacity = '0';
          page.style.pointerEvents = 'none';
          page.style.zIndex = '0';
          page.classList.remove('active');
        }
      });

      // Update counters
      const currNumEl = document.getElementById('slide-num-current');
      if (currNumEl) {
        currNumEl.innerText = String(currentSlideIndex + 1).padStart(2, '0');
      }

      // Update Top Progress Bar
      const progBar = document.getElementById('progress-bar');
      if (progBar && totalSlides > 0) {
        const percent = ((currentSlideIndex + 1) / totalSlides) * 100;
        progBar.style.width = percent + '%';
      }

      // Quản lý steps của slide hiện tại
      const activeSlide = slidePages[currentSlideIndex];
      const steps = getStepsForSlide(activeSlide);
      const totalSteps = steps.length;

      // Xóa focus cũ
      steps.forEach((st) => st.classList.remove('current-focus'));

      if (totalSteps > 0) {
        steps.forEach((st, idx) => {
          if (idx < currentStepOnSlide) {
            st.classList.add('revealed');
          } else {
            st.classList.remove('revealed');
          }
        });
        if (currentStepOnSlide > 0 && currentStepOnSlide <= totalSteps) {
          steps[currentStepOnSlide - 1].classList.add('current-focus');
        }
      }
      updateStepBadge(totalSteps);

      // Re-render MathJax / KaTeX
      renderMathContent(activeSlide);

      // Cập nhật drawer list
      initDrawer();
    }

    function renderMathContent(element) {
      // Ưu tiên KaTeX auto-render nếu có
      if (window.renderMathInElement && element) {
        try {
          window.renderMathInElement(element, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false },
              { left: '\\\\(', right: '\\\\)', display: false },
              { left: '\\\\[', right: '\\\\]', display: true }
            ],
            throwOnError: false
          });
        } catch (e) {
          console.warn('KaTeX render warning:', e);
        }
      }

      // Gọi MathJax typesetPromise bổ trợ
      if (window.MathJax && window.MathJax.typesetPromise && element) {
        window.MathJax.typesetPromise([element]).catch(function(err) {
          console.warn('MathJax typeset warning:', err);
        });
      }
    }

    function nextStepOrSlide() {
      const activeSlide = slidePages[currentSlideIndex];
      const steps = getStepsForSlide(activeSlide);
      const totalSteps = steps.length;

      // Nếu còn step chưa hiện
      if (currentStepOnSlide < totalSteps) {
        currentStepOnSlide++;
        const stepToReveal = steps[currentStepOnSlide - 1];
        stepToReveal.classList.add('revealed');

        steps.forEach((st) => st.classList.remove('current-focus'));
        stepToReveal.classList.add('current-focus');

        updateStepBadge(totalSteps);
        playStepSound();
        renderMathContent(stepToReveal);
      } else {
        // Đã hết step (hoặc slide không có step-item), chuyển sang slide tiếp
        if (currentSlideIndex < totalSlides - 1) {
          currentSlideIndex++;
          currentStepOnSlide = 0;
          updateSlideView();
          playStepSound();
        } else {
          showToast('Bạn đang ở slide cuối cùng!', 'info');
        }
      }
    }

    function prevStepOrSlide() {
      const activeSlide = slidePages[currentSlideIndex];
      const steps = getStepsForSlide(activeSlide);
      const totalSteps = steps.length;

      if (currentStepOnSlide > 0) {
        currentStepOnSlide--;
        const stepToHide = steps[currentStepOnSlide];
        stepToHide.classList.remove('revealed', 'current-focus');

        if (currentStepOnSlide > 0) {
          steps[currentStepOnSlide - 1].classList.add('current-focus');
        }
        updateStepBadge(totalSteps);
      } else {
        // Lùi về slide trước
        if (currentSlideIndex > 0) {
          currentSlideIndex--;
          const prevSlideEl = slidePages[currentSlideIndex];
          const prevSteps = getStepsForSlide(prevSlideEl);
          // Mở sẵn các step ở slide trước khi lùi lại
          currentStepOnSlide = prevSteps.length;
          prevSteps.forEach((st) => st.classList.add('revealed'));
          updateSlideView();
        }
      }
    }

    function goToSlide(index) {
      if (index >= 0 && index < totalSlides) {
        currentSlideIndex = index;
        currentStepOnSlide = 0;
        updateSlideView();
      }
    }

    function revealAllCurrentSlide() {
      const activeSlide = slidePages[currentSlideIndex];
      const steps = getStepsForSlide(activeSlide);
      steps.forEach((st) => {
        st.classList.add('revealed');
        st.classList.remove('current-focus');
      });
      currentStepOnSlide = steps.length;
      updateStepBadge(steps.length);
      playStepSound();
      showToast('Đã mở toàn bộ nội dung trang!', 'success');
    }

    function toggleFullScreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    }

    // Laser pointer
    const laserDot = document.getElementById('laser-pointer');
    const laserBtn = document.getElementById('btn-laser');

    function toggleLaser() {
      isLaserActive = !isLaserActive;
      if (isLaserActive) {
        if (laserDot) laserDot.style.display = 'block';
        if (laserBtn) {
          laserBtn.classList.add('bg-red-600', 'text-white');
        }
        showToast('Laser Pointer: ĐÃ BẬT (Phím L)', 'info');
      } else {
        if (laserDot) laserDot.style.display = 'none';
        if (laserBtn) {
          laserBtn.classList.remove('bg-red-600', 'text-white');
        }
        showToast('Laser Pointer: ĐÃ TẮT', 'info');
      }
    }

    window.addEventListener('mousemove', (e) => {
      if (isLaserActive && laserDot) {
        laserDot.style.left = e.clientX + 'px';
        laserDot.style.top = e.clientY + 'px';
      }
    });

    // Toast notification
    let toastTimeout = null;
    function showToast(message, type) {
      const toast = document.getElementById('toast-msg');
      const toastText = document.getElementById('toast-text');
      const toastIcon = document.getElementById('toast-icon');
      if (!toast || !toastText || !toastIcon) return;

      toastText.innerText = message;
      if (type === 'success') {
        toastIcon.className = 'fa-solid fa-circle-check text-emerald-400 text-lg';
      } else if (type === 'error') {
        toastIcon.className = 'fa-solid fa-circle-xmark text-rose-400 text-lg';
      } else {
        toastIcon.className = 'fa-solid fa-circle-info text-teal-400 text-lg';
      }

      toast.classList.remove('-translate-y-24');
      toast.classList.add('translate-y-0');

      clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        toast.classList.remove('translate-y-0');
        toast.classList.add('-translate-y-24');
      }, 2500);
    }

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.code) {
        case 'Space':
        case 'Enter':
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          nextStepOrSlide();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'Backspace':
          e.preventDefault();
          prevStepOrSlide();
          break;
        case 'KeyA':
          e.preventDefault();
          revealAllCurrentSlide();
          break;
        case 'KeyM':
          e.preventDefault();
          toggleDrawer();
          break;
        case 'KeyL':
          e.preventDefault();
          toggleLaser();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullScreen();
          break;
      }
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchStartY = 0;
    const stage = document.getElementById('slide-stage');
    if (stage) {
      stage.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      }, { passive: true });

      stage.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
          if (diffX < 0) {
            nextStepOrSlide();
          } else {
            prevStepOrSlide();
          }
        }
      }, { passive: true });
    }

    // Cung cấp hàm toàn cục cho các hàm kiểm tra đáp án inline trong slide
    window.renderMathContent = renderMathContent;
    window.reRenderMath = renderMathContent;

    // Tự động lắng nghe thay đổi DOM (như khi click hiện đáp án, đổi innerHTML) để render MathJax ngay lập tức
    if (stage && window.MutationObserver) {
      let mathTimer = null;
      const mathObserver = new MutationObserver(function(mutations) {
        const isInternalMath = mutations.every(function(m) {
          const t = m.target;
          return t && (
            (t.tagName && t.tagName.toLowerCase().startsWith('mjx')) ||
            (t.classList && (t.classList.contains('MathJax') || t.classList.contains('katex'))) ||
            (t.closest && (t.closest('mjx-container') || t.closest('.MathJax') || t.closest('.katex')))
          );
        });
        if (!isInternalMath) {
          clearTimeout(mathTimer);
          mathTimer = setTimeout(function() {
            renderMathContent(stage);
          }, 50);
        }
      });

      mathObserver.observe(stage, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['class', 'style']
      });

      // Xử lý click trên slide: Click chuột trái bất kỳ đâu trên slide để hiện "Dòng Tiếp" / Sang slide tiếp (giống PowerPoint)
      stage.addEventListener('click', function(e) {
        // Chỉ xử lý click chuột trái (button === 0)
        if (e.button !== 0) return;

        // Nếu click vào phần tử tương tác (button, input, controls, link...)
        const interactiveEl = e.target.closest('button, .btn, [onclick], input, textarea, select, label, a, .sim-controls, [role="button"]');
        if (interactiveEl) {
          // Kích hoạt re-render công thức toán nếu tương tác làm thay đổi nội dung
          setTimeout(function() { renderMathContent(stage); }, 60);
          setTimeout(function() { renderMathContent(stage); }, 200);
          return;
        }

        // Bỏ qua nếu người dùng đang bôi đen chọn văn bản
        const sel = window.getSelection();
        if (sel && sel.toString().trim().length > 0) {
          return;
        }

        // Kích hoạt Dòng Tiếp / Chuyển Slide
        nextStepOrSlide();
      });
    }

    // Khởi tạo ban đầu
    window.addEventListener('load', () => {
      updateSlideView();
      initDrawer();
      // Typeset toàn bộ stage lần đầu
      setTimeout(() => {
        renderMathContent(document.getElementById('slide-stage'));
      }, 300);
    });
  </script>
</body>
</html>`;

    const blob = new Blob([htmlTemplate], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bai-giang-slide.html';
    a.click();
  };

  const downloadPPTX = async () => {
    try {
      const pptxSlides = filterSlidesForPptx(slides);
      await generatePptx(pptxSlides, 'bai-giang-slide');
    } catch (error) {
      console.error('Lỗi xuất PPTX:', error);
      alert('Có lỗi khi xuất file PPTX. Vui lòng thử lại.');
    }
  };

  const downloadPPTXVisual = async () => {
    try {
      setIsExportingMath(true);
      const pptxSlides = filterSlidesForPptx(slides);
      await generatePptxWithMath(pptxSlides, 'bai-giang-slide-visual');
    } catch (error) {
      console.error('Lỗi xuất PPTX trực quan:', error);
      alert('Có lỗi khi xuất file PPTX. Vui lòng thử lại.');
    } finally {
      setIsExportingMath(false);
    }
  };

  // Welcome Screen when no slides
  const WelcomeScreen = () => (
    <div className="w-full h-full flex items-center justify-center overflow-y-auto py-8 bg-grid relative">
      {/* Decorative circles */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl animate-breathe"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl animate-breathe" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl animate-pulse"></div>

      <div className="text-center animate-slideUp max-w-5xl px-6 relative z-10">
        {/* Welcome Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-full mb-8 border border-teal-400/30 glow-teal">
          <Sparkles className="w-4 h-4 text-teal-300" />
          <span className="text-sm font-medium text-teal-200">Powered by Gemini AI</span>
        </div>

        {/* Main Greeting */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight text-shadow">
          <span className="text-white">Chào mừng quý </span>
          <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent">Thầy Cô</span>
        </h1>

        <h2 className="text-2xl md:text-3xl font-semibold mb-8">
          <span className="bg-gradient-to-r from-teal-300 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
            đến với Trợ Lý Tạo Slide Thông Minh
          </span>
        </h2>

        <p className="text-lg text-teal-100/80 mb-12 max-w-2xl mx-auto leading-relaxed">
          Ứng dụng giúp thầy cô tạo bài giảng slide <span className="text-white font-semibold">chuyên nghiệp</span> chỉ trong vài giây.
          <br />
          Chỉ cần tải lên PDF sách giáo khoa hoặc nhập chủ đề bài học!
        </p>

        {/* CTA Button */}
        <button
          onClick={() => setIsAIInputOpen(true)}
          className="group relative inline-flex items-center justify-center gap-3 px-14 py-6 bg-gradient-to-r from-teal-500 via-teal-400 to-cyan-400 text-teal-950 font-extrabold text-2xl rounded-2xl btn-3d glow-teal transition-all duration-200 mb-14"
        >
          <Sparkles className="w-8 h-8 group-hover:animate-spin" />
          <span className="tracking-wide">Bắt Đầu Tạo Slide Ngay</span>
          <Zap className="w-7 h-7" />
        </button>

        {/* How it works - Steps */}
        <div className="mb-14">
          <h3 className="text-xl font-semibold text-white mb-8 flex items-center justify-center gap-3">
            <span className="w-12 h-0.5 bg-gradient-to-r from-transparent to-teal-400"></span>
            Hướng dẫn sử dụng
            <span className="w-12 h-0.5 bg-gradient-to-l from-transparent to-teal-400"></span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            <StepCard
              step={1}
              title="Nhập API Key"
              description="Nhấn Cài đặt ở góc phải để nhập API Key (Gemini hoặc Agent Platform)"
              icon="🔑"
            />
            <StepCard
              step={2}
              title="Chọn nội dung"
              description="Tải file PDF SGK hoặc nhập chủ đề bài học cần tạo slide"
              icon="📚"
            />
            <StepCard
              step={3}
              title="Nhận slide"
              description="AI sẽ tự động tạo slide đẹp, có thể tải về dạng HTML"
              icon="✨"
            />
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <FeatureCard
            icon={<FileText className="w-6 h-6" />}
            title="Tải PDF"
            description="Upload SGK, giáo án"
            color="from-teal-400 to-cyan-400"
          />
          <FeatureCard
            icon={<Sparkles className="w-6 h-6" />}
            title="AI Gemini"
            description="Tạo nội dung thông minh"
            color="from-cyan-400 to-blue-400"
          />
          <FeatureCard
            icon={<Star className="w-6 h-6" />}
            title="Công thức Toán"
            description="Hỗ trợ LaTeX/MathJax"
            color="from-amber-400 to-orange-400"
          />
          <FeatureCard
            icon={<Download className="w-6 h-6" />}
            title="Tải về HTML"
            description="Sử dụng offline"
            color="from-green-500 to-emerald-500"
          />
        </div>

        {/* Footer note */}
        <p className="mt-10 text-base text-white font-semibold text-shadow">
          💡 Tip: Nhấn phím <kbd className="px-3 py-1.5 bg-gradient-to-b from-slate-600 to-slate-800 rounded-lg text-white font-bold shadow-md border border-slate-500">←</kbd> <kbd className="px-3 py-1.5 bg-gradient-to-b from-slate-600 to-slate-800 rounded-lg text-white font-bold shadow-md border border-slate-500">→</kbd> để chuyển slide,
          <kbd className="px-3 py-1.5 bg-gradient-to-b from-slate-600 to-slate-800 rounded-lg text-white font-bold shadow-md border border-slate-500 ml-2">F</kbd> để toàn màn hình
        </p>
      </div>
    </div>
  );

  const StepCard = ({ step, title, description, icon }: { step: number; title: string; description: string; icon: string }) => (
    <div className="card-3d rounded-xl p-6 text-center transition-all duration-200 group cursor-default">
      <div className="flex items-center justify-center gap-3 mb-4">
        <span className="text-4xl">{icon}</span>
        <span className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg icon-btn-3d">
          {step}
        </span>
      </div>
      <h4 className="text-white font-bold text-lg mb-2 text-shadow">{title}</h4>
      <p className="text-teal-100 text-sm">{description}</p>
    </div>
  );

  const FeatureCard = ({ icon, title, description, color }: { icon: React.ReactNode; title: string; description: string; color: string }) => (
    <div className="card-3d rounded-xl p-5 text-center transition-all duration-200 group cursor-default">
      <div className={`inline-flex items-center justify-center p-4 bg-gradient-to-br ${color} rounded-xl text-white mb-4 group-hover:scale-110 transition-transform icon-btn-3d`}>
        {icon}
      </div>
      <h3 className="text-base font-bold text-white mb-1 text-shadow">{title}</h3>
      <p className="text-teal-100 text-sm">{description}</p>
    </div>
  );

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-grid">
      {/* Header */}
      <Header
        onOpenSettings={() => setIsApiKeyModalOpen(true)}
        hasApiKey={hasValidKey}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden pt-16">
        {/* Slide Preview Area */}
        <div
          ref={presentationAreaRef}
          className={`flex-1 flex flex-col items-center justify-center transition-all duration-300 ${isEditorOpen ? 'w-1/2' : 'w-full'}`}
        >
          {slides.length === 0 ? (
            <WelcomeScreen />
          ) : (
            <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-4">
              {/* Slide Container - Tự động co giãn theo tỉ lệ 16:9 linh hoạt */}
              <div
                ref={slideWrapperRef}
                className={`w-full aspect-video glass-light rounded-2xl shadow-2xl overflow-hidden relative animate-fadeIn transition-all duration-300 ${
                  isFullscreen
                    ? 'max-w-[min(calc(100vw-32px),calc((100vh-48px)*16/9))] max-h-[calc(100vh-48px)]'
                    : isEditorOpen
                    ? 'max-w-2xl'
                    : 'max-w-[min(calc(100vw-48px),calc((100vh-130px)*16/9))] max-h-[calc(100vh-130px)]'
                }`}
              >
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 p-6 sm:p-8 md:p-10 flex flex-col justify-start gap-3 sm:gap-5 transition-all duration-500 overflow-y-auto ${
                      isFullscreen ? 'slide-fullscreen' : ''
                    } ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                    dangerouslySetInnerHTML={{ __html: slide.content }}
                  />
                ))}

                {/* Slide counter badge */}
                <div className="absolute bottom-3 right-4 text-sm text-slate-500 font-semibold bg-white/90 px-3 py-1 rounded-full shadow">
                  {currentSlide + 1} / {slides.length}
                </div>

                {/* Edit mode indicator */}
                {isEditorOpen && (
                  <div className="absolute top-3 left-4 text-xs text-blue-400 bg-blue-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                    Xem mã HTML song song
                  </div>
                )}
              </div>

              {/* Control Bar */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 glass px-4 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-2xl flex items-center gap-2 sm:gap-3 z-50">
                <button
                  onClick={prevStepOrSlide}
                  className="p-2 hover:bg-white/20 rounded-full transition-all text-white"
                  title="Lùi 1 dòng hoặc slide trước (← / ↑)"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-bold text-white min-w-12 text-center text-sm">
                  {currentSlide + 1} / {slides.length}
                </span>
                <button
                  onClick={nextStepOrSlide}
                  className="p-2 hover:bg-white/20 rounded-full transition-all text-white"
                  title="Dòng tiếp hoặc slide sau (→ / ↓ / Space / Enter)"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Nút Dòng Tiếp nổi bật với badge đếm bước */}
                <button
                  onClick={nextStepOrSlide}
                  className="px-3.5 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-teal-500 via-indigo-600 to-teal-600 hover:from-teal-600 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-teal-500/25 flex items-center gap-1.5 active:scale-95 transition-all border border-white/20"
                  title="Hiện dòng tiếp / Trang tiếp (Click chuột trái trên slide / Space / Enter / Mũi tên Phải)"
                >
                  <span>Dòng Tiếp</span>
                  {activeTotalSteps > 0 && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-white/20 font-mono">
                      {currentStep}/{activeTotalSteps}
                    </span>
                  )}
                </button>

                {/* Nút Hiện Hết khi đang giảng bài từng bước */}
                {activeTotalSteps > 0 && currentStep < activeTotalSteps && (
                  <button
                    onClick={revealAllSteps}
                    className="p-2 hover:bg-white/20 rounded-full transition-all text-amber-300"
                    title="Hiện toàn bộ nội dung của slide (Phím A)"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}

                <div className="w-px h-5 bg-white/20" />
                <button
                  onClick={() => setIsAIInputOpen(true)}
                  className="p-2 hover:bg-purple-500/30 rounded-full transition-all text-purple-300"
                  title="Tạo Slide với AI"
                >
                  <Sparkles className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsEditorOpen(!isEditorOpen)}
                  className={`p-2 rounded-full transition-all ${isEditorOpen ? 'bg-blue-500/40 text-blue-200' : 'hover:bg-blue-500/30 text-blue-300'}`}
                  title={isEditorOpen ? "Đóng Editor" : "Mở Editor (song song)"}
                >
                  <Code2 className="w-5 h-5" />
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="p-2 hover:bg-white/20 rounded-full transition-all text-white"
                  title="Toàn màn hình (F)"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-5 h-5" />
                  ) : (
                    <Maximize2 className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={downloadHTML}
                  className="p-2 hover:bg-green-500/30 rounded-full transition-all text-green-300"
                  title="Tải về HTML"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={downloadPPTX}
                  className="p-2 hover:bg-orange-500/30 rounded-full transition-all text-orange-300"
                  title="Tải về PPTX (PowerPoint)"
                >
                  <FileSliders className="w-5 h-5" />
                </button>
                <button
                  onClick={downloadPPTXVisual}
                  disabled={isExportingMath}
                  className={`p-2 hover:bg-purple-500/30 rounded-full transition-all text-purple-300 ${isExportingMath ? 'opacity-50 cursor-wait' : ''}`}
                  title="Tải về PPTX với công thức trực quan"
                >
                  <Calculator className={`w-5 h-5 ${isExportingMath ? 'animate-pulse' : ''}`} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Code Editor Panel - Side by side */}
        {isEditorOpen && slides.length > 0 && (
          <div className="w-1/2 flex flex-col border-l border-slate-200 bg-white">
            {/* Editor Header */}
            <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800">
                <Code2 className="w-4 h-4 text-teal-600" />
                <span className="font-semibold text-sm">HTML Editor</span>
                <span className="text-xs text-slate-500 ml-2">
                  (Slide {currentSlide + 1})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Đồng bộ 2 chiều
                </span>
              </div>
            </div>

            {/* Editor Content */}
            <CodeEditor
              content={editorContent}
              onChange={handleEditorChange}
            />
          </div>
        )}
      </div>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        selectedModel={selectedModel}
        provider={provider}
        geminiKey={geminiKey}
        agentPlatformKey={agentPlatformKey}
        onSelectProvider={setProvider}
        onSaveKey={setApiKey}
        onSelectModel={setSelectedModel}
        forceShow={!hasValidKey}
      />

      {/* AI Input Panel */}
      <AIInputPanel
        isOpen={isAIInputOpen}
        onClose={() => setIsAIInputOpen(false)}
        apiKey={apiKey}
        selectedModel={selectedModel}
        provider={provider}
        onSlidesGenerated={handleSlidesGenerated}
        onOpenApiKeyModal={() => {
          setIsAIInputOpen(false);
          setIsApiKeyModalOpen(true);
        }}
      />
    </div>
  );
}
