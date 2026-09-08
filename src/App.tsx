/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Settings, 
  Moon, 
  Sun, 
  FileText, 
  Sparkles, 
  Download, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  ListChecks,
  SquareCheck,
  Square,
  BookOpen,
  RefreshCw,
  RotateCcw,
  Lock,
  LogIn,
  X,
  History,
  Trash2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Paperclip
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';

import { ApiKeyModal } from './components/ApiKeyModal';

import { FileUploader } from './components/FileUploader';
import { LessonItem } from './components/LessonItem';
import { TeachingMethodSelector } from './components/TeachingMethodSelector';
import { ManualLessonInput, ManualLessonEntry } from './components/ManualLessonInput';

import { GeminiService } from './services/geminiService';
import { parseFileAdvanced, parseFile } from './services/fileParser';
import { downloadAllAsZip } from './services/zipService';
import { MathMode } from './services/docxGenerator';
import { saveSession, loadSession, clearSession, saveToHistory, loadHistory, removeFromHistory, clearHistory, formatRelativeTime, getLessonTypeName, HistoryEntry } from './services/sessionService';

import { AppConfig, LessonInfo, GeneratedLesson, GenerationStep, AiProvider, StandardStructure } from './types';
import { DEFAULT_MODEL, DEFAULT_GEMINI_MODEL, DEFAULT_AGENT_PLATFORM_MODEL, APP_NAME, LESSON_STRUCTURE_PROMPT } from './utils/constants';
import { cn } from './lib/utils';
import { buildTeachingMethodsPrompt, TEACHING_METHODS, TEACHING_TECHNIQUES, getSubjectActivities } from './data/teachingMethodsDB';
import { buildCompetenciesPrompt } from './data/competenciesDB';
import { LESSON_TYPES, LessonType, STANDARD_5512_STRUCTURES, STANDARD_STRUCTURE_2_PROMPT, getStructurePromptForType } from './data/lessonTypeDB';
import { validateLogin, AccountInfo } from './data/accounts';

