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
| **TD-03** | Khoảng trắng 1–3 hoặc tab đầu dòng trước ký hiệu mở lại thành block | Task 2.4c Mục 4 | Thấp | Phase 3 | Mở (Open) |
| **TD-04** | Văn bản gõ entity số `&#35;`, `&#..;` mở lại bị giải mã | Task 2.4c Mục 4 | Thấp | Phase 3 | Mở (Open) |
| **TD-05** | URL trần có `_` bị escape thành `\_` hiển thị dấu `\` | Task 2.4c Mục 4 | Thấp | Phase 3 | Mở (Open) |
| **TD-06** | Các dị biệt inline: tiêu đề kết thúc ` #`, code span dời cách, `<img />`, Setext đa dòng | Task 2.4c Mục 4 | Thấp | Phase 3 | Mở (Open) |
| **TD-07** | Blockquote chứa duy nhất đoạn trống (`>\n`) mất trên serialize lần 2 | Task 2.4c Ma trận 3b | Thấp | Phase 3 | Mở (Open) |
| **TD-08** | Task item chứa block non-text bị marked parse thành bullet text `[ ]` | Task 2.4c Ma trận 3b | Thấp | Phase 3 | Mở (Open) |
| **TD-09** | HorizontalRule ở vị trí only/first trong list item không có đoạn văn neo | Task 2.4c Ma trận 3b | Thấp | Phase 3 | Mở (Open) |
| **TD-10** | Khối phức tạp trong ordered/bullet list không idempotent do thụt lề 3-space của marked | Task 2.4c Ma trận 3b | Thấp | Phase 3 | Mở (Open) |

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

---

### TD-03: Khoảng trắng 1–3 hoặc tab đầu dòng trước ký hiệu mở lại thành block

- **Chuỗi/JSON tái hiện:**
  - Chuỗi Markdown: `"  # Heading"` hoặc `"\tTabbed text"`
  - JSON Content: `{ type: 'paragraph', content: [{ type: 'text', text: '  # Heading' }] }`
- **Hành vi hiện tại:**
  - Khi serialize, văn bản xuất `"  # Heading"`. Khi parse lại, CommonMark cho phép thụt lề 1–3 khoảng trắng trước ATX heading nên nhận diện nhầm thành heading level 1 thay vì paragraph. Dấu tab đầu dòng có thể bị hiểu nhầm thành indented code block.
- **Hành vi mong muốn:**
  - Khoảng trắng dẫn trước ký hiệu syntax phải được escape hoặc mã hóa ký tự (`&#32;`) để bảo tồn tuyệt đối node paragraph.
- **Phase dự kiến xử lý:** Phase 3 (Parser/Serializer hardening).

---

### TD-04: Văn bản gõ entity số `&#35;`, `&#..;` mở lại bị giải mã

- **Chuỗi/JSON tái hiện:**
  - Chuỗi Markdown: `"&#35; hashtag"`
  - JSON Content: `{ type: 'paragraph', content: [{ type: 'text', text: '&#35; hashtag' }] }`
- **Hành vi hiện tại:**
  - Khi serialize và parse lại, marked giải mã HTML numeric entity `&#35;` thành `# hashtag`, sau đó mở lại thành heading.
- **Hành vi mong muốn:**
  - Ký tự `&` của entity số khi người dùng gõ trong văn bản thuần cần được escape thành `&amp;#35;` để bảo toàn chuỗi ký tự gốc.
- **Phase dự kiến xử lý:** Phase 3.

---

### TD-05: URL trần có `_` bị ghi `x\_y`, mở lại chữ hiển thị chứa `\`

- **Chuỗi/JSON tái hiện:**
  - Chuỗi Markdown: `"http://example.com/x_y"`
  - JSON Content: `{ type: 'paragraph', content: [{ type: 'text', text: 'http://example.com/x_y' }] }`
- **Hành vi hiện tại:**
  - Tiptap markdown serializer tự động escape dấu gạch dưới trong từ thành `http://example.com/x\_y`. Khi parse lại thành link, text hiển thị chứa dấu gạch chéo ngược `\`.
- **Hành vi mong muốn:**
  - URL trần hoặc link URL không được escape ký tự `_` bên trong URI.
- **Phase dự kiến xử lý:** Phase 3.

---

### TD-06: Các dị biệt inline: tiêu đề kết thúc ` #`, code span dời cách, `<img />`, Setext đa dòng

