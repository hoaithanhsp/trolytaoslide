// Gemini AI Service với cơ chế fallback
export const AI_MODELS = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', isDefault: true },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro Preview', isDefault: false },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', isDefault: false },
] as const;

export type ModelId = typeof AI_MODELS[number]['id'];

export interface GenerationResult {
  success: boolean;
  slides?: string;
  error?: string;
  usedModel?: ModelId;
}

export interface GenerationProgress {
  step: number;
  totalSteps: number;
  status: 'pending' | 'processing' | 'completed' | 'error' | 'stopped';
  message: string;
  currentModel?: ModelId;
}

export interface SlideOutline {
  slideNumber: number;
  title: string;
  keyPoints: string[];
}

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// Prompt để tạo outline gợi ý
const generateOutlinePrompt = (content: string, topic: string, slideCount: number): string => {
  return `Bạn là chuyên gia thiết kế bài giảng. Hãy tạo outline cho ${slideCount} slide về chủ đề sau:

CHỦ ĐỀ: ${topic}

${content ? `NỘI DUNG THAM KHẢO:\n${content}` : ''}

Trả về JSON array với format:
[
  {"slideNumber": 1, "title": "Tiêu đề slide", "keyPoints": ["Điểm 1", "Điểm 2", "Điểm 3"]},
  ...
]

CHỈ TRẢ VỀ JSON ARRAY, KHÔNG CÓ MARKDOWN HAY GIẢI THÍCH.`;
};

// Prompt để tạo slide từ nội dung
const generateSlidePrompt = (
  content: string,
  topic?: string,
  slideCount?: number,
  outline?: SlideOutline[]
): string => {
  const slideCountInstruction = slideCount
    ? `Tạo ĐÚNG ${slideCount} slide`
    : 'Tạo 5-8 slide phù hợp với độ dài nội dung';

  const outlineInstruction = outline && outline.length > 0
    ? `\nDÀN Ý YÊU CẦU (tuân theo cấu trúc này):\n${outline.map(s =>
      `Slide ${s.slideNumber}: ${s.title}\n  - ${s.keyPoints.join('\n  - ')}`
    ).join('\n')}`
    : '';

  return `Bạn là một chuyên gia thiết kế slide thuyết trình giáo dục. Hãy tạo slide HTML cho nội dung sau.

${topic ? `CHỦ ĐỀ: ${topic}` : ''}

NỘI DUNG TÀI LIỆU:
${content}
${outlineInstruction}

YÊU CẦU:
1. ${slideCountInstruction}
2. Mỗi slide phải có class="slide" 
3. Slide đầu tiên là trang tiêu đề với h1
4. Các slide tiếp theo có h2 cho tiêu đề phụ
5. Sử dụng ul/li cho danh sách
6. Sử dụng div class="box" cho các định nghĩa/công thức quan trọng
7. Với công thức toán, dùng cú pháp LaTeX trong $$ $$ hoặc $ $
8. KHÔNG TẠO THÊM BLOCK <style> - template đã có sẵn CSS
9. KHÔNG sử dụng height: 100vh cho .slide - template sẽ xử lý display

CHỈ TRẢ VỀ CÁC THẺ <section class="slide">...</section>, KHÔNG CÓ MARKDOWN, GIẢI THÍCH HAY BLOCK <style>. Bắt đầu ngay với <section class="slide">`;
};

