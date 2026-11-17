// Gemini AI & Agent Platform Service tuân thủ nghiêm ngặt api.md (Phiên bản 4.1)
import { GoogleGenAI } from '@google/genai';

export type AiProvider = 'gemini' | 'agent-platform';

export interface ModelOption {
  id: string;
  name: string;
  isDefault?: boolean;
  provider: AiProvider;
  description?: string;
}

export const GEMINI_MODELS: ModelOption[] = [
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', isDefault: true, provider: 'gemini', description: 'Mặc định; ưu tiên chất lượng và độ ổn định (GA)' },
  { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash', provider: 'gemini', description: 'Dự phòng cân bằng giữa tốc độ và chất lượng (GA)' },
  { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash-Lite', provider: 'gemini', description: 'Dự phòng nhanh, chi phí thấp (GA)' },
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', provider: 'gemini', description: 'Dự phòng ổn định (GA)' },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', provider: 'gemini', description: 'Dự phòng chất lượng cao (GA)' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash-Lite', provider: 'gemini', description: 'Dự phòng tương thích ngược (Stable)' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'gemini', description: 'Dự phòng cuối chuỗi (Stable)' },
];

export const GEMINI_FALLBACK_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
] as const;

export const AGENT_PLATFORM_MODELS: ModelOption[] = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', isDefault: true, provider: 'agent-platform', description: 'Mặc định cho Agent Platform' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite', provider: 'agent-platform', description: 'Chi phí thấp, phản hồi nhanh' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'agent-platform', description: 'Suy luận mạnh, xử lý tài liệu dài' },
];

export const AGENT_PLATFORM_FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'] as const;

export const AI_MODELS = GEMINI_MODELS;
export type ModelId = string;

export const createGoogleAiClient = (apiKey: string, provider: AiProvider): GoogleGenAI => {
  if (provider === 'agent-platform') return new GoogleGenAI({ vertexai: true, apiKey });
  return new GoogleGenAI({ apiKey });
};

export const GOOGLE_AI_API_KEY_PATTERN = /^(?:AIzaSy|AQ)\S{8,}$/;
export function validateApiKey(key: string): boolean {
  return !!key && GOOGLE_AI_API_KEY_PATTERN.test(key.trim());
}

export type ApiErrorType = 'MODEL_OVERLOADED' | 'NOT_FOUND' | 'KEY_INVALID' | 'PERMISSION_DENIED' | 'RATE_LIMIT' | 'INVALID_ARGUMENT' | 'UNKNOWN';

export interface ParsedApiError {
  type: ApiErrorType;
  message: string;
  statusCode?: number;
  rawError: unknown;
}

export function parseApiError(error: unknown, provider: AiProvider = 'gemini'): ParsedApiError {
  const err = error as { message?: string; statusText?: string; status?: number; code?: number; statusCode?: number } | null | undefined;
  const msg = (err?.message || err?.statusText || String(error || '')).toLowerCase();
  const status = err?.status || err?.code || err?.statusCode;

  if (status === 401 || msg.includes('api_key_invalid') || msg.includes('api key not valid') || msg.includes('unauthenticated')) {
    return { type: 'KEY_INVALID', statusCode: 401, message: 'API Key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại trong Cài đặt.', rawError: error };
  }

  if (status === 403 || msg.includes('permission_denied') || msg.includes('permission denied')) {
    return {
      type: 'PERMISSION_DENIED',
      statusCode: 403,
      message: provider === 'agent-platform'
        ? 'Google đã nhận key nhưng dự án/key chưa được cấp quyền gọi Agent Platform API hoặc model này. Vui lòng kiểm tra Agent Platform API đã bật, billing và quyền sử dụng model.'
        : 'API key không có quyền truy cập Gemini API.',
      rawError: error,
    };
  }

  if (status === 429 || msg.includes('resource_exhausted') || msg.includes('quota') || msg.includes('rate limit')) {
    return { type: 'RATE_LIMIT', statusCode: 429, message: 'Đã hết quota hoặc vượt giới hạn tốc độ API. Vui lòng đợi rồi thử lại.', rawError: error };
  }

  if (status === 400 || msg.includes('invalid_argument') || msg.includes('bad request')) {
    return { type: 'INVALID_ARGUMENT', statusCode: 400, message: 'Yêu cầu không hợp lệ hoặc tham số không được hỗ trợ bởi model này.', rawError: error };
  }

  if (status === 404 || msg.includes('not_found') || msg.includes('not found')) {
    return { type: 'NOT_FOUND', statusCode: 404, message: 'Model hoặc endpoint không khả dụng.', rawError: error };
  }

  if (status === 500 || status === 502 || status === 503 || status === 504 || msg.includes('overloaded') || msg.includes('high demand') || msg.includes('try again later') || msg.includes('temporarily unavailable') || msg.includes('unavailable') || msg.includes('deadline_exceeded')) {
    return { type: 'MODEL_OVERLOADED', statusCode: status || 503, message: 'Model đang quá tải; app đang tự động thử model dự phòng.', rawError: error };
  }

  const errorObj = error as { message?: string } | undefined;
  return { type: 'UNKNOWN', statusCode: status, message: errorObj?.message || 'Lỗi không xác định khi kết nối với AI.', rawError: error };
}

