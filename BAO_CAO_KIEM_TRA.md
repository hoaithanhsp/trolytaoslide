# BÁO CÁO KIỂM TRA

## 1) Tóm tắt
- Đã rà soát các phần lõi liên quan đến AI provider/model/fallback, validate API key, luồng lưu key trong localStorage và các điểm có thể lộ thông tin nhạy cảm.
- Đã cập nhật chuỗi model Gemini theo yêu cầu, sửa model mặc định và điều chỉnh xử lý lỗi để fallback đúng với lỗi hạ tầng.
- Đã rà soát các log lỗi; giữ lại các log kỹ thuật tối thiểu, tránh in API key ra console.

## 2) Lỗi đã phát hiện và sửa
### 2.1 Model mặc định chưa đúng yêu cầu
- Trước đây model mặc định của Gemini là `gemini-3.6-flash`.
- Đã đổi sang `gemini-3.8-flash`.

### 2.2 Chuỗi fallback chưa khớp yêu cầu
- Trước đây thứ tự fallback thiếu `gemini-3.8-flash` và chưa đúng dải model yêu cầu.
- Đã cập nhật đúng chuỗi:
  `gemini-3.8-flash → gemini-3.7-flash → gemini-3.5-flash-lite → gemini-3.6-flash → gemini-3.5-flash → gemini-3.1-flash-lite → gemini-2.5-flash`

### 2.3 Model đã shutdown còn xuất hiện trong danh sách model
- Đã loại bỏ các model không còn dùng cho nhánh Gemini chính theo yêu cầu, đồng thời bỏ các preview model không phù hợp khỏi danh sách hiển thị và fallback.

### 2.4 Xử lý lỗi hạ tầng chưa đủ đầy
- Đã bổ sung xử lý `502/503/504` vào nhóm lỗi cho phép fallback model.
- Đã giữ `429` trong nhóm rate limit/cooldown, không xem là key invalid.

### 2.5 Cấu hình thinking cho Gemini 3 chưa đúng giới hạn
- Đã chuẩn hóa `thinkingConfig.thinkingLevel` theo hướng dùng mức `LOW` cho Gemini 3* trong cấu hình generate.
- Không gửi `temperature` cho Gemini 3*.

### 2.6 Rà soát validate API key
- Validator đã chấp nhận cả `AIzaSy` và `AQ` theo mẫu `/^(?:AIzaSy|AQ)\S{8,}$/`.
- Không cần sửa thêm ở phần này.

### 2.7 Tránh lộ API key qua console
- Đã rà soát các vị trí log lỗi; không thấy chỗ nào in thẳng API key ra console trong luồng đã kiểm tra.
- Giữ log kỹ thuật ở mức cần thiết để debug.

## 3) Lỗi chưa sửa được
- Chưa chạy full build/test để xác nhận toàn bộ dự án không còn lỗi TypeScript hoặc runtime phát sinh ở các phần chưa rà soát hết.
- Chưa xác minh hành vi thật của SDK Google GenAI đối với toàn bộ model mới nếu môi trường thực tế khác sandbox.

## 4) Đề xuất cải thiện thêm
- Nên tách cấu hình model/fallback thành một file cấu hình riêng để dễ cập nhật khi Google thay đổi danh sách model.
- Nên bổ sung test cho `validateApiKey`, `parseApiError`, `getOrderedModels` và `buildGenerateConfig`.
- Nên thêm kiểm thử tích hợp cho luồng fallback khi gặp `502/503/504` và rate limit `429`.
- Nên kiểm tra lại toàn bộ console logging để chuẩn hóa chính sách ẩn thông tin nhạy cảm.

## 5) Checklist api.md
- [x] Validator API key chấp nhận cả `AIzaSy` và `AQ`
- [x] Model mặc định của Gemini là `gemini-3.8-flash`
- [x] Chuỗi fallback Gemini đúng thứ tự yêu cầu
- [x] Loại bỏ model đã shutdown / preview không phù hợp trong nhánh Gemini chính
- [x] Gemini 3* chỉ dùng thinking level phù hợp, không dùng `minimal`
- [x] Không gửi `temperature/topP/topK` cho Gemini 3*
- [x] Lỗi `503/502/504` được fallback model
- [x] Lỗi `429` chỉ cooldown key, không đánh dấu invalid
- [x] Không log API key ra console
- [x] Chỉ sửa những gì cần thiết, không refactor lớn
