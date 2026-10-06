# Danh mục Chuẩn hóa Cú pháp Markdown (Markdown Normalizations)

Tài liệu này ghi nhận và phê duyệt các biến đổi cú pháp được chấp nhận trong quá trình Parse -> Serialize của WriteFlow theo quy định tại `docs/PLAN.md` (Mục 9.3) và chuẩn CommonMark. Mọi biến đổi nằm ngoài danh sách này đều bị coi là lỗi mất dữ liệu (data loss).

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

## 2. Danh sách (Lists & Task Lists)
- **Thụt lề danh sách lồng**:
  - Bullet list (`- `) thụt lề chuẩn 2 khoảng trắng cho cấp con.
  - Ordered list (`1. `) thụt lề chuẩn 3 khoảng trắng tương ứng với độ rộng ký tự đánh số.
- **Danh sách lỏng (Loose List) -> Danh sách chặt (Tight List)**:
  - Khi người dùng không có chủ đích phân đoạn văn trong từng mục danh sách, các khoảng trống thừa giữa các bullet item sẽ được gom gọn theo chuẩn canonical.

## 3. Đường kẻ ngang (Thematic Breaks / Horizontal Rules)
- **Chuẩn hóa ký tự**:
  - Các biến thể như `***`, `___`, hoặc `* * *` khi xuất ra sẽ được chuẩn hóa thành `---` đứng riêng dòng có 2 dòng trống cách ly trên/dưới.

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
- **Autolinks**:
  - Dạng `<https://example.com>` được chuẩn hóa thành `[https://example.com](https://example.com)`.

## 5. Ký tự thoát & Ngắt dòng (Escaping & Line Breaks)
- **Ngắt dòng mềm**: Dấu gạch chéo ngược `\` ở cuối dòng để ngắt dòng được chuẩn hóa thành 2 khoảng trắng theo chuẩn CommonMark.
- **Ký tự thoát không cần thiết**: Các ký tự `\#`, `\.`, `\|` khi không nằm trong ngữ cảnh xung đột cú pháp sẽ được bỏ dấu `\` để văn bản tự nhiên.