function normalizeModelId(model: string): string {
  return model.trim();
}

export function getOrderedModels(selectedModel?: string, provider: AiProvider = 'gemini'): string[] {
  const fallbackList = provider === 'agent-platform' ? AGENT_PLATFORM_FALLBACK_MODELS : GEMINI_FALLBACK_MODELS;
  const defaultModel = provider === 'agent-platform' ? 'gemini-2.5-flash' : 'gemini-3.8-flash';
  const initialModel = selectedModel && selectedModel.trim() ? normalizeModelId(selectedModel) : defaultModel;
  const ordered: string[] = [initialModel];
  for (const m of fallbackList) if (!ordered.includes(m)) ordered.push(m);
  return ordered;
}

function buildGenerateConfig(model: string, isJson: boolean, maxOutputTokens: number): Record<string, unknown> {
  const config: Record<string, unknown> = { maxOutputTokens };
  if (isJson) config.responseMimeType = 'application/json';

  const isGemini3 = model.startsWith('gemini-3');
  if (isGemini3) {
    config.thinkingConfig = { thinkingLevel: 'LOW' };
    return config;
  }

  config.temperature = 0.7;
  return config;
}

export interface CallGoogleAiOptions {
  apiKey: string;
  provider?: AiProvider;
  selectedModel?: string;
  prompt: string;
  isJson?: boolean;
  maxOutputTokens?: number;
  onFallback?: (sourceModel: string, targetModel: string, reason: string) => void;
}

export async function callGoogleAiWithFallback(options: CallGoogleAiOptions): Promise<{ text: string; usedModel: string }> {
  const provider = options.provider || 'gemini';
  const models = getOrderedModels(options.selectedModel, provider);
  const client = createGoogleAiClient(options.apiKey, provider);

  let lastError: unknown = null;
  for (let i = 0; i < models.length; i++) {
    const currentModel = models[i];
    try {
      const config = buildGenerateConfig(currentModel, !!options.isJson, options.maxOutputTokens || 32768);
      const response = await client.models.generateContent({ model: currentModel, contents: options.prompt, config: config as Parameters<typeof client.models.generateContent>[0]['config'] });
      const text = response.text || '';
      if (!text) throw new Error('Không nhận được nội dung từ API');
      return { text, usedModel: currentModel };
    } catch (error: unknown) {
      lastError = error;
      const parsed = parseApiError(error, provider);
      const isAllowedFallback = parsed.type === 'MODEL_OVERLOADED' || parsed.type === 'NOT_FOUND' || (provider === 'agent-platform' && parsed.type === 'PERMISSION_DENIED');
      if (isAllowedFallback && i < models.length - 1) {
        options.onFallback?.(currentModel, models[i + 1], parsed.message || 'Model đang gặp sự cố');
        continue;
      }
      throw new Error(parsed.message);
    }
  }

  const err = lastError as Error | null | undefined;
  throw new Error(err?.message || 'Không thể kết nối với bất kỳ model AI nào');
}

export interface GenerationResult {
  success: boolean;
  slides?: string;
  error?: string;
  usedModel?: string;
}

export interface GenerationProgress {
  step: number;
  totalSteps: number;
  status: 'pending' | 'processing' | 'completed' | 'error' | 'stopped';
  message: string;
  currentModel?: string;
}

export interface SlideOutline {
  slideNumber: number;
  title: string;
  keyPoints: string[];
  enableSimulation?: boolean;
}

const generateOutlinePrompt = (content: string, topic: string, slideCount: number): string => {
  return `Bạn là chuyên gia thiết kế bài giảng. Hãy lập kế hoạch và tạo outline cho ${slideCount} slide về chủ đề sau:

CHỦ ĐỀ: ${topic}

${content ? `NỘI DUNG THAM KHẢO:\n${content}` : ''}

Trả về định dạng JSON array chuẩn:
[
  {"slideNumber": 1, "title": "Tiêu đề slide", "keyPoints": ["Điểm 1", "Điểm 2", "Điểm 3"]},
  ...
]

CHỈ TRẢ VỀ JSON ARRAY, KHÔNG KÈM THEO MARKDOWN HAY GIẢI THÍCH NGOÀI.`;
};

