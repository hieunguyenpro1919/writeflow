# QUY TẮC BẮT BUỘC DÀNH CHO AI BUILDER (WRITEFLOW)

Tài liệu này là hợp đồng làm việc nghiêm ngặt. Mọi AI tham gia lập trình cho dự án WriteFlow phải tuân thủ tuyệt đối các điều sau:

1. **Nguồn sự thật:** Đọc kỹ `docs/PLAN.md` trước khi làm. Chỉ thực hiện đúng phạm vi của Phase/Task được giao. Không làm trước tính năng của Phase sau.
2. **Không tự ý thêm tính năng:** Yêu cầu làm gì thì làm đúng thứ đó. Tuyệt đối không tự tiện thêm màu sắc, font chữ, cài đặt hay thay đổi giao diện ngoài yêu cầu task.
3. **Không tự đổi stack/kiến trúc:** Stack cốt lõi là React + TypeScript (strict) + Vite + Tiptap. Cấm đổi sang thư viện editor khác hoặc đổi từ Tauri sang Electron nếu chưa qua Architecture Review được PO phê duyệt.
4. **Nguyên tắc Command System:** Mọi thao tác chỉnh sửa/định dạng phải đi qua Command Registry. Không viết logic định dạng trực tiếp trong component UI hay nút bấm.
5. **Không hard-code:** 
   - Không chèn chuỗi giao diện trực tiếp (phải qua i18n).
   - Không chèn mã màu/font cứng (phải qua CSS variables).
6. **Bảo toàn dữ liệu (Nguyên tắc số 10):** Không bao giờ làm mất dữ liệu người dùng. Mọi cú pháp Markdown chưa hỗ trợ phải được giữ nguyên vẹn trong `rawBlock`/`rawInline`.
7. **Task nhỏ và kiểm thử được:** Không sửa nhiều hệ thống trong một lần. Mọi thay đổi logic đều phải đi kèm test. Không hạ tiêu chuẩn test để ép CI xanh.