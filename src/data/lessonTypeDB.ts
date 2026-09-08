/**
 * Dữ liệu loại giáo án — dựa trên database/
 * 3 loại: KHBD 5512 (standard), NCBH (nghiên cứu bài học), STEM
 */

import { StandardStructure } from '../types';

export type LessonType = 'standard' | 'ncbh' | 'stem';

export interface LessonTypeInfo {
  id: LessonType;
  name: string;
  shortName: string;
  desc: string;
  icon: string;
  color: string;
}

export const LESSON_TYPES: LessonTypeInfo[] = [
  {
    id: 'standard',
    name: 'SOẠN KHBD 5512',
    shortName: 'KHBD 5512',
    desc: 'Kế hoạch bài dạy theo Công văn 5512/BGDĐT',
    icon: '📋',
    color: 'teal',
  },
  {
    id: 'ncbh',
    name: 'SOẠN KẾ HOẠCH NCBH',
    shortName: 'NCBH',
    desc: 'Nghiên cứu bài học (Lesson Study) — có biên bản họp & phản tư',
    icon: '🔬',
    color: 'violet',
  },
  {
    id: 'stem',
    name: 'SOẠN KHBD STEM',
    shortName: 'KHBD STEM',
    desc: 'Tích hợp Khoa học - Công nghệ - Kỹ thuật - Toán',
    icon: '⚙️',
    color: 'amber',
  },
];

export interface Standard5512StructureOption {
  id: StandardStructure;
  name: string;
  shortName: string;
  desc: string;
  badge: string;
  sampleFileName: string;
}

export const STANDARD_5512_STRUCTURES: Standard5512StructureOption[] = [
  {
    id: 'structure1',
    name: 'Cấu trúc 1 (4 mục: Mục tiêu - Nội dung - Sản phẩm - Tổ chức thực hiện)',
    shortName: 'Cấu trúc 1',
    desc: 'Theo file MẪU GIÁO ÁN.docx — tách riêng 4 mục: a) Mục tiêu, b) Nội dung, c) Sản phẩm, d) Tổ chức thực hiện 4 bước.',
    badge: 'Mẫu 1 (Truyền thống)',
    sampleFileName: 'MẪU GIÁO ÁN.docx',
  },
  {
    id: 'structure2',
    name: 'Cấu trúc 2 (2 mục: Mục tiêu - Tổ chức thực hiện có sản phẩm)',
    shortName: 'Cấu trúc 2',
    desc: 'Theo file MẪU KHBD CẤU TRÚC 2.docx — chỉ gồm 2 mục: a) Mục tiêu, b) Tổ chức thực hiện (nhiệm vụ & sản phẩm lồng ghép ở Bước 1 & Bước 2).',
    badge: 'Mẫu 2 (Gọn / Lồng ghép)',
    sampleFileName: 'MẪU KHBD CẤU TRÚC 2.docx',
  },
];

/**
 * Cấu trúc chuẩn cho NCBH — dựa trên database/2. TEMPLATE JSON
 */
