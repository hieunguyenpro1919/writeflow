# SỔ THEO DÕI NỢ KỸ THUẬT (TECHNICAL DEBT TRACKING)

**Dự án:** WriteFlow — Trình soạn thảo Markdown WYSIWYG  
**Trạng thái:** Kích hoạt (Active)  
**Khởi tạo:** Phase 2 (Task 2.1)  
**Quy tắc:** Mọi nợ kỹ thuật phát sinh hoặc tạm hoãn từ các phase trước phải được đánh mã số định danh, mô tả chi tiết nguyên nhân, rủi ro và quy hoạch giải quyết triệt để tại phase mục tiêu. Không được bỏ qua hoặc xóa mục nợ kỹ thuật khi chưa có giải pháp thay thế và bài kiểm thử xác nhận.

---

## 1. BẢNG TỔNG HỢP NỢ KỸ THUẬT

| Mã         | Hạng mục                                                                                                    | Nguồn gốc                            | Mức độ                    | Phase xử lý                            | Trạng thái                                                                                                                                                                                 |
| :--------- | :---------------------------------------------------------------------------------------------------------- | :----------------------------------- | :------------------------ | :------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TD-01**  | Cảnh báo kích thước gói bundle vượt 500 kB (~678 kB JS)                                                     | Phase 1 (Core Editor)                | Trung bình                | Phase 3                                | Mở (Open)                                                                                                                                                                                  |
| **TD-02**  | Bắt sự kiện IME qua tham chiếu toàn cục `window.event` trong `SmartKeysExtension`                           | Phase 1 (Task 1.9)                   | Trung bình                | Phase 2 (Task 2.6c)                    | Đã giải quyết (Task 2.6c: bảo vệ IME composition toàn diện qua PasteSanitizerExtension)                                                                                                    |
| **TD-03**  | Khoảng trắng 1–3 hoặc tab đầu dòng trước ký hiệu mở lại thành block                                         | Task 2.4c Mục 4                      | Thấp                      | Chấp nhận có điều kiện                 | Chấp nhận có điều kiện, ủy quyền ngày 07/10/2026. (Hết hiệu lực nếu corpus Task 2.5b báo lỗi mất dữ liệu trên file thật)                                                                   |
| **TD-04**  | Văn bản gõ entity số `&#35;`, `&#..;` mở lại bị giải mã                                                     | Task 2.4c Mục 4                      | Thấp                      | Chấp nhận có điều kiện                 | Chấp nhận có điều kiện, ủy quyền ngày 07/10/2026. (Hết hiệu lực nếu corpus Task 2.5b báo lỗi)                                                                                              |
| **TD-05**  | URL trần có `_` bị escape thành `\_` hiển thị dấu `\`                                                       | Task 2.4c Mục 4                      | Thấp                      | Đã sửa (Task 2.5a, 2.5a-fix)           | Đã sửa (Task 2.5a, 2.5a-fix)                                                                                                                                                               |
| **TD-05b** | Tiêu đề chứa URL có `_` (ví dụ `## http://a.com/x_y`) bị ghi `x\_y`                                         | Task 2.5a-fix                        | Thấp                      | Chấp nhận có điều kiện                 | Chấp nhận có điều kiện (ủy quyền ngày 07/10/2026, hết hiệu lực nếu corpus có file thật bị ảnh hưởng)                                                                                       |
| **TD-06**  | Các dị biệt inline: tiêu đề kết thúc ` #`, code span dời cách, `<img />`, Setext đa dòng                    | Task 2.4c Mục 4                      | Thấp                      | Chấp nhận có điều kiện                 | Chấp nhận có điều kiện, ủy quyền ngày 07/10/2026. (Hết hiệu lực nếu corpus Task 2.5b báo lỗi)                                                                                              |
| **TD-07**  | Blockquote chứa duy nhất đoạn trống (`>\n`) mất trên serialize lần 2                                        | Task 2.4c Ma trận 3b                 | Thấp                      | Đã sửa (Task 2.5a, 2.5a-fix)           | Đã sửa (Task 2.5a, 2.5a-fix)                                                                                                                                                               |
| **TD-08**  | Task item chứa block non-text bị marked parse thành bullet text `[ ]`                                       | Task 2.4c Ma trận 3b                 | Trung bình                | Hoãn đến Phase 6                       | Hoãn đến Phase 6. Điều kiện cứng: phải sửa xong trước khi bật nút Task list trong UI                                                                                                       |
| **TD-09**  | HorizontalRule ở vị trí only/first trong list item không có đoạn văn neo                                    | Task 2.4c Ma trận 3b                 | Trung bình                | Phase 3 (Kiểm chứng Task 2.8)          | Mở (Open) — Kiểm chứng Task 2.8 xác nhận kết quả test ĐỎ (non-idempotent: marked bóc tách `- ---` thành root hr, s1 !== s2; giữ nguyên nợ theo yêu cầu Task 2.8, không sửa `src/`)      |
| **TD-10**  | Khối phức tạp trong ordered/bullet list không idempotent do thụt lề 3-space của marked                      | Task 2.4c Ma trận 3b                 | Trung bình                | Đã sửa (Task 2.5f-fix)                 | Đã sửa (Task 2.5f-fix) — Triệt tiêu lệch thụt lề và bảo toàn 100% khối mã trong danh sách (`oss/express-history.md`)                                                                       |
| **B9**     | Mất khối mã lồng trong danh sách ở `express-history.md` (3 khối mã bị mất)                                  | Upstream OSS (Task 2.5f-fix)         | Nghiêm trọng (Mất code)   | Đã sửa (Task 2.5f-fix)                 | Đã sửa (Task 2.5f-fix) — `CustomCodeBlock.parseMarkdown` hỗ trợ khối mã có thụt lề dẫn trước trong list item                                                                               |
| **B10**    | Dư dấu cách trong khối mã thuộc danh sách số (`npm i` thành `    npm i`)                                    | Upstream OSS (Task 2.5f-fix)         | Trung bình (Lệch thụt lề) | Đã sửa (Task 2.5f-fix)                 | Đã sửa (Task 2.5f-fix) — `OrderedList` tokenizer chuẩn hóa thụt lề nội dung khối mã con                                                                                                    |
| **B5b**    | Code span kết thúc bằng `\` (ví dụ `` `a\` ``) làm mất `**bold**` phía sau                                  | Upstream OSS & Repo (Task 2.5f-fix)  | Trung bình                | Đã sửa (Task 2.5f-fix)                 | Đã sửa (Task 2.5f-fix) — `safePunctuation` nhận biết fence code span, ngăn mask làm hỏng closing backtick                                                                                  |
| **TD-11**  | Inline HTML tags (`<abbr>`, `<b>`, `<code>`, `<kbd>`, `<mark>`, `<sub>`, `<sup>`) bị mất hoặc thoát         | Task 2.5b (Corpus)                   | Nghiêm trọng              | Đã sửa (Task 2.5d)                     | Đã sửa (Task 2.5d) — `RawInlineExtension` bảo toàn 100% thẻ inline HTML trên toàn bộ corpus                                                                                                |
| **TD-12**  | Thẻ HTML link/image mở rộng có thuộc tính tùy biến bị mất thuộc tính khi chuyển thành markdown link         | Task 2.5b (Corpus)                   | Trung bình                | Phase 2 (Đã chuẩn hóa Task 2.8)        | Chuẩn hóa được chấp nhận (Task 2.8) — Đã ghi nhận vào `markdown-normalizations.md` (thuộc tính tùy biến ngoài href, title, src, alt được chuẩn hóa về link/ảnh Markdown thông thường)      |
| **TD-13**  | Code span chứa ký tự phân cách thoát (`\~~~`, `\``` `) bị bọc thêm backtick và escape trên serialize lần 2  | Task 2.5b-fix (Corpus)               | Thấp                      | Đã sửa (Task 2.5c)                     | Đã sửa (Task 2.5c) — Xử lý cùng B3 (bảo toàn khoảng trắng code span) giúp `real/repo-markdown-normalizations.md` đạt idempotent tuyệt đối                                                  |
| **B2**     | Link bọc ảnh huy hiệu CI badge `[![badge](img)](url)` và dạng tham chiếu (B2b, B2c)                         | Upstream OSS (Task 2.5b-fix2)        | Nghiêm trọng (Mất URL)    | Đã sửa (Task 2.5c, Task 2.5c-fix)      | Đã sửa (Task 2.5c, Task 2.5c-fix) — `RawInlineNode` bảo toàn nguyên văn cả link inline, link tham chiếu và nhiều ảnh trong một link trên toàn bộ corpus                                    |
| **B6**     | Thẻ HTML `<a href><img></a>` bị bóc tách thành ảnh trần                                                     | Upstream OSS (Task 2.5b-fix2)        | Nghiêm trọng (Mất URL)    | Đã sửa (Task 2.5c)                     | Đã sửa (Task 2.5c) — `RawInlineNode` bảo toàn nguyên văn `<a href><img></a>` trên cả đoạn văn và tiêu đề                                                                                   |
| **B1b**    | Ngắt dòng cuối đoạn văn hoặc `<br>` để lại ký tự `\` gấp đôi thành `\\` trên vòng serialize thứ 2           | Upstream OSS (Task 2.5b-fix2)        | Trung bình (Group 3)      | Đã sửa (Task 2.5d)                     | Đã sửa (Task 2.5d) — Loại bỏ newlines dẫn trước và khoảng trắng rác sau hardBreak, đạt idempotent tuyệt đối                                                                                |
| **B8**     | GitHub callout alerts `> [!NOTE]` bị escape dấu ngoặc vuông thành `> \[!NOTE\]`                             | Upstream OSS (Task 2.5b-fix2)        | Thấp (Group 2)            | Đã sửa (Task 2.5e+g)                   | Đã sửa (Task 2.5e+g) — Tự động bảo toàn cú pháp GitHub callouts / alerts `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`, `> [!CAUTION]`                                         |
| **N1**     | Ký tự `&` giữa dòng trong văn bản thuần bị tự động chuyển thành HTML entity `&amp;`                         | Upstream OSS & Repo (Task 2.5b-fix2) | Thấp (Group 2)            | Đã sửa (Task 2.5e+g)                   | Đã sửa (Task 2.5e+g) — Áp dụng cơ chế escape tối thiểu cho văn bản thuần: `&` chỉ thành `&amp;` khi sau nó là mẫu entity; `>` chỉ escape ở đầu dòng; `<` chỉ escape khi tạo thành thẻ HTML |
| **TD-14**  | Code span chứa nguyên văn `<span data-raw-inline="" data-raw-comment="true">&lt;!-- x --&gt;</span>` bị đổi | Task 2.5d Bước 0                     | Thấp                      | Chấp nhận có điều kiện                 | Chấp nhận (hiếm khi xảy ra trong văn bản thực tế, chấp nhận để phục hồi comment trong code span)                                                                                           |
| **TD-15**  | Liên kết có thẻ bên trong bị tách thành hai link (ví dụ `[<sub>x</sub> y](url)`)                            | Task 2.5e+g                          | Trung bình                | Phase 2 Task Card riêng (trước Gate A) | Mở (Open)                                                                                                                                                                                  |
| **TD-17**  | Code span nhiều dòng kết thúc bằng `\`                                                                      | Task 2.5f-fix / Task 2.6a            | Thấp                      | Phase 2 (Task 2.7)                     | Đã kiểm chứng & Đóng (Task 2.7) — AST và bộ serialize bảo toàn 100% token bold và codespan                                                                                                 |

---

## 2. CHI TIẾT TỪNG MỤC NỢ KỸ THUẬT

### TD-01: Cảnh báo kích thước gói bundle vượt 500 kB (~678 kB)

- _(Như cũ)_

### TD-02: Chuẩn hóa cơ chế bắt sự kiện IME trong `SmartKeysExtension`

- **Cập nhật Task 2.6c:** Đã tích hợp `PasteSanitizerExtension` ngăn chặn can thiệp input rules / shortcuts khi `view.composing === true`. `SmartKeysExtension` duy trì an toàn và chuỗi sự kiện composition lifecycle (`compositionstart`, `compositionupdate`, `compositionend`) bảo toàn nguyên vẹn mã hóa Unicode NFC/NFD, được kiểm thử tự động tại `tests/unit/editor/task26c.test.ts`.

### TD-03: Khoảng trắng 1–3 hoặc tab đầu dòng trước ký hiệu mở lại thành block

- **Chuỗi/JSON tái hiện:**
  - Chuỗi Markdown: `"  # Heading"` hoặc `"\tTabbed text"`
  - JSON Content: `{ type: 'paragraph', content: [{ type: 'text', text: '  # Heading' }] }`
- **Hành vi hiện tại:** Khi serialize, văn bản xuất `"  # Heading"`. Khi parse lại, CommonMark cho phép thụt lề 1–3 khoảng trắng trước ATX heading nên nhận diện nhầm thành heading level 1 thay vì paragraph. Dấu tab đầu dòng có thể bị hiểu nhầm thành indented code block.
- **Hành vi mong muốn:** Khoảng trắng dẫn trước ký hiệu syntax phải được escape hoặc mã hóa ký tự (`&#32;`) để bảo tồn tuyệt đối node paragraph.