- **Chuỗi/JSON tái hiện:**
  1. Tiêu đề kết thúc bằng ` #`: `"## Title #\n"` -> mất ` #` do chuẩn hóa ATX heading.
  2. Code span có khoảng trắng đầu/cuối: `` ` code ` `` -> serializer dời khoảng trắng ra ngoài `` `code` ``.
  3. Thẻ `<img ...>` nội dòng -> bị thêm khoảng trắng và gạch chéo `<img ... />`.
  4. Tiêu đề Setext nhiều dòng: Không idempotent qua các vòng round-trip liên tiếp.
- **Hành vi hiện tại:**
  - Chuẩn hóa mặc định của serializer làm thay đổi một số chi tiết định dạng vi mô.
- **Hành vi mong muốn:**
  - Bộ serializer có rule tùy biến để giữ nguyên vẹn trailing hashes, code span spaces, và cú pháp img inline.
- **Phase dự kiến xử lý:** Phase 3.

---

### TD-07: Blockquote chứa duy nhất đoạn trống (`>\n`) mất trên serialize lần 2

- **Chuỗi/JSON tái hiện:**
  - JSON Content: `{ type: 'doc', content: [{ type: 'blockquote', content: [{ type: 'paragraph' }] }] }`
  - Đầu ra serialize lần 1: `">\n"`
- **Hành vi hiện tại:**
  - Serialize ra `">\n"`. Marked parse chuỗi này thành `{ type: 'blockquote', content: [] }` (blockquote không có content). Khi serialize lần 2, do content rỗng nên serializer xuất ra `""`, làm mất blockquote.
- **Hành vi mong muốn:**
  - Khi parse `">\n"`, parser tái tạo một empty paragraph bên trong blockquote để bảo đảm tính idempotent.
- **Phase dự kiến xử lý:** Phase 3 (Parser review).

---

### TD-08: Task item chứa block non-text bị marked parse thành bullet text `[ ]`

- **Chuỗi/JSON tái hiện:**
  - Các tổ hợp ma trận: `taskList>taskItem` x {`emptyParagraph`, `heading`, `horizontalRule`, `emptyCodeBlock`, `codeBlockX`, `rawBlock`} ở vị trí `only` hoặc `first`.
  - Ví dụ: `{ type: 'taskList', content: [{ type: 'taskItem', attrs: { checked: false }, content: [{ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Title' }] }] }] }`
  - Đầu ra serialize: `"- [ ] ## Title\n"`
- **Hành vi hiện tại:**
  - Cú pháp GFM yêu cầu sau `- [ ] ` phải là inline text. Khi chứa heading hoặc code block ngay sau checkbox, marked parse `- [ ]` thành văn bản danh sách thường chứa text `"[ ]"`, serialize lần 2 thành `"- [ ] \\## Title\n"`.
- **Hành vi mong muốn:**
  - Parser hoặc serializer có cơ chế bọc kén hoặc indent phù hợp cho các khối phức tạp nằm trong task list item.
- **Phase dự kiến xử lý:** Phase 3.

---

### TD-09: HorizontalRule ở vị trí only/first trong list item không có đoạn văn neo

- **Chuỗi/JSON tái hiện:**
  - JSON Content: `{ type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'horizontalRule' }] }] }`
  - Đầu ra serialize: `"- ---\n"`
- **Hành vi hiện tại:**
  - Thiếu paragraph đi trước để neo listItem, marked phân tích `- ---` thành thematic break hoặc tiêu đề gạch ngang ngoài danh sách.
- **Hành vi mong muốn:**
  - Serializer sinh ký tự phân cách có thụt lề chuẩn hoặc chèn placeholder paragraph để giữ cấu trúc listItem.
- **Phase dự kiến xử lý:** Phase 3.

---

### TD-10: Khối phức tạp trong ordered/bullet list không idempotent do thụt lề 3-space của marked

- **Chuỗi/JSON tái hiện:**
  - Các tổ hợp:
    + `bulletList>listItem` x {`heading`, `codeBlock`, `rawBlock`} @ first/middle.
    + `orderedList>listItem` x {`emptyParagraph`, `heading`, `codeBlock`, `rawBlock`, `horizontalRule`} @ first/middle/last.
- **Hành vi hiện tại:**
  - Tiptap markdown serializer thụt lề cấp con danh sách có số bằng 3 khoảng trắng (`   `), trong khi CommonMark quy định continuation indent của block bên trong list item cần 4 khoảng trắng (`    `). Marked cắt bỏ thụt lề và tách các khối phức tạp ra khỏi list item.
- **Hành vi mong muốn:**
  - Tùy biến `renderNestedMarkdownContent` hoặc custom list extensions để sinh đúng 4 khoảng trắng thụt lề theo chuẩn CommonMark Spec.
- **Phase dự kiến xử lý:** Phase 3.

