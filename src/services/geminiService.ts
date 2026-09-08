// Gemini AI & Agent Platform Service tuân thủ nghiêm ngặt api.md (Phiên bản 4.1)
import { GoogleGenAI } from '@google/genai';

// ==========================================
// 1. NHÀ CUNG CẤP VÀ MODEL
// ==========================================

export type AiProvider = 'gemini' | 'agent-platform';

export interface ModelOption {
  id: string;
  name: string;
  isDefault?: boolean;
  provider: AiProvider;
  description?: string;
}

// Chuỗi model chuẩn GA cho Gemini API (Thứ tự ưu tiên 1 -> 5)
export const GEMINI_MODELS: ModelOption[] = [
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash',
    isDefault: true,
    provider: 'gemini',
    description: 'Mặc định; lập bản đồ nội dung và viết slide chi tiết (GA)',
  },
  {
    id: 'gemini-3.5-flash',
    name: 'Gemini 3.5 Flash',
    isDefault: false,
    provider: 'gemini',
    description: 'Dự phòng chất lượng cao (GA)',
  },
  {
    id: 'gemini-3.5-flash-lite',
    name: 'Gemini 3.5 Flash-Lite',
    isDefault: false,
    provider: 'gemini',
    description: 'Dự phòng nhanh, chi phí thấp, phân tích tài liệu tốt (GA)',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash-Lite',
    isDefault: false,
    provider: 'gemini',
    description: 'Tương thích ngược (Stable)',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    isDefault: false,
    provider: 'gemini',
    description: 'Dự phòng cuối chuỗi (Stable)',
  },
];

export const GEMINI_FALLBACK_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
] as const;

// Model cho Agent Platform API
export const AGENT_PLATFORM_MODELS: ModelOption[] = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    isDefault: true,
    provider: 'agent-platform',
    description: 'Mặc định cho Agent Platform',
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash-Lite',
    isDefault: false,
    provider: 'agent-platform',
    description: 'Chi phí thấp, phản hồi nhanh',
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    isDefault: false,
    provider: 'agent-platform',
    description: 'Suy luận mạnh, xử lý tài liệu dài',
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro Preview',
    isDefault: false,
    provider: 'agent-platform',
    description: 'Bản xem trước suy luận cấp cao',
  },
];

export const AGENT_PLATFORM_FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
] as const;

// Tương thích ngược với các component cũ
export const AI_MODELS = GEMINI_MODELS;
export type ModelId = string;

// ==========================================
// 2. CLIENT FACTORY CHUNG
// ==========================================

export const createGoogleAiClient = (
  apiKey: string,
  provider: AiProvider
): GoogleGenAI => {
  if (provider === 'agent-platform') {
    // Cờ kỹ thuật của Google Gen AI SDK để định tuyến tới aiplatform.googleapis.com
    return new GoogleGenAI({ vertexai: true, apiKey });
  }

  return new GoogleGenAI({ apiKey });
};

// ==========================================
// 3. XÁC THỰC API KEY DÙNG CHUNG
// ==========================================

export const GOOGLE_AI_API_KEY_PATTERN = /^(?:AIzaSy|AQ)\S{8,}$/;

export function validateApiKey(key: string): boolean {
  if (!key) return false;
  return GOOGLE_AI_API_KEY_PATTERN.test(key.trim());
}

// ==========================================
// 4. PHÂN TÍCH VÀ BẮT MÃ LỖI CHUẨN
// ==========================================

