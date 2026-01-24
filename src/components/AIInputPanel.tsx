import React, { useState, useRef } from 'react';
import { Upload, FileText, Sparkles, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { parsePDF, isPDFFile, formatFileSize, ParseProgress } from '../services/pdfParser';
import { generateSlides, GenerationProgress, ModelId } from '../services/geminiService';

interface AIInputPanelProps {
    isOpen: boolean;
    onClose: () => void;
    apiKey: string | null;
    selectedModel: ModelId;
    onSlidesGenerated: (slidesHtml: string) => void;
    onOpenApiKeyModal: () => void;
}

type InputMode = 'pdf' | 'topic';

export function AIInputPanel({
    isOpen,
    onClose,
    apiKey,
    selectedModel,
    onSlidesGenerated,
    onOpenApiKeyModal,
}: AIInputPanelProps) {
    const [mode, setMode] = useState<InputMode>('topic');
    const [topic, setTopic] = useState('');
    const [content, setContent] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [pdfContent, setPdfContent] = useState('');
    const [parseProgress, setParseProgress] = useState<ParseProgress | null>(null);
    const [generationProgress, setGenerationProgress] = useState<GenerationProgress | null>(null);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!isPDFFile(file)) {
            setError('Vui lòng chọn file PDF');
            return;
        }

        setSelectedFile(file);
        setError('');
        setIsProcessing(true);

        const result = await parsePDF(file, (progress) => {
            setParseProgress(progress);
        });

        setIsProcessing(false);
        setParseProgress(null);

        if (result.success && result.content) {
            setPdfContent(result.content);
        } else {
            setError(result.error || 'Không thể đọc file PDF');
            setSelectedFile(null);
        }
    };

    const handleGenerate = async () => {
        if (!apiKey) {
            onOpenApiKeyModal();
            return;
        }

        const inputContent = mode === 'pdf' ? pdfContent : content;
        const inputTopic = topic;

        if (!inputContent && !inputTopic) {
            setError('Vui lòng nhập nội dung hoặc chủ đề');
            return;
        }

        setError('');
        setIsProcessing(true);
        setGenerationProgress({
            step: 1,
            totalSteps: 3,
            status: 'processing',
            message: 'Đang chuẩn bị...',
        });

        const result = await generateSlides(
            inputContent || inputTopic,
            apiKey,
            selectedModel,
            inputTopic,
            (progress) => {
                setGenerationProgress(progress);
            }
        );

        setIsProcessing(false);

        if (result.success && result.slides) {
            setGenerationProgress({
                step: 3,
                totalSteps: 3,
                status: 'completed',
                message: 'Hoàn tất!',
                currentModel: result.usedModel,
            });

            setTimeout(() => {
                onSlidesGenerated(result.slides!);
                onClose();
                // Reset state
                setTopic('');
                setContent('');
                setSelectedFile(null);
                setPdfContent('');
                setGenerationProgress(null);
            }, 1000);
        } else {
            setGenerationProgress({
                step: 2,
                totalSteps: 3,
                status: 'error',
                message: `Lỗi: ${result.error}`,
                currentModel: result.usedModel,
            });
            setError(result.error || 'Không thể tạo slide');
        }
    };

    const resetPanel = () => {
        setTopic('');
        setContent('');
        setSelectedFile(null);
        setPdfContent('');
        setError('');
        setGenerationProgress(null);
        setParseProgress(null);
    };

    const getProgressPercentage = () => {
        if (generationProgress) {
            return (generationProgress.step / generationProgress.totalSteps) * 100;
        }
        if (parseProgress) {
            return parseProgress.percentage;
        }
        return 0;
    };

    const getProgressColor = () => {
        if (generationProgress?.status === 'error') return 'bg-red-500';
        if (generationProgress?.status === 'completed') return 'bg-green-500';
        return 'bg-blue-500';
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-5 rounded-t-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3 text-white">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Tạo Slide với AI</h2>
                            <p className="text-purple-100 text-sm">Nhập nội dung để tạo slide tự động</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Mode Tabs */}
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                        <button
                            onClick={() => setMode('topic')}
                            disabled={isProcessing}
                            className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${mode === 'topic'
                                    ? 'bg-white text-purple-600 shadow-md'
                                    : 'text-slate-600 hover:text-slate-800'
                                }`}
                        >
                            <FileText className="w-4 h-4 inline-block mr-2" />
                            Nhập Chủ Đề
                        </button>
                        <button
                            onClick={() => setMode('pdf')}
                            disabled={isProcessing}
                            className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${mode === 'pdf'
                                    ? 'bg-white text-purple-600 shadow-md'
                                    : 'text-slate-600 hover:text-slate-800'
                                }`}
                        >
                            <Upload className="w-4 h-4 inline-block mr-2" />
                            Tải File PDF
                        </button>
                    </div>

                    {/* Topic Input */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Chủ đề bài giảng
                        </label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="VD: Bài 1: Phương trình bậc nhất một ẩn"
                            disabled={isProcessing}
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all disabled:bg-slate-100"
                        />
                    </div>

                    {/* Content Area based on mode */}
                    {mode === 'topic' ? (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Nội dung chi tiết (tuỳ chọn)
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Nhập nội dung bài giảng, các điểm chính cần trình bày..."
                                disabled={isProcessing}
                                rows={6}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all resize-none disabled:bg-slate-100"
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Tải file PDF (SGK, tài liệu tham khảo)
                            </label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".pdf"
                                disabled={isProcessing}
                                className="hidden"
                            />
                            <div
                                onClick={() => !isProcessing && fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${selectedFile
                                        ? 'border-green-300 bg-green-50'
                                        : 'border-slate-300 hover:border-purple-400 hover:bg-purple-50'
                                    } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {selectedFile ? (
                                    <div className="space-y-2">
                                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                                        <p className="font-medium text-green-700">{selectedFile.name}</p>
                                        <p className="text-sm text-green-600">{formatFileSize(selectedFile.size)}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Upload className="w-12 h-12 text-slate-400 mx-auto" />
                                        <p className="text-slate-600">Click để chọn file PDF</p>
                                        <p className="text-sm text-slate-500">Hỗ trợ: SGK, tài liệu tham khảo</p>
                                    </div>
                                )}
                            </div>
                            {pdfContent && (
                                <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                                    <p className="text-sm text-slate-600">
                                        Đã trích xuất {pdfContent.length.toLocaleString()} ký tự từ file PDF
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Progress Bar */}
                    {(isProcessing || generationProgress) && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className={`font-medium ${generationProgress?.status === 'error' ? 'text-red-600' :
                                        generationProgress?.status === 'completed' ? 'text-green-600' : 'text-slate-600'
                                    }`}>
                                    {generationProgress?.message || (parseProgress ? `Đang đọc trang ${parseProgress.currentPage}/${parseProgress.totalPages}` : 'Đang xử lý...')}
                                </span>
                                {generationProgress?.currentModel && (
                                    <span className="text-xs text-slate-500">
                                        Model: {generationProgress.currentModel}
                                    </span>
                                )}
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${getProgressColor()} transition-all duration-300`}
                                    style={{ width: `${getProgressPercentage()}%` }}
                                />
                            </div>
                            {generationProgress?.status === 'error' && (
                                <p className="text-xs text-slate-500 mt-1">
                                    Trạng thái: Đã dừng do lỗi
                                </p>
                            )}
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-red-700 font-medium">Có lỗi xảy ra</p>
                                <p className="text-red-600 text-sm mt-1">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={resetPanel}
                            disabled={isProcessing}
                            className="px-5 py-3 border-2 border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50"
                        >
                            Đặt lại
                        </button>
                        <button
                            onClick={handleGenerate}
                            disabled={isProcessing || (!topic && !content && !pdfContent)}
                            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Tạo Slide với AI
                                </>
                            )}
                        </button>
                    </div>

                    {/* No API Key Warning */}
                    {!apiKey && (
                        <div className="flex items-center justify-center gap-2 text-amber-600 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>Bạn cần nhập API key trước khi sử dụng</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
