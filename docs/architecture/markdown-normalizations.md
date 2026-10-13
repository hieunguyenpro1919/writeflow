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
- **Hợp nhất danh sách bullet liền kề (Task 2.5f)**:
  - Khi các khối danh sách bullet liền kề nhau phân tách bởi dòng trống (thường gặp trong changelog hoặc lịch sử phát triển như `express-history.md`), parser hợp nhất chúng thành một khối danh sách duy nhất, bảo toàn nguyên vẹn 100% các mục con và cấu trúc lồng, đạt tính ổn định idempotent tuyệt đối ($s_1 \equiv s_2 \equiv s_3$).
- **Bảo toàn khối mã lồng trong danh sách (Task 2.5f-fix, B9 & B10)**:
  - Khối mã (`codeBlock`) lồng trong danh sách bullet và danh sách số (ordered list) được bảo toàn nguyên vẹn nội dung byte-for-byte. Thụt lề nội dung code block được căn chỉnh chuẩn xác theo rào cú pháp (`fence marker`), triệt tiêu độ lệch khoảng trắng (off-by-one indent).

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
- **Phân cách giữa các định nghĩa tham chiếu liên tiếp (Task 2.5d Bước 0)**:
  - Khi hai khối định nghĩa tham chiếu (`reference_def`) đứng liền kề nhau ở cấp gốc (root document), chúng được ngăn cách bằng 1 ký tự xuống dòng `\n` thay vì 2 ký tự xuống dòng `\n\n`.
  - Giúp bảo toàn phong cách trình bày liên tiếp của các khối tham chiếu (ví dụ `express-readme.md`) tại điểm ghép khối AST mà không làm ảnh hưởng dòng trống trong các khối khác (code block, raw HTML, list).

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

## 9. Thẻ HTML nội dòng & Ngắt dòng Tiêu đề (Task 2.5d-fix)
- **Thẻ HTML nội dòng dưới dạng nút nguyên tử (`rawHtmlTag`)**:
  - Mọi thẻ HTML nội dòng (mở, đóng, tự đóng, void như `<wbr>`, `<hr>`) không thuộc nhóm định dạng canonical (`i`, `em`, `strong`, `del`, `s`, `strike`, `a`, `img`, `br`) được bảo toàn byte-for-byte dưới dạng nút nguyên tử `rawHtmlTag`.
  - Các thẻ lồng nhau, thẻ chưa đóng (`<b>chưa đóng`), thẻ đóng cọc cạch (`<b>x</i>`), và các thuộc tính (`data-x='1'`, `title="a &amp; b"`) được giữ nguyên 100%.
  - Thẻ nguy hiểm (`<script>`, `<iframe>`, `<style>`, `<form>`, `<input>`, ...) được bảo vệ thành node trơ `<span data-raw-html-tag>`, tuyệt đối không sinh ra thẻ thực thi trong DOM editor.
- **Ngắt dòng cứng trong Tiêu đề Heading**:
  - Ngắt dòng cứng bên trong tiêu đề (ví dụ `# a<br>b`) được xuất ra dưới dạng `<br>` nguyên văn (thay vì dấu gạch chéo ngược `\`), đảm bảo cú pháp heading hợp lệ và idempotent tuyệt đối qua nhiều lần lưu.

## 10. Phạm vi hóa Khôi phục Entity, Footnote & Reference (Task 2.5e+g Bước 0)
- **Giới hạn phạm vi ở nút văn bản thường**:
  - Gỡ bỏ hoàn toàn mọi thao tác thay thế regex trên toàn chuỗi đầu ra (`serializer.ts`).
  - Việc khôi phục entity (`&copy;`, `&#35;`), tham chiếu footnote (`[^id]`), và chuẩn hóa đầu dòng reference definition (`\[ref]:`) được giới hạn phạm vi chặt chẽ trong các nút văn bản thường của `CustomParagraph` và `CustomHeading`.
  - Khối mã (`codeBlock`), code trong dòng (code span), khối HTML thô (`rawBlock`), và thẻ HTML (`rawHtmlTag`) được bảo toàn 100% nguyên văn, không bị biến dạng hay thay thế chuỗi.

## 11. Escape Tối Thiểu và Cảnh Báo GitHub Alerts (Task 2.5e+g Phần 1 & 2)
- **Escape tối thiểu cho văn bản thường (N1)**:
  - `&`: Chỉ chuyển thành `&amp;` khi theo sau là mẫu entity (`&#?\w+;`); các trường hợp văn bản thông thường như `R&D`, `AT&T`, `C&A`, `1 < 2 && 3 > 2`, `supports & pick one` được giữ nguyên ký tự `&` thuần.
  - `>`: Chỉ escape thành `&gt;` khi đứng ở đầu dòng (để tránh biến thành blockquote); giữa dòng (như `Node >= 20`, `a > b`) được giữ nguyên ký tự `>`.
  - `<`: Chỉ escape khi tạo thành thẻ HTML, comment hoặc autolink (dạng `<tag>`, `<b>x</b>`, `<!-- c -->`, `<https://x>`); các biểu thức so sánh như `a < b`, `x<y`, `1 < 2` được giữ nguyên ký tự `<`.
- **Cảnh báo GitHub Alerts (B8)**:
  - Dòng đầu tiên của khối trích dẫn `blockquote` có dạng `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`, `> [!CAUTION]` (không phân biệt hoa thường) được giữ nguyên byte-for-byte, không bị escape thành `> \[!NOTE\]`.
  - Các cấu trúc danh sách hoặc khối mã đi kèm bên trong trích dẫn alert được giữ nguyên vẹn cấu trúc và độ thụt lề chuẩn, không bị chèn thêm dòng `>` trống giữa alert header và khối mã (Task 2.5f).

## 12. Chuẩn hóa Thực thể và Thoát Đầu Dòng Văn Bản Thường (Task 2.5f)
- **Chuẩn hóa thực thể HTML trong văn bản thường**:
  - Khi phân tích vào AST rồi xuất ra, các thực thể HTML văn bản thường được giải mã/chuẩn hóa:
    + `&amp;` -> `&`
    + `&lt;` -> `<`
    + `&#35;` -> `#`
  - Các thực thể có ngữ nghĩa đặc biệt hoặc định dạng được giữ nguyên: `&copy;`, `&nbsp;`.
- **Thoát ký tự trích dẫn đầu dòng `\>` thành `&gt;`**:
  - Khi người dùng gõ `\>` ở đầu dòng văn bản thường trong editor hoặc tệp nguồn, serializer chuẩn hóa thành `&gt;` (thay vì để `\>` dễ bị hiểu nhầm hoặc biến đổi) để đảm bảo an toàn khối và tính idempotent tuyệt đối khi mở lại.