export const NCBH_STRUCTURE_PROMPT = `
HEADER: Trường / Tổ bộ môn / GV / Bảng (Ngày soạn | Ngày dạy | Tuần | Lớp)
TIÊU ĐỀ: "KẾ HOẠCH NGHIÊN CỨU BÀI HỌC" — centered, bold, size 14pt
Dòng phụ: "[Tên bài học]" — centered, bold

═══════════════════════════════════════════
PHẦN 1: BIÊN BẢN HỌP NHÓM CHUYÊN MÔN (Xây dựng bài học)
═══════════════════════════════════════════
- Thời gian, địa điểm họp
- Thành phần tham gia (chủ trì, ghi biên bản, thành viên)
- Nội dung thảo luận:
  + Phân tích mục tiêu bài học
  + Dự kiến khó khăn của học sinh
  + Thống nhất phương pháp, kĩ thuật dạy học
  + Phân công nhiệm vụ

═══════════════════════════════════════════
PHẦN 2: KẾ HOẠCH BÀI DẠY (Giáo án chi tiết)
═══════════════════════════════════════════

I. MỤC TIÊU
   1. Về kiến thức (3-4 gạch đầu dòng)
   2. Năng lực
      - Năng lực chung (tự chủ/tự học, giao tiếp/hợp tác, giải quyết vấn đề)
      - Năng lực đặc thù môn học (3-4 mục)
   3. Phẩm chất (chăm chỉ, trung thực, trách nhiệm)

II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
   1. Đối với giáo viên
   2. Đối với học sinh

III. TIẾN TRÌNH DẠY HỌC
   A. HOẠT ĐỘNG KHỞI ĐỘNG (5-10 phút)
      a. Mục tiêu | b. Nội dung | c. Sản phẩm | d. Tổ chức thực hiện (4 bước)
      ★ DỰ KIẾN TÌNH HUỐNG HỌC SINH: [Liệt kê 2-3 tình huống có thể xảy ra và cách xử lý]
   B. HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC (15-20 phút)
      a. Mục tiêu | b. Nội dung | c. Sản phẩm | d. Tổ chức thực hiện (4 bước)
      ★ DỰ KIẾN TÌNH HUỐNG HỌC SINH: [...]
   C. HOẠT ĐỘNG LUYỆN TẬP (10-15 phút)
      a. Mục tiêu | b. Nội dung | c. Sản phẩm | d. Tổ chức thực hiện (4 bước)
   D. HOẠT ĐỘNG VẬN DỤNG (5-10 phút)
      a. Mục tiêu | b. Nội dung | c. Sản phẩm | d. Tổ chức thực hiện (4 bước)

HƯỚNG DẪN VỀ NHÀ (5-7 gạch đầu dòng)

═══════════════════════════════════════════
PHẦN 3: PHIẾU QUAN SÁT GIỜ DẠY
═══════════════════════════════════════════
| STT | Hoạt động | Nội dung quan sát | Ghi chép (để trống) |
| 1   | Khởi động | Mức độ tham gia, hứng thú của HS | |
| 2   | Hình thành kiến thức | Cách HS tiếp cận kiến thức mới | |
| 3   | Luyện tập | Khả năng vận dụng, sai lầm thường gặp | |
| 4   | Vận dụng | Sáng tạo, kết nối thực tiễn | |

═══════════════════════════════════════════
PHẦN 4: BIÊN BẢN THẢO LUẬN SAU DẠY (Phản tư)
═══════════════════════════════════════════
- Giáo viên dạy tự đánh giá:
  + Điểm mạnh: (để trống, điền sau khi dạy)
  + Hạn chế:
  + Bài học kinh nghiệm:
- Ý kiến đóng góp của đồng nghiệp:
  + Đ/c [Tên]: (để trống)
  + Đ/c [Tên]: (để trống)
- Hướng điều chỉnh cho lần dạy sau:
  + (để trống)
`;

/**
 * Cấu trúc chuẩn cho STEM — dựa trên database/2. TEMPLATE JSON
 */
