/**
 * Cơ sở dữ liệu Năng lực Trí tuệ Nhân tạo (AI) theo QĐ 2422/QĐ-BGDĐT
 * Nguồn: Quyết định 2422/QĐ-BGDĐT của Bộ GDĐT
 * + Khung năng lực AI UNESCO dành cho học sinh
 * 
 * Dữ liệu được chuyển từ khbdnlstht-main/constants.ts
 */

// ============================================
// TYPES
// ============================================

export interface AIContentEntry {
  capHoc: string;       // Tiểu học | THCS | THPT
  lop: number;          // 1-12
  machNoiDung: string;  // A | B | C | D
  ma: string;           // A1, B2, C3, D1..
  chuDe: string;
  noiDungChinh: string;
  monTichHop: string;
}

export interface AICompetenceByLevel {
  capHoc: string;
  thanhPhan: string;    // NLa, NLb, NLc, NLd
  bieuHien: string;
}

export interface AITopicStructure {
  machNoiDung: string;
  ma: string;
  chuDe: string;
  moTa: string;
}

// ============================================
// Sheet 1: Nội dung khái quát theo lớp (toàn bộ 113 dòng từ QĐ2422)
// ============================================

export const AI_QD3439_CONTENT: AIContentEntry[] = [
  // === LỚP 1 ===
  { capHoc:"Tiểu học", lop:1, machNoiDung:"A", ma:"A1", chuDe:"Tính chủ động của con người", noiDungChinh:"Con người có cảm xúc, AI thì không; AI thể hiện cảm xúc do con người lập trình; Ý nghĩa cảm xúc mà AI thể hiện; Nhận diện AI trong cuộc sống", monTichHop:"Tin học, TNXH, Đạo đức" },
  { capHoc:"Tiểu học", lop:1, machNoiDung:"B", ma:"B1", chuDe:"Các khía cạnh đạo đức của AI", noiDungChinh:"Việc làm tốt và việc làm xấu khi sử dụng AI", monTichHop:"Đạo đức, HĐTN" },
  { capHoc:"Tiểu học", lop:1, machNoiDung:"B", ma:"B3", chuDe:"Nguyên tắc đạo đức và trách nhiệm xã hội", noiDungChinh:"Máy thông minh làm việc tốt; không dùng AI mục đích xấu", monTichHop:"Đạo đức, HĐTN" },
  { capHoc:"Tiểu học", lop:1, machNoiDung:"C", ma:"C1", chuDe:"Đặc điểm chính của AI", noiDungChinh:"Nhận biết AI và ứng dụng AI; Chức năng và công cụ AI", monTichHop:"Tin học, TNXH" },
  { capHoc:"Tiểu học", lop:1, machNoiDung:"D", ma:"D1", chuDe:"Nhận diện & hình thành giải pháp", noiDungChinh:"Máy thông minh học từ ví dụ", monTichHop:"Tin học" },
  { capHoc:"Tiểu học", lop:1, machNoiDung:"D", ma:"D2", chuDe:"Cấu trúc & tương tác, cải tiến hệ thống", noiDungChinh:"Nhiều loại máy thông minh", monTichHop:"Tin học" },
  // === LỚP 2 ===
  { capHoc:"Tiểu học", lop:2, machNoiDung:"A", ma:"A1", chuDe:"Tính chủ động của con người", noiDungChinh:"Khi nào nên và không nên dùng AI; AI làm việc, con người kiểm soát", monTichHop:"Tin học, TNXH, Đạo đức" },
  { capHoc:"Tiểu học", lop:2, machNoiDung:"A", ma:"A2", chuDe:"AI vì sự tiến bộ của con người", noiDungChinh:"AI trong gia đình; AI hỗ trợ mọi người; Con người dạy AI qua tương tác", monTichHop:"Tin học, TNXH" },
  { capHoc:"Tiểu học", lop:2, machNoiDung:"A", ma:"A3", chuDe:"Công dân trong kỉ nguyên AI", noiDungChinh:"Con người dạy AI qua tương tác", monTichHop:"TNXH, Đạo đức" },
  { capHoc:"Tiểu học", lop:2, machNoiDung:"B", ma:"B1", chuDe:"Các khía cạnh đạo đức của AI", noiDungChinh:"Sự đối xử không công bằng", monTichHop:"Đạo đức, HĐTN" },
  { capHoc:"Tiểu học", lop:2, machNoiDung:"B", ma:"B3", chuDe:"Nguyên tắc đạo đức và trách nhiệm xã hội", noiDungChinh:"Của bạn và của tớ (quyền sở hữu sản phẩm AI)", monTichHop:"Đạo đức, HĐTN" },
  { capHoc:"Tiểu học", lop:2, machNoiDung:"C", ma:"C1", chuDe:"Đặc điểm chính của AI", noiDungChinh:"Cách AI học và học liệu của AI", monTichHop:"Tin học" },
  { capHoc:"Tiểu học", lop:2, machNoiDung:"C", ma:"C3", chuDe:"Công nghệ AI", noiDungChinh:"Sơ lược cách AI phân loại đồ vật", monTichHop:"Tin học" },
  { capHoc:"Tiểu học", lop:2, machNoiDung:"D", ma:"D1", chuDe:"Nhận diện & hình thành giải pháp", noiDungChinh:"Máy thông minh giúp giải quyết vấn đề quanh em; Ý tưởng máy thông minh; Vai trò của dữ liệu", monTichHop:"Tin học" },
  // === LỚP 3 ===
  { capHoc:"Tiểu học", lop:3, machNoiDung:"A", ma:"A1", chuDe:"Tính chủ động của con người", noiDungChinh:"Cách sử dụng AI trong học tập; Không phụ thuộc hoàn toàn vào AI; Suy nghĩ kỹ trước khi dùng AI", monTichHop:"Tin học, TNXH, Đạo đức" },
  { capHoc:"Tiểu học", lop:3, machNoiDung:"A", ma:"A2", chuDe:"AI vì sự tiến bộ của con người", noiDungChinh:"AI trong trường học; AI hỗ trợ mọi người", monTichHop:"Tin học, TNXH" },
  { capHoc:"Tiểu học", lop:3, machNoiDung:"A", ma:"A3", chuDe:"Công dân trong kỉ nguyên AI", noiDungChinh:"Kiểm tra và phản biện kết quả của AI", monTichHop:"TNXH, Đạo đức" },
  { capHoc:"Tiểu học", lop:3, machNoiDung:"B", ma:"B2", chuDe:"Sử dụng AI an toàn và có trách nhiệm", noiDungChinh:"Phân biệt thật và giả (sản phẩm AI)", monTichHop:"Đạo đức, HĐTN" },
  { capHoc:"Tiểu học", lop:3, machNoiDung:"B", ma:"B3", chuDe:"Nguyên tắc đạo đức và trách nhiệm xã hội", noiDungChinh:"Cùng máy thông minh làm việc tốt", monTichHop:"Đạo đức, HĐTN" },
  { capHoc:"Tiểu học", lop:3, machNoiDung:"C", ma:"C4", chuDe:"Dữ liệu trong AI", noiDungChinh:"Dữ liệu học máy: khái niệm, đặc trưng, thuộc tính", monTichHop:"Tin học" },
  { capHoc:"Tiểu học", lop:3, machNoiDung:"C", ma:"C5", chuDe:"Kĩ thuật và thuật toán AI", noiDungChinh:"Kĩ thuật AI dựa trên luật; Kĩ thuật học máy", monTichHop:"Tin học" },
  { capHoc:"Tiểu học", lop:3, machNoiDung:"D", ma:"D1", chuDe:"Nhận diện & hình thành giải pháp", noiDungChinh:"Quá trình huấn luyện máy thông minh", monTichHop:"Tin học" },
  { capHoc:"Tiểu học", lop:3, machNoiDung:"D", ma:"D2", chuDe:"Cấu trúc & tương tác, cải tiến hệ thống", noiDungChinh:"Dữ liệu tốt cho máy thông minh; Máy thông minh có thể học sai", monTichHop:"Tin học" },
  // === LỚP 4 ===
  { capHoc:"Tiểu học", lop:4, machNoiDung:"A", ma:"A1", chuDe:"Tính chủ động của con người", noiDungChinh:"AI trong công việc hằng ngày; AI hỗ trợ, con người suy nghĩ", monTichHop:"Tin học, TNXH, Đạo đức" },
  { capHoc:"Tiểu học", lop:4, machNoiDung:"A", ma:"A2", chuDe:"AI vì sự tiến bộ của con người", noiDungChinh:"AI vì cuộc sống tốt đẹp hơn; AI trong xã hội", monTichHop:"Tin học, TNXH" },
  { capHoc:"Tiểu học", lop:4, machNoiDung:"A", ma:"A3", chuDe:"Công dân trong kỉ nguyên AI", noiDungChinh:"Con người quyết định khi dùng AI", monTichHop:"TNXH, Đạo đức" },
  { capHoc:"Tiểu học", lop:4, machNoiDung:"B", ma:"B2", chuDe:"Sử dụng AI an toàn và có trách nhiệm", noiDungChinh:"Bảo vệ thông tin cá nhân", monTichHop:"Đạo đức, HĐTN, Tin học" },
  { capHoc:"Tiểu học", lop:4, machNoiDung:"C", ma:"C2", chuDe:"Ứng dụng AI trong học tập và cuộc sống", noiDungChinh:"Một số ứng dụng AI quen thuộc trong bối cảnh Việt Nam", monTichHop:"Tin học" },
  { capHoc:"Tiểu học", lop:4, machNoiDung:"C", ma:"C5", chuDe:"Kĩ thuật và thuật toán AI", noiDungChinh:"Làm quen với một số công cụ trải nghiệm kĩ thuật học máy", monTichHop:"Tin học" },
  { capHoc:"Tiểu học", lop:4, machNoiDung:"D", ma:"D1", chuDe:"Nhận diện & hình thành giải pháp", noiDungChinh:"Từ vấn đề đến ý tưởng AI", monTichHop:"Tin học" },
  { capHoc:"Tiểu học", lop:4, machNoiDung:"D", ma:"D2", chuDe:"Cấu trúc & tương tác, cải tiến hệ thống", noiDungChinh:"Liên tục cải tiến AI", monTichHop:"Tin học" },
  // === LỚP 5 ===
  { capHoc:"Tiểu học", lop:5, machNoiDung:"A", ma:"A1", chuDe:"Tính chủ động của con người", noiDungChinh:"Con người chịu trách nhiệm; AI không thay thế con người; AI phục vụ lợi ích chung; Con người trong kỉ nguyên AI", monTichHop:"Tin học, TNXH, Đạo đức" },
  { capHoc:"Tiểu học", lop:5, machNoiDung:"A", ma:"A2", chuDe:"AI vì sự tiến bộ của con người", noiDungChinh:"AI không thay thế con người; AI phục vụ lợi ích chung", monTichHop:"Tin học, TNXH" },
  { capHoc:"Tiểu học", lop:5, machNoiDung:"A", ma:"A3", chuDe:"Công dân trong kỉ nguyên AI", noiDungChinh:"Con người trong kỉ nguyên AI", monTichHop:"TNXH, Đạo đức" },
  { capHoc:"Tiểu học", lop:5, machNoiDung:"B", ma:"B1", chuDe:"Các khía cạnh đạo đức của AI", noiDungChinh:"Hệ thống AI công bằng; Giúp AI công bằng; Cần hiểu cách AI suy nghĩ", monTichHop:"Đạo đức, HĐTN" },
  { capHoc:"Tiểu học", lop:5, machNoiDung:"B", ma:"B2", chuDe:"Sử dụng AI an toàn và có trách nhiệm", noiDungChinh:"Giúp AI công bằng", monTichHop:"Đạo đức, HĐTN" },
  { capHoc:"Tiểu học", lop:5, machNoiDung:"C", ma:"C5", chuDe:"Kĩ thuật và thuật toán AI", noiDungChinh:"Thuật toán AI dựa trên luật; Làm quen với một số ứng dụng học máy trực quan", monTichHop:"Tin học" },
  { capHoc:"Tiểu học", lop:5, machNoiDung:"D", ma:"D1", chuDe:"Nhận diện & hình thành giải pháp", noiDungChinh:"Quy trình huấn luyện AI", monTichHop:"Tin học" },
  { capHoc:"Tiểu học", lop:5, machNoiDung:"D", ma:"D2", chuDe:"Cấu trúc & tương tác, cải tiến hệ thống", noiDungChinh:"Cải tiến hệ thống AI bằng dữ liệu", monTichHop:"Tin học" },
  // === LỚP 6 ===
  { capHoc:"THCS", lop:6, machNoiDung:"A", ma:"A1", chuDe:"Tính chủ động của con người", noiDungChinh:"Con người tạo và điều khiển AI; AI hoạt động theo lập trình; Con người ra quyết định với AI", monTichHop:"Tin học" },
  { capHoc:"THCS", lop:6, machNoiDung:"A", ma:"A2", chuDe:"AI vì sự tiến bộ của con người", noiDungChinh:"Học hỏi và phát triển với AI; Quyền sở hữu và quyền riêng tư; Bảo vệ cá nhân trong thời đại AI", monTichHop:"Tin học, GDCD" },
  { capHoc:"THCS", lop:6, machNoiDung:"A", ma:"A3", chuDe:"Công dân trong kỉ nguyên AI", noiDungChinh:"Con người ra quyết định với AI; Học hỏi và phát triển với AI; Bảo vệ cá nhân trong thời đại AI", monTichHop:"Tin học, GDCD" },
  { capHoc:"THCS", lop:6, machNoiDung:"B", ma:"B1", chuDe:"Các khía cạnh đạo đức của AI", noiDungChinh:"Mặt tốt và mặt xấu; An toàn khi sử dụng AI", monTichHop:"Tin học, GDCD" },
  { capHoc:"THCS", lop:6, machNoiDung:"B", ma:"B2", chuDe:"Sử dụng AI an toàn và có trách nhiệm", noiDungChinh:"An toàn khi sử dụng AI", monTichHop:"Tin học, GDCD" },
  { capHoc:"THCS", lop:6, machNoiDung:"C", ma:"C1", chuDe:"Đặc điểm chính của AI", noiDungChinh:"Các thành phần cơ bản trong kiến trúc AI; Tác động tích cực và tiêu cực của AI", monTichHop:"Tin học" },
  { capHoc:"THCS", lop:6, machNoiDung:"C", ma:"C2", chuDe:"Ứng dụng AI trong học tập và cuộc sống", noiDungChinh:"Làm quen với ứng dụng AI gần gũi bối cảnh Việt Nam", monTichHop:"Tin học" },
  { capHoc:"THCS", lop:6, machNoiDung:"C", ma:"C3", chuDe:"Công nghệ AI", noiDungChinh:"Một số công nghệ AI quen thuộc và đơn giản", monTichHop:"Tin học" },
  { capHoc:"THCS", lop:6, machNoiDung:"D", ma:"D1", chuDe:"Nhận diện & hình thành giải pháp", noiDungChinh:"Nên hay không nên sử dụng AI?", monTichHop:"Tin học" },
  { capHoc:"THCS", lop:6, machNoiDung:"D", ma:"D2", chuDe:"Cấu trúc & tương tác, cải tiến hệ thống", noiDungChinh:"Khi nào không nên dùng AI?", monTichHop:"Tin học" },
  // === LỚP 7 ===
  { capHoc:"THCS", lop:7, machNoiDung:"A", ma:"A1", chuDe:"Tính chủ động của con người", noiDungChinh:"Quyền ra quyết định; Xác thực kết quả", monTichHop:"Tin học" },
  { capHoc:"THCS", lop:7, machNoiDung:"A", ma:"A2", chuDe:"AI vì sự tiến bộ của con người", noiDungChinh:"Hậu quả khi AI quyết định; Ngăn chặn công cụ AI có hại", monTichHop:"Tin học, GDCD" },
  { capHoc:"THCS", lop:7, machNoiDung:"A", ma:"A3", chuDe:"Công dân trong kỉ nguyên AI", noiDungChinh:"Quyền tự chủ của AI và con người; Bảo vệ quyền tự chủ của con người", monTichHop:"Tin học, GDCD" },
  { capHoc:"THCS", lop:7, machNoiDung:"B", ma:"B2", chuDe:"Sử dụng AI an toàn và có trách nhiệm", noiDungChinh:"Đánh giá và hành động vì một AI tốt đẹp hơn", monTichHop:"Tin học, GDCD" },
  { capHoc:"THCS", lop:7, machNoiDung:"B", ma:"B3", chuDe:"Nguyên tắc đạo đức và trách nhiệm xã hội", noiDungChinh:"Trách nhiệm khi sử dụng AI", monTichHop:"Tin học, GDCD" },
  { capHoc:"THCS", lop:7, machNoiDung:"C", ma:"C4", chuDe:"Dữ liệu trong AI", noiDungChinh:"Các khía cạnh đạo đức liên quan đến dữ liệu huấn luyện AI", monTichHop:"Tin học" },
  { capHoc:"THCS", lop:7, machNoiDung:"C", ma:"C5", chuDe:"Kĩ thuật và thuật toán AI", noiDungChinh:"Tìm hiểu một số cách học của AI", monTichHop:"Tin học" },
  { capHoc:"THCS", lop:7, machNoiDung:"D", ma:"D1", chuDe:"Nhận diện & hình thành giải pháp", noiDungChinh:"Ý tưởng dự án AI từ thực tiễn; Dự án tạo sản phẩm từ AI", monTichHop:"Tin học" },
  { capHoc:"THCS", lop:7, machNoiDung:"D", ma:"D2", chuDe:"Cấu trúc & tương tác, cải tiến hệ thống", noiDungChinh:"Dự án tạo sản phẩm từ AI", monTichHop:"Tin học" },
  // === LỚP 8 ===
  { capHoc:"THCS", lop:8, machNoiDung:"A", ma:"A1", chuDe:"Tính chủ động của con người", noiDungChinh:"AI không thay thế con người; Rủi ro khi lạm dụng AI", monTichHop:"Tin học" },
  { capHoc:"THCS", lop:8, machNoiDung:"A", ma:"A2", chuDe:"AI vì sự tiến bộ của con người", noiDungChinh:"Nguy cơ bị AI kiểm soát", monTichHop:"Tin học, GDCD" },
  { capHoc:"THCS", lop:8, machNoiDung:"A", ma:"A3", chuDe:"Công dân trong kỉ nguyên AI", noiDungChinh:"Người dùng và người tạo AI; Trách nhiệm pháp lý; Trách nhiệm giải trình", monTichHop:"Tin học, GDCD" },
  { capHoc:"THCS", lop:8, machNoiDung:"B", ma:"B1", chuDe:"Các khía cạnh đạo đức của AI", noiDungChinh:"Rủi ro với AI: nhận dạng cảm xúc, quyền riêng tư, kết luận sai", monTichHop:"Tin học, GDCD" },
  { capHoc:"THCS", lop:8, machNoiDung:"B", ma:"B2", chuDe:"Sử dụng AI an toàn và có trách nhiệm", noiDungChinh:"Phòng tránh rủi ro dữ liệu; Bản quyền trong dự án AI", monTichHop:"Tin học, GDCD" },
  { capHoc:"THCS", lop:8, machNoiDung:"B", ma:"B3", chuDe:"Nguyên tắc đạo đức và trách nhiệm xã hội", noiDungChinh:"Trách nhiệm phát triển AI: bảo mật, không cung cấp thông tin sai lệch", monTichHop:"Tin học, GDCD" },
  { capHoc:"THCS", lop:8, machNoiDung:"C", ma:"C1", chuDe:"Đặc điểm chính của AI", noiDungChinh:"Cách AI thực hiện một số chức năng cơ bản: đọc, nghe, nhìn", monTichHop:"Tin học" },
  { capHoc:"THCS", lop:8, machNoiDung:"C", ma:"C5", chuDe:"Kĩ thuật và thuật toán AI", noiDungChinh:"Cách AI nhận diện cảm xúc: nét mặt, từ khóa, ngữ điệu, cử chỉ", monTichHop:"Tin học" },
  { capHoc:"THCS", lop:8, machNoiDung:"D", ma:"D1", chuDe:"Nhận diện & hình thành giải pháp", noiDungChinh:"Kế hoạch dự án AI; Dự án AI đơn giản của em", monTichHop:"Tin học" },
  { capHoc:"THCS", lop:8, machNoiDung:"D", ma:"D2", chuDe:"Cấu trúc & tương tác, cải tiến hệ thống", noiDungChinh:"Dự án AI đơn giản: chatbot, mô hình nhận dạng; Trải nghiệm UX", monTichHop:"Tin học" },
  // === LỚP 9 ===
  { capHoc:"THCS", lop:9, machNoiDung:"A", ma:"A1", chuDe:"Tính chủ động của con người", noiDungChinh:"Thách thức xã hội trong kỉ nguyên AI", monTichHop:"Tin học" },
  { capHoc:"THCS", lop:9, machNoiDung:"A", ma:"A2", chuDe:"AI vì sự tiến bộ của con người", noiDungChinh:"AI tác động đến xã hội; Thiên vị và thành kiến trong AI", monTichHop:"Tin học, GDCD" },
  { capHoc:"THCS", lop:9, machNoiDung:"A", ma:"A3", chuDe:"Công dân trong kỉ nguyên AI", noiDungChinh:"Định hướng học tập trong kỉ nguyên AI; AI giúp thể hiện bản thân; Nghề nghiệp tương lai", monTichHop:"Tin học, GDCD, HĐTN-HN" },
  { capHoc:"THCS", lop:9, machNoiDung:"B", ma:"B1", chuDe:"Các khía cạnh đạo đức của AI", noiDungChinh:"Trách nhiệm khi sử dụng AI", monTichHop:"Tin học, GDCD" },
  { capHoc:"THCS", lop:9, machNoiDung:"B", ma:"B2", chuDe:"Sử dụng AI an toàn và có trách nhiệm", noiDungChinh:"Trách nhiệm khi sử dụng AI; Vai trò cá nhân và cộng đồng", monTichHop:"Tin học, GDCD" },
  { capHoc:"THCS", lop:9, machNoiDung:"B", ma:"B3", chuDe:"Nguyên tắc đạo đức và trách nhiệm xã hội", noiDungChinh:"Kiến tạo AI công bằng; Thu thập dữ liệu công bằng, tôn trọng đa dạng", monTichHop:"Tin học, GDCD" },
  { capHoc:"THCS", lop:9, machNoiDung:"C", ma:"C2", chuDe:"Ứng dụng AI trong học tập và cuộc sống", noiDungChinh:"Thực hành vận dụng AI giải quyết vấn đề, tạo ra sản phẩm đơn giản", monTichHop:"Tin học" },
  { capHoc:"THCS", lop:9, machNoiDung:"C", ma:"C3", chuDe:"Công nghệ AI", noiDungChinh:"Cách cải thiện dữ liệu, nâng cao chất lượng sản phẩm AI", monTichHop:"Tin học" },
  { capHoc:"THCS", lop:9, machNoiDung:"D", ma:"D1", chuDe:"Nhận diện & hình thành giải pháp", noiDungChinh:"Con người dẫn dắt AI", monTichHop:"Tin học" },
  { capHoc:"THCS", lop:9, machNoiDung:"D", ma:"D2", chuDe:"Cấu trúc & tương tác, cải tiến hệ thống", noiDungChinh:"Đánh giá và cải tiến sản phẩm AI", monTichHop:"Tin học" },
  // === LỚP 10 ===
  { capHoc:"THPT", lop:10, machNoiDung:"A", ma:"A1", chuDe:"Tính chủ động của con người", noiDungChinh:"Con người trong hệ thống AI; Con người cần kiểm soát AI; Rủi ro của AI với đời sống; Luật pháp với AI", monTichHop:"Tin học" },
  { capHoc:"THPT", lop:10, machNoiDung:"A", ma:"A2", chuDe:"AI vì sự tiến bộ của con người", noiDungChinh:"Rủi ro đối với con người và xã hội của dự án AI; Rủi ro của AI với đời sống", monTichHop:"Tin học, GDCD" },
  { capHoc:"THPT", lop:10, machNoiDung:"A", ma:"A3", chuDe:"Công dân trong kỉ nguyên AI", noiDungChinh:"Luật pháp với AI", monTichHop:"Tin học, GDCD" },
  { capHoc:"THPT", lop:10, machNoiDung:"B", ma:"B2", chuDe:"Sử dụng AI an toàn và có trách nhiệm", noiDungChinh:"Tuân thủ quy định và pháp luật khi sử dụng AI", monTichHop:"Tin học, GDCD" },
  { capHoc:"THPT", lop:10, machNoiDung:"B", ma:"B3", chuDe:"Nguyên tắc đạo đức và trách nhiệm xã hội", noiDungChinh:"Đạo đức trong vận hành và sáng tạo AI", monTichHop:"Tin học, GDCD" },
  { capHoc:"THPT", lop:10, machNoiDung:"C", ma:"C2", chuDe:"Ứng dụng AI trong học tập và cuộc sống", noiDungChinh:"Liên hệ các ứng dụng AI và vấn đề trong thực tế; Cách đặt prompt; Các dạng dữ liệu huấn luyện", monTichHop:"Tin học" },
  { capHoc:"THPT", lop:10, machNoiDung:"C", ma:"C3", chuDe:"Công nghệ AI", noiDungChinh:"Cách đặt prompt phù hợp với mục tiêu cụ thể; Một số công nghệ trong AI", monTichHop:"Tin học" },
  { capHoc:"THPT", lop:10, machNoiDung:"C", ma:"C4", chuDe:"Dữ liệu trong AI", noiDungChinh:"Các dạng dữ liệu huấn luyện và ảnh hưởng đến chất lượng AI", monTichHop:"Tin học" },
  { capHoc:"THPT", lop:10, machNoiDung:"D", ma:"D1", chuDe:"Nhận diện & hình thành giải pháp", noiDungChinh:"Ý tưởng hệ thống AI; Hệ thống AI", monTichHop:"Tin học" },
  { capHoc:"THPT", lop:10, machNoiDung:"D", ma:"D2", chuDe:"Cấu trúc & tương tác, cải tiến hệ thống", noiDungChinh:"Hệ thống AI: mô tả thành phần cơ bản, vấn đề vận hành/tối ưu", monTichHop:"Tin học" },
  // === LỚP 11 ===
  { capHoc:"THPT", lop:11, machNoiDung:"A", ma:"A1", chuDe:"Tính chủ động của con người", noiDungChinh:"Quy trình sử dụng AI an toàn; AI để nâng cao năng lực", monTichHop:"Tin học" },
  { capHoc:"THPT", lop:11, machNoiDung:"A", ma:"A2", chuDe:"AI vì sự tiến bộ của con người", noiDungChinh:"Bền vững và công bằng", monTichHop:"Tin học, GDCD" },
  { capHoc:"THPT", lop:11, machNoiDung:"A", ma:"A3", chuDe:"Công dân trong kỉ nguyên AI", noiDungChinh:"Quyền của người và dự án AI; Quyền cơ bản của người dùng dữ liệu", monTichHop:"Tin học, GDCD" },
  { capHoc:"THPT", lop:11, machNoiDung:"B", ma:"B2", chuDe:"Sử dụng AI an toàn và có trách nhiệm", noiDungChinh:"Phòng tránh rủi ro khi sử dụng AI", monTichHop:"Tin học, GDCD" },
  { capHoc:"THPT", lop:11, machNoiDung:"B", ma:"B3", chuDe:"Nguyên tắc đạo đức và trách nhiệm xã hội", noiDungChinh:"Đạo đức trong thiết kế AI", monTichHop:"Tin học, GDCD" },
  { capHoc:"THPT", lop:11, machNoiDung:"C", ma:"C2", chuDe:"Ứng dụng AI trong học tập và cuộc sống", noiDungChinh:"Một số ứng dụng AI trong học tập; Cách đặt prompt phù hợp", monTichHop:"Tin học" },
  { capHoc:"THPT", lop:11, machNoiDung:"C", ma:"C3", chuDe:"Công nghệ AI", noiDungChinh:"Khám phá cách thức vận hành một số hệ thống AI; Phương pháp tùy chỉnh hệ thống AI", monTichHop:"Tin học" },
  { capHoc:"THPT", lop:11, machNoiDung:"C", ma:"C5", chuDe:"Kĩ thuật và thuật toán AI", noiDungChinh:"Kiến thức cơ bản về mạng nơ-ron nhân tạo; Các thuật toán phân cụm và phân lớp", monTichHop:"Tin học" },
  // === LỚP 12 ===
  { capHoc:"THPT", lop:12, machNoiDung:"A", ma:"A1", chuDe:"Tính chủ động của con người", noiDungChinh:"Tổng hợp và nâng cao: vai trò con người trong kiểm soát, ra quyết định với AI", monTichHop:"Tin học" },
  { capHoc:"THPT", lop:12, machNoiDung:"A", ma:"A2", chuDe:"AI vì sự tiến bộ của con người", noiDungChinh:"Tổng hợp: AI phục vụ phát triển bền vững, công bằng xã hội", monTichHop:"Tin học, GDCD" },
  { capHoc:"THPT", lop:12, machNoiDung:"A", ma:"A3", chuDe:"Công dân trong kỉ nguyên AI", noiDungChinh:"Định hướng nghề nghiệp và học tập suốt đời trong kỉ nguyên AI", monTichHop:"Tin học, GDCD" },
  { capHoc:"THPT", lop:12, machNoiDung:"B", ma:"B1", chuDe:"Các khía cạnh đạo đức của AI", noiDungChinh:"Đánh giá toàn diện các vấn đề đạo đức trong phát triển và sử dụng AI", monTichHop:"Tin học, GDCD" },
  { capHoc:"THPT", lop:12, machNoiDung:"B", ma:"B2", chuDe:"Sử dụng AI an toàn và có trách nhiệm", noiDungChinh:"Tổng hợp: sử dụng AI có trách nhiệm, tuân thủ pháp luật", monTichHop:"Tin học, GDCD" },
  { capHoc:"THPT", lop:12, machNoiDung:"B", ma:"B3", chuDe:"Nguyên tắc đạo đức và trách nhiệm xã hội", noiDungChinh:"Đề xuất quy tắc ứng xử và chính sách đạo đức cho AI", monTichHop:"Tin học, GDCD" },
  { capHoc:"THPT", lop:12, machNoiDung:"C", ma:"C2", chuDe:"Ứng dụng AI trong học tập và cuộc sống", noiDungChinh:"Ứng dụng AI nâng cao trong học tập và giải quyết vấn đề thực tiễn", monTichHop:"Tin học" },
  { capHoc:"THPT", lop:12, machNoiDung:"C", ma:"C3", chuDe:"Công nghệ AI", noiDungChinh:"Tìm hiểu sâu các công nghệ AI: NLP, Computer Vision, Generative AI", monTichHop:"Tin học" },
  { capHoc:"THPT", lop:12, machNoiDung:"C", ma:"C4", chuDe:"Dữ liệu trong AI", noiDungChinh:"Quản lý dữ liệu nâng cao; Đạo đức dữ liệu trong AI", monTichHop:"Tin học" },
  { capHoc:"THPT", lop:12, machNoiDung:"D", ma:"D1", chuDe:"Nhận diện & hình thành giải pháp", noiDungChinh:"Thiết kế giải pháp AI hoàn chỉnh cho vấn đề thực tiễn", monTichHop:"Tin học" },
  { capHoc:"THPT", lop:12, machNoiDung:"D", ma:"D2", chuDe:"Cấu trúc & tương tác, cải tiến hệ thống", noiDungChinh:"Xây dựng, đánh giá và cải tiến hệ thống AI", monTichHop:"Tin học" },
];

