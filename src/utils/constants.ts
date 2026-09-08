export const APP_NAME = "TRỢ LÝ TẠO GIÁO ÁN";

export type AiProvider = 'gemini' | 'agent-platform';

export interface ModelOption {
  id: string;
  name: string;
  desc: string;
  provider: AiProvider;
}

export const GEMINI_MODELS: ModelOption[] = [
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', desc: 'Chất lượng cao nhất — mặc định', provider: 'gemini' },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', desc: 'Mạnh, ổn định, dự phòng chất lượng cao', provider: 'gemini' },
  { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash Lite', desc: 'Nhanh, tiết kiệm, trích xuất tài liệu tốt', provider: 'gemini' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', desc: 'Dự phòng tương thích', provider: 'gemini' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Dự phòng cuối chuỗi', provider: 'gemini' },
];

export const AGENT_PLATFORM_MODELS: ModelOption[] = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Mặc định Agent Platform — nhanh, ổn định', provider: 'agent-platform' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', desc: 'Nhanh, chi phí tối ưu', provider: 'agent-platform' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', desc: 'Suy luận mạnh, xử lý tài liệu dài', provider: 'agent-platform' },
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview', desc: 'Thế hệ 3.x trên Agent Platform', provider: 'agent-platform' },
];

export const GEMINI_FALLBACK_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
] as const;

export const AGENT_PLATFORM_FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.5-pro',
  'gemini-3.1-pro-preview',
] as const;

export const DEFAULT_GEMINI_MODEL = 'gemini-3.6-flash';
export const DEFAULT_AGENT_PLATFORM_MODEL = 'gemini-2.5-flash';
export const DEFAULT_MODEL = DEFAULT_GEMINI_MODEL;

// Pattern helper supporting both AIzaSy... and AQ... keys
export const GOOGLE_AI_API_KEY_PATTERN = /^(?:AIzaSy|AQ)\S{8,}$/;


export const LESSON_STRUCTURE_PROMPT = `
HEADER: Bảng 2 cột gồm Trường / Tổ / Họ và tên giáo viên / Ngày soạn / Ngày bắt đầu dạy / Thứ tự tiết
TIÊU ĐỀ: "TÊN BÀI DẠY: [Tên bài]"; Chương; Bài; Môn học/Hoạt động giáo dục; Lớp; Thời gian thực hiện

I. MỤC TIÊU
   1. Kiến thức, kĩ năng (3-5 yêu cầu cụ thể, có thể quan sát/đánh giá)
   2. Năng lực
      - Năng lực chung (3 mục: tự chủ/tự học, giao tiếp/hợp tác, giải quyết vấn đề)
      - Năng lực riêng/đặc thù môn học (3-4 biểu hiện gắn trực tiếp với bài)
      - Năng lực số (chỉ chọn nội dung phù hợp và khả thi)
   3. Phẩm chất (2-4 biểu hiện gắn với nhiệm vụ học tập)

II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
   1. Đối với giáo viên (ghi rõ phiếu, dữ liệu, thiết bị, phần mềm thực sự dùng)
   2. Đối với học sinh (ghi rõ SGK, dụng cụ, phần chuẩn bị)

III. TIẾN TRÌNH DẠY HỌC
   1. HOẠT ĐỘNG 1: KHỞI ĐỘNG (MỞ ĐẦU)
      a. Mục tiêu
      b. Nội dung: tình huống và 2-4 câu hỏi cụ thể
      c. Sản phẩm: câu trả lời/đáp án dự kiến cụ thể
      d. Tổ chức thực hiện đủ 4 bước: Chuyển giao; Thực hiện; Báo cáo, thảo luận; Kết luận, nhận định

   2. HOẠT ĐỘNG 2: HÌNH THÀNH KIẾN THỨC MỚI
      Hoạt động 2.1: [Đơn vị kiến thức thứ nhất]
         a. Mục tiêu | b. Nội dung/nhiệm vụ cụ thể | c. Sản phẩm/đáp án | d. Tổ chức thực hiện đủ 4 bước
      Hoạt động 2.2: [Đơn vị kiến thức thứ hai]
         a. Mục tiêu | b. Nội dung/nhiệm vụ cụ thể | c. Sản phẩm/đáp án | d. Tổ chức thực hiện đủ 4 bước
      Hoạt động 2.3: [Đơn vị kiến thức thứ ba hoặc ví dụ củng cố]
         a. Mục tiêu | b. Nội dung/nhiệm vụ cụ thể | c. Sản phẩm/đáp án | d. Tổ chức thực hiện đủ 4 bước

   3. HOẠT ĐỘNG 3: LUYỆN TẬP
      Hoạt động 3.1: Bài tập cơ bản/thông hiểu
         a. Mục tiêu | b. Đề bài đầy đủ | c. Đáp án/lời giải | d. Tổ chức thực hiện đủ 4 bước
      Hoạt động 3.2: Bài tập vận dụng/phân hóa
         a. Mục tiêu | b. Đề bài đầy đủ | c. Đáp án/lời giải | d. Tổ chức thực hiện đủ 4 bước

   4. HOẠT ĐỘNG 4: VẬN DỤNG
      a. Mục tiêu
      b. Nội dung: tình huống thực tiễn có dữ kiện và yêu cầu cụ thể
      c. Sản phẩm: kết quả cần nộp và tiêu chí đánh giá
      d. Tổ chức thực hiện đủ 4 bước

HƯỚNG DẪN VỀ NHÀ (5-7 gạch đầu dòng)
`;