export const STEM_STRUCTURE_PROMPT = `
HEADER: Trường / Tổ bộ môn / GV / Bảng (Ngày soạn | Ngày dạy | Tuần | Lớp)
TIÊU ĐỀ: "KẾ HOẠCH BÀI DẠY STEM" — centered, bold, size 14pt
Dòng phụ: "CHỦ ĐỀ: [Tên chủ đề/dự án STEM]" — centered, bold

═══════════════════════════════════════════
PHẦN GIỚI THIỆU DỰ ÁN STEM
═══════════════════════════════════════════
- Tên dự án:
- Vấn đề thực tiễn cần giải quyết:
- Sản phẩm dự kiến:
- Thời lượng: [số] tiết
- Kiến thức liên môn:
  | Lĩnh vực | Kiến thức áp dụng |
  | Khoa học (Science) | ... |
  | Công nghệ (Technology) | ... |
  | Kỹ thuật (Engineering) | ... |
  | Toán học (Mathematics) | ... |

═══════════════════════════════════════════
I. MỤC TIÊU
═══════════════════════════════════════════
   1. Về kiến thức
      - Kiến thức môn chính (3-4 gạch đầu dòng)
      - Kiến thức liên môn (2-3 gạch đầu dòng)
   2. Năng lực
      - Năng lực chung (tự chủ/tự học, giao tiếp/hợp tác, giải quyết vấn đề/sáng tạo)
      - Năng lực STEM: năng lực thiết kế kỹ thuật, tư duy tính toán, nghiên cứu khoa học
   3. Phẩm chất (chăm chỉ, trung thực, trách nhiệm, sáng tạo)

═══════════════════════════════════════════
II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
═══════════════════════════════════════════
   1. Đối với giáo viên (máy tính, máy chiếu, hình ảnh/video minh họa)
   2. Đối với học sinh (nguyên vật liệu chế tạo, dụng cụ đo, SGK)

═══════════════════════════════════════════
III. TIÊU CHÍ ĐÁNH GIÁ SẢN PHẨM
═══════════════════════════════════════════
| STT | Tiêu chí | Mô tả | Điểm tối đa |
| 1 | Độ chính xác khoa học | Sản phẩm thể hiện đúng nguyên lý/kiến thức | 3 |
| 2 | Tính thẩm mỹ | Sản phẩm đẹp, hoàn thiện | 2 |
| 3 | Độ bền/Chất lượng | Sản phẩm chắc chắn, hoạt động được | 2 |
| 4 | Bản vẽ thiết kế | Bản vẽ đầy đủ, có kích thước | 2 |
| 5 | Thuyết minh | Giải thích rõ kiến thức áp dụng | 1 |
| **Tổng** | | | **10** |

═══════════════════════════════════════════
IV. TIẾN TRÌNH DẠY HỌC
═══════════════════════════════════════════

HOẠT ĐỘNG 1: XÁC ĐỊNH VẤN ĐỀ THIẾT KẾ (Tiết 1)
   a. Mục tiêu: HS xác định vấn đề thực tiễn, tiếp nhận nhiệm vụ STEM
   b. Nội dung: GV giới thiệu hình ảnh/video thực tế, đặt vấn đề
   c. Sản phẩm: Bảng phân công nhiệm vụ, kế hoạch thực hiện
   d. Tổ chức thực hiện:
      - Bước 1: GV giới thiệu vấn đề thực tiễn
      - Bước 2: HS thảo luận nhóm, xác định yêu cầu sản phẩm
      - Bước 3: GV hướng dẫn tiêu chí đánh giá sản phẩm
      - Bước 4: Các nhóm phân công nhiệm vụ, lập kế hoạch

HOẠT ĐỘNG 2: NGHIÊN CỨU KIẾN THỨC NỀN (Tiết 1-2)
   a. Mục tiêu: HS nắm kiến thức cần thiết để thiết kế sản phẩm
   b. Nội dung: Nghiên cứu SGK, tài liệu; GV hướng dẫn kiến thức liên môn
   c. Sản phẩm: Phiếu học tập hoàn chỉnh, bảng tóm tắt kiến thức
   d. Tổ chức thực hiện (4 bước chi tiết)

HOẠT ĐỘNG 3: ĐỀ XUẤT VÀ BÁO CÁO PHƯƠNG ÁN THIẾT KẾ (Tiết 2)
   a. Mục tiêu: HS trình bày bản thiết kế, phản biện
   b. Nội dung: Các nhóm báo cáo phương án, GV và HS phản biện
   c. Sản phẩm: Bản thiết kế hoàn chỉnh sau phản biện
   d. Tổ chức thực hiện (4 bước chi tiết)

HOẠT ĐỘNG 4: CHẾ TẠO VÀ THỬ NGHIỆM (Về nhà / Tiết 3)
   a. Mục tiêu: HS chế tạo sản phẩm theo bản thiết kế
   b. Nội dung: Chế tạo, thử nghiệm, điều chỉnh
   c. Sản phẩm: Sản phẩm hoàn chỉnh
   d. Tổ chức thực hiện (4 bước chi tiết)

HOẠT ĐỘNG 5: BÁO CÁO VÀ ĐÁNH GIÁ SẢN PHẨM (Tiết 3)
   a. Mục tiêu: HS thuyết trình, đánh giá sản phẩm theo tiêu chí
   b. Nội dung: Trình bày, phản biện, đánh giá
   c. Sản phẩm: Bài thuyết trình, phiếu đánh giá
   d. Tổ chức thực hiện (4 bước chi tiết)

═══════════════════════════════════════════
V. PHIẾU HỌC TẬP
═══════════════════════════════════════════
(Bảng phiếu học tập với câu hỏi/nhiệm vụ cụ thể cho từng nhóm)

HƯỚNG DẪN VỀ NHÀ (5-7 gạch đầu dòng)
`;

/**
 * Cấu trúc 2 cho KHBD 5512 — dựa trên file MẪU KHBD CẤU TRÚC 2.docx
 * (Chỉ gồm a) Mục tiêu và b) Tổ chức thực hiện; nhiệm vụ và sản phẩm tích hợp ở Bước 1 & Bước 2)
 */
