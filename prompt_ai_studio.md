# 📋 Câu Lệnh Dán Vào AI Studio — App Tạo Giáo Án Tự Động

> **Hướng dẫn:** Copy toàn bộ nội dung bên dưới (từ dòng `---` đầu tiên đến hết) và dán vào Google AI Studio.

---

## PROMPT BẮT ĐẦU

```
Bạn là chuyên gia phát triển ứng dụng web giáo dục Việt Nam. Hãy tạo một ứng dụng web hoàn chỉnh (React + TypeScript + Vite + Tailwind CSS) với chức năng: **AI tự động sinh giáo án GDTC (Giáo dục Thể chất)** dạng file .docx, sử dụng Gemini API.

---

## I. MÔ TẢ ỨNG DỤNG

Ứng dụng hỗ trợ giáo viên THPT tự động hóa việc soạn giáo án dựa trên 3 loại dữ liệu đầu vào:
1. **Giáo án mẫu** (.docx) — chuẩn cấu trúc hành chính
2. **Phân phối chương trình / Kế hoạch giảng dạy** (.docx) — chứa danh sách buổi dạy, nội dung, lịch, số tiết
3. **Tài liệu tham khảo** (.docx/.pdf) — bổ sung kiến thức chuyên môn (tùy chọn)

Hệ thống sẽ:
- Phân tích cấu trúc file mẫu (header, mục tiêu, tiến trình...)
- Trích xuất lịch dạy & nội dung từng tiết từ kế hoạch
- Gọi Gemini API để sinh nội dung chi tiết cho từng giáo án
- Xuất file .docx chuẩn định dạng (~7-8 trang/giáo án)
- Cho phép tải xuống từng file hoặc toàn bộ (zip)

---

## II. TECH STACK BẮT BUỘC

- **Frontend**: React 18+ với TypeScript, Vite
- **Styling**: Tailwind CSS (mobile-first)
- **Font**: Be Vietnam Pro (heading), Inter (body) — hỗ trợ tiếng Việt
- **AI**: Gemini API (gemini-2.5-flash mặc định, hỗ trợ fallback sang gemini-3-flash-preview, gemini-2.5-flash-lite)
- **Tạo DOCX**: Thư viện docx (npm: docx) — sinh file .docx phía client
- **Đọc file upload**: mammoth (đọc .docx → text/HTML)
- **Nén file**: JSZip (tạo file .zip khi tải toàn bộ)
- **Deploy**: Vercel (cần file vercel.json với SPA rewrite)
- **Icon**: Lucide React

---

## III. CẤU TRÚC GIÁO ÁN CHUẨN (BẮT BUỘC TUÂN THỦ)

Mỗi giáo án AI sinh ra PHẢI có đủ các phần sau:

```
HEADER: Trường / Tổ bộ môn / GV / Bảng (Ngày soạn | Ngày dạy | Tuần | Lớp)

TIÊU ĐỀ: "TIẾT [số]: [Tên bài]" — centered, bold, size 14pt

I. MỤC TIÊU
   1. Về kiến thức (3-4 gạch đầu dòng)
   2. Năng lực
      - Năng lực chung (3 mục: tự chủ/tự học, giao tiếp/hợp tác, giải quyết vấn đề)
      - Năng lực GDTC (3-4 mục chuyên môn)
   3. Phẩm chất (4-5 mục: chăm chỉ, trung thực, kỷ luật, trách nhiệm, tự tin)

II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
   1. Đối với giáo viên (4 gạch đầu dòng)
   2. Đối với học sinh (3 gạch đầu dòng)

III. TIẾN TRÌNH DẠY HỌC
   A. HOẠT ĐỘNG KHỞI ĐỘNG (15-20 phút)
      a. Mục tiêu
      b. Nội dung
      c. Sản phẩm
      d. Tổ chức thực hiện
         Bước 1: GV chuyển giao nhiệm vụ học tập
         Bước 2: HS tiếp nhận, thực hiện nhiệm vụ
         Bước 3: Báo cáo kết quả, thảo luận
         Bước 4: Đánh giá kết quả thực hiện

   B. HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC VÀ LUYỆN TẬP (25-30 phút hoặc 90-100 phút cho đội tuyển)
      a. Mục tiêu
      b. Nội dung
      c. Sản phẩm
      d. Tổ chức thực hiện (4 bước như trên)
      + BẢNG LỖI SAI THƯỜNG MẮC & BIỆN PHÁP KHẮC PHỤC (bảng 2 cột)

   C. HOẠT ĐỘNG VẬN DỤNG (10-15 phút)
      a. Mục tiêu | b. Nội dung | c. Sản phẩm | d. Tổ chức thực hiện (4 bước)

   D. HOẠT ĐỘNG THƯ GIÃN VÀ HỒI PHỤC (10-15 phút)
      a. Mục tiêu | b. Nội dung | c. Sản phẩm | d. Tổ chức thực hiện (4 bước)

