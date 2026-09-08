import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { LessonInfo, AiProvider, StandardStructure } from "../types";
import { 
  LESSON_STRUCTURE_PROMPT, 
  GEMINI_FALLBACK_MODELS, 
  AGENT_PLATFORM_FALLBACK_MODELS 
} from "../utils/constants";
import { formatAIContentForPrompt } from "../data/aiCompetencyDB";
import { LessonType, getStructurePromptForType, getTypeSpecificInstructions } from "../data/lessonTypeDB";
import {
  assessLessonQuality,
  buildLessonQualityRequirements,
  LessonQualityOptions,
  selectRelevantContext,
} from "./lessonQuality";

/**
 * Client factory tập trung duy nhất cho mọi lệnh gọi AI.
 * Nếu provider là 'agent-platform', bật cờ vertexai: true để SDK định tuyến sang aiplatform.googleapis.com
 */
export const createGoogleAiClient = (
  apiKey: string,
  provider: AiProvider = 'gemini'
): GoogleGenAI => {
  if (provider === 'agent-platform') {
    return new GoogleGenAI({ vertexai: true, apiKey });
  }
  return new GoogleGenAI({ apiKey });
};

export const FALLBACK_MODELS = GEMINI_FALLBACK_MODELS;

export type ApiErrorType =
  | 'INVALID_API_KEY'
  | 'PERMISSION_DENIED'
  | 'QUOTA_EXCEEDED'
  | 'INVALID_ARGUMENT'
  | 'MODEL_OVERLOADED'
  | 'NOT_FOUND'
  | 'UNKNOWN';

const getErrorStatus = (error: any): number | undefined => {
  const status = Number(
    error?.status ??
    error?.code ??
    error?.error?.code ??
    error?.response?.status
  );
  return Number.isFinite(status) ? status : undefined;
};

export const getOrderedModels = (
  selectedModel?: string, 
  provider: AiProvider = 'gemini'
): string[] => {
  const preferred = selectedModel?.trim();
  const fallbackList = provider === 'agent-platform'
    ? AGENT_PLATFORM_FALLBACK_MODELS
    : GEMINI_FALLBACK_MODELS;

  return Array.from(new Set([
    ...(preferred ? [preferred] : []),
    ...fallbackList,
  ]));
};

export const shouldFallbackModel = (
  errorType: ApiErrorType,
  provider: AiProvider = 'gemini'
): boolean => {
  if (errorType === 'MODEL_OVERLOADED' || errorType === 'NOT_FOUND') {
    return true;
  }
  // Với Agent Platform API, có thể thử model tương thích tiếp theo khi gặp PERMISSION_DENIED
  if (provider === 'agent-platform' && errorType === 'PERMISSION_DENIED') {
    return true;
  }
  return false;
};

export interface GeminiFallbackEvent {
  fromModel: string;
  toModel: string;
  errorType: ApiErrorType;
  provider: AiProvider;
}

export const parseApiError = (error: any): ApiErrorType => {
  const message = error?.message || error?.toString() || '';
  let serialized = '';
  try {
    serialized = JSON.stringify(error) || '';
  } catch {
    serialized = String(error || '');
  }
  const combined = `${message}\n${serialized}`;
  const lower = combined.toLowerCase();
  const status = getErrorStatus(error);
  const hasStatus = (code: number) => status === code || new RegExp(`\\b${code}\\b`).test(combined);

  // 401 là lỗi xác thực/key
  if (
    hasStatus(401) ||
    message.includes('API_KEY_INVALID') ||
    lower.includes('api key not valid') ||
    lower.includes('invalid api key')
  ) {
    return 'INVALID_API_KEY';
  }

  // 403: thiếu quyền
  if (hasStatus(403) || message.includes('PERMISSION_DENIED')) {
    return 'PERMISSION_DENIED';
  }

  // 429 không phải lỗi model và không được fallback sang model khác
  if (
    hasStatus(429) ||
    message.includes('RESOURCE_EXHAUSTED') ||
    lower.includes('quota') ||
    lower.includes('rate limit')
  ) {
    return 'QUOTA_EXCEEDED';
  }

  if (hasStatus(400) || message.includes('INVALID_ARGUMENT')) {
    return 'INVALID_ARGUMENT';
  }

  // Lỗi tạm thời 500/503/504 hoặc overloaded
  if (
    hasStatus(500) ||
    hasStatus(503) ||
    hasStatus(504) ||
    message.includes('UNAVAILABLE') ||
    message.includes('INTERNAL') ||
    message.includes('DEADLINE_EXCEEDED') ||
    lower.includes('high demand') ||
    lower.includes('overloaded') ||
    lower.includes('try again later') ||
    lower.includes('temporarily unavailable') ||
    lower.includes('quá tải') ||
    lower.includes('tạm thời không khả dụng')
  ) {
    return 'MODEL_OVERLOADED';
  }

  // Not found/deprecated: 404, NOT_FOUND
  if (
    hasStatus(404) ||
    message.includes('NOT_FOUND') ||
    lower.includes('not found')
  ) {
    return 'NOT_FOUND';
  }

  return 'UNKNOWN';
};

export class GeminiService {
  private genAI: GoogleGenAI;
  private apiKey: string;
  private provider: AiProvider;
  private modelName: string;
  private onFallback?: (event: GeminiFallbackEvent) => void;