export const STANDARD_STRUCTURE_2_PROMPT = `
HEADER: Bảng 2 cột gồm Trường / Tổ / Họ và tên giáo viên / Ngày soạn / Ngày bắt đầu dạy / Thứ tự tiết
TIÊU ĐỀ: "TÊN BÀI DẠY: [Tên bài]"; Chương; Bài; Môn học/Hoạt động giáo dục; Lớp; Thời gian thực hiện: ([số] tiết)

I. MỤC TIÊU
   1. Kiến thức, kĩ năng (3-5 yêu cầu cụ thể, có thể quan sát/đánh giá)
   2. Năng lực
      - Năng lực chung (3 mục: tự chủ/tự học, giao tiếp/hợp tác, giải quyết vấn đề)
      - Năng lực riêng/đặc thù môn học (3-4 biểu hiện gắn trực tiếp với bài)
      - Năng lực số (chỉ chọn nội dung phù hợp và khả thi)
   3. Phẩm chất (2-4 biểu hiện gắn với nhiệm vụ học tập)

II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
   1. Giáo viên chuẩn bị: (ghi rõ phiếu học tập, thiết bị, phần mềm, học liệu thực sự dùng)
   2. Học sinh chuẩn bị: (ghi rõ SGK, vở ghi, đồ dùng học tập)

III. TIẾN TRÌNH DẠY HỌC
⚠️ ĐẶC ĐIỂM CỐT LÕI CỦA CẤU TRÚC 2 (THEO MẪU KHBD CẤU TRÚC 2):
- Ở MỖI HOẠT ĐỘNG, CHỈ CÓ 2 MỤC CHÍNH: a) Mục tiêu và b) Tổ chức thực hiện.
- TUYỆT ĐỐI KHÔNG TÁCH RIÊNG mục "b) Nội dung" và "c) Sản phẩm".
- Nhiệm vụ học tập ghi rõ ở Bước 1 (Chuyển giao nhiệm vụ).
- Học sinh thực hiện nhiệm vụ và SẢN PHẨM/ĐÁP ÁN/LỜI GIẢI CHI TIẾT được trình bày đầy đủ ngay trong Bước 2 (Thực hiện nhiệm vụ).

   1. HOẠT ĐỘNG 1: KHỞI ĐỘNG (MỞ ĐẦU)
      a) Mục tiêu: nêu rõ mục tiêu của hoạt động
      b) Tổ chức thực hiện:
         - Bước 1: Chuyển giao nhiệm vụ: giáo viên giao nhiệm vụ gì cho học sinh (câu hỏi, tình huống mở đầu, hình ảnh hoặc trò chơi khởi động cụ thể)
         - Bước 2: Thực hiện nhiệm vụ: học sinh thực hiện các nhiệm vụ gì, sản phẩm là gì (ghi rõ câu trả lời, sản phẩm học tập dự kiến của học sinh)
         - Bước 3: Báo cáo, thảo luận: học sinh hoạt động và báo cáo, thảo luận quá trình làm việc (cách thức chia sẻ, nhận xét câu trả lời)
         - Bước 4: Kết luận, nhận định: giáo viên kết luận lại và nhận định toàn bộ các hoạt động, dẫn dắt vào bài mới

   2. HOẠT ĐỘNG 2: HÌNH THÀNH KIẾN THỨC MỚI
      Hoạt động 2.1: [Tên đơn vị kiến thức thứ nhất]
         a) Mục tiêu: mục tiêu cần đạt của đơn vị kiến thức này
         b) Tổ chức thực hiện:
            - Bước 1: Chuyển giao nhiệm vụ: giáo viên giao nhiệm vụ gì cho học sinh (phiếu học tập, đọc SGK, quan sát, thảo luận câu hỏi cụ thể)
            - Bước 2: Thực hiện nhiệm vụ: học sinh thực hiện các nhiệm vụ gì, sản phẩm là gì (học sinh làm việc cá nhân/nhóm; ghi ĐẦY ĐỦ câu trả lời, kết quả giải, nội dung kiến thức cốt lõi/sản phẩm dự kiến)
            - Bước 3: Báo cáo, thảo luận: học sinh hoạt động và báo cáo, thảo luận quá trình làm việc (trình bày, nhận xét, bổ sung)
            - Bước 4: Kết luận, nhận định: giáo viên kết luận lại và nhận định toàn bộ các hoạt động, chuẩn hóa kiến thức
      Hoạt động 2.2: [Tên đơn vị kiến thức thứ hai]
         a) Mục tiêu: mục tiêu cần đạt của đơn vị kiến thức này
         b) Tổ chức thực hiện:
            - Bước 1: Chuyển giao nhiệm vụ: ...
            - Bước 2: Thực hiện nhiệm vụ: (nêu rõ nhiệm vụ và sản phẩm/đáp án cụ thể)
            - Bước 3: Báo cáo, thảo luận: ...
            - Bước 4: Kết luận, nhận định: ...
      Hoạt động 2.3: [Tên đơn vị kiến thức thứ ba - nếu có]
         a) Mục tiêu: ...
         b) Tổ chức thực hiện: (đầy đủ 4 bước: Bước 1, Bước 2 kèm sản phẩm, Bước 3, Bước 4)

   3. HOẠT ĐỘNG 3: LUYỆN TẬP
      Hoạt động 3.1: [Bài tập cơ bản/thông hiểu]
         a) Mục tiêu: củng cố kiến thức vừa học
         b) Tổ chức thực hiện:
            - Bước 1: Chuyển giao nhiệm vụ: GV giao bài tập, câu hỏi luyện tập cụ thể có đề bài rõ ràng
            - Bước 2: Thực hiện nhiệm vụ: học sinh làm bài cá nhân/nhóm, sản phẩm là lời giải và đáp án chi tiết
            - Bước 3: Báo cáo, thảo luận: học sinh báo cáo kết quả, nhận xét chéo
            - Bước 4: Kết luận, nhận định: GV nhận xét, chữa lỗi sai, chốt phương pháp giải
      Hoạt động 3.2: [Bài tập vận dụng/phân hóa]
         a) Mục tiêu: ...
         b) Tổ chức thực hiện: (đầy đủ 4 bước: Bước 1, Bước 2 kèm lời giải chi tiết, Bước 3, Bước 4)

   4. HOẠT ĐỘNG 4: VẬN DỤNG
      a) Mục tiêu: vận dụng kiến thức giải quyết vấn đề thực tiễn
      b) Tổ chức thực hiện:
         - Bước 1: Chuyển giao nhiệm vụ: GV nêu tình huống thực tế, nhiệm vụ dự án hoặc câu hỏi liên hệ thực tế
         - Bước 2: Thực hiện nhiệm vụ: học sinh suy nghĩ, giải quyết; sản phẩm là bài thu hoạch, giải pháp, câu trả lời cụ thể
         - Bước 3: Báo cáo, thảo luận: phương thức báo cáo (trực tiếp hoặc nộp bài)
         - Bước 4: Kết luận, nhận định: GV nhận xét, đánh giá, động viên

HƯỚNG DẪN VỀ NHÀ (5-7 gạch đầu dòng)
`;