### TD-04: Văn bản gõ entity số `&#35;`, `&#..;` mở lại bị giải mã

- **Chuỗi/JSON tái hiện:**
  - Chuỗi Markdown: `"&#35; hashtag"`
  - JSON Content: `{ type: 'paragraph', content: [{ type: 'text', text: '&#35; hashtag' }] }`
- **Hành vi hiện tại:** Khi serialize và parse lại, marked giải mã HTML numeric entity `&#35;` thành `# hashtag`, sau đó mở lại thành heading.
- **Hành vi mong muốn:** Ký tự `&` của entity số khi người dùng gõ trong văn bản thuần cần được escape thành `&amp;#35;` để bảo toàn chuỗi ký tự gốc.

### TD-05: URL trần có `_` bị ghi `x\_y`, mở lại chữ hiển thị chứa `\`

- **Chuỗi/JSON tái hiện:**
  - Chuỗi Markdown: `"http://example.com/x_y"`
  - JSON Content: `{ type: 'paragraph', content: [{ type: 'text', text: 'http://example.com/x_y' }] }`
- **Hành vi hiện tại:** Tiptap markdown serializer tự động escape dấu gạch dưới trong từ thành `http://example.com/x\_y`. Khi parse lại thành link, text hiển thị chứa dấu gạch chéo ngược `\`.
- **Hành vi mong muốn:** URL trần hoặc link URL không được escape ký tự `_` bên trong URI.
- **Trạng thái:** Đã sửa (Task 2.5a, 2.5a-fix) (Serializer tự động phục hồi `_`, `*`, `~`, `&` trong URL trần thuộc paragraph bắt đầu bằng `http://`, `https://`, `www.`).

