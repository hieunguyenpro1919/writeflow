# Nhiệm vụ Phase 2: Markdown Engine (Parser & Serializer hai chiều)

## 1. Mục tiêu cốt lõi
Xây dựng mô-đun Markdown Engine hoàn chỉnh chuyển đổi hai chiều giữa Markdown thô (CommonMark + GFM) và cây cú pháp ProseMirror/Tiptap với tiêu chuẩn bảo toàn dữ liệu tuyệt đối (Lossless Round-trip) và không thay đổi dữ liệu người dùng (Nguyên tắc số 10: Plan 9.2).

## 2. Tiêu chuẩn kiến trúc & Mô-đun hóa
- **Mã nguồn lõi**: Đặt tại `src/core/markdown/` gồm `parser.ts`, `serializer.ts`, `types.ts`, `extensions.ts`, `index.ts`.
- **Bảo toàn dữ liệu thô**: Sử dụng node `rawBlock` và mark/node `rawInline` để bọc kén an toàn mọi cú pháp chưa hỗ trợ trực quan (GFM Tables, Footnotes, Math, Raw HTML block/inline).
- **Cách ly Frontmatter**: Bóc tách YAML header ở đầu tệp riêng biệt bằng regex nghiêm ngặt trước khi parser nạp vào ProseMirror schema, khôi phục nguyên vẹn khi serialize.

## 3. Danh mục Task chi tiết
- **Task 2.1**: Khởi tạo khung mô-đun Markdown Engine, ghi nhận nợ kỹ thuật TD-01 & TD-02, ghim phiên bản `@tiptap/markdown@3.31.4`.
- **Task 2.2**: Hỗ trợ khối phức tạp (Nested Lists, Task Lists, Blockquotes, Fenced Code Blocks, Strikethrough, Links).
- **Task 2.3**: Triển khai `rawBlock` tùy biến bảo vệ HTML thô và comment.
- **Task 2.4**: Sửa 6 lỗi chặn mất dữ liệu (Tables GFM, Image URLs, Inline HTML `rawInline`, Footnotes, Frontmatter regex, Code fence length & Link spaces), đồng bộ schema giữa Editor và Engine.
- **Task 2.5**: Tích hợp bộ kiểm thử Round-trip Corpus 30 file mẫu từ DeepSeek.

## 4. Mục 7: Tiêu chí nghiệm thu (Acceptance Criteria cho AI Giám sát)
1. **Cổng kiểm thử tự động (6 CI Gates)**:
   - Typecheck, Lint, Format, Build sạch 100%.
   - Toàn bộ Vitest unit tests và Playwright E2E tests đạt 100%, không skip/only, không flaky.
2. **Lossless Round-trip**:
   - `serialize(parse(raw)) === canonical(raw)` đối với 100% các file fixture chuẩn và 30 file corpus.
   - Tính bất biến (Idempotent): `serialize(parse(serialize(parse(x)))) === serialize(parse(x))`.
3. **Bảo toàn dữ liệu biên**:
   - GFM Table không bị nuốt thành chuỗi rỗng (bọc nguyên vẹn trong `rawBlock`).
   - Cú pháp ảnh `![alt](url "title")` giữ nguyên `src`, `alt`, `title`.
   - HTML nội dòng (`<b>`, `<kbd>`, `<br>`) không bị bóc tách hay biến dạng thành ký tự lạ.
   - Footnotes (`[^1]` và `[^1]: ...`) không bị escape dấu gạch chéo ngược.
   - Frontmatter chỉ nhận diện khối YAML có dòng mở/đóng `---` độc lập; hai đường kẻ ngang `---` kẹp văn bản thường không bị biến thành frontmatter.
4. **Tài liệu & Chuẩn hóa**:
   - Có đầy đủ `docs/tasks/phase-2.md` và `docs/architecture/markdown-normalizations.md`.
   - Các hành vi biến đổi cú pháp phải nằm trong danh mục chuẩn hóa CommonMark đã phê duyệt.