const generateSlidePrompt = (content: string, topic?: string, slideCount?: number, outline?: SlideOutline[], subject?: string, gradeLevel?: string, enableSimulation?: boolean): string => {
  const slideCountInstruction = slideCount ? `Tạo ĐÚNG ${slideCount} slide` : 'Tạo 5-8 slide phù hợp với độ dài nội dung';
  const outlineInstruction = outline && outline.length > 0 ? `\nDÀN Ý YÊU CẦU (tuân theo cấu trúc này):\n${outline.map((s) => `Slide ${s.slideNumber}: ${s.title}${s.enableSimulation ? ' 🎮[CẦN MÔ PHỎNG TƯƠNG TÁC]' : ''}\n  - ${s.keyPoints.join('\n  - ')}`).join('\n')}` : '';
  const slidesWithSimulation = outline?.filter((s) => s.enableSimulation) || [];
  const hasPerSlideSimulation = slidesWithSimulation.length > 0;

  let ageAppropriateInstruction = '';
  if (gradeLevel) {
    const gradeLevelMap: Record<string, { level: string; style: string; complexity: string }> = {
      preschool: { level: 'Mầm non (3-5 tuổi)', style: 'rất đơn giản, nhiều hình ảnh minh họa đầy màu sắc, ít chữ, font lớn', complexity: 'rất cơ bản' },
      grade1: { level: 'Lớp 1 (6-7 tuổi)', style: 'đơn giản, nhiều hình ảnh, chữ to rõ ràng', complexity: 'cơ bản' },
      grade2: { level: 'Lớp 2 (7-8 tuổi)', style: 'đơn giản, hình ảnh minh họa phong phú', complexity: 'cơ bản' },
      grade3: { level: 'Lớp 3 (8-9 tuổi)', style: 'vừa phải, có hình ảnh hỗ trợ', complexity: 'cơ bản đến trung bình' },
      grade4: { level: 'Lớp 4 (9-10 tuổi)', style: 'rõ ràng, có ví dụ minh họa', complexity: 'trung bình' },
      grade5: { level: 'Lớp 5 (10-11 tuổi)', style: 'chi tiết hơn, kết hợp hình và chữ', complexity: 'trung bình' },
      grade6: { level: 'Lớp 6 THCS (11-12 tuổi)', style: 'chi tiết, có sơ đồ và biểu đồ', complexity: 'trung bình khá' },
      grade7: { level: 'Lớp 7 THCS (12-13 tuổi)', style: 'logic, có dẫn chứng', complexity: 'khá' },
      grade8: { level: 'Lớp 8 THCS (13-14 tuổi)', style: 'chuyên sâu hơn, có công thức', complexity: 'khá đến nâng cao' },
      grade9: { level: 'Lớp 9 THCS (14-15 tuổi)', style: 'toàn diện, chuẩn bị thi', complexity: 'nâng cao' },
      grade10: { level: 'Lớp 10 THPT (15-16 tuổi)', style: 'học thuật, có lý thuyết và ví dụ', complexity: 'nâng cao' },
      grade11: { level: 'Lớp 11 THPT (16-17 tuổi)', style: 'chuyên sâu, công thức phức tạp', complexity: 'nâng cao' },
      grade12: { level: 'Lớp 12 THPT (17-18 tuổi)', style: 'ôn thi, tổng hợp kiến thức', complexity: 'nâng cao, tổng kết' },
    };
    const gradeInfo = gradeLevelMap[gradeLevel];
    if (gradeInfo) ageAppropriateInstruction = `\n\n🎓 ĐỐI TƯỢNG: ${gradeInfo.level}\n- Phong cách trình bày: ${gradeInfo.style}\n- Độ phức tạp nội dung: ${gradeInfo.complexity}\n- Điều chỉnh ngôn ngữ và thuật ngữ phù hợp với lứa tuổi`;
  }

  let subjectInstruction = '';
  if (subject) {
    const subjectMap: Record<string, { name: string; visualStyle: string }> = {
      math: { name: 'Toán học (Mathematics)', visualStyle: 'đồ thị hàm số, hình học, công thức LaTeX' },
      physics: { name: 'Vật lý (Physics)', visualStyle: 'sơ đồ lực, biểu đồ chuyển động, mô hình thí nghiệm' },
      chemistry: { name: 'Hóa học (Chemistry)', visualStyle: 'công thức cấu tạo, phương trình phản ứng, mô hình phân tử' },
      biology: { name: 'Sinh học (Biology)', visualStyle: 'sơ đồ tế bào, chu trình sinh học, cây phát sinh' },
      informatics: { name: 'Tin học (Informatics)', visualStyle: 'sơ đồ khối, code snippet, flowchart' },
      literature: { name: 'Ngữ văn (Literature)', visualStyle: 'trích dẫn, sơ đồ tư duy, timeline tác phẩm' },
      history: { name: 'Lịch sử (History)', visualStyle: 'timeline lịch sử, bản đồ, hình ảnh tư liệu' },
      geography: { name: 'Địa lý (Geography)', visualStyle: 'bản đồ, biểu đồ thống kê, sơ đồ địa hình' },
      technology: { name: 'Công nghệ (Technology)', visualStyle: 'sơ đồ quy trình, bản vẽ kỹ thuật' },
      music: { name: 'Âm nhạc (Music)', visualStyle: 'bản nhạc, ký hiệu nhạc, hình ảnh nhạc cụ' },
      physical_education: { name: 'Thể dục (Physical Education)', visualStyle: 'hình minh họa động tác, sơ đồ sân bãi' },
      defense_security: { name: 'GDQPAN (Defense & Security)', visualStyle: 'sơ đồ đội hình, hình ảnh minh họa' },
      career_orientation: { name: 'Hướng nghiệp (Career Orientation)', visualStyle: 'sơ đồ nghề nghiệp, infographic' },
      local_education: { name: 'GD địa phương (Local Education)', visualStyle: 'hình ảnh địa phương, bản đồ vùng miền' },
      economics_law: { name: 'KT & Pháp luật (Economics & Law)', visualStyle: 'sơ đồ kinh tế, biểu đồ, các điều luật' },
      english: { name: 'Tiếng Anh (English)', visualStyle: 'ví dụ câu, từ vựng với hình ảnh, bảng ngữ pháp' },
    };
    const subjectInfo = subjectMap[subject];
    if (subjectInfo) {
      subjectInstruction = subject === 'english'
        ? `\n\n📚 MÔN HỌC: ${subjectInfo.name}\n- TOÀN BỘ NỘI DUNG SLIDE PHẢI BẰNG TIẾNG ANH (English only)\n- Tiêu đề, nội dung, ví dụ đều viết bằng tiếng Anh\n- Có thể thêm phần dịch nghĩa tiếng Việt nhỏ bên dưới nếu cần\n- Phong cách trực quan: ${subjectInfo.visualStyle}`
        : `\n\n📚 MÔN HỌC: ${subjectInfo.name}\n- TOÀN BỘ NỘI DUNG SLIDE BẰNG TIẾNG VIỆT\n- KHÔNG sử dụng thuật ngữ tiếng Anh\n- Phong cách trực quan phù hợp: ${subjectInfo.visualStyle}`;
    }
  }

  let simulationInstruction = '';
  if (enableSimulation || hasPerSlideSimulation) {
    const simulationTarget = hasPerSlideSimulation ? `CHỈ TẠO MÔ PHỎNG CHO CÁC SLIDE SAU: ${slidesWithSimulation.map((s) => `Slide ${s.slideNumber}`).join(', ')}` : 'TẠO MÔ PHỎNG CHO TẤT CẢ CÁC SLIDE PHÙ HỢP';
    simulationInstruction = `\n\n🎮 MÔ PHỎNG TRỰC QUAN TƯƠNG TÁC:\n${simulationTarget}\n\nYêu cầu kỹ thuật:\n1. Sử dụng <div class="simulation"> chứa inline SVG hoặc Canvas\n2. Thêm JavaScript inline để xử lý tương tác (click, hover, slider)\n3. Ví dụ mô phỏng theo môn:\n   - Toán: Đồ thị hàm số với slider điều chỉnh tham số, hình học động\n   - Vật lý: Mô phỏng chuyển động (rơi tự do, dao động), sóng, lực\n   - Hóa học: Mô hình phân tử 3D đơn giản, phản ứng hóa học động\n   - Sinh học: Sơ đồ tế bào có thể click xem chi tiết, chu trình\n   - Các môn khác: Timeline tương tác, sơ đồ tư duy có thể mở rộng\n4. Code phải đơn giản, chạy được ngay trong browser\n5. Thêm hướng dẫn sử dụng cho học sinh ("Click vào...", "Kéo thanh trượt...")\n\nMẪU CODE MÔ PHỎNG:\n<div class="simulation">\n  <svg viewBox="0 0 400 300" style="width:100%;max-height:250px;background:#f8fafc;border-radius:8px;">\n    <!-- SVG content here -->\n  </svg>\n  <div class="sim-controls"><!-- Buttons, sliders --></div>\n  <script>(function(){ /* Interactive JS */ })();</script>\n</div>`;
  }

  const mediaInstruction = `\n\n🖼️ HÌNH ẢNH:\n- KHÔNG sử dụng hình ảnh từ URL bên ngoài vì có thể không load được\n- Thay vào đó, tạo SVG đơn giản để minh họa khái niệm\n- Hoặc dùng emoji lớn để minh họa: <span style="font-size:3rem">📐</span>`;
  const colorEmphasisInstruction = `\n\n🎨 NHẤN MẠNH NỘI DUNG BẰNG MÀU SẮC:\nSử dụng các class CSS có sẵn để làm nổi bật nội dung quan trọng:\n\nMàu chữ:\n- <span class="text-primary">màu xanh dương</span>\n- <span class="text-success">màu xanh lá</span>  \n- <span class="text-danger">màu đỏ</span>\n- <span class="text-warning">màu vàng cam</span>\n- <span class="text-pink">màu hồng</span>\n- <span class="text-secondary">màu tím</span>\n\nHighlight nền:\n- <span class="highlight">nền vàng quan trọng</span>\n- <span class="highlight-blue">nền xanh dương</span>\n- <span class="highlight-green">nền xanh lá</span>\n\nKeyword box:\n- <span class="keyword">từ khóa xanh</span>\n- <span class="keyword-green">từ khóa xanh lá</span>\n- <span class="keyword-orange">từ khóa cam</span>\n\n- <span class="emphasis">in đậm xanh</span>\n- <span class="emphasis-red">in đậm đỏ</span>\n\nHÃY SỬ DỤNG LINH HOẠT các class này để nhấn mạnh khái niệm quan trọng, định nghĩa, công thức!`;

  return `Bạn là một Chuyên gia Thiết kế Bài giảng Điện tử Tương tác & Lập trình Web Sư phạm đỉnh cao theo chương trình GDPT 2018.\nHãy tạo toàn bộ các thẻ Slide HTML chất lượng cao cho nội dung sau:\n\n${topic ? `CHỦ ĐỀ BÀI HỌC: ${topic}` : ''}\n\nNỘI DUNG TÀI LIỆU THAM KHẢO:\n${content}\n${outlineInstruction}${ageAppropriateInstruction}${subjectInstruction}${simulationInstruction}${mediaInstruction}${colorEmphasisInstruction}\n\nQUY TẮC CẤU TRÚC VÀ BỐ CỤC BỘ SLIDE (THEO CHUẨN SƯ PHẠM):\n1. ${slideCountInstruction}\n2. Mỗi slide phải là một thẻ <section class="slide">...</section>.\n3. Slide 1 (Trang bìa):\n   - Tiêu đề bài học lớn nổi bật (h1)\n   - Thông tin phân môn, khối lớp, thời lượng (tiết học)\n   - Huy hiệu "GDPT 2018" hoặc "Năng lực số"\n   - Khung thông tin Giáo viên & Đơn vị công tác\n4. Slide 2 (Mục tiêu bài học):\n   - Trình bày 3 nhóm: 1. Kiến thức trọng tâm, 2. Năng lực số / Năng lực chuyên môn, 3. Phẩm chất & Năng lực chung.\n5. Các Slide Nội dung trọng tâm:\n   - Trình bày bài giảng khoa học, đầy đủ dẫn chứng, ví dụ thực tế và giải thích chi tiết.\n   - Bố cục 2 cột cân đối lấp đầy slide: sử dụng <div class="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 items-stretch">.\n   - Bên trái là Định nghĩa/Quy tắc đóng khung trong <div class="box">, bên phải là Ví dụ đối chiếu, bảng phân tích hoặc bài toán áp dụng.\n   - Các ô/box trong từng cột cần có nội dung chi tiết, mở rộng chiều cao hài hòa, không để trống trải.\n6. Slide Trắc nghiệm / Tương tác củng cố / Mini-Quiz:\n   - Chứa câu hỏi trắc nghiệm hoặc bài tập vận dụng với các phương án A, B, C, D rõ ràng.\n   - QUY TẮC BẮT BUỘC ĐỂ KHÔNG BỊ LỖI KÝ TỰ TOÁN HỌC & MATHJAX:\n     + MỌI phần Phản hồi & Lời giải chi tiết (Feedback/Explanation) BẮT BUỘC PHẢI ĐƯỢC VIẾT SẴN TRONG THẺ HTML TĨNH:\n       '<div id="feedback-box" class="feedback-box hidden p-4 rounded-xl border border-emerald-300 bg-emerald-50/90 text-slate-800 space-y-2 mt-4" style="display: none;">'\n         '<div class="font-bold text-emerald-700">🎉 CHÍNH XÁC! (Đáp án A)</div>'\n         '<div class="text-sm leading-relaxed">'\n           'Phủ định của ký hiệu $\\forall$ là $\\exists$, và phủ định của bất đẳng thức $>$ là $\\le$.<br>'\n           'Ta có: $\\overline{\\forall x \\in \\mathbb{R}, P(x)} \\equiv \\exists x \\in \\mathbb{R}, \\overline{P(x)}$.<br>'\n           'Do đó: $\\overline{A} = \\text{"}\\exists x \\in \\mathbb{R}, x^2 - x + 1 \\le 0\\text{"}$. '\n         '</div>'\n       '</div>'\n     + TUYỆT ĐỐI KHÔNG DÙNG CHUỖI JAVASCRIPT GÁN innerHTML CHỨA CÔNG THỨC TOÁN (vì ký tự \\forall sẽ bị trình duyệt JavaScript unescape \\f thành ký tự rác hình quân bích ♠orall, \\text thành tab, \\mathbb thành mất gạch chéo!).\n     + Khi học sinh click chọn đáp án hoặc bấm nút "Xác nhận đáp án", script JavaScript CHỈ CẦN mở hiển thị thẻ HTML tĩnh đã viết sẵn:\n       'var fb = document.getElementById("feedback-box"); if (fb) { fb.style.display = "block"; fb.classList.remove("hidden"); if (window.renderMathContent) window.renderMathContent(fb); }'\n7. Slide Tổng kết & Bản đồ tư duy / Dặn dò:\n   - Hệ thống hóa các kiến thức cốt lõi và nhiệm vụ học tập về nhà.\n\nQUY TẮC TRÌNH BÀY CÂU VĂN & PHÁT BIỂU TOÁN HỌC (CHỐNG VỠ DÒNG DỌC):\n- Các phát biểu tính chất hoặc biểu thức logic (Ví dụ: "Tính chất trái ngược: $P$ đúng $\\Leftrightarrow \\overline{P}$ sai") BẮT BUỘC phải nằm trọn vẹn trong cùng MỘT thẻ <p> hoặc <div>.\n- TUYỆT ĐỐI KHÔNG chia nhỏ từng ký hiệu $P$, chữ "đúng", $\\Leftrightarrow$, $\\overline{P}$, "sai" thành từng thẻ div hay span riêng rẽ, vì sẽ làm các chữ bị bẻ gãy thành từng hàng dọc xấu xí!\n\nQUY TẮC BỐ CỤC KHÔNG GIAN 16:9 & TRÌNH BÀY (CHỐNG KHOẢNG TRẮNG THỪA):\n- TUYỆT ĐỐI KHÔNG dùng class "mt-auto" hay "my-auto" trên bất kỳ thẻ nào (vì sẽ đẩy toàn bộ nội dung xuống đáy và để lại khoảng trắng lớn ở phía trên).\n- KHÔNG dùng "justify-between" trên thẻ container chính của slide; hãy dùng bố cục flex-col tự nhiên với flex-1 cho khối nội dung chính.\n- Nội dung các thẻ card, box phải được trình bày thoáng đãng, các bảng biểu và danh sách có đầy đủ thông tin để lấp đầy không gian slide một cách cân xứng.\n\nQUY TẮC ĐẶC BIỆT CHO CÔNG THỨC TOÁN HỌC & KÝ HIỆU KHOA HỌC:\n- MỌI công thức toán, biến số, ký hiệu toán học ở TẤT CẢ CÁC VỊ TRÍ (bao gồm: đề bài, các phương án lựa chọn A/B/C/D, và ĐẶC BIỆT LÀ PHẦN GIẢI THÍCH ĐÁP ÁN KHI ĐÚNG/SAI) BẮT BUỘC viết bằng cú pháp LaTeX chuẩn:\n  + Công thức trong dòng (inline math): đặt trong cặp dấu $...$ (Ví dụ: $x \\in \\mathbb{R}$, $P(x): "x > 5"$, $\\forall x$, $\\exists y$, $a \\ne 0$).\n  + Công thức khối nổi bật (display math): đặt trong cặp dấu $$...$$ (Ví dụ: $$\\Delta = b^2 - 4ac$$, $$\\int_a^b f(x)dx$$).\n- Trình bày các bước giải chi tiết, rõ ràng, dễ đọc.\n- Tuyệt đối không viết công thức dạng ký tự thường như "x thuộc R" hay "delta = b^2 - 4ac", phải dùng $x \\in \\mathbb{R}$, $\\Delta = b^2 - 4ac$.\n\nHIỆU ỨNG TRÌNH CHIẾU XUẤT HIỆN TỪNG NỘI DUNG (STEP-BY-STEP REVEAL) - BẮT BUỘC TRÊN TẤT CẢ CÁC SLIDE TỪ SLIDE 2 TRỞ ĐI:\n- YÊU CẦU BẮT BUỘC: Mỗi slide tạo ra TUYỆT ĐỐI KHÔNG ĐƯỢC show ngay hết tất cả các nội dung cùng một lúc!\n- Khi giáo viên mở slide, nội dung ban đầu phải được ẩn và chỉ xuất hiện từng nội dung một theo tiến trình giảng bài khi giáo viên click chuột trái hoặc bấm "Dòng Tiếp".\n- BẮT BUỘC GẮN class "step-item" vào TẤT CẢ các thành phần nội dung sau:\n  + Từng cột hoặc card trong Grid: <div class="step-item p-5 rounded-2xl bg-white ...">...</div>\n  + Từng ý li trong danh sách: <li class="step-item flex items-start gap-2">...</li>\n  + Từng bước giải toán: <div class="step-item p-4 rounded-xl ..."><strong>Bước 1:</strong> ...</div>, <div class="step-item ..."><strong>Bước 2:</strong> ...</div>\n  + Từng hộp định nghĩa / ví dụ đối chiếu: <div class="box step-item ...">...</div>\n  + Từng lựa chọn đáp án trắc nghiệm hoặc khối giải thích kết quả.\n- Đảm bảo mỗi slide (trừ trang bìa) luôn có từ 3 đến 6 phần tử có class "step-item" để trình chiếu từng bước mạch lạc, cuốn hút học sinh!\n\nYÊU CẦU KỸ THUẬT:\n- KHÔNG TẠO THÊM BLOCK <style> - template đã có sẵn toàn bộ CSS cần thiết.\n- KHÔNG sử dụng height: 100vh bên trong .slide.\n- SỬ DỤNG linh hoạt các class màu sắc (.text-primary, .text-success, .text-danger, .highlight, .keyword, .box) để nhấn mạnh nội dung.\n\nCHỈ TRẢ VỀ CÁC THẺ <section class="slide">...</section>, KHÔNG CÓ MARKDOWN HAY GIẢI THÍCH NGOÀI. Bắt đầu ngay với <section class="slide">`;
};