  constructor(
    apiKey: string,
    provider: AiProvider = 'gemini',
    model: string = 'gemini-3.6-flash',
    onFallback?: (event: GeminiFallbackEvent) => void
  ) {
    this.apiKey = apiKey;
    this.provider = provider;
    this.genAI = createGoogleAiClient(apiKey, provider);
    this.modelName = model;
    this.onFallback = onFallback;
  }

  /**
   * Mọi request generateContent đều đi qua hàm fallback duy nhất này.
   */
  private async callWithFallback<T>(
    fn: (modelName: string) => Promise<T>,
    preferredModel: string = this.modelName
  ): Promise<T> {
    const modelsToTry = getOrderedModels(preferredModel, this.provider);

    let lastError: any;

    for (let index = 0; index < modelsToTry.length; index++) {
      const model = modelsToTry[index];
      try {
        const result = await fn(model);
        if (index > 0) {
          console.info(`[${this.provider}] Fallback thành công với model ${model}.`);
        }
        return result;
      } catch (err: any) {
        lastError = err;
        const errorType = parseApiError(err);

        if (!shouldFallbackModel(errorType, this.provider)) {
          throw new Error(this.formatError(err));
        }

        const nextModel = modelsToTry[index + 1];
        if (nextModel) {
          this.onFallback?.({
            fromModel: model,
            toModel: nextModel,
            errorType,
            provider: this.provider,
          });
          console.warn(
            `[${this.provider}] Model ${model} gặp ${errorType}; tự động chuyển sang ${nextModel}.`
          );
        }
      }
    }

    throw new Error(this.formatError(lastError));
  }

  /**
   * Format user-friendly error messages
   */
  private formatError(err: any): string {
    const errorType = parseApiError(err);
    const message = err?.message || err?.toString() || '';

    if (errorType === 'INVALID_API_KEY') {
      return 'API Key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại trong phần Cài đặt.';
    }

    if (errorType === 'PERMISSION_DENIED') {
      if (this.provider === 'agent-platform') {
        return 'API Key chưa được cấp quyền truy cập Agent Platform API hoặc model này. Vui lòng kiểm tra lại API restrictions, billing và quyền dự án trong Google Cloud Console.';
      }
      return 'API key không có quyền truy cập Gemini API. Hãy tạo auth key mới trong Google AI Studio.';
    }

    if (errorType === 'QUOTA_EXCEEDED') {
      return 'Đã hết quota hoặc vượt giới hạn tốc độ API. Vui lòng đợi một lúc rồi thử lại.';
    }

    if (errorType === 'INVALID_ARGUMENT') {
      return 'Yêu cầu gửi tới AI không hợp lệ. Vui lòng kiểm tra nội dung đầu vào hoặc cấu hình model.';
    }

    if (errorType === 'MODEL_OVERLOADED') {
      return 'Các model AI đang quá tải hoặc tạm thời không khả dụng. App đã thử toàn bộ model dự phòng; vui lòng thử lại sau.';
    }

    if (errorType === 'NOT_FOUND') {
      return 'Không model AI nào trong chuỗi dự phòng còn khả dụng. Vui lòng chọn model khác hoặc cập nhật danh sách model.';
    }

    return message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
  }

  /**
   * Strip markdown code fences from JSON response
   */
  private stripCodeFences(text: string): string {
    return text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
  }

  /**
   * Build content parts — supports text + optional image (multimodal)
   */
  private buildParts(prompt: string, imageData?: { base64: string; mimeType: string }): any[] {
    const parts: any[] = [{ text: prompt }];
    if (imageData) {
      parts.push({
        inlineData: { data: imageData.base64, mimeType: imageData.mimeType }
      });
    }
    return parts;
  }

  /**
   * Điểm gọi Gemini duy nhất của service. Mọi tác vụ đều đi qua đây để không
   * bỏ sót fallback ở các helper như phân tích mẫu hay lượt viết lại giáo án.
   */
  private async generateTextWithFallback(
    buildRequest: (modelName: string) => { contents: any; config?: any },
    preferredModel: string = this.modelName
  ): Promise<{ text: string; model: string }> {
    return this.callWithFallback(async (model) => {
      const request = buildRequest(model);
      const response = await this.genAI.models.generateContent({
        model,
        contents: request.contents,
        ...(request.config ? { config: request.config } : {}),
      });

      return { text: response.text || '', model };
    }, preferredModel);
  }

