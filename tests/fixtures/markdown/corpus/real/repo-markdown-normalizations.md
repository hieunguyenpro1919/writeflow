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
- **Dòng trống phân cách trong khối chứa (Task 2.4c Nhóm C)**:
  - Khi một đường kẻ ngang (`---`) nằm ngay sau một đoạn văn trong khối danh sách (`listItem`), Serializer chèn thêm một dòng trống (`\n  \n  ---`) để tạo cấu trúc:
    ```markdown
    - Đoạn văn
      
      ---
    ```
  - Lý do: Dòng trống này chứa hai dấu cách thụt lề. Mặc dù linter có thể tự động xóa hai dấu cách này, nội dung vẫn hoàn toàn đúng ngữ nghĩa theo CommonMark.

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
- **URL trần trong văn bản (Sau Task 2.5a)**:
  - Dấu `_` và `*` trong chuỗi bắt đầu bằng `http://`, `https://` hoặc `www.` không bị escape.
  - Vào: `http://a.com/x_y`
  - Ra: `http://a.com/x_y`. Khi mở lại, trình phân tích tự nhận là liên kết (autolink GFM). Nội dung chữ không đổi nhưng được gắn mark liên kết (Hành vi chuẩn GFM).

## 5. Khối mã (Code Blocks) & Khối trích dẫn (Blockquotes)
- **Fenced Code Blocks**:
  - Khối mã dùng dấu ngã `~~~` hoặc khối mã thụt 4 khoảng trắng (indented code block) được chuẩn hóa thành fenced code block bằng dấu huyền ```` ``` ```` với số lượng backtick động tương ứng nội dung.
- **Lazy Blockquotes**:
  - Các dòng lazy blockquote thiếu ký tự `>` ở các dòng kế tiếp sẽ được thêm tiền tố `>` đồng nhất ở đầu mỗi dòng trích dẫn.
- **Trích dẫn chỉ chứa đoạn trống (Task 2.5a - TD-07)**:
  - Khối trích dẫn (`blockquote`) chỉ chứa các đoạn văn trống (kể cả nhiều đoạn trống liên tiếp) được ghi thành chuỗi rỗng `""` ngay từ lần đầu (lần lưu 1 == lần lưu 2), đảm bảo tính idempotent tuyệt đối.

## 6. Định dạng nội dòng (Inline Formatting)
- **Italic**: `_italic_` được chuẩn hóa thành `*italic*` theo chuẩn canonical của CommonMark serializer.
- **Snake Case Escaping**: Ký tự gạch dưới giữa từ như `snake_case` được tự động escape thành `snake\_case` để tránh nhầm lẫn với cú pháp nhấn mạnh in nghiêng của markdown lexer.
- **Bảo toàn ký tự trong URL trần (Task 2.5a - TD-05)**: Trong văn bản không có mark link, chuỗi bắt đầu bằng `http://`, `https://` hoặc `www.` (kéo dài đến khoảng trắng hoặc ký tự `<`, `>`) thì KHÔNG escape `_`, `*`, `~`, `&` bên trong chuỗi đó. Ngoài chuỗi URL, cơ chế escape `\_` vẫn được giữ nguyên vẹn.

## 7. Ký tự thoát & Ngắt dòng (Escaping & Line Breaks)
- **Ngắt dòng cứng (Hard Line Break - Plan 9.3 & Task 2.4c Nhóm B)**:
  - Thẻ `<br>` hoặc 2 khoảng trắng cuối dòng được chuẩn hóa thành dấu gạch chéo ngược `\` ở cuối dòng (`\\\n`), loại bỏ rủi ro bị các công cụ format/linter tự động xóa bỏ trailing spaces.
  - Xóa khoảng trắng thừa (trailing spaces) vô nghĩa ở cuối các dòng văn bản thông thường.
  - **Bỏ ngắt dòng cứng ở cuối khối (Task 2.4c Nhóm B)**: Khi lưu, ngắt dòng cứng ở cuối khối bị bỏ. 
    + Vào: `a` rồi ngắt dòng.
    + Ra: `a\n`.
- **Ký tự thoát không cần thiết**: Các ký tự `\#`, `\.`, `\|` khi không nằm trong ngữ cảnh xung đột cú pháp sẽ được bỏ dấu `\` để văn bản tự nhiên.
- **Thoát ký tự đầu dòng đoạn văn (Line-Start Syntax Escaping - Plan 9.5 P0 & Task 2.4c Nhóm D)**:
  - Để ngăn chặn việc văn bản thuần bị biến thành cấu trúc khối (Block Structures) khi mở lại (Round-trip), Serializer tự động thêm dấu thoát `\` khi dòng bắt đầu bằng các cú pháp đặc thù (theo sau bởi khoảng trắng hoặc kết thúc dòng):
    + Heading: `^(#{1,6})(\s+|$)` (kể cả dòng chỉ có `#` đơn độc) -> `\#` hoặc `\######`
    + Ordered List: `^([0-9]+)([.)])(\s+|$)` (ví dụ `1.`, `1986.`, `1)`) -> `1\.`, `1986\.`, `1\)`
    + Bullet List: `^([-+*])(\s+|$)` (kể cả dòng chỉ có `+`, `-`, `*`) -> `\+`, `\-`, `\*`
    + Task List: `- [ ] `, `- [x] ` -> `\- \[ \] `, `\- \[x\] `
    + Định nghĩa tham chiếu dạng văn bản thuần: `^(\[[^\]]+\]:)` (ví dụ `[ref]: http://x`) -> `\[ref]: http://x` (bảo toàn dấu thoát ngoặc vuông mở để không bị parse nhầm thành reference definition)
    + Horizontal Rule: `---` -> `\---`
    + Blockquote: `> ` -> `\> `
    + Indented Code: 4 khoảng trắng đầu dòng `    ` -> `&#32;   `
    + Fenced Code: ```` ``` ```` hoặc `~~~` -> `\``` ` hoặc `\~~~`
    + Plain Text Tags: `<tag>`, `<b>`, `<a>` -> `\<tag>`, `\<b`, `\<a`
    + HTML Entities: `&amp;`, `&lt;`, `&copy;` -> serialize dưới dạng escaped entities (`&amp;amp;`, `&amp;lt;`, `\&copy;`).
    + Dòng bắt đầu bằng `[tên]:` trong văn bản thường được escape dấu `[` (`\[ref]: ...`).

## 8. Xử lý Đoạn Trống (Empty Paragraphs)
- Một đoạn trống giữa hai đoạn ra đúng một dòng trống kép.
  + Vào: đoạn `a`, đoạn trống, đoạn `b`.
  + Ra: `a\n\n\n\nb\n`.
- Từ đoạn trống thứ hai trở đi (liên tiếp) được ghi thành `&nbsp;` trên dòng riêng và mở lại thành đoạn trống.
- Đoạn trống ở **đầu file** ra dòng trống đầu file.
- Đoạn trống ở **cuối file** (một đoạn) bị bỏ. Từ hai đoạn trở lên thì đoạn cuối còn lại dạng `&nbsp;`.