export function ensureStepItemsInHtml(html: string): string {
  if (!html) return html;
  if (typeof window === 'undefined') return html;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
    const root = doc.body.firstElementChild;
    if (!root) return html;
    let slideElements = Array.from(root.querySelectorAll('.slide, section.slide-page, section[data-slide]'));
    if (slideElements.length === 0) slideElements = [root as Element];
    slideElements.forEach((slideEl, slideIndex) => {
      if (slideElements.length > 1 && slideIndex === 0) return;
      const existingSteps = slideEl.querySelectorAll('.step-item');
      if (existingSteps.length >= 2) return;
      let stepNum = 1;
      const gridColumns = slideEl.querySelectorAll('.grid > div, [class*="grid"] > div');
      if (gridColumns.length >= 2) {
        gridColumns.forEach((col) => {
          const subBoxes = col.querySelectorAll('.box, .card, .glass-card, [class*="rounded-2xl"], [class*="rounded-xl"]');
          if (subBoxes.length >= 2) {
            subBoxes.forEach((box) => {
              box.classList.add('step-item');
              box.setAttribute('data-step', String(stepNum++));
            });
          } else {
            col.classList.add('step-item');
            col.setAttribute('data-step', String(stepNum++));
          }
        });
        return;
      }
      const listItems = slideEl.querySelectorAll('ul > li, ol > li');
      if (listItems.length >= 2) {
        listItems.forEach((li) => {
          li.classList.add('step-item');
          li.setAttribute('data-step', String(stepNum++));
        });
        return;
      }
      const boxes = slideEl.querySelectorAll('.box, .card, .math-box, [class*="border-l-"]');
      if (boxes.length >= 2) {
        boxes.forEach((box) => {
          box.classList.add('step-item');
          box.setAttribute('data-step', String(stepNum++));
        });
        return;
      }
      const contentChildren = slideEl.querySelectorAll('.content-wrapper > div, .space-y-4 > div, .space-y-3 > div, .flex-1 > div');
      if (contentChildren.length >= 2) {
        contentChildren.forEach((child) => {
          child.classList.add('step-item');
          child.setAttribute('data-step', String(stepNum++));
        });
        return;
      }
      const directChildren = Array.from(slideEl.children).filter((el) => {
        const tag = el.tagName.toLowerCase();
        return tag !== 'h1' && tag !== 'h2' && tag !== 'header' && !el.classList.contains('header-badge');
      });
      if (directChildren.length >= 2) directChildren.forEach((child) => { child.classList.add('step-item'); child.setAttribute('data-step', String(stepNum++)); });
    });
    return root.innerHTML;
  } catch (err) {
    console.warn('ensureStepItemsInHtml error:', err);
    return html;
  }
}

