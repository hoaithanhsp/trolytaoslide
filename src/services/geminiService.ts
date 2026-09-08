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

  const errorObj = error as { message?: string } | undefined;

  return {
    type: 'UNKNOWN',
    statusCode: status,
    message: errorObj?.message || 'Lỗi không xác định khi kết nối với AI.',
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

  return `Bạn là một Chuyên gia Thiết kế Bài giảng Điện tử Tương tác & Lập trình Web Sư phạm đỉnh cao theo chương trình GDPT 2018.
Hãy tạo toàn bộ các thẻ Slide HTML chất lượng cao cho nội dung sau:

${topic ? `CHỦ ĐỀ BÀI HỌC: ${topic}` : ''}

NỘI DUNG TÀI LIỆU THAM KHẢO:
${content}
${outlineInstruction}${ageAppropriateInstruction}${subjectInstruction}${simulationInstruction}${mediaInstruction}${colorEmphasisInstruction}

QUY TẮC CẤU TRÚC VÀ BỐ CỤC BỘ SLIDE (THEO CHUẨN SƯ PHẠM):
1. ${slideCountInstruction}
2. Mỗi slide phải là một thẻ <section class="slide">...</section>.
3. Slide 1 (Trang bìa):
   - Tiêu đề bài học lớn nổi bật (h1)
   - Thông tin phân môn, khối lớp, thời lượng (tiết học)
   - Huy hiệu "GDPT 2018" hoặc "Năng lực số"
   - Khung thông tin Giáo viên & Đơn vị công tác
4. Slide 2 (Mục tiêu bài học):
   - Trình bày 3 nhóm: 1. Kiến thức trọng tâm, 2. Năng lực số / Năng lực chuyên môn, 3. Phẩm chất & Năng lực chung.
5. Các Slide Nội dung trọng tâm:
   - Trình bày bài giảng khoa học, đầy đủ dẫn chứng, ví dụ thực tế và giải thích chi tiết.
   - Bố cục 2 cột cân đối lấp đầy slide: sử dụng <div class="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 items-stretch">.
   - Bên trái là Định nghĩa/Quy tắc đóng khung trong <div class="box">, bên phải là Ví dụ đối chiếu, bảng phân tích hoặc bài toán áp dụng.
   - Các ô/box trong từng cột cần có nội dung chi tiết, mở rộng chiều cao hài hòa, không để trống trải.
6. Slide Trắc nghiệm / Tương tác củng cố / Mini-Quiz:
   - Chứa câu hỏi trắc nghiệm hoặc bài tập vận dụng nhanh với các phương án A, B, C, D rõ ràng.
   - Kèm phần giải thích đáp án chi tiết, tường minh (Feedback/Explanation).
   - ĐẶC BIỆT: Trong phần giải thích đáp án, MỌI công thức toán, biến số, phép suy luận BẮT BUỘC viết bằng cú pháp LaTeX kẹp trong $...$ hoặc $$...$$ (Ví dụ: $x^2 \\ge 0 \\Rightarrow x^2+1 \\ge 1 > 0$ với mọi $x \\in \\mathbb{R}$).
   - Nếu có script JavaScript xử lý sự kiện kiểm tra đáp án (onclick): sau khi gán innerHTML cho phần giải thích, HÃY GỌI:
     \`if (window.renderMathContent) window.renderMathContent(feedbackBox); else if (window.MathJax?.typesetPromise) window.MathJax.typesetPromise([feedbackBox]);\`
7. Slide Tổng kết & Bản đồ tư duy / Dặn dò:
   - Hệ thống hóa các kiến thức cốt lõi và nhiệm vụ học tập về nhà.

QUY TẮC BỐ CỤC KHÔNG GIAN 16:9 & TRÌNH BÀY (CHỐNG KHOẢNG TRẮNG THỪA):
- TUYỆT ĐỐI KHÔNG dùng class "mt-auto" hay "my-auto" trên bất kỳ thẻ nào (vì sẽ đẩy toàn bộ nội dung xuống đáy và để lại khoảng trắng lớn ở phía trên).
- KHÔNG dùng "justify-between" trên thẻ container chính của slide; hãy dùng bố cục flex-col tự nhiên với flex-1 cho khối nội dung chính.
- Nội dung các thẻ card, box phải được trình bày thoáng đãng, các bảng biểu và danh sách có đầy đủ thông tin để lấp đầy không gian slide một cách cân xứng.

QUY TẮC ĐẶC BIỆT CHO CÔNG THỨC TOÁN HỌC & KÝ HIỆU KHOA HỌC:
- MỌI công thức toán, biến số, ký hiệu toán học ở TẤT CẢ CÁC VỊ TRÍ (bao gồm: đề bài, các phương án lựa chọn A/B/C/D, và ĐẶC BIỆT LÀ PHẦN GIẢI THÍCH ĐÁP ÁN KHI ĐÚNG/SAI) BẮT BUỘC viết bằng cú pháp LaTeX chuẩn:
  + Công thức trong dòng (inline math): đặt trong cặp dấu $...$ (Ví dụ: $x \\in \\mathbb{R}$, $P(x): "x > 5"$, $\\forall x$, $\\exists y$, $a \\ne 0$).
  + Công thức khối nổi bật (display math): đặt trong cặp dấu $$...$$ (Ví dụ: $$\\Delta = b^2 - 4ac$$, $$\\int_a^b f(x)dx$$).
- Trình bày các bước giải chi tiết, rõ ràng, dễ đọc.
- Tuyệt đối không viết công thức dạng ký tự thường như "x thuộc R" hay "delta = b^2 - 4ac", phải dùng $x \\in \\mathbb{R}$, $\\Delta = b^2 - 4ac$.

HIỆU ỨNG TRÌNH CHIẾU XUẤT HIỆN TỪNG NỘI DUNG (STEP-BY-STEP REVEAL) - BẮT BUỘC TRÊN TẤT CẢ CÁC SLIDE TỪ SLIDE 2 TRỞ ĐI:
- YÊU CẦU BẮT BUỘC: Mỗi slide tạo ra TUYỆT ĐỐI KHÔNG ĐƯỢC show ngay hết tất cả các nội dung cùng một lúc!
- Khi giáo viên mở slide, nội dung ban đầu phải được ẩn và chỉ xuất hiện từng nội dung một theo tiến trình giảng bài khi giáo viên click chuột trái hoặc bấm "Dòng Tiếp".
- BẮT BUỘC GẮN class "step-item" vào TẤT CẢ các thành phần nội dung sau:
  + Từng cột hoặc card trong Grid: <div class="step-item p-5 rounded-2xl bg-white ...">...</div>
  + Từng ý li trong danh sách: <li class="step-item flex items-start gap-2">...</li>
  + Từng bước giải toán: <div class="step-item p-4 rounded-xl ..."><strong>Bước 1:</strong> ...</div>, <div class="step-item ..."><strong>Bước 2:</strong> ...</div>
  + Từng hộp định nghĩa / ví dụ đối chiếu: <div class="box step-item ...">...</div>
  + Từng lựa chọn đáp án trắc nghiệm hoặc khối giải thích kết quả.
- Đảm bảo mỗi slide (trừ trang bìa) luôn có từ 3 đến 6 phần tử có class "step-item" để trình chiếu từng bước mạch lạc, cuốn hút học sinh!

YÊU CẦU KỸ THUẬT:
- KHÔNG TẠO THÊM BLOCK <style> - template đã có sẵn toàn bộ CSS cần thiết.
- KHÔNG sử dụng height: 100vh bên trong .slide.
- SỬ DỤNG linh hoạt các class màu sắc (.text-primary, .text-success, .text-danger, .highlight, .keyword, .box) để nhấn mạnh nội dung.

CHỈ TRẢ VỀ CÁC THẺ <section class="slide">...</section>, KHÔNG CÓ MARKDOWN HAY GIẢI THÍCH NGOÀI. Bắt đầu ngay với <section class="slide">`;
};