HƯỚNG DẪN VỀ NHÀ (5-7 gạch đầu dòng)
```

> ⚠️ QUY TẮC CỨNG:
> - Mỗi hoạt động A/B/C/D đều PHẢI có 4 mục con: a, b, c, d
> - Mục "d. Tổ chức thực hiện" luôn có 4 bước
> - Phần B BẮT BUỘC có bảng lỗi sai (bảng 2 cột trong DOCX)
> - Font: Times New Roman 13pt, margin 2cm, giáo án ~7-8 trang

---

## IV. CÁC TÍNH NĂNG CẦN CÓ

### 4.1 Quản lý API Key
- Modal bắt buộc nhập API key khi lần đầu sử dụng
- Hướng dẫn lấy key tại: https://aistudio.google.com/api-keys
- Lưu vào localStorage, nút Settings trên Header để thay đổi
- Dòng chữ đỏ "Lấy API key để sử dụng app" luôn hiển thị trên Header

### 4.2 Chọn Model AI
- Hiển thị dạng Cards cho 3 model:
  1. gemini-2.5-flash (Default) — Cân bằng
  2. gemini-3-flash-preview — Hiệu năng cao
  3. gemini-2.5-flash-lite — Tiết kiệm
- Cơ chế fallback tự động khi model lỗi

### 4.3 Upload & Phân tích file
- Khu vực drag & drop upload file .docx
- Slot 1: **Giáo án mẫu** (bắt buộc) — để AI học cấu trúc
- Slot 2: **Kế hoạch / Phân phối chương trình** (bắt buộc) — để AI trích xuất danh sách tiết
- Slot 3: **Tài liệu tham khảo** (tùy chọn) — bổ sung kiến thức
- Hiển thị preview nội dung đã trích xuất từ file
- Hiển thị danh sách tiết đã phát hiện (checkbox để chọn tiết cần tạo)

### 4.4 Thông tin bổ sung
- Form nhập: Tên trường, Tổ bộ môn, Tên GV, Năm học
- Tự động điền nếu phát hiện trong file upload

### 4.5 Quy trình sinh giáo án (3 bước hiển thị trên UI)
- **Step 1**: Phân tích cấu trúc giáo án mẫu → Trích xuất template
- **Step 2**: Phân tích kế hoạch → Trích xuất danh sách tiết, nội dung, ngày
- **Step 3**: Sinh nội dung chi tiết cho từng giáo án bằng AI
- Hiển thị progress bar và trạng thái từng bước
- Nếu lỗi API ở bước nào → retry bước đó với model fallback, giữ kết quả các bước trước

### 4.6 Xuất file DOCX
- Sinh file .docx chuẩn định dạng (Times New Roman 13pt, margin 2cm)
- Bảng lỗi sai dùng table với Table Grid style
- Nút tải từng giáo án riêng lẻ
- Nút "Tải tất cả" → tạo file .zip chứa toàn bộ giáo án
- Tên file: `Giao_an_tiet_01.docx`, `Giao_an_tiet_02.docx`...

### 4.7 Preview & Chỉnh sửa
- Hiển thị preview nội dung giáo án đã sinh (dạng rich text)
- Cho phép chỉnh sửa nội dung trước khi tải xuống
- Nút "Sinh lại" cho từng giáo án cụ thể

---

## V. GIAO DIỆN

### Bảng màu: Công cụ Giáo viên
- Primary: `#0D9488` (Teal)
- Secondary: `#F97316` (Orange)  
- Accent: `#EC4899` (Pink)
- Background: trắng sáng, gradient nhẹ
- Dark mode: hỗ trợ (bg-gray-900)

