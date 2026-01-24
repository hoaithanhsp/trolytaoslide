import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Code2, Maximize2, Minimize2, Download, Sparkles } from 'lucide-react';
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
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
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

    <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

    <style>
        :root {
            --primary: #2563eb;
            --secondary: #1e40af;
            --accent: #f59e0b;
            --text: #1e293b;
            --bg: #f8fafc;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Be Vietnam Pro', sans-serif;
            background: var(--bg);
            height: 100vh;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        #presentation-area {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .slide-container {
            width: 960px;
            height: 540px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.15);
            position: relative;
            overflow: hidden;
        }

        .slide {
            display: none;
            width: 100%;
            height: 100%;
            padding: 40px 60px;
            flex-direction: column;
            justify-content: center;
            animation: fadeIn 0.5s ease;
        }
        .slide.active { display: flex; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .slide h1 { font-size: 3.5rem; color: var(--primary); margin-bottom: 20px; }
        .slide h2 { font-size: 2.5rem; color: var(--secondary); margin-bottom: 30px; border-bottom: 3px solid var(--accent); display: inline-block; padding-bottom: 10px; }
        .slide ul { font-size: 1.5rem; line-height: 1.6; padding-left: 40px; color: var(--text); }
        .slide li { margin-bottom: 15px; }
        .slide p { font-size: 1.4rem; margin-bottom: 20px; line-height: 1.5; }

        .box {
            background: #eff6ff;
            border-left: 5px solid var(--primary);
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
            font-size: 1.3rem;
        }

        .slide-footer {
            position: absolute; bottom: 20px; right: 30px;
            font-size: 1rem; color: #94a3b8;
        }

        .controls {
            position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%);
            background: rgba(255,255,255,0.9);
            padding: 10px 20px; border-radius: 50px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            display: flex; gap: 15px; align-items: center;
            backdrop-filter: blur(5px);
        }
        .btn {
            border: none; background: transparent; cursor: pointer;
            font-size: 1.2rem; color: var(--text); padding: 8px 12px;
            border-radius: 50%; transition: 0.2s;
        }
        .btn:hover { background: #e2e8f0; color: var(--primary); }
    </style>
</head>
<body>
    <div id="presentation-area">
        <div class="slide-container" id="slide-wrapper">
${editorContent}
        </div>

        <div class="controls">
            <button class="btn" onclick="prevSlide()" title="Slide trước"><i class="fas fa-chevron-left"></i></button>
            <span id="slide-counter" style="font-weight: bold; min-width: 60px; text-align: center;">1 / ${slides.length}</span>
            <button class="btn" onclick="nextSlide()" title="Slide sau"><i class="fas fa-chevron-right"></i></button>
        </div>
    </div>

    <script>
        let currentSlide = 0;
        let slides = document.querySelectorAll('.slide');

        function showSlide(index) {
            slides.forEach(s => s.classList.remove('active'));
            if (index >= slides.length) index = 0;
            if (index < 0) index = slides.length - 1;
            currentSlide = index;
            slides[currentSlide].classList.add('active');
            document.getElementById('slide-counter').innerText = (currentSlide + 1) + ' / ' + slides.length;
        }

        function nextSlide() { showSlide(currentSlide + 1); }
        function prevSlide() { showSlide(currentSlide - 1); }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
        });

        showSlide(0);
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

  return (
    <div className="w-full h-screen bg-slate-100 flex flex-col overflow-hidden">
      {/* Header */}
      <Header
        onOpenSettings={() => setIsApiKeyModalOpen(true)}
        hasApiKey={hasValidKey}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden pt-16">
        <div
          ref={presentationAreaRef}
          className={`flex-1 flex flex-col items-center justify-center transition-all duration-300 ${isEditorOpen ? 'mr-0' : 'mr-0'
            }`}
        >
          <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
            <div
              ref={slideWrapperRef}
              className="w-full max-w-6xl aspect-video bg-white rounded-lg shadow-2xl overflow-hidden"
            >
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 p-10 md:p-16 flex flex-col justify-center transition-opacity duration-500 ${index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                  dangerouslySetInnerHTML={{ __html: slide.content }}
                />
              ))}
              <div className="absolute bottom-4 right-6 text-sm text-slate-500 font-semibold">
                {currentSlide + 1} / {slides.length}
              </div>
            </div>

            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg flex items-center gap-4 z-50">
              <button
                onClick={prevSlide}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                title="Slide trước"
              >
                <ChevronLeft className="w-5 h-5 text-slate-700" />
              </button>
              <span className="font-bold text-slate-700 min-w-12 text-center">
                {currentSlide + 1} / {slides.length}
              </span>
              <button
                onClick={nextSlide}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                title="Slide sau"
              >
                <ChevronRight className="w-5 h-5 text-slate-700" />
              </button>
              <div className="w-px h-5 bg-slate-300 mx-2" />
              <button
                onClick={() => setIsAIInputOpen(true)}
                className="p-2 hover:bg-purple-100 rounded-full transition-colors"
                title="Tạo Slide với AI"
              >
                <Sparkles className="w-5 h-5 text-purple-600" />
              </button>
              <button
                onClick={() => setIsEditorOpen(!isEditorOpen)}
                className="p-2 hover:bg-blue-100 rounded-full transition-colors"
                title="Sửa Code"
              >
                <Code2 className="w-5 h-5 text-blue-600" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                title="Toàn màn hình"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5 text-slate-700" />
                ) : (
                  <Maximize2 className="w-5 h-5 text-slate-700" />
                )}
              </button>
              <button
                onClick={downloadHTML}
                className="p-2 hover:bg-green-100 rounded-full transition-colors"
                title="Tải về"
              >
                <Download className="w-5 h-5 text-green-600" />
              </button>
            </div>
          </div>
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
