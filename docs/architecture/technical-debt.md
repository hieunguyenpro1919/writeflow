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
| **TD-03** | Khoảng trắng 1–3 hoặc tab đầu dòng trước ký hiệu mở lại thành block | Task 2.4c Mục 4 | Thấp | Chấp nhận có điều kiện | Chấp nhận có điều kiện, ủy quyền ngày 07/10/2026. (Hết hiệu lực nếu corpus Task 2.5b báo lỗi mất dữ liệu trên file thật) |
| **TD-04** | Văn bản gõ entity số `&#35;`, `&#..;` mở lại bị giải mã | Task 2.4c Mục 4 | Thấp | Chấp nhận có điều kiện | Chấp nhận có điều kiện, ủy quyền ngày 07/10/2026. (Hết hiệu lực nếu corpus Task 2.5b báo lỗi) |
| **TD-05** | URL trần có `_` bị escape thành `\_` hiển thị dấu `\` | Task 2.4c Mục 4 | Thấp | Đã sửa (Task 2.5a) | Đã sửa (Task 2.5a) |
| **TD-06** | Các dị biệt inline: tiêu đề kết thúc ` #`, code span dời cách, `<img />`, Setext đa dòng | Task 2.4c Mục 4 | Thấp | Chấp nhận có điều kiện | Chấp nhận có điều kiện, ủy quyền ngày 07/10/2026. (Hết hiệu lực nếu corpus Task 2.5b báo lỗi) |
| **TD-07** | Blockquote chứa duy nhất đoạn trống (`>\n`) mất trên serialize lần 2 | Task 2.4c Ma trận 3b | Thấp | Đã sửa (Task 2.5a) | Đã sửa (Task 2.5a) |
| **TD-08** | Task item chứa block non-text bị marked parse thành bullet text `[ ]` | Task 2.4c Ma trận 3b | Trung bình | Hoãn đến Phase 6 | Hoãn đến Phase 6. Điều kiện cứng: phải sửa xong trước khi bật nút Task list trong UI |
| **TD-09** | HorizontalRule ở vị trí only/first trong list item không có đoạn văn neo | Task 2.4c Ma trận 3b | Trung bình | Chờ corpus | Chờ kết quả corpus (Task 2.5b) |
| **TD-10** | Khối phức tạp trong ordered/bullet list không idempotent do thụt lề 3-space của marked | Task 2.4c Ma trận 3b | Trung bình | Chờ corpus | Chờ kết quả corpus (Task 2.5b) |

---

## 2. CHI TIẾT TỪNG MỤC NỢ KỸ THUẬT

### TD-01: Cảnh báo kích thước gói bundle vượt 500 kB (~678 kB)
- *(Như cũ)*

### TD-02: Chuẩn hóa cơ chế bắt sự kiện IME trong `SmartKeysExtension`
- *(Như cũ)*

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
- **Trạng thái:** Đã sửa trong Task 2.5a (Serializer tự động phục hồi `_`, `*`, `~`, `&` trong URL trần bắt đầu bằng `http://`, `https://`, `www.`).

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

### TD-10: Khối phức tạp trong ordered/bullet list không idempotent do thụt lề 3-space của marked
- **Chuỗi/JSON tái hiện:**
  - Các tổ hợp: `orderedList>listItem` x {`emptyParagraph`, `heading`, `codeBlock`, `rawBlock`, `horizontalRule`} @ first/middle/last.
- **Hành vi hiện tại:** Tiptap markdown serializer thụt lề cấp con danh sách có số bằng 3 khoảng trắng (`   `), trong khi CommonMark quy định continuation indent của block bên trong list item cần 4 khoảng trắng (`    `). Marked cắt bỏ thụt lề và tách các khối phức tạp ra khỏi list item.
- **Hành vi mong muốn:** Tùy biến `renderNestedMarkdownContent` hoặc custom list extensions để sinh đúng 4 khoảng trắng thụt lề theo chuẩn CommonMark Spec.