export function repairLatexAndScriptEscapes(html: string): string {
  if (!html) return html;
  let fixed = html;
  fixed = fixed.replace(/[\u000c♠]\s*orall/gi, '\\forall ');
  fixed = fixed.replace(/[\u000c♠]\s*forall/gi, '\\forall ');
  fixed = fixed.replace(/[\u000c♠]/g, '');
  fixed = fixed.replace(/(?<!\\)overline\{/g, '\\overline{');
  fixed = fixed.replace(/(?<!\\)overline([A-Z])/g, '\\overline{$1}');
  fixed = fixed.replace(/[\t\s]?ext"/g, '\\text{"');
  fixed = fixed.replace(/le0ext"/g, '\\le 0\\text{"}');
  fixed = fixed.replace(/ge0ext"/g, '\\ge 0\\text{"}');
  fixed = fixed.replace(/(?<!\\)equiv(?=\s)/g, '\\equiv');
  fixed = fixed.replace(/(?<!\\)exists(?=\s|[a-zA-Z0-9_{}()])/g, '\\exists ');
  fixed = fixed.replace(/(?<!\\)mathbb\{([A-Z])\}/g, '\\mathbb{$1}');
  fixed = fixed.replace(/(?<!\\)mathbb([A-Z])/g, '\\mathbb{$1}');
  fixed = fixed.replace(/(?<=[0-9a-zA-Z])\s*le\s*(?=[0-9a-zA-Z])/g, ' \\le ');
  fixed = fixed.replace(/(?<=[0-9a-zA-Z])\s*ge\s*(?=[0-9a-zA-Z])/g, ' \\ge ');
  fixed = fixed.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, (_match, scriptBody) => {
    const latexCommands = ['forall', 'exists', 'mathbb', 'overline', 'text', 'le', 'ge', 'equiv', 'in', 'Rightarrow', 'Leftrightarrow', 'Delta', 'alpha', 'beta', 'pi', 'ne', 'subset', 'cup', 'cap', 'infty', 'sum', 'int', 'frac', 'sqrt'];
    let safeBody = scriptBody;
    latexCommands.forEach((cmd) => {
      const regex = new RegExp(`(?<!\\\\)\\\\${cmd}\\b`, 'g');
      safeBody = safeBody.replace(regex, `\\\\${cmd}`);
    });
    return `<script>${safeBody}</script>`;
  });
  return fixed;
}

export async function generateOutline(content: string, topic: string, slideCount: number, apiKey: string, selectedModel?: string, provider: AiProvider = 'gemini', onFallback?: (sourceModel: string, targetModel: string, reason: string) => void): Promise<{ success: boolean; outline?: SlideOutline[]; error?: string; usedModel?: string }> {
  try {
    const prompt = generateOutlinePrompt(content, topic, slideCount);
    const result = await callGoogleAiWithFallback({ apiKey, provider, selectedModel, prompt, isJson: true, maxOutputTokens: 12288, onFallback });
    const cleanedJson = result.text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const outline = JSON.parse(cleanedJson) as SlideOutline[];
    return { success: true, outline, usedModel: result.usedModel };
  } catch (error: unknown) {
    const err = error as Error | undefined;
    return { success: false, error: err?.message || 'Không thể tạo dàn ý outline' };
  }
}

export async function generateSlides(content: string, apiKey: string, selectedModel?: string, topic?: string, onProgress?: (progress: GenerationProgress) => void, slideCount?: number, outline?: SlideOutline[], subject?: string, gradeLevel?: string, enableSimulation?: boolean, provider: AiProvider = 'gemini'): Promise<GenerationResult> {
  const totalSteps = 3;
  const prompt = generateSlidePrompt(content, topic, slideCount, outline, subject, gradeLevel, enableSimulation);
  const initialModel = selectedModel || (provider === 'agent-platform' ? 'gemini-2.5-flash' : 'gemini-3.8-flash');

  onProgress?.({ step: 1, totalSteps, status: 'processing', message: `Đang chuẩn bị và phân tích nội dung với ${initialModel}...`, currentModel: initialModel });
  onProgress?.({ step: 2, totalSteps, status: 'processing', message: `Đang tạo ${slideCount ? slideCount + ' slide' : 'slide'} với ${initialModel}...`, currentModel: initialModel });

  try {
    const result = await callGoogleAiWithFallback({
      apiKey,
      provider,
      selectedModel,
      prompt,
      isJson: false,
      maxOutputTokens: 32768,
      onFallback: (sourceModel, targetModel, reason) => {
        onProgress?.({ step: 2, totalSteps, status: 'processing', message: `${reason}. Đang tự động chuyển từ ${sourceModel} sang ${targetModel}...`, currentModel: targetModel });
      },
    });

    let cleanedHtml = result.text.replace(/```html\s*/gi, '').replace(/```\s*/g, '').trim();
    cleanedHtml = cleanedHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    cleanedHtml = cleanedHtml.replace(/^\s+/gm, '').trim();
    cleanedHtml = ensureStepItemsInHtml(cleanedHtml);
    cleanedHtml = repairLatexAndScriptEscapes(cleanedHtml);

    onProgress?.({ step: 3, totalSteps, status: 'completed', message: 'Hoàn tất tạo slide thành công!', currentModel: result.usedModel });
    return { success: true, slides: cleanedHtml, usedModel: result.usedModel };
  } catch (error: unknown) {
    const err = error as Error | undefined;
    onProgress?.({ step: 2, totalSteps, status: 'error', message: `Lỗi: ${err?.message || 'Không thể tạo slide'}`, currentModel: initialModel });
    return { success: false, error: err?.message || 'Không thể tạo slide' };
  }
}