// ============================================
// Sheet 2: Năng lực đặc thù AI theo cấp học
// ============================================

export const AI_QD3439_COMPETENCE: AICompetenceByLevel[] = [
  { capHoc:"Tiểu học", thanhPhan:"NLa - Tư duy lấy con người làm trung tâm", bieuHien:"Nhận biết được AI là sản phẩm do con người tạo ra, nêu được một số ví dụ AI giúp ích cho con người như robot, trợ lý ảo, phần mềm học tập; biết lựa chọn, sử dụng công cụ AI phục vụ học tập, vui chơi an toàn; nhận biết các tình huống cần con người kiểm soát." },
  { capHoc:"Tiểu học", thanhPhan:"NLb - Đạo đức AI", bieuHien:"Hiểu rằng AI cần được sử dụng đúng cách, không gây hại; hiểu được việc không chia sẻ thông tin cá nhân cho các công cụ AI chưa rõ nguồn gốc; thực hiện hành vi có trách nhiệm khi sử dụng thiết bị có AI; tôn trọng sản phẩm số của người khác; biết đề xuất cách sử dụng AI có lợi cho cộng đồng." },
  { capHoc:"Tiểu học", thanhPhan:"NLc - Các kĩ thuật và ứng dụng AI", bieuHien:"Làm quen với phần mềm, ứng dụng có yếu tố AI (nhận diện hình ảnh, giọng nói, gợi ý học tập); biết vận dụng công cụ AI hỗ trợ học tập (vẽ, luyện đọc, học toán,...); thử nghiệm tạo sản phẩm đơn giản với AI." },
  { capHoc:"Tiểu học", thanhPhan:"NLd - Thiết kế hệ thống AI", bieuHien:"Nhận biết được rằng hệ thống AI hoạt động dựa trên dữ liệu để đưa ra dự đoán hoặc phản hồi; lấy được ví dụ minh hoạ quy trình học đơn giản của AI; nêu được một số ý tưởng đơn giản để cải thiện khi kết quả chưa chính xác." },
  { capHoc:"THCS", thanhPhan:"NLa - Tư duy lấy con người làm trung tâm", bieuHien:"Hiểu vai trò của con người trong thiết kế, vận hành, sử dụng AI; biết rằng con người chịu trách nhiệm với các phản hồi, tác động AI; nhận diện được, phân tích tình huống sử dụng AI cho mục đích đúng đắn; biết đề xuất cách kết hợp AI với yếu tố con người để giải quyết vấn đề xã hội." },
  { capHoc:"THCS", thanhPhan:"NLb - Đạo đức AI", bieuHien:"Nêu được các nguyên tắc đạo đức cơ bản của AI: không gây hại, không thiên kiến, công bằng, minh bạch; biết áp dụng các nguyên tắc đó khi học tập, làm việc với công cụ AI (không gian lận, tôn trọng quyền riêng tư); biết đánh giá sản phẩm AI có nguy cơ xâm phạm quyền con người, đề xuất giải pháp cải thiện." },
  { capHoc:"THCS", thanhPhan:"NLc - Các kĩ thuật và ứng dụng AI", bieuHien:"Hiểu được khái niệm dữ liệu, thuật toán, mô hình AI; biết dùng một số công cụ AI đơn giản phục vụ học tập, dự án nhỏ; biết kết hợp nhiều công cụ AI để tạo sản phẩm số có ý nghĩa (video, thuyết trình, mô phỏng)." },
  { capHoc:"THCS", thanhPhan:"NLd - Thiết kế hệ thống AI", bieuHien:"Xác định được các tình huống thực tiễn có thể và nên ứng dụng AI; tham gia vào quá trình lập kế hoạch thiết kế hệ thống AI đơn giản thông qua việc xác định mục tiêu, lựa chọn dữ liệu và mô phỏng hoạt động với công cụ có sẵn; đánh giá được kết quả và đề xuất cách cải thiện ở mức độ cơ bản." },
  { capHoc:"THPT", thanhPhan:"NLa - Tư duy lấy con người làm trung tâm", bieuHien:"Phân tích được ảnh hưởng của AI đến cơ hội việc làm, quyền riêng tư và tác động đến các quyết định của con người; biết tích hợp yếu tố nhân văn, công bằng vào thiết kế và sử dụng các công cụ AI; thiết kế giải pháp AI thúc đẩy phát triển bền vững, hòa nhập xã hội." },
  { capHoc:"THPT", thanhPhan:"NLb - Đạo đức AI", bieuHien:"Đánh giá các nguyên tắc đạo đức AI trong các tình huống thực tế; biết vận dụng các nguyên tắc đạo đức trong dự án học tập; đánh giá được các công cụ AI vi phạm chuẩn mực đạo đức xã hội; đề xuất được quy tắc ứng xử hoặc mô hình chính sách đạo đức cho AI." },
  { capHoc:"THPT", thanhPhan:"NLc - Các kĩ thuật và ứng dụng AI", bieuHien:"Hiểu và trình bày được quy trình phát triển AI thu thập – xử lý dữ liệu – huấn luyện – đánh giá; biết sử dụng công cụ lập trình AI cơ bản tạo ra sản phẩm AI hỗ trợ học tập; cải tiến được hoặc tích hợp mô hình AI sẵn có để phát triển công cụ mới; biết đánh giá tính hiệu quả và bền vững của công cụ AI." },
  { capHoc:"THPT", thanhPhan:"NLd - Thiết kế hệ thống AI", bieuHien:"Mô tả được cấu trúc tổng thể và một số thành phần chính của một hệ thống AI, phân tích được mục tiêu, thành phần và mối liên hệ giữa các phần trong hệ thống ở mức độ đơn giản; đề xuất và lựa chọn được phương án thiết kế, vận hành phù hợp với mục tiêu cụ thể; thực hiện được các hoạt động kiểm thử, điều chỉnh và tối ưu ở mức cơ bản." },
];