export type ApiErrorType =
  | 'MODEL_OVERLOADED'
  | 'NOT_FOUND'
  | 'KEY_INVALID'
  | 'PERMISSION_DENIED'
  | 'RATE_LIMIT'
  | 'INVALID_ARGUMENT'
  | 'UNKNOWN';

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

  // 401: Key sai / hết hạn
  if (
    status === 401 ||
    msg.includes('api_key_invalid') ||
    msg.includes('api key not valid') ||
    msg.includes('unauthenticated')
  ) {
    return {
      type: 'KEY_INVALID',
      statusCode: 401,
      message: 'API Key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại trong Cài đặt.',
      rawError: error,
    };
  }

  // 403: Không có quyền truy cập
  if (
    status === 403 ||
    msg.includes('permission_denied') ||
    msg.includes('permission denied')
  ) {
    const errorMsg =
      provider === 'agent-platform'
        ? 'Google đã nhận key nhưng dự án/key chưa được cấp quyền gọi Agent Platform API hoặc model này. Vui lòng kiểm tra Agent Platform API đã bật, billing và quyền sử dụng model.'
        : 'API key không có quyền truy cập Gemini API.';
    return {
      type: 'PERMISSION_DENIED',
      statusCode: 403,
      message: errorMsg,
      rawError: error,
    };
  }

  // 429: Hết quota / rate limit (Tuyệt đối không đánh dấu key invalid)
  if (
    status === 429 ||
    msg.includes('resource_exhausted') ||
    msg.includes('quota') ||
    msg.includes('rate limit')
  ) {
    return {
      type: 'RATE_LIMIT',
      statusCode: 429,
      message: 'Đã hết quota hoặc vượt giới hạn tốc độ API. Vui lòng đợi rồi thử lại.',
      rawError: error,
    };
  }

  // 400: Tham số hoặc payload sai
  if (
    status === 400 ||
    msg.includes('invalid_argument') ||
    msg.includes('bad request')
  ) {
    return {
      type: 'INVALID_ARGUMENT',
      statusCode: 400,
      message: 'Yêu cầu không hợp lệ hoặc tham số không được hỗ trợ bởi model này.',
      rawError: error,
    };
  }

  // 404: Endpoint / model không khả dụng -> cho phép fallback
  if (status === 404 || msg.includes('not_found') || msg.includes('not found')) {
    return {
      type: 'NOT_FOUND',
      statusCode: 404,
      message: 'Model hoặc endpoint không khả dụng.',
      rawError: error,
    };
  }

  // 500, 503, 504 hoặc quá tải -> cho phép fallback
  if (
    status === 500 ||
    status === 503 ||
    status === 504 ||
    msg.includes('overloaded') ||
    msg.includes('high demand') ||
    msg.includes('try again later') ||
    msg.includes('temporarily unavailable') ||
    msg.includes('unavailable') ||
    msg.includes('deadline_exceeded')
  ) {
    return {
      type: 'MODEL_OVERLOADED',
      statusCode: status || 503,
      message: 'Model đang quá tải; app đang tự động thử model dự phòng.',
      rawError: error,
    };
  }

  return {
    type: 'UNKNOWN',
    statusCode: status,
    message: error?.message || 'Lỗi không xác định khi kết nối với AI.',
    rawError: error,
  };
}

// ==========================================
// 5. THỨ TỰ THỰC TẾ CỦA CHUỖI FALLBACK
// ==========================================

export function getOrderedModels(selectedModel?: string, provider: AiProvider = 'gemini'): string[] {
  const fallbackList =
    provider === 'agent-platform'
      ? AGENT_PLATFORM_FALLBACK_MODELS
      : GEMINI_FALLBACK_MODELS;

  const defaultModel =
    provider === 'agent-platform'
      ? 'gemini-2.5-flash'
      : 'gemini-3.6-flash';

  const initialModel = selectedModel && selectedModel.trim() ? selectedModel.trim() : defaultModel;

  const ordered: string[] = [initialModel];
  for (const m of fallbackList) {
    if (!ordered.includes(m)) {
      ordered.push(m);
    }
  }
  return ordered;
}

// ==========================================
// 6. CẤU HÌNH API VÀ THINKING (PHẦN IV)
// ==========================================

