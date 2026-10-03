# BÁO CÁO THỬ NGHIỆM SPIKE (GATE S)

**Dự án:** WriteFlow — Trình soạn thảo Markdown WYSIWYG  
**Giai đoạn:** Phase S — Spike  
**Ngày thực hiện:** 03/10/2026  
**Người thực hiện:** AI Builder & Product Owner (PO)  
**Trạng thái Gate S:** **ĐẠT (PASS) — GO PHASE 0**

---

## 1. MỤC TIÊU CỦA PHASE S

Kiểm chứng thực nghiệm 2 rủi ro kỹ thuật nền tảng lớn nhất được xác định trong `docs/PLAN.md` trước khi tiến hành khóa kiến trúc và bootstrap dự án:
1. **Spike S1:** Khả năng tương thích của bộ gõ tiếng Việt (Telex/VNI qua Unikey/EVKey) với ProseMirror/Tiptap và kiểm tra nguy cơ xung đột với các Input Rules (`# `, `- `, `* `).
2. **Spike S2:** Kiểm tra tính an toàn dữ liệu (Round-trip) của `@tiptap/markdown` đối với các cấu trúc Markdown phức tạp (YAML Frontmatter và thẻ HTML thô chưa hỗ trợ).

---

## 2. KẾT QUẢ THỬ NGHIỆM CHI TIẾT

### 2.1. Spike S1: Bộ gõ tiếng Việt & Input Rules

- **Môi trường thử nghiệm:** Dự án cô lập tại `spikes/tiptap-validation` (Vite + React + TypeScript + Tiptap). Thử nghiệm trực tiếp với Unikey và EVKey trên nền tảng Windows.
- **Quan sát thực tế:**
  - **Nhận phím và hiển thị:** Trình soạn thảo Tiptap tiếp nhận các ký tự tổ hợp tiếng Việt (`ă, â, ê, ô, ơ, ư, đ`) và 5 thanh điệu hoàn toàn mượt mà, không gặp hiện tượng mất dấu, nuốt chữ hay nhân đôi ký tự.
  - **Cơ chế Input Rules:** Khi cờ `isComposing = true`, ProseMirror tự động khóa (bypass) quá trình kích hoạt Input Rules (`if (view.composing) return false;`).
  - **Lưu ý kiến trúc:** Với các bộ gõ trên Windows ở chế độ giả lập Backspace (thay vì phát sinh DOM Composition events chuẩn), cần tiếp tục kiểm tra trên WebView2 của Tauri ở Phase 3.
- **Đánh giá:** **ĐẠT (PASS)** cho Phase S. Tiếp tục tuân thủ kịch bản kiểm tra tại mục 18.3 ở các phase sau.

### 2.2. Spike S2: Bảo toàn dữ liệu Markdown (Round-trip)

- **Môi trường thử nghiệm:** Nạp đoạn Markdown mẫu kiểm tra chứa Frontmatter và thẻ HTML thô:
  ```markdown
  ---
  title: Thử nghiệm Spike S2
  author: WriteFlow
  ---
  # Tiêu đề kiểm tra
  Đây là văn bản có **in đậm** và *in nghiêng*.

  <div class="custom-widget">Thẻ HTML lạ chưa hỗ trợ</div>
  ```
- **Kết quả quan sát từ `@tiptap/markdown` mặc định:**
  1. **Định dạng cơ bản (`**in đậm**`, `*in nghiêng*`):** ✅ Bảo toàn chính xác.
  2. **Khối Frontmatter (`--- ... ---`):** ❌ **HỎNG CẤU TRÚC.** `@tiptap/markdown` mặc định parse cặp `---` thành Thước ngang (Horizontal Rule) và nội dung YAML thành Tiêu đề cấp 2 (`## title: ...`).
  3. **Thẻ HTML lạ (`<div class="custom-widget">...</div>`):** ❌ **BỊ ESCAPE KÝ TỰ.** Thẻ bị mã hóa thành `&lt;div class="custom-widget"&gt;...&lt;/div&gt;` thay vì giữ nguyên vẹn thẻ thô.
- **Đánh giá:** **GHI NHẬN RỦI RO KIẾN TRÚC.** Kết quả thực nghiệm hoàn toàn trùng khớp với cảnh báo của `docs/PLAN.md` (Rủi ro R-01, Nguyên tắc 10).

---

## 3. KẾT LUẬN VÀ QUYẾT ĐỊNH CHO CÁC PHASE TIẾP THEO

1. **Gate S Decision: PASS (ĐẠT)**  
   Bộ gõ tiếng Việt hoạt động ổn định trên nền tảng Tiptap/ProseMirror. Dự án đủ điều kiện bước vào **Phase 0 (Bootstrap Project)**.
2. **Kế hoạch xử lý rủi ro mất dữ liệu (S2):**
   - `@tiptap/markdown` mặc định không thể dùng độc lập nguyên bản mà phải được bổ sung các node tùy biến tại **Phase 2**.
   - Tại **Phase 2 (Markdown Engine)**, bắt buộc phải hiện thực node `rawBlock` và `rawInline` để cô lập, lưu trữ nguyên vẹn các cấu trúc YAML Frontmatter và thẻ HTML thô chưa được hỗ trợ, bảo đảm tuân thủ triệt để **Nguyên tắc số 10: Không bao giờ làm mất dữ liệu người dùng**.