// ============================================
// Sheet 3: Cấu trúc 4 mạch nội dung - 11 chủ đề
// ============================================

export const AI_QD3439_TOPICS: AITopicStructure[] = [
  { machNoiDung:"A. Tư duy lấy con người làm trung tâm", ma:"A1", chuDe:"Tính chủ động của con người", moTa:"Nhấn mạnh vai trò trung tâm của con người trong việc điều khiển, kiểm soát và ra quyết định khi sử dụng AI. Con người luôn chịu trách nhiệm cuối cùng." },
  { machNoiDung:"A. Tư duy lấy con người làm trung tâm", ma:"A2", chuDe:"AI vì sự tiến bộ của con người", moTa:"AI được tạo ra để phục vụ và nâng cao chất lượng cuộc sống con người. Nhận diện lợi ích, rủi ro và tác động xã hội của AI." },
  { machNoiDung:"A. Tư duy lấy con người làm trung tâm", ma:"A3", chuDe:"Công dân trong kỉ nguyên AI", moTa:"Hình thành ý thức, kỹ năng sống và học tập trong thế giới có AI. Phát triển năng lực tự học, tư duy phản biện, hợp tác với AI." },
  { machNoiDung:"B. Đạo đức AI", ma:"B1", chuDe:"Các khía cạnh đạo đức của AI", moTa:"Nhận diện và phân tích các vấn đề đạo đức: thiên vị, công bằng, quyền riêng tư, trách nhiệm giải trình trong AI." },
  { machNoiDung:"B. Đạo đức AI", ma:"B2", chuDe:"Sử dụng AI an toàn và có trách nhiệm", moTa:"Hình thành thái độ và hành vi sử dụng AI có trách nhiệm: bảo vệ dữ liệu cá nhân, tôn trọng bản quyền, phòng tránh rủi ro." },
  { machNoiDung:"B. Đạo đức AI", ma:"B3", chuDe:"Nguyên tắc đạo đức và trách nhiệm xã hội", moTa:"Hiểu và áp dụng các nguyên tắc đạo đức cơ bản khi phát triển và sử dụng AI. Đảm bảo công bằng, minh bạch, không gây hại." },
  { machNoiDung:"C. Các kĩ thuật và ứng dụng AI", ma:"C1", chuDe:"Đặc điểm chính của AI", moTa:"Kiến thức nền tảng về cách AI hoạt động: dữ liệu, thuật toán, mô hình. Phân biệt AI với phần mềm thông thường." },
  { machNoiDung:"C. Các kĩ thuật và ứng dụng AI", ma:"C2", chuDe:"Ứng dụng AI trong học tập và cuộc sống", moTa:"Thực hành sử dụng các công cụ AI trong học tập và giải quyết vấn đề thực tiễn. Biết cách đặt prompt hiệu quả." },
  { machNoiDung:"C. Các kĩ thuật và ứng dụng AI", ma:"C3", chuDe:"Công nghệ AI", moTa:"Tìm hiểu các công nghệ AI phổ biến: nhận dạng hình ảnh, giọng nói, xử lý ngôn ngữ tự nhiên, học máy." },
  { machNoiDung:"C. Các kĩ thuật và ứng dụng AI", ma:"C4", chuDe:"Dữ liệu trong AI", moTa:"Hiểu vai trò của dữ liệu trong AI: thu thập, xử lý, chất lượng dữ liệu ảnh hưởng đến kết quả AI." },
  { machNoiDung:"C. Các kĩ thuật và ứng dụng AI", ma:"C5", chuDe:"Kĩ thuật và thuật toán AI", moTa:"Kiến thức về các kĩ thuật AI: luật, học máy (có giám sát, không giám sát), mạng nơ-ron nhân tạo." },
  { machNoiDung:"D. Thiết kế hệ thống AI", ma:"D1", chuDe:"Nhận diện & hình thành giải pháp", moTa:"Xác định vấn đề có thể giải quyết bằng AI, lập kế hoạch, thiết kế phương án giải quyết. Phát triển tư duy giải quyết vấn đề." },
  { machNoiDung:"D. Thiết kế hệ thống AI", ma:"D2", chuDe:"Cấu trúc & tương tác, cải tiến hệ thống", moTa:"Hiểu cấu trúc hệ thống AI, thực hành tạo sản phẩm AI đơn giản, đánh giá và cải tiến sản phẩm dựa trên phản hồi và dữ liệu." },
];