function buildGenerateConfig(model: string, isJson: boolean, maxOutputTokens: number): Record<string, unknown> {
  const config: Record<string, unknown> = {
    maxOutputTokens,
  };

  if (isJson) {
    config.responseMimeType = 'application/json';
  }

  const isGemini3 = model.startsWith('gemini-3');
  const is36Or35Lite = model === 'gemini-3.6-flash' || model === 'gemini-3.5-flash-lite';

  // Với Gemini 3: dùng thinkingConfig với thinkingLevel = HIGH
  if (isGemini3) {
    config.thinkingConfig = {
      thinkingLevel: 'HIGH',
    };
  }

  // Từ Gemini 3.6 Flash và 3.5 Flash-Lite: tuyệt đối không gửi temperature, topP, topK
  if (!isGemini3 && !is36Or35Lite) {
    config.temperature = 0.7;
  }

  return config;
}

// ==========================================
// 7. HÀM FALLBACK TẬP TRUNG DUY NHẤT
// ==========================================

export interface CallGoogleAiOptions {
  apiKey: string;
  provider?: AiProvider;
  selectedModel?: string;
  prompt: string;
  isJson?: boolean;
  maxOutputTokens?: number;
  onFallback?: (sourceModel: string, targetModel: string, reason: string) => void;
}

export async function callGoogleAiWithFallback(
  options: CallGoogleAiOptions
): Promise<{ text: string; usedModel: string }> {
  const provider = options.provider || 'gemini';
  const models = getOrderedModels(options.selectedModel, provider);
  const client = createGoogleAiClient(options.apiKey, provider);

  let lastError: unknown = null;

  for (let i = 0; i < models.length; i++) {
    const currentModel = models[i];
    try {
      const config = buildGenerateConfig(
        currentModel,
        !!options.isJson,
        options.maxOutputTokens || 32768
      );

      const response = await client.models.generateContent({
        model: currentModel,
        contents: options.prompt,
        config: config as Parameters<typeof client.models.generateContent>[0]['config'],
      });

      const text = response.text || '';
      if (!text) {
        throw new Error('Không nhận được nội dung từ API');
      }

      return { text, usedModel: currentModel };
    } catch (error: unknown) {
      lastError = error;
      const parsed = parseApiError(error, provider);

      // Điều kiện được phép chuyển model dự phòng
      const isAllowedFallback =
        parsed.type === 'MODEL_OVERLOADED' ||
        parsed.type === 'NOT_FOUND' ||
        (provider === 'agent-platform' && parsed.type === 'PERMISSION_DENIED');

      if (isAllowedFallback && i < models.length - 1) {
        const nextModel = models[i + 1];
        options.onFallback?.(
          currentModel,
          nextModel,
          parsed.message || 'Model đang gặp sự cố'
        );
        continue;
      }

      // Các lỗi dừng ngay (401, 403 thông thường, 429, 400) hoặc đã hết model fallback
      throw new Error(parsed.message);
    }
  }

  const err = lastError as Error | null | undefined;
  throw new Error(err?.message || 'Không thể kết nối với bất kỳ model AI nào');
}

// ==========================================
// 8. CÁC KIỂU DỮ LIỆU ĐẦU RA CHO APP
// ==========================================

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

// ==========================================
// 9. PROMPTS
// ==========================================

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

