import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Code2, Maximize2, Minimize2, Download, Sparkles, Presentation, Zap, FileText, Star } from 'lucide-react';
import { CodeEditor } from './CodeEditor';
import { Header } from './Header';
import { ApiKeyModal } from './ApiKeyModal';
import { AIInputPanel } from './AIInputPanel';
import { defaultSlides } from '../data/slides';
import { useApiKey } from '../hooks/useApiKey';

declare global {
  interface Window {
    MathJax?: {
      typesetPromise?: (elements?: Element[]) => Promise<void>;
    };
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

  const slideWrapperRef = useRef<HTMLDivElement>(null);
  const presentationAreaRef = useRef<HTMLDivElement>(null);

  const { apiKey, selectedModel, hasValidKey, setApiKey, setSelectedModel } = useApiKey();

  // Hiển thị modal API key nếu chưa có key
  useEffect(() => {
    if (!hasValidKey && !isApiKeyModalOpen) {
      setIsApiKeyModalOpen(true);
    }
  }, [hasValidKey]);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (slides.length > 0) {
        if (e.key === 'ArrowRight') nextSlide();
        if (e.key === 'ArrowLeft') prevSlide();
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [slides.length]);

  const nextSlide = () => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
  };

  const prevSlide = () => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  const handleEditorChange = (newContent: string) => {
    setEditorContent(newContent);
    if (slideWrapperRef.current) {
      slideWrapperRef.current.innerHTML = newContent;

      // Re-render MathJax
      if (window.MathJax) {
        window.MathJax.typesetPromise?.([slideWrapperRef.current]);
      }

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
    // Update editor content
    setEditorContent(slidesHtml);

    // Parse slides from HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${slidesHtml}</div>`, 'text/html');
    const slideElements = doc.querySelectorAll('.slide');

    const newSlides = Array.from(slideElements).map((el, index) => ({
      id: index + 1,
      title: el.querySelector('h1, h2')?.textContent || `Slide ${index + 1}`,
      content: el.innerHTML,
    }));

    if (newSlides.length > 0) {
      setSlides(newSlides);
      setCurrentSlide(0);

      // Re-render MathJax after state update
      setTimeout(() => {
        if (window.MathJax && slideWrapperRef.current) {
          window.MathJax.typesetPromise?.([slideWrapperRef.current]);
        }
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
    const htmlTemplate = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài Giảng Slide</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;900&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">

    <!-- MathJax Configuration -->
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
                    return MathJax.startup.defaultPageReady().then(() => {
                        console.log('MathJax loaded successfully');
                    });
                }
            }
        };
    </script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

    <style>
        :root {
            --primary: #2563eb;
            --secondary: #1e40af;
            --accent: #f59e0b;
            --text: #1e293b;
            --bg: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Be Vietnam Pro', sans-serif;
            background: var(--bg);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        #presentation-area {
            position: relative;
            width: 100%;
            max-width: 1200px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .slide-container {
            width: 100%;
            aspect-ratio: 16/9;
            background: white;
            border-radius: 16px;
            box-shadow: 0 25px 80px rgba(0,0,0,0.3);
            position: relative;
            overflow: hidden;
        }

        .slide {
            display: none;
            width: 100%;
            height: 100%;
            padding: 50px 70px;
            flex-direction: column;
            justify-content: center;
            background: white;
        }
        .slide.active { display: flex; }

        /* Animation keyframes */
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeInLeft {
            from { opacity: 0; transform: translateX(-30px); }
            to { opacity: 1; transform: translateX(0); }
        }

        @keyframes highlightGlow {
            0%, 100% { box-shadow: 0 0 0 rgba(37, 99, 235, 0); }
            50% { box-shadow: 0 0 20px rgba(37, 99, 235, 0.3); }
        }

        /* Staggered animations for slide elements */
        .slide.active > * {
            opacity: 0;
            animation: fadeInUp 0.6s ease forwards;
        }

        .slide.active > h1, .slide.active > h2 {
            animation: fadeInLeft 0.7s ease forwards;
        }

        .slide.active > *:nth-child(1) { animation-delay: 0.1s; }
        .slide.active > *:nth-child(2) { animation-delay: 0.25s; }
        .slide.active > *:nth-child(3) { animation-delay: 0.4s; }
        .slide.active > *:nth-child(4) { animation-delay: 0.55s; }
        .slide.active > *:nth-child(5) { animation-delay: 0.7s; }
        .slide.active > *:nth-child(6) { animation-delay: 0.85s; }

        /* List item animations */
        .slide.active ul li, .slide.active ol li {
            opacity: 0;
            animation: fadeInUp 0.5s ease forwards;
        }

        .slide.active ul li:nth-child(1), .slide.active ol li:nth-child(1) { animation-delay: 0.3s; }
        .slide.active ul li:nth-child(2), .slide.active ol li:nth-child(2) { animation-delay: 0.45s; }
        .slide.active ul li:nth-child(3), .slide.active ol li:nth-child(3) { animation-delay: 0.6s; }
        .slide.active ul li:nth-child(4), .slide.active ol li:nth-child(4) { animation-delay: 0.75s; }
        .slide.active ul li:nth-child(5), .slide.active ol li:nth-child(5) { animation-delay: 0.9s; }
        .slide.active ul li:nth-child(6), .slide.active ol li:nth-child(6) { animation-delay: 1.05s; }

        /* Typography */
        .slide h1 { 
            font-size: 3.2rem; font-weight: 800; color: var(--primary); 
            margin-bottom: 25px; line-height: 1.2;
        }
        .slide h2 { 
            font-size: 2.4rem; font-weight: 700; color: var(--secondary); 
            margin-bottom: 35px; border-bottom: 4px solid var(--accent); 
            display: inline-block; padding-bottom: 12px; 
        }
        .slide ul, .slide ol { font-size: 1.4rem; line-height: 1.8; padding-left: 45px; color: var(--text); }
        .slide li { margin-bottom: 18px; }
        .slide li::marker { color: var(--primary); font-weight: bold; }
        .slide p { font-size: 1.35rem; margin-bottom: 22px; line-height: 1.7; color: var(--text); }

        /* Math formulas styling */
        .MathJax { font-size: 1.1em !important; }
        mjx-container { margin: 5px 0 !important; }

        /* Box styling */
        .box, [style*="border-left"] {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border-left: 5px solid var(--primary);
            padding: 25px 30px; margin: 25px 0;
            border-radius: 0 12px 12px 0; font-size: 1.25rem;
            box-shadow: 0 4px 15px rgba(37, 99, 235, 0.1);
        }

        /* Controls */
        .controls {
            margin-top: 25px; background: rgba(255,255,255,0.95);
            padding: 12px 28px; border-radius: 50px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.15);
            display: flex; gap: 18px; align-items: center;
            backdrop-filter: blur(10px);
        }
        .btn {
            border: none; background: transparent; cursor: pointer;
            font-size: 1.3rem; color: var(--text); padding: 10px 14px;
            border-radius: 50%; transition: all 0.3s ease;
        }
        .btn:hover { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; transform: scale(1.1);
        }
        #slide-counter { font-weight: 700; font-size: 1.1rem; min-width: 70px; text-align: center; color: var(--secondary); }

        @media (max-width: 768px) {
            body { padding: 10px; }
            .slide { padding: 30px 40px; }
            .slide h1 { font-size: 2.2rem; }
            .slide h2 { font-size: 1.8rem; }
            .slide ul, .slide ol, .slide p { font-size: 1.1rem; }
        }
    </style>
</head>
<body>
    <div id="presentation-area">
        <div class="slide-container" id="slide-wrapper">
${editorContent}
        </div>

        <div class="controls">
            <button class="btn" onclick="prevSlide()" title="Slide trước"><i class="fas fa-chevron-left"></i></button>
            <span id="slide-counter">1 / ${slides.length}</span>
            <button class="btn" onclick="nextSlide()" title="Slide sau"><i class="fas fa-chevron-right"></i></button>
            <span style="color:#ccc; margin: 0 5px;">|</span>
            <button class="btn" onclick="toggleFullscreen()" title="Toàn màn hình"><i class="fas fa-expand"></i></button>
        </div>
    </div>

    <script>
        let currentSlide = 0;
        let slides = document.querySelectorAll('.slide');

        function showSlide(index) {
            slides.forEach(s => {
                s.classList.remove('active');
                s.style.animation = 'none';
                s.offsetHeight;
                s.style.animation = null;
            });
            if (index >= slides.length) index = 0;
            if (index < 0) index = slides.length - 1;
            currentSlide = index;
            const activeSlide = slides[currentSlide];
            activeSlide.classList.add('active');
            if (window.MathJax && window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise([activeSlide]).catch(err => console.log('MathJax error:', err));
            }
            document.getElementById('slide-counter').innerText = (currentSlide + 1) + ' / ' + slides.length;
        }

        function nextSlide() { showSlide(currentSlide + 1); }
        function prevSlide() { showSlide(currentSlide - 1); }
        function toggleFullscreen() {
            if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); }
            else { document.exitFullscreen(); }
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); nextSlide(); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); prevSlide(); }
            if (e.key === 'f' || e.key === 'F') toggleFullscreen();
        });

        window.addEventListener('load', () => {
            showSlide(0);
            if (window.MathJax && window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise().then(() => console.log('MathJax initial render complete'));
            }
        });
    </script>