// ============================================
// HÀM TRA CỨU & FORMAT
// ============================================

/** Tra cứu nội dung AI theo lớp */
export function getAIContentByGrade(grade: number): AIContentEntry[] {
  return AI_QD3439_CONTENT.filter(e => e.lop === grade);
}

/** Tra cứu nội dung AI theo lớp + môn học */
export function getAIContentByGradeAndSubject(grade: number, subjectName: string): AIContentEntry[] {
  const allForGrade = getAIContentByGrade(grade);

  // Mapping tên môn sang từ khóa tìm trong cột monTichHop
  const subjectKeywords: Record<string, string[]> = {
    "Toán": ["Tin học"],
    "Ngữ Văn": ["Tin học"],
    "Vật Lí": ["Tin học", "TNXH"],
    "Hóa Học": ["Tin học", "TNXH"],
    "Sinh Học": ["Tin học", "TNXH"],
    "Tiếng Anh": ["Tin học"],
    "Lịch Sử": ["Tin học", "GDCD"],
    "Địa Lí": ["Tin học", "TNXH"],
    "GDCD": ["GDCD", "Đạo đức"],
    "Công Nghệ": ["Tin học"],
    "Tin Học": ["Tin học"],
    "Thể Dục": ["Tin học"],
    "Nghệ thuật": ["Tin học", "HĐTN"],
    "Hoạt động trải nghiệm": ["HĐTN", "HĐTN-HN", "Đạo đức"],
    "Giáo dục Quốc phòng - An ninh": ["GDCD", "Tin học"],
    "Giáo dục Địa phương": ["TNXH", "Tin học", "GDCD"],
    // Thêm các tên viết tắt/biến thể phổ biến
    "GDTC": ["Tin học"],
    "Âm nhạc": ["Tin học", "HĐTN"],
    "Mĩ thuật": ["Tin học", "HĐTN"],
  };

  const keywords = subjectKeywords[subjectName] || ["Tin học"];

  // Lọc: lấy các entry có monTichHop chứa ít nhất 1 keyword
  const filtered = allForGrade.filter(e =>
    keywords.some(kw => e.monTichHop.includes(kw))
  );

  // Nếu không tìm thấy kết quả phù hợp, trả về toàn bộ cho lớp đó
  return filtered.length > 0 ? filtered : allForGrade;
}