### TD-05b: Tiêu đề chứa URL có `_` (ví dụ `## http://a.com/x_y`) bị ghi `x\_y`

- **Chuỗi/JSON tái hiện:**
  - Chuỗi Markdown: `"## http://example.com/x_y"`
  - JSON Content: `{ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'http://example.com/x_y' }] }`
- **Hành vi hiện tại:** Vì logic bảo toàn URL trần hiện được đóng gói trong `CustomParagraph` để tránh ảnh hưởng codeBlock/rawBlock, URL trần nằm trực tiếp trong node `heading` vẫn bị escape `_` thành `\_`.
- **Hành vi mong muốn:** URL trần trong heading cũng không bị escape `_`.
- **Trạng thái:** Chấp nhận có điều kiện (ủy quyền ngày 07/10/2026, hết hiệu lực nếu corpus có file thật bị ảnh hưởng).

### TD-06: Các dị biệt inline: tiêu đề kết thúc ` #`, code span dời cách, `<img />`, Setext đa dòng

- **Chuỗi/JSON tái hiện:**
  1. Tiêu đề kết thúc bằng ` #`: `"## Title #\n"` -> mất ` #` do chuẩn hóa ATX heading.
  2. Code span có khoảng trắng đầu/cuối: `` ` code ` `` -> serializer dời khoảng trắng ra ngoài `` `code` ``.
  3. Thẻ `<img ...>` nội dòng -> bị thêm khoảng trắng và gạch chéo `<img ... />`.
  4. Tiêu đề Setext nhiều dòng: Không idempotent qua các vòng round-trip liên tiếp.
