export type AiProvider = 'gemini' | 'agent-platform';

export interface LessonInfo {
  tiet: number;
  tuan: number;
  ngay_day: string;
  noi_dung: string;
  ghi_chu?: string;
}

export type StandardStructure = 'structure1' | 'structure2';

export interface AppConfig {
  apiKey: string;
  geminiApiKey: string;
  agentPlatformApiKey: string;
  provider: AiProvider;
  model: string;
  lessonType: 'standard' | 'ncbh' | 'stem';
  standardStructure?: StandardStructure;
  schoolLevel: string;
  classLevel: string;
  subjectName: string;
  schoolName: string;
  departmentName: string;
  teacherName: string;
  schoolYear: string;
  enableAiCompetency: boolean;
  enableDigitalCompetency: boolean;
  enableForeignLanguage: boolean;
  enableDisabilityCompetency: boolean;
}

export interface GenerationStep {
  id: 'analyze-sample' | 'extract-schedule' | 'generate-content';
  label: string;
  status: 'idle' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface GeneratedLesson {
  info: LessonInfo;
  content: string;
  status: 'idle' | 'generating' | 'completed' | 'error';
}
