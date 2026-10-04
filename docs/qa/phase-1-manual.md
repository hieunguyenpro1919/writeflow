# KỊCH BẢN KIỂM THỬ THỦ CÔNG PHASE 1 (MANUAL QA)

Tài liệu hướng dẫn PO hoặc QA thực hiện kiểm thử thực tế trên giao diện ứng dụng WriteFlow sau khi hoàn thành Phase 1 (Core Editor + Command System + Phím tắt).

---

## 1. KỊCH BẢN 1: TRẢI NGHIỆM SOẠN THẢO CƠ BẢN (THEO PLAN PHỤ LỤC E)

*Thời gian thực hiện ước tính: ~10 phút*  
*Mục tiêu: Đảm bảo thao tác gõ tự nhiên, không giật lag, phím tắt trực quan, không phải nhớ cú pháp Markdown.*

| Bước | Thao tác thực hiện | Kết quả mong đợi | Trạng thái (Đạt / Chưa đạt) | Ghi chú |
|:---:|---|---|:---:|---|
| **1** | Mở ứng dụng (`npm run dev`), quan sát giao diện khởi tạo. Gõ 2–3 đoạn văn bản bình thường. | - Hiển thị văn bản chào mừng và gợi ý phím tắt `Ctrl+/` (hoặc `⌘/`).<br>- Gõ mượt mà, không gián đoạn, không có độ trễ.<br>- Thanh trạng thái dưới đáy đếm từ và ký tự chính xác. | [ ] | |
| **2** | Chọn một đoạn chữ, bấm **Ctrl+B** rồi **Ctrl+I**. Bấm lại tổ hợp phím đó lần nữa. | - Bấm lần đầu: Chữ được in đậm và in nghiêng (`<strong><em>`).<br>- Bấm lần hai: Tắt định dạng tương ứng (Toggle). | [ ] | |
| **3** | Đặt con trỏ tại một dòng bất kỳ:<br>- Bấm **Ctrl+Alt+1**<br>- Bấm **Ctrl+Alt+2**<br>- Bấm **Ctrl+Alt+3**<br>- Bấm **Ctrl+Alt+0** | - Lần lượt chuyển thành Tiêu đề 1 (`<h1>`), Tiêu đề 2 (`<h2>`), Tiêu đề 3 (`<h3>`).<br>- Bấm lại cùng tổ hợp hoặc **Ctrl+Alt+0** chuyển về đoạn văn bản thường (`<p>`). | [ ] | P1-D1: Bấm lại phím heading sẽ toggle về paragraph |
| **4** | Đặt con trỏ tại dòng thường:<br>- Bấm **Ctrl+Shift+8**<br>- Gõ mục 1, bấm **Enter**<br>- Gõ mục 2, bấm **Enter**<br>- Bấm **Enter** lần nữa ở dòng trống | - Tạo danh sách dấu chấm (`<ul><li>`).<br>- Enter sinh dòng danh sách mới.<br>- Enter trên dòng trống thoát khỏi danh sách, con trỏ trở về dòng đoạn văn thường. Không bị kẹt trong danh sách. | [ ] | |
| **5** | Đặt con trỏ tại dòng thường:<br>- Bấm **Ctrl+Shift+7** (danh sách số)<br>- Bấm **Ctrl+Shift+B** (trích dẫn blockquote) | - Chuyển đổi chuẩn xác giữa Danh sách số (`<ol>`) và Khối trích dẫn (`<blockquote>`).<br>- Enter 2 lần tại dòng trống đều thoát khối thành công. | [ ] | |
| **6** | Gõ `# ` (thăng + khoảng trắng) ở đầu dòng. Sau đó:<br>- Trường hợp A: Bấm ngay phím **Backspace**<br>- Trường hợp B: Gõ chữ `Tiêu đề`, bấm **Ctrl+Z** | - Khi gõ `# `: Lập tức biến thành Heading 1 (Input rule).<br>- Trường hợp A: Bấm **Backspace** ngay lập tức xóa khối tiêu đề rỗng và trả về một đoạn văn bản thường rỗng (`<p></p>`).<br>- Trường hợp B: Bấm **Ctrl+Z** hoàn tác lại nội dung đã nhập. | [ ] | Đính chính chuẩn theo hành vi ProseMirror |
| **7** | Bôi đen một cụm từ, bấm **Ctrl+U**. | - Không gạch chân chữ (Markdown không hỗ trợ thẻ underline chuẩn).<br>- Hiện toast thông báo: *"Định dạng này không được hỗ trợ trong Markdown"* và tự biến mất sau 3.5 giây. Văn bản giữ nguyên vẹn. | [ ] | Task 1.8: Bảo vệ schema |
| **8** | Bấm **Ctrl+Shift+S** | - Không bị kích hoạt gạch ngang ngoài ý muốn (phím mặc định của Tiptap đã được gỡ bỏ; phím gạch ngang chính thức của WriteFlow là `Ctrl+Shift+X`). | [ ] | |
| **9** | - Bấm tổ hợp phím **Ctrl+/** (hoặc bấm nút "Phím tắt" ở góc thanh trạng thái dưới đáy).<br>- Nhập từ khóa tìm kiếm vào ô tìm kiếm.<br>- Bấm **Tab** để di chuyển focus.<br>- Bấm **Esc** để đóng. | - Hộp thoại phím tắt mở ra nhanh chóng, hiển thị đầy đủ danh sách lệnh nhóm theo danh mục.<br>- Lệnh Redo trên Windows hiển thị cả 2 phím: `Ctrl+Y` và `Ctrl+Shift+Z`.<br>- Ô tìm kiếm lọc chính xác tên lệnh và phím.<br>- Focus được giữ kín bên trong hộp thoại (Focus Trap).<br>- Bấm **Esc** hoặc bấm ra ngoài nền (Backdrop) đóng hộp thoại; sau khi đóng, con trỏ tự động quay về editor. | [ ] | Task 1.12 |
| **10** | Thực hiện gõ, định dạng, rồi bấm **Ctrl+Z** (Undo) và **Ctrl+Y** / **Ctrl+Shift+Z** (Redo) liên tiếp nhiều bước. | - Mọi bước định dạng và văn bản hoàn tác và làm lại chính xác từng bước, không bị mất dữ liệu hay lỗi cấu trúc. | [ ] | Task 1.7 |

---

## 2. KỊCH BẢN KIỂM TRA BỘ GÕ TIẾNG VIỆT (THEO PLAN MỤC 18.3)

*Thực hiện trên Windows với bộ gõ **Unikey** và **EVKey**, kiểu gõ **Telex** và **VNI**.*

| STT | Kịch bản kiểm thử | Thao tác chi tiết | Kết quả mong đợi | Trạng thái |
|:---:|---|---|---|:---:|
| **V1** | **Gõ đoạn văn bản tiếng Việt có dấu đầy đủ** | Gõ đoạn: *"Viết lách là dòng chảy tự nhiên của tư duy. Trình soạn thảo văn bản tiếng Việt tối giản, bảo vệ toàn vẹn dữ liệu người dùng."* | Đầy đủ nguyên âm `ă â ê ô ơ ư đ` và 5 thanh (sắc, huyền, hỏi, ngã, nặng). Không bị nhân đôi chữ (như `dd`, `ee`), không bị mất dấu hoặc nuốt ký tự. | [ ] |
| **V2** | **Gõ trong các khối cấu trúc khác nhau** | Gõ tiếng Việt có dấu lần lượt trong:<br>- Đoạn thường (`<p>`)<br>- Tiêu đề 1, 2, 3 (`<h1>`, `<h2>`, `<h3>`)<br>- Danh sách dấu chấm (`<ul>`) & danh sách số (`<ol>`)<br>- Khối trích dẫn (`<blockquote>`) | Dấu tiếng Việt hiển thị trơn tru, phông chữ chuẩn (Inter) không bị lỗi chân dấu hay vỡ dòng. Bộ đếm từ ở thanh trạng thái đếm đúng âm tiết. | [ ] |
| **V3** | **Input rules kết hợp chữ tiếng Việt** | Gõ `# Tiêu đề chương một`<br>Gõ `* Mục danh sách đầu tiên`<br>Gõ `> Lời trích dẫn sâu sắc` | Sau khi kích hoạt cấu trúc, gõ tiếp chữ tiếng Việt có dấu đầu tiên không bị mất dấu hay dính ký tự cấu trúc. | [ ] |
| **V4** | **Sửa dấu giữa từ và xóa lùi** | Đặt con trỏ vào giữa từ *"hoàn toàn"*, gõ sửa thành *"hoàn hảo"*. Dùng Backspace xóa từng ký tự có dấu đang gõ dở. | Bộ gõ xử lý mượt mà, không bị kẹt bộ đệm IME composition, không sinh ký tự lạ. | [ ] |
| **V5** | **Định dạng phím tắt khi đang chọn chữ có dấu** | Bôi đen từ *"nghiên cứu"*, bấm **Ctrl+B**, rồi đặt con trỏ sau từ đó gõ tiếp *"khoa học"*. | Từ *"nghiên cứu"* in đậm đúng dấu, chữ *"khoa học"* gõ tiếp tục bình thường mà không bị bung dấu của từ trước. | [ ] |
| **V6** | **Chặn xung đột phím tắt trong khi đang gõ tiếng Việt (IME Composition)** | Khi đang gõ dở một từ (ví dụ đang gõ tổ hợp Telex chưa kết thúc từ), bấm tổ hợp phím tắt (như Ctrl+B). | `KeymapExtension` có cơ chế bảo vệ IME: Không nuốt phím hay làm đứt gãy từ đang gõ dở của bộ gõ. | [ ] |

---

## 3. KIỂM TRA BỐ CỤC BÀN PHÍM & PHÍM ALTGR

*Kiểm tra khả năng tương thích của các tổ hợp phím `Ctrl+Alt+...` trên các bố cục bàn phím khác nhau.*

| Bố cục bàn phím | Thao tác | Hành vi mong đợi | Ghi chú thực tế |
|---|---|---|---|
| **English (US)** | Bấm **Ctrl+Alt+1**, **Ctrl+Alt+2**, **Ctrl+Alt+3**, **Ctrl+Alt+0** | Chuyển đổi mượt mà giữa H1, H2, H3 và Paragraph. | Chuẩn xác theo thiết kế. |
| **Vietnamese / International (Có phím AltGr)** | Bấm **AltGr+1**, **AltGr+2**, **AltGr+3** hoặc **Ctrl+Alt+...** | Quan sát xem Windows có nhận AltGr trùng với `Ctrl+Alt` hay không. | Theo ghi nhận thiết kế Phase 1: Giữ nguyên phím `Ctrl+Alt+0/1/2/3`. Nếu người dùng dùng layout bàn phím đặc biệt (Đức, Pháp, Ba Lan), tổ hợp này có thể gõ ký tự đặc biệt. Tính năng tùy biến gán lại phím sẽ được mở ở Phase 5. |

---

## 4. TỔNG HỢP KẾT QUẢ KIỂM THỬ THỦ CÔNG

- **Người thực hiện:** PO / Tester
- **Ngày kiểm thử:** ____________________
- **Phiên bản / Commit:** `phase-1` (Commit cuối: `8847369` hoặc mới hơn)
- **Môi trường thử nghiệm:**
  - Hệ điều hành: Windows 10/11
  - Trình duyệt / WebView: Edge / Chrome (Chromium)
  - Bộ gõ tiếng Việt: Unikey / EVKey (Bảng mã Unicode dựng sẵn, kiểu gõ Telex & VNI)
- **Kết luận:**
  - [ ] **ĐẠT:** Tất cả các ca kiểm thử hoạt động đúng như thiết kế, không có lỗi chặn, tiếng Việt mượt mà.
  - [ ] **CẦN SỬA ĐỔI:** (Ghi chú cụ thể các bước chưa đạt dưới đây).

*Ghi chú thêm:*
____________________________________________________________________________________________________
____________________________________________________________________________________________________