export default function App() {
  // State
  const savedProvider = (localStorage.getItem('google_ai_provider') as AiProvider) || 'gemini';
  const initialProvider: AiProvider = (savedProvider === 'vertex' as any) ? 'gemini' : savedProvider;
  const geminiKey = localStorage.getItem('gemini_api_key') || '';
  const agentPlatformKey = localStorage.getItem('agent_platform_api_key') || '';
  const initialApiKey = initialProvider === 'agent-platform' ? agentPlatformKey : geminiKey;
  const initialModel = localStorage.getItem('gemini_model') || (initialProvider === 'agent-platform' ? DEFAULT_AGENT_PLATFORM_MODEL : DEFAULT_GEMINI_MODEL);

  const [config, setConfig] = useState<AppConfig>({
    apiKey: initialApiKey,
    geminiApiKey: geminiKey,
    agentPlatformApiKey: agentPlatformKey,
    provider: initialProvider,
    model: initialModel,
    lessonType: (localStorage.getItem('lesson_type') as LessonType) || 'standard',
    standardStructure: (localStorage.getItem('standard_structure') as StandardStructure) || 'structure1',
    schoolLevel: localStorage.getItem('school_level') || '',
    classLevel: localStorage.getItem('class_level') || '',
    subjectName: localStorage.getItem('subject_name') || '',
    schoolName: localStorage.getItem('school_name') || '',
    departmentName: localStorage.getItem('department_name') || '',
    teacherName: localStorage.getItem('teacher_name') || '',
    schoolYear: localStorage.getItem('school_year') || '2025-2026',
    enableAiCompetency: localStorage.getItem('enable_ai_competency') !== 'false',
    enableDigitalCompetency: localStorage.getItem('enable_digital_competency') === 'true',
    enableForeignLanguage: localStorage.getItem('enable_foreign_language') === 'true',
    enableDisabilityCompetency: localStorage.getItem('enable_disability_competency') === 'true'
  });

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(!config.apiKey);

  // Premium login state (NCBH & STEM)
  const [isPremiumLoggedIn, setIsPremiumLoggedIn] = useState(() => {
    return sessionStorage.getItem('premium_logged_in') === 'true';
  });
  const [premiumUser, setPremiumUser] = useState<AccountInfo | null>(() => {
    const saved = sessionStorage.getItem('premium_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [pendingLessonType, setPendingLessonType] = useState<LessonType | null>(null);
  const [pendingAction, setPendingAction] = useState<'select' | 'generate'>('select');
  const [freeUsageCount, setFreeUsageCount] = useState(() => {
    return parseInt(localStorage.getItem('free_usage_count') || '0', 10);
  });
  
  const [sampleFile, setSampleFile] = useState<File | null>(null);
  const [scheduleFile, setScheduleFile] = useState<File | null>(null);
  const [refFiles, setRefFiles] = useState<File[]>([]);
  const [textbookFile, setTextbookFile] = useState<File | null>(null);

  const [steps, setSteps] = useState<GenerationStep[]>([
    { id: 'analyze-sample', label: 'Phân tích cấu trúc mẫu', status: 'idle' },
    { id: 'extract-schedule', label: 'Trích xuất kế hoạch dạy', status: 'idle' },
    { id: 'generate-content', label: 'Sinh nội dung giáo án', status: 'idle' }
  ]);

  const [lessons, setLessons] = useState<GeneratedLesson[]>([]);
  const [sampleStructure, setSampleStructure] = useState(() => {
    return sessionStorage.getItem('sample_structure') || '';
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [mathMode, setMathMode] = useState<MathMode>(() => {
    return (localStorage.getItem('math_mode') as MathMode) || 'omml';
  });

  // S4: Ý tưởng / hoạt động bổ sung
  const [teacherIdeas, setTeacherIdeas] = useState(() => {
    return localStorage.getItem('teacher_ideas') || '';
  });
  const [ideaFiles, setIdeaFiles] = useState<File[]>([]);
  const [ideaFilesText, setIdeaFilesText] = useState('');

  // History panel state
  const [showHistory, setShowHistory] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>(() => loadHistory());
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  // Lesson selection state
  const [extractedLessons, setExtractedLessons] = useState<LessonInfo[]>([]);
  const [selectedLessonIndices, setSelectedLessonIndices] = useState<Set<number>>(new Set());
  const [showLessonSelector, setShowLessonSelector] = useState(false);

  // Teaching methods selection state
  const [selectedMethodIds, setSelectedMethodIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('selected_methods') || '[]'); } catch { return []; }
  });
  const [selectedTechniqueIds, setSelectedTechniqueIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('selected_techniques') || '[]'); } catch { return []; }
  });
  const [selectedActivities, setSelectedActivities] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('selected_activities') || '[]'); } catch { return []; }
  });

  // Manual lesson input state (persisted)
  const [manualEntries, setManualEntries] = useState<ManualLessonEntry[]>(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('manual_entries') || '[]');
      // Migrate old entries that don't have loai/tenBai/thoiLuong fields
      return raw.map((e: any) => ({
        loai: e.loai || 'tiet',
        tiet: e.tiet || '',
        tenBai: e.tenBai || '',
        noiDung: e.noiDung || '',
        chuDe: e.chuDe || '',
        thoiLuong: e.thoiLuong || '2',
      }));
    } catch { return []; }
  });

  // School level → class mapping
  const CLASS_OPTIONS: Record<string, string[]> = {
    'Tiểu học': ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5'],
    'THCS': ['Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9'],
    'THPT': ['Lớp 10', 'Lớp 11', 'Lớp 12'],
  };

  // Effects
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Tự động mở modal bắt buộc nhập API key khi chưa có (LỆNH.md mục 2)
  useEffect(() => {
    if (!config.apiKey) {
      setIsApiModalOpen(true);
    }
  }, []);

  // Khôi phục phiên làm việc khi mở app
  useEffect(() => {
    const session = loadSession();
    if (session) {
      if (session.lessons?.length > 0) {
        setLessons(session.lessons);
      }
      if (session.extractedLessons?.length > 0) {
        setExtractedLessons(session.extractedLessons);
        setShowLessonSelector(true);
      }
      if (session.steps) {
        setSteps(session.steps);
      }
      if (session.selectedIndices?.length > 0) {
        setSelectedLessonIndices(new Set(session.selectedIndices));
      }
      if (session.sampleStructure) {
        setSampleStructure(session.sampleStructure);
        sessionStorage.setItem('sample_structure', session.sampleStructure);
      }
    }
  }, []);

  // Auto-save phiên khi lessons hoặc steps thay đổi
  useEffect(() => {
    if (lessons.length > 0 || extractedLessons.length > 0 || steps.some(s => s.status !== 'idle')) {
      saveSession({
        lessons,
        extractedLessons,
        steps,
        selectedIndices: Array.from(selectedLessonIndices),
        sampleStructure,
      });
    }
  }, [lessons, extractedLessons, steps, selectedLessonIndices, sampleStructure]);

  const saveConfig = (newConfig: Partial<AppConfig>) => {
    const updated = { ...config, ...newConfig };
    setConfig(updated);
    if (newConfig.provider !== undefined) {
      localStorage.setItem('google_ai_provider', newConfig.provider);
      localStorage.setItem('google_ai_provider_selection_source', 'manual');
    }
    if (newConfig.geminiApiKey !== undefined) localStorage.setItem('gemini_api_key', newConfig.geminiApiKey);
    if (newConfig.agentPlatformApiKey !== undefined) localStorage.setItem('agent_platform_api_key', newConfig.agentPlatformApiKey);
    if (newConfig.apiKey !== undefined) {
      if (updated.provider === 'agent-platform') {
        localStorage.setItem('agent_platform_api_key', newConfig.apiKey);
      } else {
        localStorage.setItem('gemini_api_key', newConfig.apiKey);
      }
    }
    if (newConfig.model !== undefined) localStorage.setItem('gemini_model', newConfig.model);
    if (newConfig.schoolLevel !== undefined) localStorage.setItem('school_level', newConfig.schoolLevel);
    if (newConfig.classLevel !== undefined) localStorage.setItem('class_level', newConfig.classLevel);
    if (newConfig.subjectName !== undefined) localStorage.setItem('subject_name', newConfig.subjectName);
    if (newConfig.schoolName !== undefined) localStorage.setItem('school_name', newConfig.schoolName);
    if (newConfig.departmentName !== undefined) localStorage.setItem('department_name', newConfig.departmentName);
    if (newConfig.teacherName !== undefined) localStorage.setItem('teacher_name', newConfig.teacherName);
    if (newConfig.schoolYear !== undefined) localStorage.setItem('school_year', newConfig.schoolYear);
    if (newConfig.enableAiCompetency !== undefined) localStorage.setItem('enable_ai_competency', String(newConfig.enableAiCompetency));
    if (newConfig.enableDigitalCompetency !== undefined) localStorage.setItem('enable_digital_competency', String(newConfig.enableDigitalCompetency));
    if (newConfig.enableForeignLanguage !== undefined) localStorage.setItem('enable_foreign_language', String(newConfig.enableForeignLanguage));
    if (newConfig.enableDisabilityCompetency !== undefined) localStorage.setItem('enable_disability_competency', String(newConfig.enableDisabilityCompetency));
    if (newConfig.lessonType !== undefined) localStorage.setItem('lesson_type', newConfig.lessonType);
    if (newConfig.standardStructure !== undefined) localStorage.setItem('standard_structure', newConfig.standardStructure);
    // Auto-clear classLevel if schoolLevel changes and class is not in new level
    if (newConfig.schoolLevel !== undefined && newConfig.schoolLevel !== config.schoolLevel) {
      const validClasses = CLASS_OPTIONS[newConfig.schoolLevel] || [];
      if (!validClasses.includes(updated.classLevel)) {
        updated.classLevel = validClasses[0] || '';
        localStorage.setItem('class_level', updated.classLevel);
        setConfig(updated);
      }
    }
  };

  // Handle lesson type selection
  const handleLessonTypeClick = (typeId: LessonType) => {
    // NCBH & STEM always require login
    if ((typeId === 'ncbh' || typeId === 'stem') && !isPremiumLoggedIn) {
      setPendingLessonType(typeId);
      setPendingAction('select');
      setLoginError('');
      setLoginUsername('');
      setLoginPassword('');
      setShowLoginModal(true);
      return;
    }
    saveConfig({ lessonType: typeId });
  };

  // Check if login is required before generating
  const needsLoginToGenerate = (): boolean => {
    if (isPremiumLoggedIn) return false;
    // Standard: 1 free use, then require login
    if (config.lessonType === 'standard' && freeUsageCount >= 1) return true;
    // NCBH & STEM: always require (handled in handleLessonTypeClick, but double-check)
    if (config.lessonType === 'ncbh' || config.lessonType === 'stem') return true;
    return false;
  };

  const showLoginForGenerate = () => {
    setPendingLessonType(config.lessonType as LessonType);
    setPendingAction('generate');
    setLoginError('');
    setLoginUsername('');
    setLoginPassword('');
    setShowLoginModal(true);
  };

  // Handle premium login
  const handlePremiumLogin = () => {
    const account = validateLogin(loginUsername, loginPassword);
    if (account) {
      setIsPremiumLoggedIn(true);
      setPremiumUser(account);
      sessionStorage.setItem('premium_logged_in', 'true');
      sessionStorage.setItem('premium_user', JSON.stringify(account));
      setShowLoginModal(false);
      setLoginError('');
      if (pendingLessonType && pendingAction === 'select') {
        saveConfig({ lessonType: pendingLessonType });
      }
      setPendingLessonType(null);
      toast.success(`Đăng nhập thành công! Xin chào ${account.name}`);
    } else {
      setLoginError('Tên đăng nhập hoặc mật khẩu không đúng.');
    }
  };

  // Persist manual entries
  const handleManualEntriesChange = (entries: ManualLessonEntry[]) => {
    setManualEntries(entries);
    localStorage.setItem('manual_entries', JSON.stringify(entries));
  };

  // Persist teaching methods selections
  const handleMethodsChange = (ids: string[]) => {
    setSelectedMethodIds(ids);
    localStorage.setItem('selected_methods', JSON.stringify(ids));
  };
  const handleTechniquesChange = (ids: string[]) => {
    setSelectedTechniqueIds(ids);
    localStorage.setItem('selected_techniques', JSON.stringify(ids));
  };
  const handleActivitiesChange = (ids: string[]) => {
    setSelectedActivities(ids);
    localStorage.setItem('selected_activities', JSON.stringify(ids));
  };

  const updateStep = (id: string, status: GenerationStep['status'], error?: string) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, status, error } : s));
  };

  const createGeminiService = () => new GeminiService(
    config.apiKey,
    config.provider,
    config.model,
    ({ fromModel, toModel, errorType, provider }) => {
      const reason = errorType === 'NOT_FOUND'
        ? 'không còn khả dụng'
        : errorType === 'PERMISSION_DENIED'
        ? 'chưa được cấp quyền'
        : 'đang quá tải hoặc tạm lỗi';
      const providerName = provider === 'agent-platform' ? 'Agent Platform' : 'Gemini';
      toast.info(`Model ${fromModel} (${providerName}) ${reason}. App tự động chuyển sang ${toModel}.`, {
        duration: 6000,
        id: 'gemini-model-fallback',
      });
    }
  );

  const startGeneration = async () => {
    if (!config.apiKey) {
      setIsApiModalOpen(true);
      return;
    }
    // Check login requirement
    if (needsLoginToGenerate()) {
      showLoginForGenerate();
      return;
    }
    const hasManualEntries = manualEntries.some(e => e.loai === 'bai' ? e.tenBai?.trim() : e.tiet?.trim());
    if (!sampleFile && config.lessonType !== 'standard') {
      toast.error("Vui lòng tải lên giáo án mẫu!");
      return;
    }
    if (!config.schoolLevel || !config.classLevel) {
      toast.error("Vui lòng chọn cấp học và lớp!");
      return;
    }
    if (!scheduleFile && !hasManualEntries) {
      toast.error("Vui lòng tải lên kế hoạch dạy hoặc khai báo tiết học thủ công!");
      return;
    }

    setIsGenerating(true);
    // KHÔNG xóa lessons cũ — giữ lại kết quả đã sinh trước đó
    // Chỉ reset steps
    setSteps([
      { id: 'analyze-sample', label: 'Phân tích cấu trúc mẫu', status: 'idle' },
      { id: 'extract-schedule', label: 'Trích xuất kế hoạch dạy', status: 'idle' },
      { id: 'generate-content', label: 'Sinh nội dung giáo án', status: 'idle' }
    ]);
    const gemini = createGeminiService();

    // Check for valid manual entries
    const validManualEntries = manualEntries.filter(e => 
      e.loai === 'bai' ? (e.tenBai?.trim()) : (e.tiet?.trim())
    );

    try {
      // Step 1: Analyze Sample
      updateStep('analyze-sample', 'processing');
      let structure = '';
      if (sampleFile) {
        const sampleResult = await parseFileAdvanced(sampleFile);
        const sampleText = sampleResult.type === 'text' ? (sampleResult.text || '') : '';
        const sampleImageData = sampleResult.type === 'image' ? sampleResult.imageData : undefined;
        structure = await gemini.analyzeSample(sampleText, sampleImageData);
      } else {
        // Tự động sử dụng cấu trúc mẫu chuẩn được tích hợp sẵn
        structure = config.lessonType === 'standard'
          ? (config.standardStructure === 'structure2' ? STANDARD_STRUCTURE_2_PROMPT : LESSON_STRUCTURE_PROMPT)
          : getStructurePromptForType(config.lessonType);
      }
      setSampleStructure(structure);
      sessionStorage.setItem('sample_structure', structure);
      updateStep('analyze-sample', 'completed');

      let schedule: LessonInfo[];

      if (validManualEntries.length > 0) {
        // Use manual entries — skip file extraction
        updateStep('extract-schedule', 'processing');
        schedule = validManualEntries.map((entry) => {
          if (entry.loai === 'bai') {
            // Loại "bài" — soạn trọn bài theo thời lượng
            const thoiLuong = parseInt(entry.thoiLuong) || 2;
            return [{
              tiet: 0,
              tuan: 0,
              ngay_day: '',
              noi_dung: entry.tenBai.trim() || entry.noiDung.trim() || 'Bài học',
              ghi_chu: [
                entry.noiDung?.trim() ? `Nội dung chi tiết: ${entry.noiDung}` : '',
                `SOẠN THEO BÀI | THỜI LƯỢNG: ${thoiLuong} tiết`,
              ].filter(Boolean).join(' | '),
            }];
          } else {
            // Loại "tiết" — parse "30, 31" → multiple lessons
            const tietParts = entry.tiet.split(/[,;\s]+/).filter(Boolean);
            return tietParts.map((t, i) => ({
              tiet: parseInt(t) || (i + 1),
              tuan: 0,
              ngay_day: '',
              noi_dung: entry.noiDung?.trim() || `Tiết ${t}`,
              ghi_chu: entry.chuDe?.trim() ? `Chủ đề: ${entry.chuDe}` : '',
            }));
          }
        }).flat();
        updateStep('extract-schedule', 'completed');
      } else {
        // Extract from file
        updateStep('extract-schedule', 'processing');
        if (!scheduleFile) {
          throw new Error("Chưa có file kế hoạch và chưa khai báo tiết học thủ công.");
        }
        const schedResult = await parseFileAdvanced(scheduleFile);
        const schedText = schedResult.type === 'text' ? (schedResult.text || '') : '';
        const schedImageData = schedResult.type === 'image' ? schedResult.imageData : undefined;
        schedule = await gemini.extractSchedule(schedText, schedImageData);
      }
      
      if (schedule.length === 0) {
        throw new Error("Không tìm thấy danh sách tiết dạy trong file kế hoạch.");
      }

      // Store extracted lessons and show selector
      setExtractedLessons(schedule);
      setSelectedLessonIndices(new Set(schedule.map((_, i) => i))); // Select all by default
      setShowLessonSelector(true);
      updateStep('extract-schedule', 'completed');

      toast.success(`Đã tìm thấy ${schedule.length} tiết dạy. Vui lòng chọn tiết cần tạo giáo án rồi bấm "Sinh giáo án".`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Đã có lỗi xảy ra trong quá trình xử lý.");
      // Find current processing step and mark as error
      setSteps(prev => prev.map(s => s.status === 'processing' ? { ...s, status: 'error', error: err.message } : s));
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSelectedLessons = async () => {
    if (!config.apiKey) {
      setIsApiModalOpen(true);
      return;
    }
    if (selectedLessonIndices.size === 0) {
      toast.error("Vui lòng chọn ít nhất 1 tiết dạy!");
      return;
    }

    setIsGenerating(true);
    const gemini = createGeminiService();

    // Build initial lessons from selected
    const selectedInfos = extractedLessons.filter((_, i) => selectedLessonIndices.has(i));
    const initialLessons: GeneratedLesson[] = selectedInfos.map(info => ({
      info,
      content: '',
      status: 'idle'
    }));
    setLessons(initialLessons);
    setShowLessonSelector(false);

    try {
      updateStep('generate-content', 'processing');

      let refText = "";
      if (refFiles.length > 0) {
        const refParts = await Promise.all(refFiles.map(f => parseFile(f)));
        refText = refParts.join('\n\n---\n\n');
      }

      let textbookText = "";
      if (textbookFile) {
        textbookText = await parseFile(textbookFile);
      }

      let failedLessonCount = 0;
      let lastLessonError = '';

      for (let i = 0; i < initialLessons.length; i++) {
        setLessons(prev => prev.map((l, idx) => idx === i ? { ...l, status: 'generating' } : l));

        try {
          const content = await gemini.generateLesson(
            initialLessons[i].info,
            sampleStructure,
            {
              school: config.schoolName,
              dept: config.departmentName,
              teacher: config.teacherName,
              year: config.schoolYear,
              level: config.schoolLevel,
              classLevel: config.classLevel,
              subjectName: config.subjectName,
              enableAiCompetency: config.enableAiCompetency,
              enableDigitalCompetency: config.enableDigitalCompetency,
              enableForeignLanguage: config.enableForeignLanguage,
              enableDisabilityCompetency: config.enableDisabilityCompetency,
              lessonType: config.lessonType,
              standardStructure: config.standardStructure
            },
            refText,
            textbookText,
            buildTeachingMethodsPrompt(selectedMethodIds, selectedTechniqueIds, selectedActivities),
            buildCompetenciesPrompt(config.schoolLevel, config.classLevel, refText),
            (teacherIdeas || ideaFilesText) ? `${teacherIdeas}${ideaFilesText ? '\n\nNội dung từ file đính kèm của giáo viên:' + ideaFilesText : ''}` : undefined
          );

          setLessons(prev => prev.map((l, idx) => idx === i ? { ...l, content, status: 'completed' } : l));
        } catch (err: any) {
          failedLessonCount += 1;
          lastLessonError = err?.message || 'Không xác định';
          setLessons(prev => prev.map((l, idx) => idx === i ? { ...l, status: 'error' } : l));
          toast.error(`Lỗi khi soạn ${initialLessons[i].info.tiet > 0 ? `tiết ${initialLessons[i].info.tiet}` : initialLessons[i].info.noi_dung}: ${lastLessonError}`);
        }
      }

      if (failedLessonCount > 0) {
        updateStep(
          'generate-content',
          'error',
          `${failedLessonCount}/${initialLessons.length} giáo án chưa tạo được. ${lastLessonError}`
        );
        toast.error(`${failedLessonCount}/${initialLessons.length} giáo án chưa tạo được; các giáo án thành công vẫn được giữ lại.`);
      } else {
        updateStep('generate-content', 'completed');
      }
      // Increment free usage counter for standard type
      if (
        failedLessonCount < initialLessons.length &&
        !isPremiumLoggedIn &&
        config.lessonType === 'standard'
      ) {
        const newCount = freeUsageCount + 1;
        setFreeUsageCount(newCount);
        localStorage.setItem('free_usage_count', String(newCount));
      }
      if (failedLessonCount === 0) {
        toast.success("Đã hoàn thành soạn thảo toàn bộ giáo án!");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Đã có lỗi xảy ra.");
      setSteps(prev => prev.map(s => s.status === 'processing' ? { ...s, status: 'error', error: err.message } : s));
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleLessonSelection = (index: number) => {
    setSelectedLessonIndices(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const toggleAllLessons = () => {
    if (selectedLessonIndices.size === extractedLessons.length) {
      setSelectedLessonIndices(new Set());
    } else {
      setSelectedLessonIndices(new Set(extractedLessons.map((_, i) => i)));
    }
  };

  const regenerateLesson = async (index: number) => {
    if (!config.apiKey) {
      setIsApiModalOpen(true);
      return;
    }
    const gemini = createGeminiService();
    const lesson = lessons[index];
    
    // Fallback: nếu sampleStructure rỗng, dùng cấu trúc chuẩn theo loại giáo án và cấu trúc 5512
    const defaultStructure = config.lessonType === 'standard'
      ? (config.standardStructure === 'structure2' ? STANDARD_STRUCTURE_2_PROMPT : LESSON_STRUCTURE_PROMPT)
      : getStructurePromptForType(config.lessonType);
    const structureToUse = sampleStructure || sessionStorage.getItem('sample_structure') || defaultStructure;
    
    setLessons(prev => prev.map((l, idx) => idx === index ? { ...l, status: 'generating' } : l));
    
    try {
      let refText = "";
      if (refFiles.length > 0) {
        const refParts = await Promise.all(refFiles.map(f => parseFile(f)));
        refText = refParts.join('\n\n---\n\n');
      }

      let textbookText = "";
      if (textbookFile) {
        textbookText = await parseFile(textbookFile);
      }

      const content = await gemini.generateLesson(
        lesson.info,
        structureToUse,
        { 
          school: config.schoolName, 
          dept: config.departmentName, 
          teacher: config.teacherName, 
          year: config.schoolYear,
          level: config.schoolLevel,
          classLevel: config.classLevel,
          subjectName: config.subjectName,
          enableAiCompetency: config.enableAiCompetency,
          enableDigitalCompetency: config.enableDigitalCompetency,
          enableForeignLanguage: config.enableForeignLanguage,
          enableDisabilityCompetency: config.enableDisabilityCompetency,
          lessonType: config.lessonType,
          standardStructure: config.standardStructure
        },
        refText,
        textbookText,
        buildTeachingMethodsPrompt(selectedMethodIds, selectedTechniqueIds, selectedActivities),
        buildCompetenciesPrompt(config.schoolLevel, config.classLevel, refText),
        (teacherIdeas || ideaFilesText) ? `${teacherIdeas}${ideaFilesText ? '\n\nNội dung từ file đính kèm của giáo viên:' + ideaFilesText : ''}` : undefined
      );
      
      setLessons(prev => prev.map((l, idx) => idx === index ? { ...l, content, status: 'completed' } : l));
      toast.success(`Đã soạn lại tiết ${lesson.info.tiet || lesson.info.noi_dung}`);
    } catch (err: any) {
      setLessons(prev => prev.map((l, idx) => idx === index ? { ...l, status: 'error' } : l));
      toast.error(`Lỗi khi soạn lại: ${err.message || 'Không xác định'}`);
    }
  };

  // Hàm retry từng step riêng lẻ
  const retryStep = async (stepId: string) => {
    if (!config.apiKey) {
      setIsApiModalOpen(true);
      return;
    }
    const gemini = createGeminiService();

    if (stepId === 'analyze-sample') {
      if (!sampleFile && config.lessonType !== 'standard') {
        toast.error('Vui lòng tải lên giáo án mẫu trước!');
        return;
      }
      setIsGenerating(true);
      updateStep('analyze-sample', 'processing');
      try {
        let structure = '';
        if (sampleFile) {
          const sampleResult = await parseFileAdvanced(sampleFile);
          const sampleText = sampleResult.type === 'text' ? (sampleResult.text || '') : '';
          const sampleImageData = sampleResult.type === 'image' ? sampleResult.imageData : undefined;
          structure = await gemini.analyzeSample(sampleText, sampleImageData);
        } else {
          structure = config.lessonType === 'standard'
            ? (config.standardStructure === 'structure2' ? STANDARD_STRUCTURE_2_PROMPT : LESSON_STRUCTURE_PROMPT)
            : getStructurePromptForType(config.lessonType);
        }
        setSampleStructure(structure);
        sessionStorage.setItem('sample_structure', structure);
        updateStep('analyze-sample', 'completed');
        toast.success('Cập nhật cấu trúc mẫu thành công!');
      } catch (err: any) {
        updateStep('analyze-sample', 'error', err.message);
        toast.error('Lỗi phân tích: ' + (err.message || 'Không xác định'));
      } finally {
        setIsGenerating(false);
      }
    } else if (stepId === 'extract-schedule') {
      const validManualEntries = manualEntries.filter(e =>
        e.loai === 'bai' ? (e.tenBai?.trim()) : (e.tiet?.trim())
      );
      if (!scheduleFile && validManualEntries.length === 0) {
        toast.error('Vui lòng tải file kế hoạch hoặc khai báo tiết học!');
        return;
      }
      setIsGenerating(true);
      updateStep('extract-schedule', 'processing');
      try {
        let schedule: LessonInfo[];
        if (validManualEntries.length > 0) {
          schedule = validManualEntries.map((entry) => {
            if (entry.loai === 'bai') {
              const thoiLuong = parseInt(entry.thoiLuong) || 2;
              return [{
                tiet: 0, tuan: 0, ngay_day: '',
                noi_dung: entry.tenBai.trim() || entry.noiDung.trim() || 'Bài học',
                ghi_chu: [
                  entry.noiDung?.trim() ? `Nội dung chi tiết: ${entry.noiDung}` : '',
                  `SOẠN THEO BÀI | THỜI LƯỢNG: ${thoiLuong} tiết`,
                ].filter(Boolean).join(' | '),
              }];
            } else {
              const tietParts = entry.tiet.split(/[,;\s]+/).filter(Boolean);
              return tietParts.map((t, i) => ({
                tiet: parseInt(t) || (i + 1), tuan: 0, ngay_day: '',
                noi_dung: entry.noiDung?.trim() || `Tiết ${t}`,
                ghi_chu: entry.chuDe?.trim() ? `Chủ đề: ${entry.chuDe}` : '',
              }));
            }
          }).flat();
        } else {
          const schedResult = await parseFileAdvanced(scheduleFile!);
          const schedText = schedResult.type === 'text' ? (schedResult.text || '') : '';
          const schedImageData = schedResult.type === 'image' ? schedResult.imageData : undefined;
          schedule = await gemini.extractSchedule(schedText, schedImageData);
        }
        if (schedule.length === 0) throw new Error('Không tìm thấy tiết dạy nào.');
        setExtractedLessons(schedule);
        setSelectedLessonIndices(new Set(schedule.map((_, i) => i)));
        setShowLessonSelector(true);
        updateStep('extract-schedule', 'completed');
        toast.success(`Đã tìm thấy ${schedule.length} tiết dạy.`);
      } catch (err: any) {
        updateStep('extract-schedule', 'error', err.message);
        toast.error('Lỗi trích xuất: ' + (err.message || 'Không xác định'));
      } finally {
        setIsGenerating(false);
      }
    }
  };

  // Hàm reset toàn bộ — làm mới từ đầu
  const resetAll = () => {
    if (lessons.length > 0 || extractedLessons.length > 0) {
      const confirmed = window.confirm('Bạn có chắc muốn làm mới từ đầu?\n\nTất cả giáo án đã sinh và kết quả phân tích sẽ bị xóa.');
      if (!confirmed) return;
    }
    // Lưu vào lịch sử trước khi xóa (nếu có lessons hoàn thành)
    const completedLessons = lessons.filter(l => l.status === 'completed');
    if (completedLessons.length > 0) {
      saveToHistory({
        subject: config.subjectName || 'Không rõ',
        schoolLevel: config.schoolLevel || '',
        classLevel: config.classLevel || '',
        lessonType: config.lessonType || 'standard',
        standardStructure: config.standardStructure,
        totalLessons: lessons.length,
        completedLessons: completedLessons.length,
        lessons: lessons,
      });
      setHistoryEntries(loadHistory());
    }
    setLessons([]);
    setExtractedLessons([]);
    setSelectedLessonIndices(new Set());
    setShowLessonSelector(false);
    setSampleStructure('');
    sessionStorage.removeItem('sample_structure');
    clearSession();
    setSteps([
      { id: 'analyze-sample', label: 'Phân tích cấu trúc mẫu', status: 'idle' },
      { id: 'extract-schedule', label: 'Trích xuất kế hoạch dạy', status: 'idle' },
      { id: 'generate-content', label: 'Sinh nội dung giáo án', status: 'idle' }
    ]);
    toast.success('Đã làm mới từ đầu. Phiên trước đã lưu vào lịch sử.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-teal-100 selection:text-teal-900 transition-colors duration-300">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-teal-50/80 dark:bg-gray-950/90 backdrop-blur-xl border-b border-teal-200/60 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-600/25">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-black tracking-[0.2em] bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent uppercase">
                {APP_NAME}
              </h1>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium -mt-0.5">
                Phát triển bởi thầy Trần Hoài Thanh - Zalo: 0348296773
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setIsApiModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
              title="Cài đặt API Key & Model"
            >
              <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-red-500" />
              <span className="text-xs font-bold text-red-500 hidden sm:inline">
                Lấy API key để sử dụng app
              </span>
            </button>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={cn(
                "relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors",
                showHistory ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
              )}
              title="Lịch sử sinh giáo án"
            >
              <History className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:inline">Lịch sử</span>
              {historyEntries.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {historyEntries.length > 9 ? '9+' : historyEntries.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
              title={isDarkMode ? 'Chế độ sáng' : 'Chế độ tối'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* History Panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 overflow-hidden z-30"
          >
            <div className="max-w-5xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-violet-500" />
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">Lịch sử sinh giáo án</h3>
                  <span className="text-xs text-gray-400">({historyEntries.length} phiên)</span>
                </div>
                {historyEntries.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm('Xóa toàn bộ lịch sử?')) {
                        clearHistory();
                        setHistoryEntries([]);
                        toast.success('Đã xóa lịch sử.');
                      }
                    }}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Xóa tất cả
                  </button>
                )}
              </div>

              {historyEntries.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Chưa có lịch sử nào. Các phiên sinh giáo án sẽ được lưu tự động tại đây.</p>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                  {historyEntries.map((entry) => (
                    <div key={entry.id} className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                      {/* Collapsed row */}
                      <div
                        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        onClick={() => setExpandedHistoryId(expandedHistoryId === entry.id ? null : entry.id)}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-sm">
                            {entry.lessonType === 'ncbh' ? '🔬' : entry.lessonType === 'stem' ? '⚙️' : '📋'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {entry.subject || 'Chưa rõ môn'}{entry.classLevel ? ` — ${entry.classLevel}` : ''}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 font-medium">
                                {getLessonTypeName(entry.lessonType, entry.standardStructure)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-400">{formatRelativeTime(entry.createdAt)}</span>
                              <span className="text-xs text-gray-300">•</span>
                              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                {entry.completedLessons}/{entry.totalLessons} tiết
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Khôi phục phiên
                              setLessons(entry.lessons);
                              setShowHistory(false);
                              toast.success('Đã khôi phục phiên làm việc.');
                            }}
                            className="text-xs px-3 py-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 font-medium hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
                          >
                            Khôi phục
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromHistory(entry.id);
                              setHistoryEntries(loadHistory());
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          {expandedHistoryId === entry.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                      </div>

                      {/* Expanded details */}
                      <AnimatePresence>
                        {expandedHistoryId === entry.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-gray-100 dark:border-gray-800 overflow-hidden"
                          >
                            <div className="p-3 bg-gray-50/50 dark:bg-gray-800/30 space-y-1.5 max-h-48 overflow-y-auto">
                              {entry.lessons.map((lesson, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs">
                                  <span className={cn(
                                    "w-1.5 h-1.5 rounded-full flex-shrink-0",
                                    lesson.status === 'completed' ? "bg-green-500" :
                                    lesson.status === 'error' ? "bg-red-500" : "bg-gray-300"
                                  )} />
                                  <span className="text-gray-600 dark:text-gray-400 truncate">
                                    Tiết {lesson.info.tiet}: {lesson.info.noi_dung}
                                  </span>
                                  <span className={cn(
                                    "text-[10px] font-medium flex-shrink-0 ml-auto",
                                    lesson.status === 'completed' ? "text-green-600" :
                                    lesson.status === 'error' ? "text-red-500" : "text-gray-400"
                                  )}>
                                    {lesson.status === 'completed' ? '✓' : lesson.status === 'error' ? '✗' : '—'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        {/* Hero */}
        <section className="text-center space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/30 dark:to-emerald-900/30 text-teal-700 dark:text-teal-300 text-sm font-semibold mb-4 shadow-sm">
              <Sparkles className="w-4 h-4" />
              Hỗ trợ bởi Gemini AI
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              <span className="rainbow-text-animated rainbow-glow text-4xl md:text-5xl" data-text="Soạn giáo án dễ dàng">Soạn giáo án dễ dàng</span>
              <br />
              <span className="rainbow-text-animated rainbow-glow text-5xl md:text-6xl" data-text="chỉ với 1 click">chỉ với 1 click</span>
            </h2>
            <div className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mt-4 space-y-2">
              <p>Tự động hóa quy trình soạn thảo giáo án tất cả các môn chuẩn cấu trúc.</p>
              <p>Tiết kiệm hàng giờ làm việc mỗi tuần.</p>
              <p>Truy cập: <a href="https://giaovienai.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-teal-600 dark:text-teal-400 font-semibold underline underline-offset-2 hover:text-teal-700 dark:hover:text-teal-300 transition-colors">giaovienai.vercel.app</a> để cập nhật các tool AI mới nhất</p>
            </div>
          </motion.div>
        </section>

        {/* Configuration Section */}
        <section className="space-y-8">
          <div className="space-y-8">
            {/* Lesson Type Selector — PHÍA TRÊN phần 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="card-3d space-y-4"
            >
              <div className="flex items-center gap-3 mb-1">
                <div className="badge-3d" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">Chọn loại giáo án</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Chọn định dạng giáo án phù hợp với yêu cầu</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {LESSON_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleLessonTypeClick(type.id)}
                    className={cn(
                      "relative p-4 rounded-2xl border-2 text-left transition-all group hover:shadow-md",
                      config.lessonType === type.id
                        ? type.color === 'teal'
                          ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 shadow-sm shadow-teal-200 dark:shadow-teal-900/40"
                          : type.color === 'violet'
                          ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 shadow-sm shadow-violet-200 dark:shadow-violet-900/40"
                          : "border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-sm shadow-amber-200 dark:shadow-amber-900/40"
                        : "border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900"
                    )}
                  >
                    {config.lessonType === type.id && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle2 className={cn(
                          "w-5 h-5",
                          type.color === 'teal' ? "text-teal-600" :
                          type.color === 'violet' ? "text-violet-600" :
                          "text-amber-600"
                        )} />
                      </div>
                    )}
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{type.name}</h4>
                      {!isPremiumLoggedIn && (
                        (type.id === 'ncbh' || type.id === 'stem') ? (
                          <Lock className="w-3.5 h-3.5 text-gray-400" />
                        ) : type.id === 'standard' && freeUsageCount >= 1 ? (
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                        ) : type.id === 'standard' && freeUsageCount === 0 ? (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-green-100 dark:bg-green-900/30 text-green-600 font-bold">Dùng thử</span>
                        ) : null
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-1">{type.desc}</p>
                  </button>
                ))}
              </div>

              {/* Sub-options: Lựa chọn Cấu trúc 1 hoặc Cấu trúc 2 khi chọn SOẠN KHBD 5512 */}
              {config.lessonType === 'standard' && (
                <div className="mt-4 pt-4 border-t border-teal-100 dark:border-teal-900/40 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                        Chọn cấu trúc Kế hoạch bài dạy 5512:
                      </span>
                    </div>
                    <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                      {(config.standardStructure || 'structure1') === 'structure2' ? 'Đang chọn: Cấu trúc 2' : 'Đang chọn: Cấu trúc 1'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {STANDARD_5512_STRUCTURES.map((struct) => {
                      const isSelected = (config.standardStructure || 'structure1') === struct.id;
                      return (
                        <div
                          key={struct.id}
                          onClick={() => saveConfig({ standardStructure: struct.id })}
                          className={cn(
                            "cursor-pointer relative p-3.5 rounded-xl border-2 transition-all duration-200 text-left",
                            isSelected
                              ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/20 shadow-md shadow-teal-500/10 ring-2 ring-teal-500/20"
                              : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700"
                          )}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5 flex-shrink-0">
                              <span className={cn(
                                "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
                                isSelected ? "border-teal-600 bg-teal-600 text-white" : "border-gray-300 dark:border-gray-600"
                              )}>
                                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                                <span className="font-bold text-sm text-gray-900 dark:text-white">
                                  {struct.shortName}
                                </span>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-teal-100/70 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                                  {struct.badge}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-2.5">
                                {struct.desc}
                              </p>
                              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-[11px]">
                                <span className="text-gray-400 font-mono">
                                  {struct.sampleFileName}
                                </span>
                                <a
                                  href={struct.id === 'structure2' ? '/templates/mau_khbd_cau_truc_2.docx' : '/templates/mau_giao_an_cau_truc_1.docx'}
                                  download={struct.sampleFileName}
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors p-0.5"
                                  title={`Tải về file ${struct.sampleFileName}`}
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  Tải file mẫu .docx
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Step 1: Upload */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card-3d space-y-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="badge-3d badge-3d-orange">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-xl title-3d-orange">1. Tải lên tài liệu</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <FileUploader 
                    label="Giáo án mẫu (.docx, .pdf)"
                    description={
                      config.lessonType === 'standard'
                        ? `Mẫu hệ thống sẵn có: ${config.standardStructure === 'structure2' ? 'Cấu trúc 2 (MẪU KHBD CẤU TRÚC 2.docx)' : 'Cấu trúc 1 (MẪU GIÁO ÁN.docx)'} — hoặc tải file riêng`
                        : "Để AI học cấu trúc giáo án của bạn"
                    }
                    file={sampleFile}
                    onFileSelect={setSampleFile}
                    required={config.lessonType !== 'standard'}
                  />
                  {config.lessonType === 'standard' && !sampleFile && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 text-xs border border-teal-200/60 dark:border-teal-800/40">
                      <span className="font-semibold">✓ Đã sẵn sàng:</span>
                      <span>Hệ thống sẽ dùng mẫu {(config.standardStructure || 'structure1') === 'structure2' ? 'Cấu trúc 2 (gọn 2 mục)' : 'Cấu trúc 1 (chuẩn 4 mục)'}. Bạn có thể bắt đầu soạn ngay!</span>
                    </div>
                  )}
                </div>
                <FileUploader 
                  label="Phân phối chương trình (.docx, .pdf)"
                  description="Đối chiếu tiết học, nội dung (tùy chọn nếu đã khai báo thủ công)"
                  file={scheduleFile}
                  onFileSelect={setScheduleFile}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FileUploader 
                  label="Bài học trong SGK (.docx, .pdf)"
                  description="Chỉ tải phần bài cần soạn — giáo án sẽ bám sát nội dung SGK"
                  file={textbookFile}
                  onFileSelect={setTextbookFile}
                />
                <div className="flex items-end">
                  <FileUploader 
                    label="Tài liệu tham khảo (.docx, .pdf)"
                    description="Bổ sung kiến thức — có thể tải nhiều file (tùy chọn)"
                    file={null}
                    onFileSelect={() => {}}
                    multiple
                    files={refFiles}
                    onFilesSelect={setRefFiles}
                  />
                </div>
              </div>
            </motion.div>

            {/* Step 2: Config + Khai báo bài học */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card-3d space-y-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="badge-3d badge-3d-pink">
                  <Settings className="w-5 h-5" />
                </div>
                <h3 className="text-xl title-3d-pink">2. Thông tin & Khai báo bài học</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Cấp học <span className="text-red-500">*</span></label>
                  <select 
                    value={config.schoolLevel}
                    onChange={(e) => saveConfig({ schoolLevel: e.target.value })}
                    className={cn(
                      "w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-gray-950 outline-none focus:ring-2 focus:ring-teal-500",
                      config.schoolLevel ? "border-gray-200 dark:border-gray-800" : "border-red-300 dark:border-red-700"
                    )}
                  >
                    <option value="">-- Chọn cấp học --</option>
                    <option value="Tiểu học">Tiểu học</option>
                    <option value="THCS">THCS</option>
                    <option value="THPT">THPT</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Lớp <span className="text-red-500">*</span></label>
                  <select 
                    value={config.classLevel}
                    onChange={(e) => saveConfig({ classLevel: e.target.value })}
                    disabled={!config.schoolLevel}
                    className={cn(
                      "w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-gray-950 outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50",
                      config.classLevel ? "border-gray-200 dark:border-gray-800" : "border-red-300 dark:border-red-700"
                    )}
                  >
                    <option value="">-- Chọn lớp --</option>
                    {(CLASS_OPTIONS[config.schoolLevel] || []).map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Môn học <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={config.subjectName}
                    onChange={(e) => saveConfig({ subjectName: e.target.value })}
                    placeholder="VD: Toán, Ngữ Văn, GDTC, Tiếng Anh..."
                    className={cn(
                      "w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-gray-950 outline-none focus:ring-2 focus:ring-teal-500",
                      config.subjectName ? "border-gray-200 dark:border-gray-800" : "border-red-300 dark:border-red-700"
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Tên trường</label>
                  <input 
                    type="text" 
                    value={config.schoolName}
                    onChange={(e) => saveConfig({ schoolName: e.target.value })}
                    placeholder="VD: THPT Chuyên Hà Nội - Amsterdam"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Tổ bộ môn</label>
                  <input 
                    type="text" 
                    value={config.departmentName}
                    onChange={(e) => saveConfig({ departmentName: e.target.value })}
                    placeholder="VD: Tổ Giáo dục Thể chất"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Tên giáo viên</label>
                  <input 
                    type="text" 
                    value={config.teacherName}
                    onChange={(e) => saveConfig({ teacherName: e.target.value })}
                    placeholder="VD: Nguyễn Văn A"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Năm học</label>
                  <input 
                    type="text" 
                    value={config.schoolYear}
                    onChange={(e) => saveConfig({ schoolYear: e.target.value })}
                    placeholder="VD: 2025-2026"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Toggle năng lực AI */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Thêm năng lực trí tuệ nhân tạo (AI) vào giáo án</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tích hợp năng lực AI theo 2422/QĐ-BGDĐT — tra cứu chính xác theo lớp và môn học</p>
                </div>
                <button
                  type="button"
                  onClick={() => saveConfig({ enableAiCompetency: !config.enableAiCompetency })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    config.enableAiCompetency ? 'bg-teal-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    config.enableAiCompetency ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Toggle năng lực số */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Thêm năng lực số</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tích hợp Khung năng lực số theo TT 02/2025/TT-BGDĐT — 6 miền năng lực, 24 năng lực thành phần</p>
                </div>
                <button
                  type="button"
                  onClick={() => saveConfig({ enableDigitalCompetency: !config.enableDigitalCompetency })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    config.enableDigitalCompetency ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    config.enableDigitalCompetency ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Toggle năng lực ngoại ngữ */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Thêm năng lực ngoại ngữ</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tích hợp tiếng Anh chuyên ngành theo phương pháp CLIL — QĐ 2371/QĐ-TTg</p>
                </div>
                <button
                  type="button"
                  onClick={() => saveConfig({ enableForeignLanguage: !config.enableForeignLanguage })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    config.enableForeignLanguage ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    config.enableForeignLanguage ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Toggle năng lực cho HS khuyết tật */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Thêm năng lực cho HS khuyết tật</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tích hợp giáo dục hòa nhập — điều chỉnh nội dung, KHGDCN cho học sinh khuyết tật</p>
                </div>
                <button
                  type="button"
                  onClick={() => saveConfig({ enableDisabilityCompetency: !config.enableDisabilityCompetency })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    config.enableDisabilityCompetency ? 'bg-amber-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    config.enableDisabilityCompetency ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>



              {/* Manual Lesson Input — ngay trong mục thông tin */}
              <ManualLessonInput
                entries={manualEntries}
                onChange={handleManualEntriesChange}
              />
            </motion.div>

            {/* Step 3: Phương pháp & Kĩ thuật dạy học */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card-3d space-y-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="badge-3d badge-3d-violet">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-xl title-3d-violet">3. Phương pháp & Kĩ thuật dạy học</h3>
              </div>

              <TeachingMethodSelector
                selectedMethodIds={selectedMethodIds}
                selectedTechniqueIds={selectedTechniqueIds}
                selectedActivities={selectedActivities}
                onMethodsChange={handleMethodsChange}
                onTechniquesChange={handleTechniquesChange}
                onActivitiesChange={handleActivitiesChange}
                subjectName={config.subjectName}
              />

              {/* Nút Gợi ý AI */}
              <button
                onClick={async () => {
                  if (!config.apiKey) { setIsApiModalOpen(true); return; }
                  setIsSuggesting(true);
                  try {
                    const gemini = createGeminiService();
                    // Thu thập nội dung đã phân tích
                    let contentContext = '';
                    if (sampleStructure) contentContext += 'Cấu trúc giáo án mẫu:\n' + sampleStructure.slice(0, 1500) + '\n\n';
                    if (manualEntries.length > 0) {
                      contentContext += 'Nội dung bài học:\n';
                      manualEntries.forEach(e => {
                        if (e.loai === 'bai') contentContext += `- Bài: ${e.tenBai}, Nội dung: ${e.noiDung}\n`;
                        else contentContext += `- Tiết ${e.tiet}: ${e.noiDung}\n`;
                      });
                    }
                    if (textbookFile) {
                      const tbText = await parseFile(textbookFile);
                      contentContext += '\nNội dung SGK:\n' + tbText.slice(0, 2000);
                    }

                    const subjectActivities = getSubjectActivities(config.subjectName);
                    const result = await gemini.suggestMethods(
                      config.subjectName,
                      contentContext,
                      TEACHING_METHODS.map(m => ({ id: m.id, name: m.name })),
                      TEACHING_TECHNIQUES.map(t => ({ id: t.id, name: t.name, group: t.groupLabel })),
                      subjectActivities
                    );

                    handleMethodsChange(result.methodIds);
                    handleTechniquesChange(result.techniqueIds);
                    handleActivitiesChange(result.activities);
                    toast.success(`AI đã gợi ý ${result.methodIds.length} phương pháp, ${result.techniqueIds.length} kĩ thuật, ${result.activities.length} hoạt động`);
                  } catch (err: any) {
                    toast.error('Lỗi khi gợi ý: ' + (err.message || 'Không xác định'));
                  } finally {
                    setIsSuggesting(false);
                  }
                }}
                disabled={isSuggesting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold hover:from-violet-600 hover:to-purple-700 disabled:opacity-60 transition-all shadow-sm"
              >
                {isSuggesting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Đang phân tích.....</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Gợi ý cho giáo án</>
                )}
              </button>
            </motion.div>

            {/* Step 4: Ý tưởng / hoạt động muốn thêm vào giáo án */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="card-3d space-y-4"
            >
              <div className="flex items-center gap-3 mb-1">
                <div className="badge-3d" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">4. Ý tưởng / hoạt động muốn thêm</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Không bắt buộc — nếu nhập, AI sẽ tích hợp vào giáo án</p>
                </div>
              </div>

              <textarea
                value={teacherIdeas}
                onChange={(e) => {
                  setTeacherIdeas(e.target.value);
                  localStorage.setItem('teacher_ideas', e.target.value);
                }}
                rows={4}
                placeholder={'Ví dụ:\n- Thêm hoạt động nhóm: cho HS thảo luận theo bàn 2 phút\n- Bài tập thêm: Tính diện tích hình tròn bán kính 5cm\n- Sử dụng video minh họa về phản ứng hóa học...'}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-400 resize-y min-h-[80px]"
              />

              {/* File đính kèm */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors">
                  <Paperclip className="w-4 h-4" />
                  <span>Đính kèm file bổ sung (bài tập, tài liệu...)</span>
                  <input
                    type="file"
                    multiple
                    accept=".docx,.pdf,.txt,.pptx"
                    className="hidden"
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []) as File[];
                      setIdeaFiles(files);
                      // Parse files to text for prompt
                      let parsed = '';
                      for (const f of files) {
                        try {
                          const t = await parseFile(f);
                          parsed += `\n--- Nội dung file "${f.name}" ---\n${t}\n`;
                        } catch {
                          parsed += `\n[Không đọc được file: ${f.name}]\n`;
                        }
                      }
                      setIdeaFilesText(parsed);
                    }}
                  />
                </label>
                {ideaFiles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ideaFiles.map((f, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-xs text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <Paperclip className="w-3 h-3" />
                        {f.name}
                        <button
                          onClick={async () => {
                            const next = ideaFiles.filter((_, idx) => idx !== i);
                            setIdeaFiles(next);
                            if (next.length === 0) {
                              setIdeaFilesText('');
                              return;
                            }

                            let reparsed = '';
                            for (const remainingFile of next) {
                              try {
                                const text = await parseFile(remainingFile);
                                reparsed += `\n--- Nội dung file "${remainingFile.name}" ---\n${text}\n`;
                              } catch {
                                reparsed += `\n[Không đọc được file: ${remainingFile.name}]\n`;
                              }
                            }
                            setIdeaFilesText(reparsed);
                          }}
                          className="ml-1 text-amber-400 hover:text-red-500"
                        >×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Trạng thái xử lý — ngay dưới mục 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card-3d space-y-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="badge-3d badge-3d-teal">
                  <ListChecks className="w-5 h-5" />
                </div>
                <h3 className="text-xl title-3d-teal">Trạng thái xử lý</h3>
              </div>
              
              <div className="space-y-5">
                {steps.map((step, idx) => (
                  <div key={step.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "step-circle-3d",
                        step.status === 'completed' ? "completed" :
                        step.status === 'processing' ? "processing" :
                        step.status === 'error' ? "error" :
                        "idle"
                      )}>
                        {step.status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                      {idx < steps.length - 1 && (
                        <div className={cn(
                          "step-connector-3d",
                          step.status === 'completed' ? "completed" : "idle"
                        )} />
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className={cn(
                        "text-sm font-bold transition-colors",
                        step.status === 'completed' ? "text-teal-600" :
                        step.status === 'processing' ? "text-teal-600" :
                        "text-gray-500"
                      )}>
                        {step.label}
                      </p>
                      {step.status === 'processing' && (
                        <p className="text-xs text-teal-500 mt-1 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Đang xử lý...
                        </p>
                      )}
                      {step.status === 'error' && (
                        <div className="mt-1">
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span className="break-all">{step.error}</span>
                          </p>
                          {step.id !== 'generate-content' && (
                            <button
                              onClick={() => retryStep(step.id)}
                              disabled={isGenerating}
                              className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Thử lại bước này
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  onClick={startGeneration}
                  disabled={isGenerating || showLessonSelector || (!sampleFile && config.lessonType !== 'standard') || !config.schoolLevel || !config.classLevel || (!scheduleFile && !manualEntries.some(e => e.loai === 'bai' ? e.tenBai?.trim() : e.tiet?.trim()))}
                  className="btn-3d btn-3d-teal flex-1"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Phân tích cấu trúc giáo án
                    </>
                  )}
                </button>

                {(lessons.length > 0 || extractedLessons.length > 0 || steps.some(s => s.status !== 'idle')) && (
                  <button
                    onClick={resetAll}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-4 py-3 rounded-2xl border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-all"
                    title="Làm mới từ đầu — xóa tất cả kết quả"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span className="hidden sm:inline">Làm mới</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Lesson Selector Section */}
        <AnimatePresence>
          {showLessonSelector && extractedLessons.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center text-teal-600">
                    <ListChecks className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold">
                    Chọn tiết dạy cần tạo giáo án
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({selectedLessonIndices.size}/{extractedLessons.length} đã chọn)
                    </span>
                  </h3>
                </div>
                <button
                  onClick={toggleAllLessons}
                  className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                >
                  {selectedLessonIndices.size === extractedLessons.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {extractedLessons.map((lesson, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleLessonSelection(idx)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all",
                      selectedLessonIndices.has(idx)
                        ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                        : "border-gray-100 dark:border-gray-800 hover:border-teal-200 dark:hover:border-teal-800"
                    )}
                  >
                    {selectedLessonIndices.has(idx)
                      ? <SquareCheck className="w-5 h-5 text-teal-600 shrink-0" />
                      : <Square className="w-5 h-5 text-gray-300 dark:text-gray-600 shrink-0" />
                    }
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        Tiết {lesson.tiet}: {lesson.noi_dung}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Tuần {lesson.tuan} • {lesson.ngay_day}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={generateSelectedLessons}
                disabled={isGenerating || selectedLessonIndices.size === 0}
                className="w-full py-4 rounded-2xl bg-teal-600 text-white font-bold shadow-xl shadow-teal-600/30 hover:bg-teal-700 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang sinh giáo án...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Sinh giáo án cho {selectedLessonIndices.size} tiết đã chọn
                  </>
                )}
              </button>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <AnimatePresence>
          {lessons.length > 0 && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h3 className="text-2xl font-black tracking-tight">Danh sách giáo án đã sinh</h3>
                <div className="flex items-center gap-3">
                  {/* Math Mode Toggle */}
                  <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-0.5">
                    <button
                      onClick={() => { setMathMode('omml'); localStorage.setItem('math_mode', 'omml'); }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                        mathMode === 'omml' ? "bg-white dark:bg-gray-700 text-teal-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                      )}
                      title="Công thức Equation có thể chỉnh sửa trực tiếp trong Microsoft Word (OMML)"
                    >
                      ∑ Equation
                    </button>
                    <button
                      onClick={() => { setMathMode('latex'); localStorage.setItem('math_mode', 'latex'); }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                        mathMode === 'latex' ? "bg-white dark:bg-gray-700 text-violet-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                      )}
                      title="Công thức dạng LaTeX"
                    >
                      $x$ LaTeX
                    </button>
                  </div>
                  <button 
                    onClick={() => downloadAllAsZip(lessons, mathMode)}
                    disabled={!lessons.some(l => l.status === 'completed')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    Tải tất cả (.zip)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lessons.map((lesson, idx) => (
                  <LessonItem 
                    key={idx} 
                    lesson={lesson} 
                    onRegenerate={() => regenerateLesson(idx)}
                    mathMode={mathMode}
                  />
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-teal-200/60 dark:border-gray-800 mt-20 py-10 bg-teal-50/60 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white tracking-wide">{APP_NAME}</span>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2026 • Công cụ hỗ trợ giáo viên Việt Nam
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Phát triển bởi thầy Trần Hoài Thanh
          </p>
        </div>
      </footer>

      {/* Premium Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLoginModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6 text-white relative">
                <button 
                  onClick={() => setShowLoginModal(false)}
                  className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Đăng nhập</h3>
                    <p className="text-sm text-white/80">Tính năng yêu cầu tài khoản</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="p-6 space-y-4">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 rounded-xl">
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    🔒 {pendingAction === 'generate' && pendingLessonType === 'standard' 
                      ? 'Bạn đã sử dụng hết lượt dùng thử miễn phí. '
                      : `Tính năng ${pendingLessonType === 'ncbh' ? 'SOẠN KẾ HOẠCH NCBH' : pendingLessonType === 'stem' ? 'SOẠN KHBD STEM' : 'SOẠN KHBD 5512'} `
                    }
                    {pendingAction === 'generate' && pendingLessonType === 'standard'
                      ? 'Vui lòng đăng nhập để tiếp tục sử dụng.'
                      : 'yêu cầu đăng nhập. Vui lòng nhập tài khoản được cấp.'
                    }
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tên đăng nhập</label>
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => { setLoginUsername(e.target.value); setLoginError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handlePremiumLogin()}
                    placeholder="Nhập email hoặc username"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mật khẩu</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => { setLoginPassword(e.target.value); setLoginError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handlePremiumLogin()}
                    placeholder="Nhập mật khẩu"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                  />
                </div>

                {loginError && (
                  <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {loginError}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 pt-0 flex gap-3">
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handlePremiumLogin}
                  disabled={!loginUsername.trim() || !loginPassword.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                >
                  <LogIn className="w-4 h-4" />
                  Đăng nhập
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ApiKeyModal 
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        onSave={(payload) => saveConfig({
          provider: payload.provider,
          geminiApiKey: payload.geminiApiKey,
          agentPlatformApiKey: payload.agentPlatformApiKey,
          apiKey: payload.apiKey,
          model: payload.model
        })}
        provider={config.provider}
        geminiApiKey={config.geminiApiKey}
        agentPlatformApiKey={config.agentPlatformApiKey}
        selectedModel={config.model}
        onModelSelect={(id) => saveConfig({ model: id })}
        forceOpen={!config.apiKey}
      />
    </div>
  );
}
