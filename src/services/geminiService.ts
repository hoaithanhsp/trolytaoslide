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

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// Prompt để tạo slide từ nội dung
const generateSlidePrompt = (content: string, topic?: string): string => {
  return `Bạn là một chuyên gia thiết kế slide thuyết trình giáo dục. Hãy tạo slide HTML cho nội dung sau.

${topic ? `CHỦ ĐỀ: ${topic}` : ''}

NỘI DUNG TÀI LIỆU:
${content}

YÊU CẦU:
1. Tạo 5-8 slide HTML phù hợp với nội dung
2. Mỗi slide phải có class="slide" 
3. Slide đầu tiên là trang tiêu đề với h1
4. Các slide tiếp theo có h2 cho tiêu đề phụ
5. Sử dụng ul/li cho danh sách
6. Sử dụng div class="box" cho các định nghĩa/công thức quan trọng
7. Với công thức toán, dùng cú pháp LaTeX trong $$ $$ hoặc $ $
8. Style inline: màu chính #2563eb, màu phụ #1e40af, accent #f59e0b
9. Font size: h1=3.5rem, h2=2.5rem, p/li=1.4rem

CHỈ TRẢ VỀ HTML THUẦN TÚY, KHÔNG CÓ MARKDOWN HAY GIẢI THÍCH. Bắt đầu ngay với <section class="slide">`;
};

// Gọi Gemini API
async function callGeminiAPI(
  content: string,
  apiKey: string,
  modelId: ModelId,
  topic?: string
): Promise<{ success: boolean; data?: string; error?: string }> {
  const prompt = generateSlidePrompt(content, topic);
  
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

    // Clean up response - remove markdown code blocks if present
    let cleanedHtml = generatedText
      .replace(/```html\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    return { success: true, data: cleanedHtml };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi không xác định',
    };
  }
}

// Tạo slide với cơ chế fallback
export async function generateSlides(
  content: string,
  apiKey: string,
  selectedModel?: ModelId,
  topic?: string,
  onProgress?: (progress: GenerationProgress) => void
): Promise<GenerationResult> {
  // Xác định thứ tự model để thử
  const modelsToTry = selectedModel
    ? [selectedModel, ...AI_MODELS.filter(m => m.id !== selectedModel).map(m => m.id)]
    : AI_MODELS.map(m => m.id);

  const totalSteps = 3; // Analyze, Generate, Format

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
      message: `Đang tạo slide với ${currentModel}...`,
      currentModel,
    });

    const result = await callGeminiAPI(content, apiKey, currentModel, topic);

    if (result.success && result.data) {
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
        slides: result.data,
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