const generateSlidePrompt = (
  content: string,
  topic?: string,
  slideCount?: number,
  outline?: SlideOutline[],
  subject?: string,
  gradeLevel?: string,
  enableSimulation?: boolean
): string => {
  const slideCountInstruction = slideCount
    ? `Tạo ĐÚNG ${slideCount} slide`
    : 'Tạo 5-8 slide phù hợp với độ dài nội dung';

  const outlineInstruction =
    outline && outline.length > 0
      ? `\nDÀN Ý YÊU CẦU (tuân theo cấu trúc này):\n${outline
          .map(
            (s) =>
              `Slide ${s.slideNumber}: ${s.title}${
                s.enableSimulation ? ' 🎮[CẦN MÔ PHỎNG TƯƠNG TÁC]' : ''
              }\n  - ${s.keyPoints.join('\n  - ')}`
          )
          .join('\n')}`
      : '';

  const slidesWithSimulation = outline?.filter((s) => s.enableSimulation) || [];
  const hasPerSlideSimulation = slidesWithSimulation.length > 0;

  let ageAppropriateInstruction = '';
  if (gradeLevel) {
    const gradeLevelMap: Record<
      string,
      { level: string; style: string; complexity: string }
    > = {
      preschool: {
        level: 'Mầm non (3-5 tuổi)',
        style: 'rất đơn giản, nhiều hình ảnh minh họa đầy màu sắc, ít chữ, font lớn',
        complexity: 'rất cơ bản',
      },
      grade1: {
        level: 'Lớp 1 (6-7 tuổi)',
        style: 'đơn giản, nhiều hình ảnh, chữ to rõ ràng',
        complexity: 'cơ bản',
      },
      grade2: {
        level: 'Lớp 2 (7-8 tuổi)',
        style: 'đơn giản, hình ảnh minh họa phong phú',
        complexity: 'cơ bản',
      },
      grade3: {
        level: 'Lớp 3 (8-9 tuổi)',
        style: 'vừa phải, có hình ảnh hỗ trợ',
        complexity: 'cơ bản đến trung bình',
      },
      grade4: {
        level: 'Lớp 4 (9-10 tuổi)',
        style: 'rõ ràng, có ví dụ minh họa',
        complexity: 'trung bình',
      },
      grade5: {
        level: 'Lớp 5 (10-11 tuổi)',
        style: 'chi tiết hơn, kết hợp hình và chữ',
        complexity: 'trung bình',
      },
      grade6: {
        level: 'Lớp 6 THCS (11-12 tuổi)',
        style: 'chi tiết, có sơ đồ và biểu đồ',
        complexity: 'trung bình khá',
      },
      grade7: {
        level: 'Lớp 7 THCS (12-13 tuổi)',
        style: 'logic, có dẫn chứng',
        complexity: 'khá',
      },
      grade8: {
        level: 'Lớp 8 THCS (13-14 tuổi)',
        style: 'chuyên sâu hơn, có công thức',
        complexity: 'khá đến nâng cao',
      },
      grade9: {
        level: 'Lớp 9 THCS (14-15 tuổi)',
        style: 'toàn diện, chuẩn bị thi',
        complexity: 'nâng cao',
      },
      grade10: {
        level: 'Lớp 10 THPT (15-16 tuổi)',
        style: 'học thuật, có lý thuyết và ví dụ',
        complexity: 'nâng cao',
      },
      grade11: {
        level: 'Lớp 11 THPT (16-17 tuổi)',
        style: 'chuyên sâu, công thức phức tạp',
        complexity: 'nâng cao',
      },
      grade12: {
        level: 'Lớp 12 THPT (17-18 tuổi)',
        style: 'ôn thi, tổng hợp kiến thức',
        complexity: 'nâng cao, tổng kết',
      },
    };
    const gradeInfo = gradeLevelMap[gradeLevel];
    if (gradeInfo) {
      ageAppropriateInstruction = `\n\n🎓 ĐỐI TƯỢNG: ${gradeInfo.level}
- Phong cách trình bày: ${gradeInfo.style}
- Độ phức tạp nội dung: ${gradeInfo.complexity}
- Điều chỉnh ngôn ngữ và thuật ngữ phù hợp với lứa tuổi`;
    }
  }

  let subjectInstruction = '';
  if (subject) {
    const subjectMap: Record<
      string,
      { name: string; visualStyle: string }
    > = {
      math: {
        name: 'Toán học (Mathematics)',
        visualStyle: 'đồ thị hàm số, hình học, công thức LaTeX',
      },
      physics: {
        name: 'Vật lý (Physics)',
        visualStyle: 'sơ đồ lực, biểu đồ chuyển động, mô hình thí nghiệm',
      },
      chemistry: {
        name: 'Hóa học (Chemistry)',
        visualStyle: 'công thức cấu tạo, phương trình phản ứng, mô hình phân tử',
      },
      biology: {
        name: 'Sinh học (Biology)',
        visualStyle: 'sơ đồ tế bào, chu trình sinh học, cây phát sinh',
      },
      informatics: {
        name: 'Tin học (Informatics)',
        visualStyle: 'sơ đồ khối, code snippet, flowchart',
      },
      literature: {
        name: 'Ngữ văn (Literature)',
        visualStyle: 'trích dẫn, sơ đồ tư duy, timeline tác phẩm',
      },
      history: {
        name: 'Lịch sử (History)',
        visualStyle: 'timeline lịch sử, bản đồ, hình ảnh tư liệu',
      },
      geography: {
        name: 'Địa lý (Geography)',
        visualStyle: 'bản đồ, biểu đồ thống kê, sơ đồ địa hình',
      },
      technology: {
        name: 'Công nghệ (Technology)',
        visualStyle: 'sơ đồ quy trình, bản vẽ kỹ thuật',
      },
      music: {
        name: 'Âm nhạc (Music)',
        visualStyle: 'bản nhạc, ký hiệu nhạc, hình ảnh nhạc cụ',
      },
      physical_education: {
        name: 'Thể dục (Physical Education)',
        visualStyle: 'hình minh họa động tác, sơ đồ sân bãi',
      },
      defense_security: {
        name: 'GDQPAN (Defense & Security)',
        visualStyle: 'sơ đồ đội hình, hình ảnh minh họa',
      },
      career_orientation: {
        name: 'Hướng nghiệp (Career Orientation)',
        visualStyle: 'sơ đồ nghề nghiệp, infographic',
      },
      local_education: {
        name: 'GD địa phương (Local Education)',
        visualStyle: 'hình ảnh địa phương, bản đồ vùng miền',
      },
      economics_law: {
        name: 'KT & Pháp luật (Economics & Law)',
        visualStyle: 'sơ đồ kinh tế, biểu đồ, các điều luật',
      },
      english: {
        name: 'Tiếng Anh (English)',
        visualStyle: 'ví dụ câu, từ vựng với hình ảnh, bảng ngữ pháp',
      },
    };
    const subjectInfo = subjectMap[subject];
    if (subjectInfo) {
      if (subject === 'english') {
        subjectInstruction = `\n\n📚 MÔN HỌC: ${subjectInfo.name}
- TOÀN BỘ NỘI DUNG SLIDE PHẢI BẰNG TIẾNG ANH (English only)
- Tiêu đề, nội dung, ví dụ đều viết bằng tiếng Anh
- Có thể thêm phần dịch nghĩa tiếng Việt nhỏ bên dưới nếu cần
- Phong cách trực quan: ${subjectInfo.visualStyle}`;
      } else {
        subjectInstruction = `\n\n📚 MÔN HỌC: ${subjectInfo.name}
- TOÀN BỘ NỘI DUNG SLIDE BẰNG TIẾNG VIỆT
- KHÔNG sử dụng thuật ngữ tiếng Anh
- Phong cách trực quan phù hợp: ${subjectInfo.visualStyle}`;
      }
    }
  }

  let simulationInstruction = '';
  if (enableSimulation || hasPerSlideSimulation) {
    const simulationTarget = hasPerSlideSimulation
      ? `CHỈ TẠO MÔ PHỎNG CHO CÁC SLIDE SAU: ${slidesWithSimulation
          .map((s) => `Slide ${s.slideNumber}`)
          .join(', ')}`
      : 'TẠO MÔ PHỎNG CHO TẤT CẢ CÁC SLIDE PHÙ HỢP';

    simulationInstruction = `\n\n🎮 MÔ PHỎNG TRỰC QUAN TƯƠNG TÁC:
${simulationTarget}

Yêu cầu kỹ thuật:
1. Sử dụng <div class="simulation"> chứa inline SVG hoặc Canvas
2. Thêm JavaScript inline để xử lý tương tác (click, hover, slider)
3. Ví dụ mô phỏng theo môn:
   - Toán: Đồ thị hàm số với slider điều chỉnh tham số, hình học động
   - Vật lý: Mô phỏng chuyển động (rơi tự do, dao động), sóng, lực
   - Hóa học: Mô hình phân tử 3D đơn giản, phản ứng hóa học động
   - Sinh học: Sơ đồ tế bào có thể click xem chi tiết, chu trình
   - Các môn khác: Timeline tương tác, sơ đồ tư duy có thể mở rộng
4. Code phải đơn giản, chạy được ngay trong browser
5. Thêm hướng dẫn sử dụng cho học sinh ("Click vào...", "Kéo thanh trượt...")

MẪU CODE MÔ PHỎNG:
<div class="simulation">
  <svg viewBox="0 0 400 300" style="width:100%;max-height:250px;background:#f8fafc;border-radius:8px;">
    <!-- SVG content here -->
  </svg>
  <div class="sim-controls"><!-- Buttons, sliders --></div>
  <script>(function(){ /* Interactive JS */ })();</script>
</div>`;
  }

  const mediaInstruction = `\n\n🖼️ HÌNH ẢNH:
- KHÔNG sử dụng hình ảnh từ URL bên ngoài vì có thể không load được
- Thay vào đó, tạo SVG đơn giản để minh họa khái niệm
- Hoặc dùng emoji lớn để minh họa: <span style="font-size:3rem">📐</span>`;

  const colorEmphasisInstruction = `\n\n🎨 NHẤN MẠNH NỘI DUNG BẰNG MÀU SẮC:
Sử dụng các class CSS có sẵn để làm nổi bật nội dung quan trọng:

Màu chữ:
- <span class="text-primary">màu xanh dương</span>
- <span class="text-success">màu xanh lá</span>  
- <span class="text-danger">màu đỏ</span>
- <span class="text-warning">màu vàng cam</span>
- <span class="text-pink">màu hồng</span>
- <span class="text-secondary">màu tím</span>

Highlight nền:
- <span class="highlight">nền vàng quan trọng</span>
- <span class="highlight-blue">nền xanh dương</span>
- <span class="highlight-green">nền xanh lá</span>

Keyword box:
- <span class="keyword">từ khóa xanh</span>
- <span class="keyword-green">từ khóa xanh lá</span>
- <span class="keyword-orange">từ khóa cam</span>

In đậm nhấn mạnh:
- <span class="emphasis">in đậm xanh</span>
- <span class="emphasis-red">in đậm đỏ</span>

HÃY SỬ DỤNG LINH HOẠT các class này để nhấn mạnh khái niệm quan trọng, định nghĩa, công thức!`;

  return `Bạn là một chuyên gia thiết kế slide thuyết trình giáo dục. Hãy tạo slide HTML cho nội dung sau.

${topic ? `CHỦ ĐỀ: ${topic}` : ''}

NỘI DUNG TÀI LIỆU:
${content}
${outlineInstruction}${ageAppropriateInstruction}${subjectInstruction}${simulationInstruction}${mediaInstruction}${colorEmphasisInstruction}

YÊU CẦU KỸ THUẬT:
1. ${slideCountInstruction}
2. Mỗi slide phải có class="slide" 
3. Slide đầu tiên là trang tiêu đề với h1
4. Các slide tiếp theo có h2 cho tiêu đề phụ
5. Sử dụng ul/li cho danh sách
6. Sử dụng div class="box" cho các định nghĩa/công thức quan trọng
7. Với công thức toán, dùng cú pháp LaTeX trong $$ $$ hoặc $ $
8. KHÔNG TẠO THÊM BLOCK <style> - template đã có sẵn CSS
9. KHÔNG sử dụng height: 100vh cho .slide - template sẽ xử lý display
10. SỬ DỤNG các class màu sắc (.text-primary, .highlight, .keyword...) để nhấn mạnh nội dung

CHỈ TRẢ VỀ CÁC THẺ <section class="slide">...</section>, KHÔNG CÓ MARKDOWN, GIẢI THÍCH HAY BLOCK <style>. Bắt đầu ngay với <section class="slide">`;
};