// Gọi Gemini API
async function callGeminiAPI(
  prompt: string,
  apiKey: string,
  modelId: ModelId
): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    const response = await fetch(
      `${GEMINI_API_BASE}/${modelId}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.error?.message || `HTTP ${response.status}`;
      const errorCode = errorData?.error?.code || response.status;
      throw new Error(`${errorCode} ${errorMessage}`);
    }

    const data = await response.json();
    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('Không nhận được nội dung từ API');
    }

    return { success: true, data: generatedText };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi không xác định',
    };
  }
}

// Tạo outline gợi ý
export async function generateOutline(
  content: string,
  topic: string,
  slideCount: number,
  apiKey: string,
  selectedModel?: ModelId
): Promise<{ success: boolean; outline?: SlideOutline[]; error?: string }> {
  const modelsToTry = selectedModel
    ? [selectedModel, ...AI_MODELS.filter(m => m.id !== selectedModel).map(m => m.id)]
    : AI_MODELS.map(m => m.id);

  const prompt = generateOutlinePrompt(content, topic, slideCount);

  for (const modelId of modelsToTry) {
    const result = await callGeminiAPI(prompt, apiKey, modelId);

    if (result.success && result.data) {
      try {
        // Clean up response
        let cleanedJson = result.data
          .replace(/```json\s*/gi, '')
          .replace(/```\s*/g, '')
          .trim();

        const outline = JSON.parse(cleanedJson) as SlideOutline[];
        return { success: true, outline };
      } catch {
        continue; // Try next model if JSON parse fails
      }
    }
  }

  return { success: false, error: 'Không thể tạo outline' };
}

// Tạo slide với cơ chế fallback
export async function generateSlides(
  content: string,
  apiKey: string,
  selectedModel?: ModelId,
  topic?: string,
  onProgress?: (progress: GenerationProgress) => void,
  slideCount?: number,
  outline?: SlideOutline[]
): Promise<GenerationResult> {
  // Xác định thứ tự model để thử
  const modelsToTry = selectedModel
    ? [selectedModel, ...AI_MODELS.filter(m => m.id !== selectedModel).map(m => m.id)]
    : AI_MODELS.map(m => m.id);

  const totalSteps = 3; // Analyze, Generate, Format
  const prompt = generateSlidePrompt(content, topic, slideCount, outline);

  for (let modelIndex = 0; modelIndex < modelsToTry.length; modelIndex++) {
    const currentModel = modelsToTry[modelIndex];

    // Step 1: Analyzing
    onProgress?.({
      step: 1,
      totalSteps,
      status: 'processing',
      message: `Đang phân tích nội dung với ${currentModel}...`,
      currentModel,
    });

    // Step 2: Generating
    onProgress?.({
      step: 2,
      totalSteps,
      status: 'processing',
      message: `Đang tạo ${slideCount ? slideCount + ' slide' : 'slide'} với ${currentModel}...`,
      currentModel,
    });

    const result = await callGeminiAPI(prompt, apiKey, currentModel);

    if (result.success && result.data) {
      // Clean up response - remove markdown code blocks if present
      let cleanedHtml = result.data
        .replace(/```html\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();

      // Loại bỏ các block <style> thừa - template đã có sẵn CSS
      cleanedHtml = cleanedHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

      // Loại bỏ khoảng trắng thừa giữa các section
      cleanedHtml = cleanedHtml.replace(/^\s+/gm, '').trim();

      // Step 3: Formatting
      onProgress?.({
        step: 3,
        totalSteps,
        status: 'completed',
        message: 'Hoàn tất tạo slide!',
        currentModel,
      });

      return {
        success: true,
        slides: cleanedHtml,
        usedModel: currentModel,
      };
    }

    // Nếu không phải model cuối, thử model tiếp theo
    if (modelIndex < modelsToTry.length - 1) {
      onProgress?.({
        step: 2,
        totalSteps,
        status: 'processing',
        message: `Model ${currentModel} gặp lỗi. Đang chuyển sang model tiếp theo...`,
        currentModel: modelsToTry[modelIndex + 1],
      });
      continue;
    }

    // Tất cả model đều thất bại
    onProgress?.({
      step: 2,
      totalSteps,
      status: 'error',
      message: `Lỗi: ${result.error}`,
      currentModel,
    });

    return {
      success: false,
      error: result.error,
      usedModel: currentModel,
    };
  }

  return {
    success: false,
    error: 'Không thể kết nối với bất kỳ model AI nào',
  };
}

// Validate API key format
export function validateApiKey(key: string): boolean {
  // Gemini API keys thường bắt đầu với "AIza" và có độ dài khoảng 39 ký tự
  return key.startsWith('AIza') && key.length >= 35;
}