/** Lấy năng lực đặc thù theo cấp học */
export function getAICompetenceByCapHoc(grade: number): AICompetenceByLevel[] {
  let capHoc: string;
  if (grade >= 1 && grade <= 5) capHoc = "Tiểu học";
  else if (grade >= 6 && grade <= 9) capHoc = "THCS";
  else capHoc = "THPT";
  return AI_QD3439_COMPETENCE.filter(e => e.capHoc === capHoc);
}

/** Format nội dung AI thành text để inject vào prompt */
export function formatAIContentForPrompt(grade: number, subjectName: string): string {
  const entries = getAIContentByGradeAndSubject(grade, subjectName);
  const competences = getAICompetenceByCapHoc(grade);

  let capHoc: string;
  if (grade >= 1 && grade <= 5) capHoc = "Tiểu học";
  else if (grade >= 6 && grade <= 9) capHoc = "THCS";
  else capHoc = "THPT";

  let result = `\n## KHUNG NỘI DUNG GIÁO DỤC TRÍ TUỆ NHÂN TẠO - LỚP ${grade} (${capHoc})`;
  result += `\n(Theo QĐ 2422/QĐ-BGDĐT của Bộ GDĐT)\n`;

  // Phần 1: Nội dung AI cụ thể cho lớp + môn
  result += `\n### NỘI DUNG AI PHÙ HỢP VỚI LỚP ${grade} VÀ MÔN ${subjectName.toUpperCase()}:\n`;
  const grouped: Record<string, AIContentEntry[]> = {};
  for (const e of entries) {
    if (!grouped[e.machNoiDung]) grouped[e.machNoiDung] = [];
    grouped[e.machNoiDung].push(e);
  }

  for (const [mach, items] of Object.entries(grouped)) {
    const machName = mach === "A" ? "A. Tư duy lấy con người làm trung tâm" :
                     mach === "B" ? "B. Đạo đức AI" :
                     mach === "C" ? "C. Các kĩ thuật và ứng dụng AI" :
                     "D. Thiết kế hệ thống AI";
    result += `\n**${machName}:**\n`;
    for (const item of items) {
      result += `- [${item.ma}] ${item.chuDe}: ${item.noiDungChinh}\n`;
    }
  }

  // Phần 2: Yêu cầu cần đạt về năng lực đặc thù
  result += `\n### YÊU CẦU CẦN ĐẠT VỀ NĂNG LỰC AI (CẤP ${capHoc.toUpperCase()}):\n`;
  for (const c of competences) {
    result += `- **${c.thanhPhan}**: ${c.bieuHien}\n`;
  }

  return result;
}
