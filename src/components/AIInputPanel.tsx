import React, { useState, useRef } from 'react';
import { Upload, FileText, Sparkles, X, AlertCircle, CheckCircle, Loader2, ListOrdered, ChevronDown, ChevronUp, Edit3 } from 'lucide-react';
import { parsePDF, isPDFFile, formatFileSize, ParseProgress } from '../services/pdfParser';
import { generateSlides, generateOutline, GenerationProgress, ModelId, SlideOutline, AiProvider } from '../services/geminiService';

// Danh sách môn học với thuật ngữ tiếng Anh chuyên ngành
export const SUBJECTS = [
    { id: 'math', name: 'Toán học (Mathematics)', icon: '🔢' },
    { id: 'physics', name: 'Vật lý (Physics)', icon: '⚛️' },
    { id: 'chemistry', name: 'Hóa học (Chemistry)', icon: '🧪' },
    { id: 'biology', name: 'Sinh học (Biology)', icon: '🧬' },
    { id: 'informatics', name: 'Tin học (Informatics)', icon: '💻' },
    { id: 'literature', name: 'Ngữ văn (Literature)', icon: '📖' },
    { id: 'history', name: 'Lịch sử (History)', icon: '🏛️' },
    { id: 'geography', name: 'Địa lý (Geography)', icon: '🌍' },
    { id: 'technology', name: 'Công nghệ (Technology)', icon: '🔧' },
    { id: 'music', name: 'Âm nhạc (Music)', icon: '🎵' },
    { id: 'physical_education', name: 'Thể dục (Physical Education)', icon: '🏃' },
    { id: 'defense_security', name: 'GDQPAN (Defense & Security Education)', icon: '🎖️' },
    { id: 'career_orientation', name: 'Hoạt động hướng nghiệp (Career Orientation)', icon: '🎯' },
    { id: 'local_education', name: 'Giáo dục địa phương (Local Education)', icon: '🏘️' },
    { id: 'economics_law', name: 'GD Kinh tế & Pháp luật (Economics & Law Education)', icon: '⚖️' },
    { id: 'english', name: 'Tiếng Anh (English)', icon: '🌐' }
] as const;

// Danh sách lớp học từ Mầm non đến THPT
export const GRADE_LEVELS = [
    { id: 'preschool', name: 'Mầm non (3-5 tuổi)', category: 'Mầm non', ageRange: '3-5' },
    { id: 'grade1', name: 'Lớp 1', category: 'Tiểu học', ageRange: '6-7' },
    { id: 'grade2', name: 'Lớp 2', category: 'Tiểu học', ageRange: '7-8' },
    { id: 'grade3', name: 'Lớp 3', category: 'Tiểu học', ageRange: '8-9' },
    { id: 'grade4', name: 'Lớp 4', category: 'Tiểu học', ageRange: '9-10' },
    { id: 'grade5', name: 'Lớp 5', category: 'Tiểu học', ageRange: '10-11' },
    { id: 'grade6', name: 'Lớp 6', category: 'THCS', ageRange: '11-12' },
    { id: 'grade7', name: 'Lớp 7', category: 'THCS', ageRange: '12-13' },
    { id: 'grade8', name: 'Lớp 8', category: 'THCS', ageRange: '13-14' },
    { id: 'grade9', name: 'Lớp 9', category: 'THCS', ageRange: '14-15' },
    { id: 'grade10', name: 'Lớp 10', category: 'THPT', ageRange: '15-16' },
    { id: 'grade11', name: 'Lớp 11', category: 'THPT', ageRange: '16-17' },
    { id: 'grade12', name: 'Lớp 12', category: 'THPT', ageRange: '17-18' }
] as const;

export type SubjectId = typeof SUBJECTS[number]['id'];
export type GradeLevelId = typeof GRADE_LEVELS[number]['id'];

interface AIInputPanelProps {
    isOpen: boolean;
    onClose: () => void;
    apiKey: string | null;
    selectedModel: ModelId;
    provider?: AiProvider;
    onSlidesGenerated: (slidesHtml: string) => void;
    onOpenApiKeyModal: () => void;
}

type InputMode = 'pdf' | 'topic';