</body>
</html>`;

    const blob = new Blob([htmlTemplate], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bai-giang-slide.html';
    a.click();
  };

  // Welcome Screen when no slides
  const WelcomeScreen = () => (
    <div className="w-full h-full flex items-center justify-center bg-grid">
      <div className="text-center animate-slideUp max-w-3xl px-8">
        {/* Floating Icon */}
        <div className="relative inline-flex items-center justify-center mb-8">
          <div className="absolute w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full blur-3xl opacity-30 animate-pulse"></div>
          <div className="relative p-6 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl animate-float">
            <Presentation className="w-16 h-16 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI Slide Generator
          </span>
        </h1>

        <p className="text-xl text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
          Tạo bài thuyết trình chuyên nghiệp chỉ trong vài giây với sức mạnh của Gemini AI
        </p>

        {/* CTA Button */}
        <button
          onClick={() => setIsAIInputOpen(true)}
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold text-lg rounded-2xl shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-300 hover:scale-105 animate-pulse-glow"
        >
          <Sparkles className="w-6 h-6 group-hover:animate-spin" />
          <span>Bắt Đầu Tạo Slide</span>
          <Zap className="w-5 h-5" />
        </button>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<FileText className="w-6 h-6" />}
            title="Tải PDF"
            description="Upload SGK, tài liệu và để AI xử lý"
          />
          <FeatureCard
            icon={<Sparkles className="w-6 h-6" />}
            title="AI Thông Minh"
            description="Gemini AI tạo nội dung chất lượng"
          />
          <FeatureCard
            icon={<Star className="w-6 h-6" />}
            title="Thiết Kế Đẹp"
            description="Slide chuyên nghiệp, sẵn sàng trình bày"
          />
        </div>
      </div>
    </div>
  );

  const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
    <div className="glass rounded-2xl p-6 text-left hover:bg-white/10 transition-all duration-300 group cursor-default">
      <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm">{description}</p>
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
        <div
          ref={presentationAreaRef}
          className="flex-1 flex flex-col items-center justify-center transition-all duration-300"
        >
          {slides.length === 0 ? (
            <WelcomeScreen />
          ) : (
            <div className="relative w-full h-full flex items-center justify-center p-6">
              {/* Slide Container with glassmorphism */}
              <div
                ref={slideWrapperRef}
                className="w-full max-w-5xl aspect-video glass-light rounded-2xl shadow-2xl overflow-hidden relative animate-fadeIn"
              >
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 p-10 md:p-16 flex flex-col justify-center transition-all duration-500 ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                      }`}
                    dangerouslySetInnerHTML={{ __html: slide.content }}
                  />
                ))}
                <div className="absolute bottom-4 right-6 text-sm text-slate-500 font-semibold bg-white/80 px-3 py-1 rounded-full">
                  {currentSlide + 1} / {slides.length}
                </div>
              </div>

              {/* Control Bar */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 glass px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 z-50">
                <button
                  onClick={prevSlide}
                  className="p-2.5 hover:bg-white/20 rounded-full transition-all text-white"
                  title="Slide trước"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-bold text-white min-w-16 text-center">
                  {currentSlide + 1} / {slides.length}
                </span>
                <button
                  onClick={nextSlide}
                  className="p-2.5 hover:bg-white/20 rounded-full transition-all text-white"
                  title="Slide sau"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-white/20 mx-1" />
                <button
                  onClick={() => setIsAIInputOpen(true)}
                  className="p-2.5 hover:bg-purple-500/30 rounded-full transition-all text-purple-300"
                  title="Tạo Slide với AI"
                >
                  <Sparkles className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsEditorOpen(!isEditorOpen)}
                  className="p-2.5 hover:bg-blue-500/30 rounded-full transition-all text-blue-300"
                  title="Sửa Code"
                >
                  <Code2 className="w-5 h-5" />
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="p-2.5 hover:bg-white/20 rounded-full transition-all text-white"
                  title="Toàn màn hình"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-5 h-5" />
                  ) : (
                    <Maximize2 className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={downloadHTML}
                  className="p-2.5 hover:bg-green-500/30 rounded-full transition-all text-green-300"
                  title="Tải về"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {isEditorOpen && (
          <CodeEditor content={editorContent} onChange={handleEditorChange} />
        )}
      </div>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        selectedModel={selectedModel}
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
        onSlidesGenerated={handleSlidesGenerated}
        onOpenApiKeyModal={() => {
          setIsAIInputOpen(false);
          setIsApiKeyModalOpen(true);
        }}
      />
    </div>
  );
}