- **Hành vi hiện tại:** Chuẩn hóa mặc định của serializer làm thay đổi một số chi tiết định dạng vi mô.
- **Hành vi mong muốn:** Bộ serializer có rule tùy biến để giữ nguyên vẹn trailing hashes, code span spaces, và cú pháp img inline.

### TD-07: Blockquote chứa duy nhất đoạn trống (`>\n`) mất trên serialize lần 2

- **Chuỗi/JSON tái hiện:**
  - JSON Content: `{ type: 'doc', content: [{ type: 'blockquote', content: [{ type: 'paragraph' }] }] }`
  - Đầu ra serialize: `""` (chuỗi rỗng)
- **Hành vi hiện tại:** Ban đầu serialize ra `">\n"`, marked parse thành `{ type: 'blockquote', content: [] }`, serialize lần 2 thành `""` (không idempotent).
- **Hành vi mong muốn:** `blockquote` chỉ chứa các đoạn văn trống được serialize thành chuỗi rỗng `""` ngay từ lần đầu (lần lưu 1 == lần lưu 2).
- **Trạng thái:** Đã sửa trong Task 2.5a (`CustomBlockquote` trả về chuỗi rỗng khi chỉ chứa các empty paragraph, đảm bảo tính idempotent tuyệt đối).
- **Ghi chú (Task 2.5a-fix):** Blockquote lồng nhau chỉ chứa các đoạn trống (ví dụ `> >`) hiện chưa idempotent và sẽ được xử lý ở phase sau.

### TD-08: Task item chứa block non-text bị marked parse thành bullet text `[ ]`

- **Chuỗi/JSON tái hiện:**
  - Ví dụ: `{ type: 'taskList', content: [{ type: 'taskItem', attrs: { checked: false }, content: [{ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Title' }] }] }] }`
  - Đầu ra serialize: `"- [ ] ## Title\n"`
- **Hành vi hiện tại:** Cú pháp GFM yêu cầu sau `- [ ] ` phải là inline text. Khi chứa heading hoặc code block ngay sau checkbox, marked parse `- [ ]` thành văn bản danh sách thường chứa text `"[ ]"`, serialize lần 2 thành `"- [ ] \\## Title\n"`.
- **Hành vi mong muốn:** Parser hoặc serializer có cơ chế bọc kén hoặc indent phù hợp cho các khối phức tạp nằm trong task list item.

### TD-09: HorizontalRule ở vị trí only/first trong list item không có đoạn văn neo

- **Chuỗi/JSON tái hiện:**
  - JSON Content: `{ type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'horizontalRule' }] }] }`
  - Đầu ra serialize: `"- ---\n"`
- **Hành vi hiện tại:** Thiếu paragraph đi trước để neo listItem, marked phân tích `- ---` thành thematic break hoặc tiêu đề gạch ngang ngoài danh sách.
- **Hành vi mong muốn:** Serializer sinh ký tự phân cách có thụt lề chuẩn hoặc chèn placeholder paragraph để giữ cấu trúc listItem.
- **Kiểm chứng Task 2.8:** Đã bổ sung bộ test vector tại `tests/unit/markdown/task28.test.ts`. Kết quả kiểm chứng: **ĐỎ (RED)** — AST mất nút `bulletList`, `s1` (`"- ---\n"`) khác `s2` (`"---\n"`). Theo đúng chỉ thị Task 2.8 (khi test ĐỎ: giữ nguyên trạng thái ghi nợ, TUYỆT ĐỐI KHÔNG sửa `src/`), khoản nợ này tiếp tục duy trì mở và chuyển giao cho Phase 3 xử lý triệt để.

### TD-10: Khối phức tạp trong ordered/bullet list không idempotent do thụt lề 3-space của marked

- **Chuỗi/JSON tái hiện:**
  - Các file corpus thật bị ảnh hưởng: `real/oss-jest-guide.md`, `real/oss-react-tutorial.md`, `real/oss-rust-cli-guide.md`.
  - Cú pháp: Ordered list (`1. `) chứa khối mã fenced code block thụt lề.
- **Hành vi hiện tại:** Tiptap markdown serializer thụt lề cấp con danh sách có số bằng 3 khoảng trắng (`   `), trong khi CommonMark quy định continuation indent của block bên trong list item cần 4 khoảng trắng (`    `). Marked cắt bỏ thụt lề và tách các khối phức tạp ra khỏi list item ở vòng serialize thứ 2 (`s2 !== s1`).
- **Hành vi mong muốn:** Tùy biến `renderNestedMarkdownContent` hoặc custom list extensions để sinh đúng 4 khoảng trắng thụt lề theo chuẩn CommonMark Spec.
- **Mức độ & Kế hoạch:** Trung bình (Group 3). Cần sửa qua Task Card riêng trước Gate A.