/**
 * Lấy prompt cấu trúc phù hợp theo loại giáo án và cấu trúc 5512
 */
export function getStructurePromptForType(type: LessonType, standardStructure: StandardStructure = 'structure1'): string {
  switch (type) {
    case 'ncbh':
      return NCBH_STRUCTURE_PROMPT;
    case 'stem':
      return STEM_STRUCTURE_PROMPT;
    case 'standard':
      return standardStructure === 'structure2' ? STANDARD_STRUCTURE_2_PROMPT : '';
    default:
      return '';
  }
}

/**
 * Lấy hướng dẫn bổ sung theo loại giáo án và cấu trúc 5512
 */
export function getTypeSpecificInstructions(type: LessonType, standardStructure: StandardStructure = 'structure1'): string {
  switch (type) {
    case 'ncbh':
      return `
⚠️ LOẠI GIÁO ÁN: NGHIÊN CỨU BÀI HỌC (NCBH / Lesson Study)
Giáo án này PHẢI có ĐẦY ĐỦ 4 phần:
1. BIÊN BẢN HỌP NHÓM CHUYÊN MÔN — nội dung thảo luận, phân công, thống nhất phương pháp
2. KẾ HOẠCH BÀI DẠY CHI TIẾT — giống KHBD 5512 nhưng thêm DỰ KIẾN TÌNH HUỐNG HỌC SINH ở mỗi hoạt động
3. PHIẾU QUAN SÁT GIỜ DẠY — bảng để đồng nghiệp quan sát, ghi chép
4. BIÊN BẢN THẢO LUẬN SAU DẠY — phần tự đánh giá và ý kiến đồng nghiệp (để trống cho GV điền)

★ KHÁC BIỆT CHÍNH SO VỚI KHBD 5512:
- Mỗi hoạt động phải có phần "Dự kiến tình huống học sinh" (2-3 tình huống + cách xử lý)
- Có phần biên bản họp trước khi dạy
- Có phần phản tư sau khi dạy
`;
    case 'stem':
      return `
⚠️ LOẠI GIÁO ÁN: KHBD STEM (Tích hợp Khoa học-Công nghệ-Kỹ thuật-Toán)
Giáo án này PHẢI có ĐẦY ĐỦ các phần:
1. GIỚI THIỆU DỰ ÁN STEM — vấn đề thực tiễn, sản phẩm dự kiến, kiến thức liên môn (bảng S-T-E-M)
2. MỤC TIÊU — kiến thức chính + liên môn, năng lực STEM (thiết kế kỹ thuật, tư duy tính toán)
3. TIÊU CHÍ ĐÁNH GIÁ SẢN PHẨM — bảng 5 tiêu chí/10 điểm
4. TIẾN TRÌNH — 5 hoạt động theo quy trình STEM:
   HĐ1: Xác định vấn đề thiết kế
   HĐ2: Nghiên cứu kiến thức nền
   HĐ3: Đề xuất và báo cáo phương án thiết kế
   HĐ4: Chế tạo và thử nghiệm
   HĐ5: Báo cáo và đánh giá sản phẩm
5. PHIẾU HỌC TẬP — câu hỏi/nhiệm vụ cụ thể liên quan đến kiến thức nền

★ KHÁC BIỆT CHÍNH SO VỚI KHBD 5512:
- PHẢI có vấn đề thực tiễn và sản phẩm cụ thể (không phải bài tập lý thuyết đơn thuần)
- Kiến thức liên môn (bảng S-T-E-M) là BẮT BUỘC
- 5 hoạt động theo quy trình kỹ thuật, KHÔNG phải 4 hoạt động chuẩn
- Có bảng tiêu chí đánh giá sản phẩm
- Thời lượng thường 2-3 tiết
`;
    case 'standard':
      if (standardStructure === 'structure2') {
        return `
⚠️ CẤU TRÚC ÁP DỤNG: CẤU TRÚC 2 (THEO FILE MẪU KHBD CẤU TRÚC 2)
Quy cách bắt buộc cho mỗi hoạt động (Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng):
1. CHỈ CÓ 2 MỤC LỚN:
   a) Mục tiêu: ...
   b) Tổ chức thực hiện:
      - Bước 1: Chuyển giao nhiệm vụ: giáo viên giao nhiệm vụ cụ thể cho học sinh
      - Bước 2: Thực hiện nhiệm vụ: học sinh thực hiện nhiệm vụ gì, sản phẩm là gì (ghi ĐẦY ĐỦ câu trả lời, sản phẩm học tập dự kiến, lời giải chi tiết của học sinh tại đây)
      - Bước 3: Báo cáo, thảo luận: học sinh hoạt động và báo cáo, thảo luận quá trình làm việc
      - Bước 4: Kết luận, nhận định: giáo viên kết luận lại và nhận định toàn bộ các hoạt động, chuẩn hóa kiến thức
2. TUYỆT ĐỐI KHÔNG tách riêng mục b) Nội dung và c) Sản phẩm. Không dùng tiêu đề "b. Nội dung" hay "c. Sản phẩm". Toàn bộ nội dung học sinh làm và sản phẩm học tập đạt được đều nằm trong Bước 2 của mục "b) Tổ chức thực hiện".
`;
      }
      return `
⚠️ CẤU TRÚC ÁP DỤNG: CẤU TRÚC 1 (THEO FILE MẪU GIÁO ÁN 5512 TRUYỀN THỐNG)
Mỗi hoạt động BẮT BUỘC có đủ 4 mục riêng biệt:
a) Mục tiêu
b) Nội dung
c) Sản phẩm
d) Tổ chức thực hiện (Bước 1: Chuyển giao nhiệm vụ; Bước 2: Thực hiện nhiệm vụ; Bước 3: Báo cáo, thảo luận; Bước 4: Kết luận, nhận định)
`;
    default:
      return '';
  }
}