  private getLessonGenerationConfig(modelName: string) {
    return {
      maxOutputTokens: 32768,
      ...(modelName.startsWith('gemini-3')
        ? { thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } }
        : {}),
    };
  }

  /**
   * Analyze sample lesson plan — supports text or image input
   */
  async analyzeSample(
    sampleText: string,
    imageData?: { base64: string; mimeType: string }
  ): Promise<string> {
    const prompt = `Bạn là chuyên gia phân tích mẫu kế hoạch bài dạy. Hãy lập HỒ SƠ CẤU TRÚC của mẫu dưới đây để một AI khác có thể điền nội dung mới mà vẫn giữ đúng hình thức.

PHẢI TRÍCH XUẤT ĐẦY ĐỦ:
1. Header: số cột/hàng, nhãn trường, tổ, giáo viên, ngày, tiết, lớp.
2. Thứ tự chính xác của mọi phần và tiểu mục (I, II, III; Hoạt động 1; 2.1, 2.2, 2.3; 3.1, 3.2...). Không được gộp hoặc bỏ tiểu hoạt động.
3. Với mỗi hoạt động, liệt kê đủ các ô/mục a) Mục tiêu, b) Nội dung, c) Sản phẩm, d) Tổ chức thực hiện và số bước bên trong.
4. Bảng, bullet, căn lề, in đậm/in nghiêng và quy tắc đặt tiêu đề.
5. Các vị trí là chỗ trống/dòng chấm cần được điền bằng nội dung thật.

CHỈ mô tả cấu trúc và các vị trí cần điền; không đánh giá độ dài, không sao chép nội dung bài học cũ, không đề nghị làm giáo án ngắn. Nếu mẫu sơ lược thì vẫn phải giữ đủ slot nhưng ghi rõ rằng từng slot cần nội dung cụ thể.
${sampleText ? `\nNỘI DUNG FILE MẪU:\n${sampleText}` : '\nPhân tích từ ảnh giáo án đính kèm.'}`;

    const response = await this.generateTextWithFallback(() => ({
        contents: [{ parts: this.buildParts(prompt, imageData) }],
        config: { maxOutputTokens: 8192 },
    }));

    return response.text;
  }

  /**
   * Extract schedule from plan file — supports text or image input
   */
  async extractSchedule(
    scheduleText: string,
    imageData?: { base64: string; mimeType: string }
  ): Promise<LessonInfo[]> {
    const prompt = `Phân tích kế hoạch giảng dạy sau. Trích xuất danh sách các tiết dạy dưới dạng JSON array:
[{"tiet": 1, "tuan": 1, "ngay_day": "...", "noi_dung": "...", "ghi_chu": "..."}]

CHÚ Ý:
- "tiet" là số thứ tự tiết (number)
- "tuan" là tuần thứ mấy (number)
- "ngay_day" là ngày dạy (string)
- "noi_dung" là nội dung/tên bài (string)
- "ghi_chu" là ghi chú thêm nếu có (string, có thể rỗng)
${scheduleText ? `\nNội dung kế hoạch:\n${scheduleText}` : '\nPhân tích từ ảnh kế hoạch đính kèm.'}

Chỉ trả về JSON array, không kèm văn bản khác. Không wrap trong markdown code block.`;

    const response = await this.generateTextWithFallback(() => ({
        contents: [{ parts: this.buildParts(prompt, imageData) }],
        config: { responseMimeType: "application/json" }
    }));

    const resultText = response.text || "[]";

    try {
      const cleaned = this.stripCodeFences(resultText);
      const parsed = JSON.parse(cleaned);
      
      if (!Array.isArray(parsed)) {
        console.error("Schedule response is not an array:", parsed);
        return [];
      }
      
      return parsed.map((item: any, idx: number) => ({
        tiet: item.tiet ?? idx + 1,
        tuan: item.tuan ?? 1,
        ngay_day: item.ngay_day ?? '',
        noi_dung: item.noi_dung ?? `Tiết ${idx + 1}`,
        ghi_chu: item.ghi_chu ?? '',
      }));
    } catch (e) {
      console.error("Failed to parse schedule JSON:", e, "Raw:", resultText);
      return [];
    }
  }

  /**
   * Generate a full lesson plan
   */
  async generateLesson(
    lesson: LessonInfo, 
    structure: string, 
    schoolInfo: { school: string, dept: string, teacher: string, year: string, level?: string, classLevel?: string, subjectName?: string, enableAiCompetency?: boolean, enableDigitalCompetency?: boolean, enableForeignLanguage?: boolean, enableDisabilityCompetency?: boolean, lessonType?: LessonType, standardStructure?: StandardStructure },
    referenceText?: string,
    textbookText?: string,
    teachingMethodsPrompt?: string,
    competenciesPrompt?: string,
    teacherIdeasPrompt?: string
  ): Promise<string> {
      const subjectLabel = schoolInfo.subjectName || 'môn học';
      
      // Detect "SOẠN THEO BÀI | THỜI LƯỢNG: X tiết" from ghi_chu
      const thoiLuongMatch = lesson.ghi_chu?.match(/THỜI LƯỢNG:\s*(\d+)\s*tiết/i);
      const isSoanTheoBai = lesson.ghi_chu?.includes('SOẠN THEO BÀI');
      const thoiLuong = thoiLuongMatch ? parseInt(thoiLuongMatch[1]) : 1;
      
      // Extract noi dung chi tiet if present
      const noiDungMatch = lesson.ghi_chu?.match(/Nội dung chi tiết:\s*(.+?)(?:\s*\||$)/);
      const noiDungChiTiet = noiDungMatch ? noiDungMatch[1].trim() : '';

      let lessonHeader: string;
      let thoiLuongPrompt = '';

      if (isSoanTheoBai) {
        lessonHeader = `Viết giáo án ${subjectLabel} chi tiết cho bài: ${lesson.noi_dung}.`;
        thoiLuongPrompt = `
⚠️ THỜI LƯỢNG BÀI HỌC: ${thoiLuong} tiết
- Giáo án này cho BÀI HỌC trọn vẹn, KHÔNG phải 1 tiết đơn lẻ.
- Thời lượng ${thoiLuong} tiết → nội dung phải ĐẦY ĐỦ, CỤ THỂ, CHI TIẾT tương xứng.
- ${thoiLuong >= 3 ? 'Bài dài — cần nhiều hoạt động đa dạng, bài tập phong phú, nội dung mở rộng sâu.' : thoiLuong >= 2 ? 'Bài 2 tiết — nội dung vừa đủ chi tiết, có phần luyện tập kỹ.' : 'Bài 1 tiết — nội dung cô đọng, trọng tâm.'}
- KHÔNG cần chú thích từng hoạt động kéo dài bao nhiêu phút.
- Số trang in A4 tương ứng: khoảng ${Math.max(6, thoiLuong * 4)}-${Math.max(8, thoiLuong * 5)} trang.
${noiDungChiTiet ? `\n📝 NỘI DUNG CHI TIẾT ĐƯỢC CUNG CẤP:\n${noiDungChiTiet}\nGiáo án PHẢI bám sát nội dung chi tiết trên.` : ''}`;
      } else {
        lessonHeader = `Viết giáo án ${subjectLabel} chi tiết cho Tiết ${lesson.tiet}: ${lesson.noi_dung}.`;
      }

      // Chọn cấu trúc chuẩn theo loại giáo án và cấu trúc 5512 (Cấu trúc 1 hoặc Cấu trúc 2)
      const currentLessonType = schoolInfo.lessonType || 'standard';
      const currentStandardStructure = schoolInfo.standardStructure || 'structure1';
      const typeStructure = getStructurePromptForType(currentLessonType, currentStandardStructure);
      const typeInstructions = getTypeSpecificInstructions(currentLessonType, currentStandardStructure);
      const analyzedSampleStructure = structure?.trim() || '';
      
      // Với KHBD 5512:
      // - Nếu có mẫu người dùng tải lên: dùng mẫu người dùng
      // - Nếu không có: dùng Cấu trúc 1 (LESSON_STRUCTURE_PROMPT) hoặc Cấu trúc 2 (STANDARD_STRUCTURE_2_PROMPT)
      const defaultStandardPrompt = currentStandardStructure === 'structure2' ? typeStructure : LESSON_STRUCTURE_PROMPT;
      const structureToUse = currentLessonType === 'standard'
        ? (analyzedSampleStructure || defaultStandardPrompt)
        : (typeStructure || LESSON_STRUCTURE_PROMPT);
      const sampleFormattingGuide = currentLessonType !== 'standard' && analyzedSampleStructure
        ? `\nHƯỚNG DẪN HÌNH THỨC TỪ FILE MẪU (chỉ áp dụng bảng, header, font, cách đánh mục; không được làm mất các phần bắt buộc của loại ${currentLessonType.toUpperCase()}):\n${analyzedSampleStructure}`
        : '';

      const relevantTextbook = selectRelevantContext(textbookText || '', lesson.noi_dung, 24000);
      const relevantReference = selectRelevantContext(referenceText || '', lesson.noi_dung, 14000);
      const relevantTeacherIdeas = selectRelevantContext(teacherIdeasPrompt || '', lesson.noi_dung, 18000);
      const qualityOptions: LessonQualityOptions = {
        subjectName: subjectLabel,
        durationPeriods: thoiLuong,
        lessonType: currentLessonType,
        standardStructure: currentStandardStructure,
        hasTextbook: Boolean(relevantTextbook),
      };
      const qualityRequirements = buildLessonQualityRequirements(qualityOptions);

      const prompt = `${lessonHeader}
${typeInstructions}

ĐÂY LÀ CẤU TRÚC HÌNH THỨC CÓ THẨM QUYỀN. Tuân thủ CHÍNH XÁC thứ tự, tên mục và số tiểu hoạt động; điền nội dung thật vào mọi slot:
${structureToUse}
${sampleFormattingGuide}

Thông tin bổ sung:
- Môn học: ${subjectLabel}
- Cấp học: ${schoolInfo.level || '[Cấp học]'}
- Lớp: ${schoolInfo.classLevel || '[Lớp]'}
- Trường: ${schoolInfo.school || '[Tên trường]'}
- Tổ bộ môn: ${schoolInfo.dept || '[Tổ bộ môn]'}
- Giáo viên: ${schoolInfo.teacher || '[Tên GV]'}
- Năm học: ${schoolInfo.year || '2025-2026'}
- Ngày dạy: ${lesson.ngay_day || '[Ngày dạy]'}
- Tuần: ${lesson.tuan || '[Tuần]'}
${thoiLuongPrompt}
${lesson.ghi_chu && !isSoanTheoBai ? `\n⚠️ CHỦ ĐỀ BẮT BUỘC: ${lesson.ghi_chu}\nGiáo án PHẢI thuộc chủ đề này. Mọi hoạt động, bài tập, nội dung đều phải xoay quanh chủ đề trên.` : ''}

⚠️ NỘI DUNG PHẢI PHÙ HỢP CẤP HỌC ${schoolInfo.level || ''} VÀ ĐỐI TƯỢNG ${schoolInfo.classLevel || ''}. Độ khó bài tập, ngôn ngữ, thời lượng phải tương xứng lứa tuổi học sinh.

YÊU CẦU BẮT BUỘC:
- Mỗi hoạt động/tiểu hoạt động có đủ 4 mục: a) Mục tiêu, b) Nội dung, c) Sản phẩm, d) Tổ chức thực hiện
- Mục d luôn có 4 bước: Bước 1, Bước 2, Bước 3, Bước 4
- Nội dung bài tập chi tiết, cụ thể, phù hợp NỘI DUNG TIẾT DẠY và ĐẶC THÙ MÔN ${subjectLabel.toUpperCase()}
- Phần Hướng dẫn về nhà: 5-7 gạch đầu dòng
- Ngôn ngữ: Tiếng Việt chuẩn giáo dục
- Dùng markdown formatting: **bold** cho tiêu đề, - cho bullet, | | cho bảng
- TUYỆT ĐỐI KHÔNG dùng HTML tags (<p>, <b>, <font>, <br>, <table>, <tr>, <td>...). CHỈ dùng markdown thuần.
- TUYỆT ĐỐI KHÔNG in mã nội bộ, mã trích dẫn hệ thống vào giáo án. Cấm các mã dạng: THPT_NL_CHUNG_xx, THPT_PC_xx, THCS_NL_xx, TH_PC_xx, [A1], [C2], (Theo QĐ 2422/QĐ-BGDĐT), YCCD, v.v. Chỉ viết NỘI DUNG bằng ngôn ngữ tự nhiên.
- TUYỆT ĐỐI KHÔNG dùng dấu gạch ngang "------" hay "--------" làm nội dung ô bảng hoặc placeholder. Nếu ô bảng chưa có dữ liệu, viết nội dung mẫu cụ thể hoặc để trống.
- Các công thức toán học, vật lý, hóa học PHẢI viết bằng cú pháp LaTeX chuẩn:
  + Công thức inline (trong dòng văn bản): dùng $...$ ví dụ: $\\frac{1}{2}mv^2$, $\\sqrt{x^2+y^2}$, $a^2 + b^2 = c^2$
  + Công thức hiển thị riêng dòng: dùng $$...$$ ví dụ: $$F = ma$$, $$E = mc^2$$
  + Dùng \\frac{}{} cho phân số, \\sqrt{} cho căn, ^{} cho mũ, _{} cho chỉ số, \\alpha \\beta \\pi cho ký hiệu Hy Lạp
  + KHÔNG viết công thức dạng text thô (ví dụ: KHÔNG viết "x^2" mà phải viết "$x^{2}$")
- Năng lực đặc thù phải PHÙ HỢP với môn ${subjectLabel} (KHÔNG dùng năng lực của môn khác)
${qualityRequirements}
${schoolInfo.enableAiCompetency ? (() => {
  // Parse grade from classLevel (e.g. "Lớp 7" → 7, "Lớp 10" → 10)
  const gradeMatch = (schoolInfo.classLevel || '').match(/(\d+)/);
  const grade = gradeMatch ? parseInt(gradeMatch[1]) : 0;
  const aiFrameworkData = grade > 0 ? formatAIContentForPrompt(grade, subjectLabel) : '';
  return `
🤖 NĂNG LỰC TRÍ TUỆ NHÂN TẠO (AI) - TÍCH HỢP VÀO GIÁO ÁN (Theo QĐ 2422/QĐ-BGDĐT):

${aiFrameworkData}

📋 CÁCH TÍCH HỢP NĂNG LỰC AI VÀO GIÁO ÁN:

═══════════════════════════════════════════════════════════
📍 VỊ TRÍ 1: PHẦN I. MỤC TIÊU (Năng lực AI NGAY SAU Năng lực số)
═══════════════════════════════════════════════════════════
- Trong phần I. MỤC TIÊU, SAU mục NLS (nếu có), thêm:
  - Năng lực trí tuệ nhân tạo (AI) (Theo QĐ 2422/QĐ-BGDĐT):
    + [Mã chủ đề]: Nội dung năng lực AI cụ thể cho lớp ${grade > 0 ? grade : schoolInfo.classLevel || ''}

- VÍ DỤ ĐÚNG:
  - Năng lực trí tuệ nhân tạo (AI) (Theo QĐ 2422/QĐ-BGDĐT):
    + [A1] Tính chủ động của con người: (nội dung cụ thể phù hợp bài học)
    + [C2] Ứng dụng AI trong học tập: (nội dung cụ thể phù hợp bài học)

═══════════════════════════════════════════════════════════
📍 VỊ TRÍ 2: CÁC HOẠT ĐỘNG DẠY HỌC (PHÂN BỔ ĐỀU)
═══════════════════════════════════════════════════════════
- NLS và NL AI nên được phân bổ vào CÁC HOẠT ĐỘNG KHÁC NHAU
- KHÔNG đặt NL AI ngay sau NLS trong cùng một hoạt động
- Phân bổ đều: Nếu NLS ở Hoạt động 2, thì NL AI ở Hoạt động 3 hoặc 4

📝 QUY TẮC:
- Chỉ tích hợp 2-3 nội dung AI phù hợp nhất với nội dung bài học
- Hoạt động AI phải thực tế, khả thi trong điều kiện trường học Việt Nam
- Hướng dẫn HS sử dụng AI có trách nhiệm, biết phản biện kết quả AI
- Đề xuất phần mềm, ứng dụng CNTT phù hợp với nội dung bài dạy
- Lưu ý đạo đức sử dụng AI trong học tập (không gian lận, trích dẫn nguồn)
- Năng lực AI phải đúng theo nội dung QĐ 2422 cho lớp đang soạn
`;
})() : ''}
${schoolInfo.enableDigitalCompetency ? (() => {
  const gradeMatch2 = (schoolInfo.classLevel || '').match(/(\d+)/);
  const grade2 = gradeMatch2 ? parseInt(gradeMatch2[1]) : 0;
  let bacNLS = 'CB1';
  if (grade2 >= 1 && grade2 <= 3) bacNLS = 'Cơ bản 1 (CB1)';
  else if (grade2 >= 4 && grade2 <= 5) bacNLS = 'Cơ bản 2 (CB2)';
  else if (grade2 >= 6 && grade2 <= 7) bacNLS = 'Trung cấp 1 (TC1)';
  else if (grade2 >= 8 && grade2 <= 9) bacNLS = 'Trung cấp 2 (TC2)';
  else if (grade2 >= 10 && grade2 <= 11) bacNLS = 'Nâng cao 1 (NC1)';
  else if (grade2 >= 12) bacNLS = 'Nâng cao 2 (NC2)';
  return `
💻 NĂNG LỰC SỐ - TÍCH HỢP VÀO GIÁO ÁN (Theo TT 02/2025/TT-BGDĐT):

🎯 BẬC THÀNH THẠO ÁP DỤNG: ${bacNLS} (Lớp ${grade2 > 0 ? grade2 : schoolInfo.classLevel || ''})

📋 6 MIỀN NĂNG LỰC SỐ:
- Miền 1: Khai thác thông tin và dữ liệu (truy cập, tìm kiếm, đánh giá, quản lý dữ liệu số)
- Miền 2: Giao tiếp và hợp tác trong môi trường số (tương tác, chia sẻ, cộng tác trực tuyến)
- Miền 3: Sáng tạo nội dung số (phát triển, chỉnh sửa, tích hợp tài nguyên số, bản quyền)
- Miền 4: An toàn trong không gian mạng (bảo vệ thiết bị, dữ liệu, quyền riêng tư)
- Miền 5: Giải quyết vấn đề (xử lý sự cố kỹ thuật, ứng dụng công nghệ giải quyết vấn đề)
- Miền 6: Ứng dụng công nghệ mới/AI và định hướng nghề nghiệp số

📍 CÁCH TÍCH HỢP:
- Trong phần I. MỤC TIÊU, thêm mục "Năng lực số" sau Năng lực chung
- Chọn 1-2 miền năng lực số phù hợp nhất với nội dung bài học
- Thiết kế hoạt động thực hành sử dụng công cụ số (phần mềm, ứng dụng, website)
- Đánh giá qua sản phẩm số: bản trình chiếu, video, sơ đồ tư duy số, bảng số liệu
- Tích hợp tự nhiên, không gượng ép, phù hợp điều kiện cơ sở vật chất
`;
})() : ''}
${schoolInfo.enableForeignLanguage ? (() => {
  const subjectForFL = schoolInfo.subjectName || 'môn học';
  return `
🌐 NĂNG LỰC NGOẠI NGỮ (TIẾNG ANH) - TÍCH HỢP VÀO GIÁO ÁN (Theo QĐ 2371/QĐ-TTg):

Phương pháp: CLIL (Content and Language Integrated Learning) — Học tập tích hợp nội dung và ngôn ngữ.

📋 QUY TRÌNH TÍCH HỢP:

1. PHẦN I. MỤC TIÊU — thêm mục "Năng lực ngoại ngữ (tiếng Anh chuyên ngành)":
   - Nhận biết, phát âm chuẩn 4-8 thuật ngữ tiếng Anh cốt lõi của bài học ${subjectForFL}
   - Đọc hiểu câu hỏi/đề bài song ngữ Anh-Việt ở mức cơ bản

2. PHẦN II. THIẾT BỊ VÀ HỌC LIỆU — bổ sung:
   - Bảng từ vựng (Word Bank / Vocabulary Box) kèm phiên âm IPA và nghĩa tiếng Việt
   - Phiếu học tập song ngữ (nếu phù hợp)

3. PHẦN III. CÁC HOẠT ĐỘNG DẠY HỌC — lồng ghép tiếng Anh:
   - Khởi động: Giới thiệu Hộp từ vựng (Word Bank), cho HS đọc đồng thanh
   - Hình thành kiến thức: Ghi thuật ngữ tiếng Anh bên cạnh khái niệm mới
   - Luyện tập: Ít nhất 1 bài tập hoặc 2 câu hỏi trắc nghiệm song ngữ Anh-Việt
   - Vận dụng: Giao nhiệm vụ tìm hiểu tài liệu mở rộng hoặc sản phẩm có tiêu đề tiếng Anh

⚠️ NGUYÊN TẮC:
- Kiến thức bộ môn là trung tâm, tiếng Anh là công cụ hỗ trợ
- Tích hợp tự nhiên, vừa sức, không biến tiết bộ môn thành tiết ngữ pháp
- Cung cấp từ vựng kèm phiên âm IPA chuẩn và nghĩa tiếng Việt
- Đánh giá theo hướng khích lệ, không trừ điểm chuyên môn vì tiếng Anh
`;
})() : ''}
${schoolInfo.enableDisabilityCompetency ? (() => {
  return `
♿ GIÁO DỤC HÒA NHẬP CHO HỌC SINH KHUYẾT TẬT - TÍCH HỢP VÀO GIÁO ÁN:

📋 HƯỚNG DẪN ĐIỀU CHỈNH GIÁO ÁN CHO HSKT:

1. PHẦN I. MỤC TIÊU — bổ sung:
   - Mục tiêu điều chỉnh cho HSKT (nếu lớp có HSKT):
     + Mục tiêu tối thiểu: Các kỹ năng cơ bản để tự phục vụ
     + Giảm yêu cầu về mức độ đạt được so với HS bình thường
     + Tích hợp kỹ năng giao tiếp & hợp tác qua hoạt động nhóm nhỏ

2. CÁC HOẠT ĐỘNG DẠY HỌC — điều chỉnh:
   - Tinh giản, thay thế hoặc miễn giảm nội dung phù hợp dạng tật và mức độ tật
   - Sử dụng đồ dùng trực quan (que tính, thẻ số, hình ảnh minh họa)
   - Bố trí HSKT ngồi cạnh bạn học tốt để hỗ trợ
   - Dành thêm thời gian cho HSKT hoàn thành nhiệm vụ

3. ĐÁNH GIÁ — linh hoạt:
   - HS khuyết tật nhẹ: Đánh giá như HS bình thường, giảm nhẹ yêu cầu
   - HS khuyết tật nặng: Đánh giá tiến bộ (Tiến bộ rõ rệt / Có tiến bộ / Ít tiến bộ)
   - Hình thức: phỏng vấn, quan sát, theo dõi (không chỉ dựa vào bài kiểm tra)

4. KỸ NĂNG ĐẶC THÙ CẦN PHÁT TRIỂN:
   - Kỹ năng giao tiếp: Biết trao đổi cơ bản với bạn bè và giáo viên
   - Kỹ năng tự phục vụ: Tự sắp xếp đồ dùng học tập
   - Kỹ năng xã hội: Biết bày tỏ cảm xúc, tham gia hoạt động nhóm

⚠️ NGUYÊN TẮC:
- Tôn trọng sự khác biệt, không phân biệt đối xử
- Điều chỉnh KHÔNG có nghĩa là cắt bỏ hoàn toàn
- Phối hợp giáo viên bộ môn + giáo viên chủ nhiệm + phụ huynh
- Khai thác điểm mạnh của từng HSKT
`;
})() : ''}
${teachingMethodsPrompt || ''}
${competenciesPrompt || ''}

${relevantTextbook ? `📖 TRÍCH ĐOẠN SÁCH GIÁO KHOA LIÊN QUAN (NGUỒN ƯU TIÊN CAO NHẤT):
Dưới đây là phần đã được chọn theo tên bài. Giáo án PHẢI:
- Bám sát CÁC MỤC, CÁC PHẦN trong nội dung SGK bên dưới
- Sử dụng ĐÚNG các thuật ngữ, định nghĩa, ví dụ trong SGK
- Các hoạt động dạy học phải XOAY QUANH nội dung SGK
- Bài tập phải PHÙ HỢP với mức độ kiến thức trong SGK

${relevantTextbook}` : ''}

${relevantReference ? `TÀI LIỆU THAM KHẢO LIÊN QUAN (chỉ dùng khi không mâu thuẫn với SGK):\n${relevantReference}` : ''}

${relevantTeacherIdeas ? `
⚠️ YÊU CẦU ĐẶC BIỆT TỪ GIÁO VIÊN — BẮT BUỘC THỰC HIỆN:
Giáo viên đã yêu cầu tích hợp các nội dung sau vào giáo án. BẠN PHẢI đưa CHÍNH XÁC các nội dung này vào phần phù hợp nhất của giáo án (hoạt động khởi động / hình thành kiến thức / luyện tập / vận dụng).
KHÔNG được bỏ qua hay thay đổi nội dung giáo viên yêu cầu.

${relevantTeacherIdeas}
` : ''}`;

      const response = await this.generateTextWithFallback((model) => ({
        contents: [{ parts: [{ text: prompt }] }],
        config: this.getLessonGenerationConfig(model),
      }));

      const firstDraft = this.cleanGeneratedContent(response.text);
      if (!firstDraft.trim()) {
        throw new Error('AI không trả về nội dung giáo án. Vui lòng thử lại.');
      }

      const firstAssessment = assessLessonQuality(firstDraft, qualityOptions);
      if (firstAssessment.passed) return firstDraft;

      // Tự kiểm tra và viết lại đúng một lần khi bản đầu còn sơ sài. Việc sửa
      // chỉ chạy khi các chỉ số nội dung thực tế chưa đạt nên không làm tăng
      // số request cho những giáo án đã tốt.
      console.warn('Bản nháp giáo án chưa đạt chuẩn, đang yêu cầu bổ sung:', {
        model: response.model,
        score: firstAssessment.score,
        stats: firstAssessment.stats,
        issues: firstAssessment.issues,
      });

      const revisionPrompt = `${prompt}

═══════════════════════════════════════════════════════════
KIỂM TRA CHẤT LƯỢNG BẢN NHÁP: CHƯA ĐẠT - PHẢI VIẾT LẠI TOÀN BỘ
═══════════════════════════════════════════════════════════
Các lỗi cần khắc phục:
${firstAssessment.issues.map((issue, index) => `${index + 1}. ${issue}`).join('\n')}

Hãy viết lại TOÀN BỘ giáo án từ đầu. Giữ đúng cấu trúc và nguồn ở trên, nhưng bổ sung nội dung chuyên môn, nhiệm vụ, sản phẩm, ví dụ, bài tập, công thức và lời giải để khắc phục đầy đủ mọi lỗi. Không nhận xét bản nháp, không dùng cụm "đã bổ sung", chỉ trả về giáo án hoàn chỉnh.

BẢN NHÁP CHƯA ĐẠT (chỉ dùng để nhận ra phần còn thiếu, không được rút gọn theo bản này):
${firstDraft}`;

      try {
        const revisedResponse = await this.generateTextWithFallback((revisionModel) => ({
          contents: [{ parts: [{ text: revisionPrompt }] }],
          config: this.getLessonGenerationConfig(revisionModel),
        }), response.model);
        const revisedDraft = this.cleanGeneratedContent(revisedResponse.text);
        if (!revisedDraft.trim()) return firstDraft;

        const revisedAssessment = assessLessonQuality(revisedDraft, qualityOptions);
        console.info('Kết quả tự kiểm tra giáo án sau khi bổ sung:', {
          model: revisedResponse.model,
          score: revisedAssessment.score,
          passed: revisedAssessment.passed,
          stats: revisedAssessment.stats,
        });
        return revisedAssessment.score >= firstAssessment.score ? revisedDraft : firstDraft;
      } catch (revisionError) {
        console.warn('Không thể chạy lượt bổ sung, dùng bản nháp đầu tiên:', revisionError);
        return firstDraft;
      }
  }

  /**
   * Post-process: loại bỏ mã nội bộ, dấu gạch ngang thừa, trích dẫn hệ thống
   */
  private cleanGeneratedContent(content: string): string {
    return content
      // Loại bỏ mã ID nội bộ: (THPT_NL_CHUNG_03), (THPT_PC_CHAM_CHI), etc.
      .replace(/\s*\((?:THPT|THCS|TH)_(?:NL|PC|NLS)[A-Z0-9_]*\)/g, '')
      // Loại bỏ mã [A1], [C2], [B3] etc. (mã AI competency)
      .replace(/\s*\[[A-Z]\d+\]\s*/g, ' ')
      // Loại bỏ (Theo QĐ 3439/QĐ-BGDĐT) và tương tự
      .replace(/\s*\(Theo QĐ \d+\/QĐ-BGDĐT\)/g, '')
      // Loại bỏ dãy dấu gạch ngang dài trong ô bảng (>= 3 dấu gạch liên tiếp)
      .replace(/\|\s*-{3,}\s*/g, '| ')
      .replace(/-{4,}/g, '')
      // Clean up khoảng trắng thừa
      .replace(/ {3,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n');
  }

  /**
   * Suggest teaching methods, techniques, and activities based on content
   */
  async suggestMethods(
    subjectName: string,
    lessonContent: string,
    availableMethods: { id: string; name: string }[],
    availableTechniques: { id: string; name: string; group: string }[],
    availableActivities: string[]
  ): Promise<{ methodIds: string[]; techniqueIds: string[]; activities: string[] }> {
    const prompt = `Bạn là chuyên gia giáo dục Việt Nam. Dựa trên thông tin bên dưới, hãy GỢI Ý các phương pháp dạy học, kĩ thuật dạy học, và hoạt động đặc thù PHÙ HỢP NHẤT.

MÔN HỌC: ${subjectName || 'Chưa xác định'}

NỘI DUNG BÀI HỌC ĐÃ PHÂN TÍCH:
${lessonContent || '(Chưa có nội dung)'}

DANH SÁCH PHƯƠNG PHÁP CÓ SẴN (chọn 3-5 cái phù hợp nhất):
${availableMethods.map(m => `- id: "${m.id}" → ${m.name}`).join('\n')}

DANH SÁCH KĨ THUẬT DẠY HỌC (chọn 4-6 cái phù hợp nhất, cần đa dạng nhóm):
${availableTechniques.map(t => `- id: "${t.id}" (${t.group}) → ${t.name}`).join('\n')}

DANH SÁCH HOẠT ĐỘNG ĐẶC THÙ MÔN HỌC (chọn 3-5 cái phù hợp nhất):
${availableActivities.map(a => `- "${a}"`).join('\n')}

Trả về JSON đúng format:
{"methodIds": ["id1", "id2", ...], "techniqueIds": ["id1", "id2", ...], "activities": ["act1", "act2", ...]}

Chỉ trả về JSON, không kèm giải thích.`;

    const response = await this.generateTextWithFallback(() => ({
        contents: [{ parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
    }));

    const resultText = response.text || "{}";

    try {
      const cleaned = this.stripCodeFences(resultText);
      const parsed = JSON.parse(cleaned);
      return {
        methodIds: Array.isArray(parsed.methodIds) ? parsed.methodIds : [],
        techniqueIds: Array.isArray(parsed.techniqueIds) ? parsed.techniqueIds : [],
        activities: Array.isArray(parsed.activities) ? parsed.activities : [],
      };
    } catch (e) {
      console.error("Failed to parse suggestMethods JSON:", e, "Raw:", resultText);
      return { methodIds: [], techniqueIds: [], activities: [] };
    }
  }
}