/**
 * Tự động đảm bảo mỗi slide nội dung (từ slide 2 trở đi) đều có class "step-item"
 * để nội dung không bị show hết cùng một lúc mà xuất hiện từng phần mượt mà.
 */
export function ensureStepItemsInHtml(html: string): string {
  if (!html) return html;
  if (typeof window === 'undefined') return html;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
    const root = doc.body.firstElementChild;
    if (!root) return html;

    let slideElements = Array.from(root.querySelectorAll('.slide, section.slide-page, section[data-slide]'));
    if (slideElements.length === 0) {
      // Nếu là nội dung của một slide đơn lẻ không có thẻ section bọc ngoài
      slideElements = [root as Element];
    }

    slideElements.forEach((slideEl, slideIndex) => {
      // Nếu có nhiều slide và đây là slide 1 (Trang bìa - tiêu đề chính nên hiển thị trọn vẹn) -> bỏ qua
      if (slideElements.length > 1 && slideIndex === 0) return;

      const existingSteps = slideEl.querySelectorAll('.step-item');
      if (existingSteps.length >= 2) {
        // Đã có tối thiểu 2 bước reveal trở lên -> đạt chuẩn
        return;
      }

      let stepNum = 1;

      // 1. Nếu có lưới Grid (.grid > div hoặc [class*="grid"] > div)
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

      // 2. Nếu có danh sách (ul > li hoặc ol > li)
      const listItems = slideEl.querySelectorAll('ul > li, ol > li');
      if (listItems.length >= 2) {
        listItems.forEach((li) => {
          li.classList.add('step-item');
          li.setAttribute('data-step', String(stepNum++));
        });
        return;
      }

      // 3. Nếu có các hộp .box, .card, .math-box
      const boxes = slideEl.querySelectorAll('.box, .card, .math-box, [class*="border-l-"]');
      if (boxes.length >= 2) {
        boxes.forEach((box) => {
          box.classList.add('step-item');
          box.setAttribute('data-step', String(stepNum++));
        });
        return;
      }

      // 4. Nếu có các khối div trong container nội dung chính
      const contentChildren = slideEl.querySelectorAll('.content-wrapper > div, .space-y-4 > div, .space-y-3 > div, .flex-1 > div');
      if (contentChildren.length >= 2) {
        contentChildren.forEach((child) => {
          child.classList.add('step-item');
          child.setAttribute('data-step', String(stepNum++));
        });
        return;
      }

      // 5. Fallback: gắn cho các phần tử con cấp 1 của slide (loại trừ tiêu đề h1, h2, header)
      const directChildren = Array.from(slideEl.children).filter((el) => {
        const tag = el.tagName.toLowerCase();
        return tag !== 'h1' && tag !== 'h2' && tag !== 'header' && !el.classList.contains('header-badge');
      });
      if (directChildren.length >= 2) {
        directChildren.forEach((child) => {
          child.classList.add('step-item');
          child.setAttribute('data-step', String(stepNum++));
        });
      }
    });

    return root.innerHTML;
  } catch (err) {
    console.warn('ensureStepItemsInHtml error:', err);
    return html;
  }
}

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

    // Tự động chuẩn hóa hiệu ứng xuất hiện từng dòng (step-item reveal) cho các slide
    cleanedHtml = ensureStepItemsInHtml(cleanedHtml);

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
