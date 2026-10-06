# Danh mục Chuẩn hóa Cú pháp Markdown (Markdown Normalizations)

Tài liệu này ghi nhận và phê duyệt các biến đổi cú pháp được chấp nhận trong quá trình Parse -> Serialize của WriteFlow theo quy định tại `docs/PLAN.md` (Mục 9.3, 9.5) và chuẩn CommonMark/GFM. Mọi biến đổi nằm ngoài danh sách này đều bị coi là lỗi mất dữ liệu (data loss).

---

## 1. Tiêu đề (Headings)
- **Setext Headings -> ATX Headings**:
  - Tiêu đề gạch chân dạng:
    ```markdown
    Tiêu đề cấp 1
    =============
    ```
    sẽ được chuẩn hóa thành dạng ATX:
    ```markdown
    # Tiêu đề cấp 1
    ```
  - Lý do: Chuẩn hóa cú pháp thống nhất cho toàn bộ hệ thống văn bản.
- **Closed ATX Headings (`## Heading ##`)**:
  - Dạng đóng ATX như `## Tiêu đề ##` được chuẩn hóa thành dạng chuẩn mở `## Tiêu đề`.

## 2. Danh sách (Lists & Task Lists)
- **Thụt lề danh sách lồng**:
  - Bullet list (`- `) thụt lề chuẩn 2 khoảng trắng cho cấp con.
  - Ordered list (`1. `) thụt lề chuẩn 3 khoảng trắng tương ứng với độ rộng ký tự đánh số.
- **Danh sách lỏng (Loose List) -> Danh sách chặt (Tight List)**:
  - Khi người dùng không có chủ đích phân đoạn văn trong từng mục danh sách, các khoảng trống thừa giữa các bullet item sẽ được gom gọn theo chuẩn canonical.

## 3. Đường kẻ ngang (Thematic Breaks / Horizontal Rules)
- **Chuẩn hóa ký tự**:
  - Các biến thể như `***`, `___`, hoặc `* * *` khi xuất ra sẽ được chuẩn hóa thành `---` đứng riêng dòng có dòng trống cách ly.

## 4. Liên kết & Đường dẫn (Links)
- **Reference-style Links -> Inline Links**:
  - Cú pháp tham chiếu:
    ```markdown
    Xem tại [Trang chủ][1]
    [1]: https://example.com
    ```
    được phân giải và xuất ra thành liên kết nội dòng trực tiếp:
    ```markdown
    Xem tại [Trang chủ](https://example.com)
    ```
- **Autolinks & Bare URLs**:
  - Dạng `<https://example.com>` hoặc bare URL `https://example.com` được chuẩn hóa thành `[https://example.com](https://example.com)`.

## 5. Khối mã (Code Blocks) & Khối trích dẫn (Blockquotes)
- **Fenced Code Blocks**:
  - Khối mã dùng dấu ngã `~~~` hoặc khối mã thụt 4 khoảng trắng (indented code block) được chuẩn hóa thành fenced code block bằng dấu huyền ```` ``` ```` với số lượng backtick động tương ứng nội dung.
- **Lazy Blockquotes**:
  - Các dòng lazy blockquote thiếu ký tự `>` ở các dòng kế tiếp sẽ được thêm tiền tố `>` đồng nhất ở đầu mỗi dòng trích dẫn.

## 6. Định dạng nội dòng (Inline Formatting)
- **Italic**: `_italic_` được chuẩn hóa thành `*italic*` theo chuẩn canonical của CommonMark serializer.
- **Snake Case Escaping**: Ký tự gạch dưới giữa từ như `snake_case` được tự động escape thành `snake\_case` để tránh nhầm lẫn với cú pháp nhấn mạnh in nghiêng của markdown lexer.

## 7. Ký tự thoát & Ngắt dòng (Escaping & Line Breaks)
- **Ngắt dòng cứng (Hard Line Break - Plan 9.3)**:
  - Thẻ `<br>` hoặc 2 khoảng trắng cuối dòng được chuẩn hóa thành dấu gạch chéo ngược `\` ở cuối dòng (`\\\n`), loại bỏ rủi ro bị các công cụ format/linter tự động xóa bỏ trailing spaces.
  - Xóa khoảng trắng thừa (trailing spaces) vô nghĩa ở cuối các dòng văn bản thông thường.
- **Ký tự thoát không cần thiết**: Các ký tự `\#`, `\.`, `\|` khi không nằm trong ngữ cảnh xung đột cú pháp sẽ được bỏ dấu `\` để văn bản tự nhiên.
- **Thoát ký tự đầu dòng đoạn văn (Line-Start Syntax Escaping - Plan 9.5 P0)**:
  - Để ngăn chặn việc văn bản thuần bị biến thành cấu trúc khối (Block Structures) khi mở lại (Round-trip), Serializer tự động thêm dấu thoát `\` khi dòng bắt đầu bằng các cú pháp đặc thù:
    + Heading: `# ` hoặc `## ` -> `\# ` hoặc `\## `
    + Ordered List: `^[0-9]+[\.\)] ` (ví dụ `1. `, `1986. `, `1) `) -> `1\. `, `1986\. `, `1\) `
    + Bullet List: `- `, `+ `, `* ` -> `\- `, `\+ `, `\* `
    + Task List: `- [ ] `, `- [x] ` -> `\- \[ \] `, `\- \[x\] `
    + Horizontal Rule: `---` -> `\---`
    + Blockquote: `> ` -> `\> `
    + Indented Code: 4 khoảng trắng đầu dòng `    ` -> `&#32;   ` (ngăn indented code block và phục hồi 4 dấu cách khi parse)
    + Fenced Code: ```` ``` ```` hoặc `~~~` -> `\``` ` hoặc `\~~~`
    + Plain Text Tags: `<tag>`, `<b>`, `<a>` -> `\<tag>`, `\<b`, `\<a` (ngăn nhận diện nhầm thành rawBlock / rawInline)
    + HTML Entities: `&amp;`, `&lt;`, `&copy;` -> serialize dưới dạng escaped entities (`&amp;amp;`, `&amp;lt;`, `\&copy;`) để phục hồi 100% văn bản người dùng gõ.