### Layout
- **Header**: Logo + Tên app "Trợ Lý Tạo Giáo Án AI" + Settings (API Key) + Dark mode toggle
- **Hero**: Mô tả ngắn + CTA "Bắt đầu tạo giáo án"
- **Main**: Wizard 3 bước (Upload → Cấu hình → Sinh & Tải)
- **Footer**: Thông tin tác giả, phiên bản

### Responsive
- Mobile-first (375px ưu tiên)
- Tablet 768px, Desktop 1024px+
- Touch target tối thiểu 44x44px

### Animation
- Fade-in khi chuyển bước
- Progress bar animate khi AI đang xử lý
- Button hover: scale-[1.02], active: scale-[0.98]
- Toast notification cho thông báo thành công/lỗi

---

## VI. CẤU TRÚC THƯ MỤC DỰ ÁN

```
src/
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ApiKeyModal.tsx
│   ├── ModelSelector.tsx
│   ├── FileUploader.tsx
│   ├── LessonPreview.tsx
│   ├── ProgressTracker.tsx
│   └── DownloadPanel.tsx
├── services/
│   ├── geminiService.ts      // Gọi Gemini API, fallback, retry
│   ├── docxParser.ts         // Đọc file .docx upload (mammoth)
│   ├── docxGenerator.ts      // Sinh file .docx output (docx lib)
│   └── zipService.ts         // Tạo file .zip (JSZip)
├── hooks/
│   ├── useApiKey.ts
│   ├── useFileUpload.ts
│   └── useLessonGenerator.ts
├── types/
│   └── index.ts              // TypeScript interfaces
├── utils/
│   └── constants.ts
├── App.tsx
├── main.tsx
└── index.css
```

---

## VII. PROMPT MẪU GỬI CHO GEMINI API

### Step 1 — Phân tích mẫu:
```
"Phân tích cấu trúc giáo án mẫu sau đây. Trích xuất:
1. Cấu trúc header (trường, tổ, GV, bảng ngày)
2. Các phần chính (I, II, III) và phần con
3. Format đặc biệt (bảng, bullet, bold/italic)
4. Thời lượng mỗi hoạt động

Nội dung file mẫu:
[NỘI DUNG GIÁO ÁN MẪU]"
```

### Step 2 — Phân tích kế hoạch:
```
"Phân tích kế hoạch giảng dạy sau. Trích xuất danh sách các tiết dạy dưới dạng JSON:
[{\"tiet\": 1, \"tuan\": 1, \"ngay_day\": \"...\", \"noi_dung\": \"...\", \"ghi_chu\": \"...\"}]

Nội dung kế hoạch:
[NỘI DUNG KẾ HOẠCH]"
```

### Step 3 — Sinh giáo án:
```
"Viết giáo án GDTC chi tiết cho Tiết [X]: [Nội dung].
Tuân thủ CHÍNH XÁC cấu trúc sau: [CẤU TRÚC TỪ STEP 1].
Thông tin: Trường [tên], GV [tên], Ngày dạy [ngày], Tuần [tuần].

YÊU CẦU:
- Mỗi hoạt động A/B/C/D có đủ 4 mục: a) Mục tiêu, b) Nội dung, c) Sản phẩm, d) Tổ chức thực hiện
- Mục d luôn có 4 bước
- Phần B phải có bảng lỗi sai thường mắc (ít nhất 4 lỗi)
- Nội dung bài tập chi tiết, cụ thể, phù hợp nội dung tiết dạy
- Đủ 7-8 trang khi in A4
- Phần Hướng dẫn về nhà: 5-7 gạch đầu dòng

Tài liệu tham khảo bổ sung (nếu có):
[NỘI DUNG TÀI LIỆU THAM KHẢO]"
```

---

## VIII. YÊU CẦU KỸ THUẬT KHÁC

1. **vercel.json** ở root:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

2. **Xử lý lỗi API**:
   - Hết quota → thông báo: "API key hết quota. Hãy lấy key từ Gmail khác hoặc chờ đến ngày mai."
   - Model lỗi → tự động fallback: gemini-2.5-flash → gemini-3-flash-preview → gemini-2.5-flash-lite
   - Chỉ retry bước đang lỗi, giữ kết quả các bước trước

3. **Performance**:
   - Lazy load component nặng
   - React.memo cho list items
   - Skeleton loading (animate-pulse) thay vì spinner

4. **Không hardcode text**: Mọi label tiếng Việt đặt trong constants

Hãy bắt đầu code toàn bộ ứng dụng. Output tất cả các file cần thiết.
```