// ==========================================
// 10. GENERATE OUTLINE (ĐI QUA FALLBACK CHUNG)
// ==========================================

export async function generateOutline(
  content: string,
  topic: string,
  slideCount: number,
  apiKey: string,
  selectedModel?: string,
  provider: AiProvider = 'gemini',
  onFallback?: (sourceModel: string, targetModel: string, reason: string) => void
): Promise<{ success: boolean; outline?: SlideOutline[]; error?: string; usedModel?: string }> {
  try {
    const prompt = generateOutlinePrompt(content, topic, slideCount);

    const result = await callGoogleAiWithFallback({
      apiKey,
      provider,
      selectedModel,
      prompt,
      isJson: true,
      maxOutputTokens: 12288,
      onFallback,
    });

    const cleanedJson = result.text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    const outline = JSON.parse(cleanedJson) as SlideOutline[];
    return { success: true, outline, usedModel: result.usedModel };
  } catch (error: unknown) {
    const err = error as Error | undefined;
    return {
      success: false,
      error: err?.message || 'Không thể tạo dàn ý outline',
    };
  }
}

// ==========================================
// 11. GENERATE SLIDES (ĐI QUA FALLBACK CHUNG)
// ==========================================

export async function generateSlides(
  content: string,
  apiKey: string,
  selectedModel?: string,
  topic?: string,
  onProgress?: (progress: GenerationProgress) => void,
  slideCount?: number,
  outline?: SlideOutline[],
  subject?: string,
  gradeLevel?: string,
  enableSimulation?: boolean,
  provider: AiProvider = 'gemini'
): Promise<GenerationResult> {
  const totalSteps = 3;
  const prompt = generateSlidePrompt(
    content,
    topic,
    slideCount,
    outline,
    subject,
    gradeLevel,
    enableSimulation
  );

  const initialModel = selectedModel || (provider === 'agent-platform' ? 'gemini-2.5-flash' : 'gemini-3.6-flash');

  // Step 1: Phân tích nội dung
  onProgress?.({
    step: 1,
    totalSteps,
    status: 'processing',
    message: `Đang chuẩn bị và phân tích nội dung với ${initialModel}...`,
    currentModel: initialModel,
  });

  // Step 2: Tạo slide
  onProgress?.({
    step: 2,
    totalSteps,
    status: 'processing',
    message: `Đang tạo ${slideCount ? slideCount + ' slide' : 'slide'} với ${initialModel}...`,
    currentModel: initialModel,
  });

  try {
    const result = await callGoogleAiWithFallback({
      apiKey,
      provider,
      selectedModel,
      prompt,
      isJson: false,
      maxOutputTokens: 32768,
      onFallback: (sourceModel, targetModel, reason) => {
        onProgress?.({
          step: 2,
          totalSteps,
          status: 'processing',
          message: `${reason}. Đang tự động chuyển từ ${sourceModel} sang ${targetModel}...`,
          currentModel: targetModel,
        });
      },
    });

    let cleanedHtml = result.text
      .replace(/```html\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    // Loại bỏ các block <style> thừa nếu có
    cleanedHtml = cleanedHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    cleanedHtml = cleanedHtml.replace(/^\s+/gm, '').trim();

    // Step 3: Hoàn tất định dạng
    onProgress?.({
      step: 3,
      totalSteps,
      status: 'completed',
      message: 'Hoàn tất tạo slide thành công!',
      currentModel: result.usedModel,
    });

    return {
      success: true,
      slides: cleanedHtml,
      usedModel: result.usedModel,
    };
  } catch (error: unknown) {
    const err = error as Error | undefined;
    onProgress?.({
      step: 2,
      totalSteps,
      status: 'error',
      message: `Lỗi: ${err?.message || 'Không thể tạo slide'}`,
      currentModel: initialModel,
    });

    return {
      success: false,
      error: err?.message || 'Không thể tạo slide',
    };
  }
}
