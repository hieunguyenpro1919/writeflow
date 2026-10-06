# SỔ THEO DÕI NỢ KỸ THUẬT (TECHNICAL DEBT TRACKING)

**Dự án:** WriteFlow — Trình soạn thảo Markdown WYSIWYG  
**Trạng thái:** Kích hoạt (Active)  
**Khởi tạo:** Phase 2 (Task 2.1)  
**Quy tắc:** Mọi nợ kỹ thuật phát sinh hoặc tạm hoãn từ các phase trước phải được đánh mã số định danh, mô tả chi tiết nguyên nhân, rủi ro và quy hoạch giải quyết triệt để tại phase mục tiêu. Không được bỏ qua hoặc xóa mục nợ kỹ thuật khi chưa có giải pháp thay thế và bài kiểm thử xác nhận.

---

## 1. BẢNG TỔNG HỢP NỢ KỸ THUẬT

| Mã | Hạng mục | Nguồn gốc | Mức độ | Phase xử lý | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TD-01** | Cảnh báo kích thước gói bundle vượt 500 kB (~678 kB JS) | Phase 1 (Core Editor) | Trung bình | Phase 3 | Mở (Open) |
| **TD-02** | Bắt sự kiện IME qua tham chiếu toàn cục `window.event` trong `SmartKeysExtension` | Phase 1 (Task 1.9) | Trung bình | Phase 3 | Mở (Open) |

---

## 2. CHI TIẾT TỪNG MỤC NỢ KỸ THUẬT

### TD-01: Cảnh báo kích thước gói bundle vượt 500 kB (~678 kB)

- **Mô tả:**  
  Khi thực hiện lệnh `npm run build`, công cụ đóng gói Vite phát cảnh báo kích thước chunk vượt ngưỡng 500 kB sau khi nén minification:
  ```text
  dist/assets/index-CNSRxufu.js   678.76 kB │ gzip: 212.53 kB
  (!) Some chunks are larger than 500 kB after minification. Consider:
  - Using dynamic import() to code-split the application
  - Use build.rolldownOptions.output.codeSplitting to improve chunking
  - Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
  ```
- **Nguyên nhân gốc rễ:**  
  Toàn bộ module `@tiptap/core`, `@tiptap/pm`, `@tiptap/starter-kit`, React runtime và i18next được đóng gói thành một single chunk duy nhất trong chế độ web app hiện tại.
- **Rủi ro:**  
  Trong môi trường desktop (Tauri WebView2), toàn bộ file được nạp cục bộ từ đĩa nên không ảnh hưởng đến băng thông mạng. Tuy nhiên, đối với bản web hoặc khởi động lần đầu, kích thước lớn làm tăng thời gian parse/eval JavaScript của trình duyệt.
- **Giải pháp quy hoạch (Phase 3):**  
  1. Khi tích hợp Tauri ở Phase 3, đánh giá lại cấu hình `build.rollupOptions.output.manualChunks` để chia nhỏ các module bên thứ ba (vendor chunking).
  2. Đánh giá lazy loading / dynamic import đối với các hộp thoại phụ (như `ShortcutsDialog`) hoặc các extension nặng khi chưa cần dùng ngay lúc mở app.
  3. Đo lường thời gian khởi động (Startup Time) theo mục tiêu hiệu năng < 200ms được nêu trong `docs/PLAN.md` (Mục 18.2).

---

### TD-02: Chuẩn hóa cơ chế bắt sự kiện IME trong `SmartKeysExtension`

- **Mô tả:**  
  Trong file `src/core/editor/smart-keys.ts`, đoạn mã bảo vệ IME khỏi bị phím Backspace can thiệp khi đang gõ tiếng Việt có sử dụng:
  ```typescript
  const event =
    typeof window !== 'undefined' ? (window.event as KeyboardEvent | undefined) : undefined;
  const isComposing = Boolean(event?.isComposing);
  const isImeKeyCode = event?.keyCode === 229;

  if (this.editor.view.composing || isComposing || isImeKeyCode) {
    return false;
  }
  ```
- **Nguyên nhân gốc rễ:**  
  Hàm callback của `addKeyboardShortcuts()` trong Tiptap không truyền trực tiếp đối tượng DOM `KeyboardEvent` gốc vào tham số hàm xử lý, buộc extension phải truy cập qua `window.event` để lấy thuộc tính `isComposing` và `keyCode === 229` (chuẩn IME Windows).
- **Rủi ro:**  
  - `window.event` là API kế thừa (deprecated/legacy) và có thể không đồng nhất trên các môi trường trình duyệt không chuẩn hoặc khi chạy trong môi trường kiểm thử ảo hóa không mô phỏng đầy đủ đối tượng window.
  - Phụ thuộc vào biến toàn cục thay vì trạng thái luồng xử lý của ProseMirror.
- **Giải pháp quy hoạch (Phase 3):**  
  1. Thay thế việc bắt sự kiện bàn phím phím tắt trực tiếp trong `addKeyboardShortcuts()` bằng ProseMirror Plugin thông qua `props.handleKeyDown(view, event)` hoặc cấu hình `PluginView`.
  2. Khi dùng `handleKeyDown(view, event)`, đối tượng `event` là `KeyboardEvent` chuẩn được truyền trực tiếp, cho phép kiểm tra `event.isComposing` và `event.keyCode === 229` mà không cần chạm đến `window.event`.
  3. Kiểm thử trên WebView2 thực tế của ứng dụng desktop Tauri tại Phase 3 để bảo đảm 100% kịch bản gõ tiếng Việt Telex/VNI với Unikey và EVKey vẫn hoạt động hoàn hảo.
