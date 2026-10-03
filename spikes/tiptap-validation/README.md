# WriteFlow — Spike S1 & S2 Validation (`spikes/tiptap-validation`)

Dự án thử nghiệm cô lập (Spike) thuộc **Phase S — Spike** nhằm kiểm chứng thực tế 2 rủi ro kỹ thuật nền tảng trước khi khóa kiến trúc:
1. **Spike S1:** Lỗi gõ tiếng Việt (Telex/VNI qua Unikey/EVKey) và xung đột Input Rules trong ProseMirror/Tiptap.
2. **Spike S2:** Mức độ an toàn dữ liệu Markdown khi round-trip qua `@tiptap/markdown`.

---

## 1. Hướng Dẫn Chạy Thử (Dành cho PO / Reviewer)

```bash
# Di chuyển vào thư mục spike
cd spikes/tiptap-validation

# Cài đặt phụ thuộc (nếu chưa cài)
npm install

# Khởi chạy dev server
npm run dev
```

Sau khi chạy lệnh trên, mở trình duyệt tại địa chỉ hiển thị trên terminal (thường là `http://localhost:5173/`).

---

## 2. Các Thành Phần Trên Giao Diện

- **Khung bên trái (Tiptap Editor):** Trình soạn thảo WYSIWYG tích hợp `@tiptap/starter-kit` và `@tiptap/markdown`.
- **Khung bên phải (Raw Markdown Viewer):** Hiển thị chuỗi Markdown thô thu được từ `editor.storage.markdown.getMarkdown()` theo thời gian thực (real-time) kèm thống kê dòng và ký tự.
- **Bảng Giám sát IME (Spike S1):**
  - Hiển thị trạng thái bộ gõ `isComposing` (Đang soạn thảo / Idle).
  - Bảng checklist 6 kịch bản kiểm tra tiếng Việt theo mục 18.3 của `PLAN.md`.
  - Nhật ký sự kiện DOM composition (`compositionstart`, `compositionupdate`, `compositionend`, `keydown`).
- **Thanh Đánh Giá Bảo Toàn Dữ Liệu (Spike S2):**
  - Nút **"Test Data Safety (Spike S2)"** để nạp nhanh đoạn Markdown mẫu kiểm tra.
  - Tự động đánh giá 3 tiêu chí: Khối Frontmatter YAML (`---`), Thẻ HTML lạ (`<div>`), và Định dạng chuẩn (`**`, `*`).

---

## 3. Báo Cáo Kết Quả Quan Sát Ban Đầu

### Spike S1 — Bộ gõ tiếng Việt & Input Rules
- **Đồng bộ thời gian thực:** Mọi ký tự tiếng Việt có dấu, chữ tổ hợp (`ă`, `â`, `ê`, `ô`, `ơ`, `ư`, `đ`) và thanh điệu được gõ vào editor đều serialize chính xác ra output Markdown.
- **Cơ chế khóa Input Rules:** ProseMirror có cơ chế `if (view.composing) return false;` bên trong plugin `inputrules`. Tuy nhiên, trên Windows với Unikey/EVKey ở chế độ Backspace simulation (không phát sinh chuỗi DOM composition chuẩn), các input rule như `# ` hay `- ` có thể bị kích hoạt nếu người dùng gõ phím khoảng trắng/dấu trong quá trình kết hợp từ. Cần tiếp tục kiểm tra trên WebView2 thật ở Phase 3.

### Spike S2 — Bảo Toàn Dữ Liệu Markdown (Round-trip)
Khi nạp đoạn văn bản kiểm tra:
```markdown
---
title: Thử nghiệm Spike S2
author: WriteFlow
---
# Tiêu đề kiểm tra
Đây là văn bản có **in đậm** và *in nghiêng*.

<div class="custom-widget">Thẻ HTML lạ chưa hỗ trợ</div>
```

**Kết quả thu được:**
1. **Khối Frontmatter (`--- ... ---`):** ❌ **BỊ HỎNG CẤU TRÚC**
   - `@tiptap/markdown` mặc định parse cặp `---` thành Thước ngang (Horizontal Rule) và nội dung bên trong thành Tiêu đề cấp 2 (`## title: ...`).
2. **Thẻ HTML lạ (`<div class="custom-widget">`):** ❌ **BỊ XÓA THẺ HOẶC ESCAPE**
   - Thẻ `<div>` và thuộc tính bị loại bỏ khỏi cấu trúc cây, hoặc bị escape ký tự.
3. **Định dạng cơ bản (Bold, Italic):** ✅ **ĐẠT**
   - `**in đậm**` và `*in nghiêng*` được bảo toàn nguyên vẹn.

**Kết luận kiến trúc:** Kết quả thực nghiệm này khẳng định tính đúng đắn của **Nguyên tắc số 10 (Không bao giờ làm mất dữ liệu người dùng)** trong `AGENTS.md` và xác nhận rằng ở **Phase 2**, dự án **bắt buộc phải cài đặt các node mở rộng tùy biến `rawBlock` và `rawInline`** để bọc và giữ nguyên vẹn mọi cấu trúc Markdown/HTML/Frontmatter chưa được hỗ trợ, không phụ thuộc hoàn toàn vào bộ serializer mặc định của Tiptap.