export function AIInputPanel({
    isOpen,
    onClose,
    apiKey,
    selectedModel,
    provider = 'gemini',
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

    // Slide count options
    const [slideCount, setSlideCount] = useState<number | ''>('');
    const [showOutline, setShowOutline] = useState(false);
    const [outline, setOutline] = useState<SlideOutline[]>([]);
    const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);

    // Môn học, lớp học và mô phỏng trực quan
    const [subject, setSubject] = useState<SubjectId | ''>('');
    const [gradeLevel, setGradeLevel] = useState<GradeLevelId | ''>('');
    const [enableSimulation, setEnableSimulation] = useState(false);

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

    const handleSlideCountChange = (value: string) => {
        if (value === '') {
            setSlideCount('');
            setOutline([]);
            setShowOutline(false);
        } else {
            const num = parseInt(value);
            if (num >= 1 && num <= 20) {
                setSlideCount(num);
                setOutline([]);
                setShowOutline(false);
            }
        }
    };

    const handleGenerateOutline = async () => {
        if (!apiKey || !topic || !slideCount) {
            if (!topic) setError('Vui lòng nhập chủ đề trước');
            return;
        }

        setIsGeneratingOutline(true);
        setError('');

        const inputContent = mode === 'pdf' ? pdfContent : content;
        const result = await generateOutline(
            inputContent,
            topic,
            slideCount as number,
            apiKey,
            selectedModel,
            provider,
            (sourceModel, targetModel, reason) => {
                setError(`${reason}. Đang tự động chuyển từ ${sourceModel} sang ${targetModel}...`);
            }
        );

        setIsGeneratingOutline(false);

        if (result.success && result.outline) {
            setOutline(result.outline);
            setShowOutline(true);
        } else {
            setError(result.error || 'Không thể tạo outline');
        }
    };

    const handleOutlineChange = (slideIndex: number, field: 'title' | 'keyPoints', value: string | string[]) => {
        const newOutline = [...outline];
        if (field === 'title') {
            newOutline[slideIndex].title = value as string;
        } else {
            newOutline[slideIndex].keyPoints = value as string[];
        }
        setOutline(newOutline);
    };

    const handleKeyPointChange = (slideIndex: number, pointIndex: number, value: string) => {
        const newOutline = [...outline];
        newOutline[slideIndex].keyPoints[pointIndex] = value;
        setOutline(newOutline);
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
            },
            slideCount ? slideCount as number : undefined,
            outline.length > 0 ? outline : undefined,
            subject || undefined,
            gradeLevel || undefined,
            enableSimulation,
            provider
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
                resetPanel();
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
        setSlideCount('');
        setOutline([]);
        setShowOutline(false);
        setSubject('');
        setGradeLevel('');
        setEnableSimulation(false);
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
        return 'bg-purple-500';
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

                    {/* Subject & Grade Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Subject Dropdown */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                📚 Môn học
                            </label>
                            <select
                                value={subject}
                                onChange={(e) => setSubject(e.target.value as SubjectId | '')}
                                disabled={isProcessing}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all disabled:bg-slate-100 bg-white text-sm"
                            >
                                <option value="">-- Chọn môn học --</option>
                                {SUBJECTS.map((subj) => (
                                    <option key={subj.id} value={subj.id}>
                                        {subj.icon} {subj.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Grade Level Dropdown */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                🎓 Lớp học
                            </label>
                            <select
                                value={gradeLevel}
                                onChange={(e) => setGradeLevel(e.target.value as GradeLevelId | '')}
                                disabled={isProcessing}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all disabled:bg-slate-100 bg-white text-sm"
                            >
                                <option value="">-- Chọn lớp --</option>
                                <optgroup label="🌸 Mầm non">
                                    {GRADE_LEVELS.filter(g => g.category === 'Mầm non').map((grade) => (
                                        <option key={grade.id} value={grade.id}>{grade.name}</option>
                                    ))}
                                </optgroup>
                                <optgroup label="📖 Tiểu học">
                                    {GRADE_LEVELS.filter(g => g.category === 'Tiểu học').map((grade) => (
                                        <option key={grade.id} value={grade.id}>{grade.name}</option>
                                    ))}
                                </optgroup>
                                <optgroup label="📘 THCS">
                                    {GRADE_LEVELS.filter(g => g.category === 'THCS').map((grade) => (
                                        <option key={grade.id} value={grade.id}>{grade.name}</option>
                                    ))}
                                </optgroup>
                                <optgroup label="📕 THPT">
                                    {GRADE_LEVELS.filter(g => g.category === 'THPT').map((grade) => (
                                        <option key={grade.id} value={grade.id}>{grade.name}</option>
                                    ))}
                                </optgroup>
                            </select>
                        </div>
                    </div>

                    {/* Interactive Simulation Toggle */}
                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-200">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={enableSimulation}
                                onChange={(e) => setEnableSimulation(e.target.checked)}
                                disabled={isProcessing}
                                className="w-5 h-5 rounded-lg border-2 border-cyan-400 text-cyan-600 focus:ring-cyan-300 focus:ring-2 transition-all"
                            />
                            <div className="flex-1">
                                <span className="font-semibold text-slate-700 flex items-center gap-2">
                                    🎮 Tạo mô phỏng trực quan tương tác
                                </span>
                                <p className="text-xs text-slate-500 mt-1">
                                    AI sẽ tạo các mô phỏng SVG/Canvas tương tác phù hợp với môn học (đồ thị, phản ứng hóa học, sơ đồ...)
                                </p>
                            </div>
                        </label>
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

                    {/* Slide Count Option */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                        <div className="flex items-center gap-3 mb-3">
                            <ListOrdered className="w-5 h-5 text-purple-600" />
                            <label className="text-sm font-semibold text-slate-700">
                                Số lượng slide (tuỳ chọn)
                            </label>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                min="1"
                                max="20"
                                value={slideCount}
                                onChange={(e) => handleSlideCountChange(e.target.value)}
                                placeholder="Để trống = AI tự cân đối"
                                disabled={isProcessing}
                                className="flex-1 px-4 py-2.5 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all disabled:bg-slate-100 text-sm"
                            />
                            {slideCount && topic && (
                                <button
                                    onClick={handleGenerateOutline}
                                    disabled={isProcessing || isGeneratingOutline}
                                    className="px-4 py-2.5 bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 text-sm"
                                >
                                    {isGeneratingOutline ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Edit3 className="w-4 h-4" />
                                    )}
                                    Tạo gợi ý
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            💡 Nhập số từ 1-20. Để trống để AI tự quyết định số slide phù hợp.
                        </p>
                    </div>

                    {/* Outline Editor */}
                    {outline.length > 0 && (
                        <div className="bg-white border-2 border-purple-200 rounded-xl overflow-hidden">
                            <button
                                onClick={() => setShowOutline(!showOutline)}
                                className="w-full px-4 py-3 bg-purple-50 flex items-center justify-between hover:bg-purple-100 transition-colors"
                            >
                                <span className="font-semibold text-purple-700 flex items-center gap-2">
                                    <ListOrdered className="w-5 h-5" />
                                    Dàn ý {outline.length} slide (có thể chỉnh sửa)
                                </span>
                                {showOutline ? (
                                    <ChevronUp className="w-5 h-5 text-purple-600" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-purple-600" />
                                )}
                            </button>

                            {showOutline && (
                                <div className="p-4 space-y-4 max-h-60 overflow-y-auto">
                                    {outline.map((slide, slideIndex) => (
                                        <div key={slideIndex} className="bg-slate-50 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="w-6 h-6 bg-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                                    {slide.slideNumber}
                                                </span>
                                                <input
                                                    type="text"
                                                    value={slide.title}
                                                    onChange={(e) => handleOutlineChange(slideIndex, 'title', e.target.value)}
                                                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-purple-400"
                                                    placeholder="Tiêu đề slide"
                                                />
                                                {/* Checkbox mô phỏng cho slide này */}
                                                <label className="flex items-center gap-1.5 cursor-pointer bg-cyan-50 px-2 py-1 rounded-lg border border-cyan-200 hover:bg-cyan-100 transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        checked={slide.enableSimulation || false}
                                                        onChange={(e) => {
                                                            const newOutline = [...outline];
                                                            newOutline[slideIndex].enableSimulation = e.target.checked;
                                                            setOutline(newOutline);
                                                        }}
                                                        className="w-4 h-4 rounded border-cyan-400 text-cyan-600 focus:ring-cyan-300"
                                                    />
                                                    <span className="text-xs font-medium text-cyan-700">🎮 Mô phỏng</span>
                                                </label>
                                            </div>
                                            <div className="pl-8 space-y-1">
                                                {slide.keyPoints.map((point, pointIndex) => (
                                                    <input
                                                        key={pointIndex}
                                                        type="text"
                                                        value={point}
                                                        onChange={(e) => handleKeyPointChange(slideIndex, pointIndex, e.target.value)}
                                                        className="w-full px-3 py-1.5 border border-slate-100 rounded-lg text-xs text-slate-600 focus:outline-none focus:border-purple-300"
                                                        placeholder={`Điểm ${pointIndex + 1}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

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
                                rows={5}
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
                                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${selectedFile
                                    ? 'border-green-300 bg-green-50'
                                    : 'border-slate-300 hover:border-purple-400 hover:bg-purple-50'
                                    } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {selectedFile ? (
                                    <div className="space-y-2">
                                        <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
                                        <p className="font-medium text-green-700">{selectedFile.name}</p>
                                        <p className="text-sm text-green-600">{formatFileSize(selectedFile.size)}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Upload className="w-10 h-10 text-slate-400 mx-auto" />
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
                            <span>Vui lòng cấu hình API Key trước khi sử dụng tính năng này.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