### TD-11: Inline HTML tags (`<abbr>`, `<b>`, `<code>`, `<kbd>`, `<mark>`, `<sub>`, `<sup>`) bị mất hoặc thoát

- **Chuỗi/JSON tái hiện:**
  - Các file corpus bị ảnh hưởng: `14-html-mixed-raw.md`, `real/oss-github-cheatsheet.md`, `real/oss-katex-readme.md`, `real/oss-redux-readme.md`.
  - Chuỗi Markdown mẫu: `"Nhấn <kbd>Ctrl</kbd> + <kbd>B</kbd> để bật <b>Bold</b>"`, `"<mark>Text</mark>"`, `"H<sub>2</sub>O"`.
- **Hành vi hiện tại:** Do ProseMirror/Tiptap chưa có extension `rawInline` (hiện tại mới có `rawBlock`), các thẻ inline HTML không thuộc schema mặc định bị bóc tách mất thẻ (ví dụ `<mark>Text</mark>` thành `Text`, `H<sub>2</sub>O` thành `H2O`) hoặc bị serializer escape dấu `<`, `>`.
- **Hành vi mong muốn:** Cung cấp `rawInline` mark/node hoặc custom inline HTML preservation để giữ nguyên vẹn 100% cú pháp inline HTML mà không bị bóc tách hay escape.
- **Mức độ & Kế hoạch:** Đã sửa (Task 2.5d-fix) — Chuyển đổi mọi thẻ HTML nội dòng sang nút nguyên tử `rawHtmlTag`, bảo toàn 100% nguyên văn byte-for-byte, thẻ lồng nhau, thẻ chưa đóng/đóng sai, và đảm bảo an toàn DOM Editor.

### TD-12: Thẻ HTML link/image mở rộng có thuộc tính tùy biến bị mất thuộc tính khi chuyển thành markdown link

- **Chuỗi/JSON tái hiện:**
  - File corpus bị ảnh hưởng: `13-html-link-img-extended.md`.
  - Chuỗi Markdown mẫu: `"<a href=\"https://example.com/docs\" target=\"_blank\" rel=\"noopener\" class=\"btn\">Docs</a>"`
- **Hành vi hiện tại:** Khi parse lần 1, thẻ `<a>` có thuộc tính mở rộng (`target="_blank"`, `rel`, `class`) bị ProseMirror link mark chuẩn hóa thành markdown link đơn giản `[Docs](https://example.com/docs)`, làm mất các thuộc tính mở rộng của HTML tag gốc.
- **Hành vi mong muốn:** Nhận diện và kén bảo vệ toàn vẹn các thẻ HTML mở rộng (`<a>`, `<img>` có thuộc tính lạ) ở cấp inline thông qua `rawInline` để bảo toàn nguyên văn các thuộc tính mở rộng.
- **Mức độ & Kế hoạch:** Chuẩn hóa được chấp nhận (Task 2.8) — Đã chính thức ghi nhận vào danh mục chuẩn hóa cú pháp Markdown (`docs/architecture/markdown-normalizations.md` Mục 4). Thuộc tính tùy biến của thẻ `<a>` / `<img>` (ngoài href, title, src, alt) được chấp nhận loại bỏ khi chuẩn hóa thành link/ảnh Markdown thông thường nhằm duy trì cú pháp Markdown canonical gọn gàng.

### TD-13: Code span chứa ký tự phân cách thoát (`\~~~`, `\``` `) bị bọc thêm backtick và escape trên serialize lần 2

- **Chuỗi/JSON tái hiện:**
  - File corpus bị ảnh hưởng: `real/repo-markdown-normalizations.md`.
  - Chuỗi Markdown mẫu: `` e: ` ``` ` hoặc `~~~` -> `\``` ` hoặc `\~~~` ``
- **Hành vi hiện tại:** Vòng serialize thứ nhất sinh ra `` `\~~~` ``, nhưng vòng serialize thứ hai chuyển thành `` ` \~\~\~\` `` do bộ escape ký tự dấu ngã của serializer, dẫn đến `s2 !== s1` (không idempotent).
- **Hành vi mong muốn:** Bộ serializer kiểm tra ngữ cảnh code span và tránh escape trùng lặp các ký tự bên trong hoặc liền kề code span.
- **Mức độ & Kế hoạch:** Thấp (Group 3). Cần xử lý trước Gate A.

### B2: Link bọc ảnh huy hiệu CI badge `[![badge](img)](url)` bị mất link ngoài

- **Chuỗi/JSON tái hiện:**
  - File corpus bị ảnh hưởng: 15 file (`oss/axios-readme.md`, `oss/electron-readme.md`, `oss/jest-readme.md`, `oss/katex-readme.md`, `oss/markdown-it-readme.md`, `oss/marked-readme.md`, `oss/mermaid-readme.md`, `oss/prettier-readme.md`, `oss/react-readme.md`, `oss/redux-readme.md`, `oss/ripgrep-readme.md`, `oss/tiptap-readme.md`, `oss/vscode-readme.md`, `oss/zustand-readme.md`, `real/repo-readme.md`).
  - Chuỗi Markdown mẫu: `[![npm version](https://badge.fury.io/js/axios.svg)](https://badge.fury.io/js/axios)`
- **Hành vi hiện tại:** Tiptap schema xử lý node `image` là leaf node độc lập không lồng mark `link`, khiến link ngoài bọc ảnh bị loại bỏ hoàn toàn, chỉ còn lại `![npm version](https://badge.fury.io/js/axios.svg)`. Mất 100% URL điều hướng của badge.
- **Hành vi mong muốn:** Hỗ trợ link mark trên image node hoặc bọc ảnh trong link inline chuẩn CommonMark.
- **Mức độ & Kế hoạch:** Nghiêm trọng (Mất dữ liệu URL người dùng — Vi phạm Nguyên tắc số 10). Cần xử lý qua Task Card riêng trước Gate A.

### B6: Thẻ HTML `<a href><img></a>` bị bóc tách thành ảnh trần

- **Chuỗi/JSON tái hiện:**
  - File corpus bị ảnh hưởng: `oss/jest-readme.md`, `oss/katex-readme.md`, `oss/redux-readme.md`.
  - Chuỗi Markdown mẫu: `<a href="https://opencollective.com/jest"><img src="https://opencollective.com/jest/backers.svg"></a>`
- **Hành vi hiện tại:** DOMParser nhận diện thẻ `<img>` bên trong `<a>` và chuyển thành node image của ProseMirror mà không bảo tồn thẻ bao bọc `<a>`, làm mất liên kết tài trợ / nhà tài trợ.
- **Hành vi mong muốn:** Kén bảo vệ cấu trúc liên kết ảnh HTML thô qua `rawBlock` / `rawInline` hoặc link mark trên image.
- **Mức độ & Kế hoạch:** Nghiêm trọng (Mất URL). Cần xử lý qua Task Card riêng trước Gate A.

### B1b: Ngắt dòng cuối đoạn văn hoặc `<br>` để lại ký tự `\` gấp đôi thành `\\` trên vòng serialize thứ 2

- **Chuỗi/JSON tái hiện:**
  - File corpus bị ảnh hưởng: `oss/lodash-readme.md`, `oss/mermaid-readme.md`, `synthetic/12-html-inline-tags.md`.
  - Chuỗi Markdown mẫu: `"Line 1<br>\nLine 2"` hoặc `"Line 1\\\nLine 2"`
- **Hành vi hiện tại:** Thẻ `<br>` hoặc hardBreak ở cuối đoạn văn được serialize thành `\` ở cuối dòng. Vòng serialize thứ 2 nhận diện `\` như văn bản thường và escape thành `\\` (không idempotent: `s2 !== s1`).
- **Hành vi mong muốn:** Chuẩn hóa quy tắc HardBreak và trailing backslash của serializer để đảm bảo tính idempotent tuyệt đối.
- **Mức độ & Kế hoạch:** Đã sửa (Task 2.5d) — Loại bỏ newlines dẫn trước và khoảng trắng rác sau hardBreak, đạt idempotent tuyệt đối.

### B8: GitHub callout alerts `> [!NOTE]` bị escape dấu ngoặc vuông thành `> \[!NOTE\]`

- **Chuỗi/JSON tái hiện:**
  - File corpus bị ảnh hưởng: `oss/axios-readme.md`, `oss/lodash-readme.md`, `oss/markdown-it-readme.md`.
  - Chuỗi Markdown mẫu: `"> [!NOTE]\n> This is an alert."`
- **Hành vi hiện tại:** Bộ escape đầu dòng hoặc paragraph escape nhận diện `[` trong trích dẫn và thêm dấu thoát `\\[`, biến alert chuẩn GitHub thành trích dẫn văn bản chứa dấu ngoặc vuông thoát.
- **Hành vi mong muốn:** Bảo toàn cú pháp GitHub Callouts / Alerts `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`, `> [!CAUTION]`.
- **Mức độ & Kế hoạch:** Đã sửa (Task 2.5e+g) — `CustomBlockquote` tự động bảo toàn nguyên vẹn cú pháp GitHub alerts trên dòng đầu của trích dẫn.

### N1: Ký tự `&` giữa dòng trong văn bản thuần bị tự động chuyển thành HTML entity `&amp;`

- **Chuỗi/JSON tái hiện:**
  - File corpus bị ảnh hưởng: 14 file (`oss/awesome-readme.md`, `oss/express-history.md`, `oss/express-readme.md`, `oss/keep-a-changelog.md`, `oss/lodash-readme.md`, `oss/markdown-it-readme.md`, `oss/marked-readme.md`, `oss/redux-readme.md`, `real/repo-qa-manual.md`, `real/repo-readme.md`, `real/repo-tasks-phase-1.md`, `real/repo-tasks-phase-2.md`, `real/repo-versions.md`, `synthetic/27-edge-syntax-as-text.md`).
  - Chuỗi Markdown mẫu: `"Research & Development"`, `"arrayLimit & denial of service"`
- **Hành vi hiện tại:** DOMParser chuyển ký tự `&` trong text thành `&amp;` hoặc serializer tự động sinh `&amp;` khi xuất ra Markdown.
- **Hành vi mong muốn:** Ký tự `&` giữa dòng trong văn bản thuần Markdown không cần và không được mã hóa thành `&amp;` trừ khi là entity hợp lệ.
- **Mức độ & Kế hoạch:** Đã sửa (Task 2.5e+g) — Áp dụng escape tối thiểu trong `restorePlainTextMarkdown`: `&` chỉ thành `&amp;` khi theo sau là mẫu entity; `>` chỉ escape ở đầu dòng; `<` chỉ escape khi tạo thành thẻ HTML.

### TD-14: Code span chứa nguyên văn `<span data-raw-inline="" data-raw-comment="true">&lt;!-- x --&gt;</span>` bị đổi

- **Chuỗi/JSON tái hiện:**
  - Chuỗi Markdown mẫu: `` `<span data-raw-inline="" data-raw-comment="true">&lt;!-- x --&gt;</span>` ``
- **Hành vi hiện tại:** Để khôi phục comment inline trong code span (`<!-- x -->`), serializer thay thế chuỗi đại diện raw-inline thành comment thật trong node text mang mark `code`, dẫn tới việc nếu người dùng gõ nguyên văn thẻ span này trong code span thì nó sẽ bị đổi thành `<!-- x -->`.
- **Hành vi mong muốn:** Nhận diện và phân biệt giữa span do engine sinh ra với chuỗi ký tự do người dùng nhập.
- **Mức độ & Kế hoạch:** Thấp. Chấp nhận (trường hợp cực hiếm trong thực tế, chấp nhận có điều kiện).

### TD-15: Liên kết có thẻ bên trong bị tách thành hai link (ví dụ `[<sub>x</sub> y](url)`)

- **Chuỗi/JSON tái hiện:**
  - Chuỗi Markdown mẫu: `[<sub>x</sub> y](https://example.com)`
- **Hành vi hiện tại:** Khi bên trong liên kết Markdown có chứa thẻ HTML con (dưới dạng atomic inline node `rawHtmlTag`), ProseMirror có xu hướng tách khối liên kết thành hai liên kết riêng lẻ: một liên kết chứa thẻ con và một liên kết chứa văn bản còn lại.
- **Hành vi mong muốn:** Giữ nguyên một liên kết thống nhất bao bọc toàn bộ thẻ HTML con và văn bản đi kèm.
- **Mức độ & Kế hoạch:** Trung bình. Cần xử lý qua Task Card riêng trước Gate A.

### TD-16: `<?php` và `<foo@bar.com>` gõ tay trong editor không round-trip

- **Chuỗi/JSON tái hiện:**
  - Chuỗi Markdown / văn bản gõ tay: `"<?php ... ?>"` hoặc `"<foo@bar.com>"`
- **Hành vi hiện tại:** Khi gõ tay trực tiếp trong editor dưới dạng văn bản thường, chuỗi bắt đầu bằng `<?php` bị parser xử lý thành processing instruction / raw HTML, hoặc email autolink `<foo@bar.com>` bị biến đổi thành link node mà không giữ nguyên văn bản thuần khi round-trip.
- **Hành vi mong muốn:** Cơ chế phân biệt văn bản thường chứa ký tự giống tag với thẻ thực sự để round-trip tuyệt đối.
- **Mức độ & Kế hoạch:** Thấp. Chấp nhận (trường hợp cực hiếm khi gõ tay ngoài code block, người dùng viết mã hoặc email thường dùng code span hoặc autolink chuẩn).

### TD-17: Code span nhiều dòng kết thúc bằng `\`

- **Chuỗi/JSON tái hiện:**
  - Chuỗi Markdown mẫu: `` `multi\nline\` and **bold** ``
  - Mẫu danh sách: `- `multi\nline\` and **bold**`và`1. `multi\nline\` and **bold**`
- **Kết quả kiểm chứng (Task 2.7):** Đã kiểm chứng toàn diện qua bộ unit test [`tests/unit/markdown/task27.test.ts`](file:///d:/HOCTAP/TuDo/writeflow/tests/unit/markdown/task27.test.ts).
  - Quy tắc CommonMark 6.1 chuẩn hóa newline trong code span thành khoảng trắng (`multi line\`), marked phân giải trọn vẹn rào đóng backtick của multiline codespan mà không làm hỏng token `**bold**` liền kề.
  - Assertions khẳng định: `codeNode.text === 'multi line\\'`, `codeNode.marks` chứa mark `code`, `boldNode.text === 'bold'`, `boldNode.marks` chứa mark `bold`, serialized output xuất đúng `**bold**` (không bị escape `\*\*bold\*\*`) và đạt 100% idempotency qua nhiều vòng serialize.
- **Trạng thái:** Đã kiểm chứng & Đóng (Closed).

### B9: Mất khối mã lồng trong danh sách ở `express-history.md`

- **Chuỗi/JSON tái hiện:**
  - File corpus bị ảnh hưởng: `oss/express-history.md`.
  - Mẫu tối thiểu: `- item\n  \`\`\`js\n QUERY /reports\n \`\`\`\n`
- **Hành vi ban đầu:** Khi một khối mã nằm lồng trong mục danh sách có thụt lề dẫn trước (ví dụ 2 dấu cách), Tiptap `@tiptap/extension-code-block` mặc định kiểm tra `token.raw?.startsWith('\`\`\`') === false`. Do `token.raw` bắt đầu bằng khoảng trắng thụt lề (` \`\`\`js`), Tiptap trả về mảng rỗng `[]`, làm mất hoàn toàn 3 khối mã trong `express-history.md`(số token`code` của marked giảm từ 4 về 0).
- **Hành vi mong muốn:** Bảo toàn 100% các khối mã lồng trong danh sách với số token và nội dung nguyên văn khớp hoàn toàn văn bản nguồn.
- **Mức độ & Kế hoạch:** Đã sửa (Task 2.5f-fix) — `CustomCodeBlock.parseMarkdown` gọi `.trimStart()` trên `token.raw` trước khi kiểm tra rào cú pháp, phục hồi toàn vẹn cả 4 khối mã trong `express-history.md`.

### B10: Dư dấu cách trong khối mã thuộc danh sách số

- **Chuỗi/JSON tái hiện:**
  - Chuỗi Markdown mẫu: `"1. step\n\n   \`\`\`bash\n npm i\n \`\`\`\n"`
- **Hành vi ban đầu:** Khối mã xuất ra bị dư 1 khoảng trắng thành `"    npm i"`.
- **Nguyên nhân gốc:** Tokenizer của `@tiptap/extension-ordered-list` tính toán thụt lề nội dung `contentIndent = indentLevel + marker.length + 1` làm phát sinh độ lệch 1 dấu cách trên các dòng nội dung của code block con.
- **Hành vi mong muốn:** Bảo toàn đúng từng byte thụt lề của khối mã lồng trong danh sách số, danh sách bullet và lồng nhiều cấp.
- **Mức độ & Kế hoạch:** Đã sửa (Task 2.5f-fix) — Bọc tokenizer của `OrderedList` để loại bỏ chính xác độ lệch khoảng trắng dư thừa tương ứng giữa rào mở và đóng của code block.

### B5b: Code span kết thúc bằng dấu gạch chéo ngược làm mất `**bold**`

- **Chuỗi/JSON tái hiện:**
  - Chuỗi Markdown mẫu: `` `a\` and **bold** and `b` `` và `` `C:\dir\` and **x** ``
- **Hành vi ban đầu:** Quy tắc `anyPunctuation` của `marked` chuyển dấu `\` và dấu backtick đóng thành `++` trong chuỗi mặt nạ lexing `n`, làm hỏng rào đóng của code span và khiến bộ parser nuốt chửng các token `**bold**` phía sau thành văn bản thuần rồi bị escape thành `\*\*bold\*\*`.
- **Hành vi mong muốn:** Code span kết thúc bằng dấu gạch chéo ngược phải bảo toàn 100% token in đậm/nghiêng phía sau byte-for-byte.
- **Mức độ & Kế hoạch:** Đã sửa (Task 2.5f-fix) — Áp dụng `safePunctuation` cho `marked.Lexer.rules.inline.*.anyPunctuation` theo dõi chính xác độ dài rào mở/đóng code span trên từng dòng để không mask nhầm ký tự `\` nằm ngay trước dấu backtick đóng. Có kèm assertion runtime khẳng định cấu trúc marked không bị phá vỡ.

---

## 3. GHI CHÚ KỸ THUẬT & KIẾN TRÚC PHÁT SINH

### Ghi chú Kỹ thuật 1: Đường dẫn tương đối có khoảng trắng trước dấu hai chấm trong `isValidLinkHref`

- **Hiện tượng:** Chuỗi liên kết tương đối có dạng `[tập tin](notes: draft.md)` hoặc `[link](folder : file.md)` chứa dấu hai chấm `:` phân tách sau một từ.
- **Nguyên nhân:** Khi `isValidLinkHref` loại bỏ sạch các ký tự điều khiển/khoảng trắng trong dải `[\u0000-\u0020]` trước khi kiểm tra scheme (để vá bypass `java\tscript:`), chuỗi `notes: draft.md` được chuẩn hóa thành `notes:draft.md`. Bộ phân giải scheme nhận diện `notes:` là một URL protocol/scheme chưa nằm trong danh sách whitelist (`http`, `https`, `mailto`), do đó từ chối URL này.
- **Khuyến nghị & Quy ước:** Trong văn bản Markdown, các đường dẫn tương đối có chứa ký tự đặc biệt hoặc dấu `:` nên được bắt đầu bằng tiền tố tường minh `./` (ví dụ `[tập tin](./notes: draft.md)` hoặc `[link](./folder : file.md)`) hoặc mã hóa phần trăm `%20` (`./notes:%20draft.md`). Hàm `isValidLinkHref` luôn chấp nhận ngay lập tức mọi đường dẫn bắt đầu bằng `./`, `/`, `../`, `#`, hoặc `?` trước khi thực hiện thẩm tra scheme.

### Ghi chú Kỹ thuật 2: Củng cố Bộ Kiểm thử E2E IME với Chrome DevTools Protocol (CDP)

- **Mô tả:** Trong Task 2.6d và Task 2.7, bài kiểm thử E2E [`tests/e2e/ime.spec.ts`](file:///d:/HOCTAP/TuDo/writeflow/tests/e2e/ime.spec.ts) đã được hoàn thiện và củng cố:
  - Sử dụng trực tiếp Chrome DevTools Protocol (`Input.imeSetComposition` và `Input.insertText`) để mô phỏng chính xác hành vi của bộ gõ tiếng Việt (Telex/VNI) trên engine Chromium.
  - Tích hợp bước kiểm tra ký tự (`#`, `*chữ*`) thực sự hiện diện trên DOM của editor trong suốt giai đoạn composition (`view.composing === true`) trước khi khẳng định không bị kích hoạt nhầm thành thẻ `h1` hoặc mark `em`.
  - Loại bỏ hoàn toàn rủi ro kiểm thử rỗng (empty test/weak test) và khẳng định editor hoạt động ổn định, bảo toàn trọn vẹn văn bản gõ tiếng Việt có dấu.
