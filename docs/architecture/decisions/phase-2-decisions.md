# SỔ QUYẾT ĐỊNH PHASE 2 (PHASE 2 DECISIONS)

Tài liệu này ghi nhận các quyết định quan trọng ảnh hưởng đến kiến trúc và quy trình của Phase 2.

| Mã | Quyết định | Lý do | Người quyết định | Ngày |
| :--- | :--- | :--- | :--- | :--- |
| **P2-D1** | Chấp nhận nợ kỹ thuật TD-03, TD-04, TD-06, TD-08, TD-09, TD-10 theo bảng phân loại (A). | Để tránh dồn khối lượng công việc và không để đọng nhiều nợ kỹ thuật. Việc chấp nhận sẽ hết hiệu lực nếu corpus (Task 2.5b) phát hiện lỗi trên dữ liệu thật. | PO (ủy quyền cho Claude) | 07/10/2026 |
| **P2-D2** | Ngắt dòng cứng khi lưu là `\` cuối dòng (Plan 9.3); `<br>` trong dòng chuẩn hóa sang `\`. | Đảm bảo ngắt dòng hiển thị đúng theo CommonMark, tránh các linter/format tự động xóa khoảng trắng ở cuối dòng. | PO | 07/10/2026 |
| **P2-D3** | Đoạn trống liên tiếp dùng `&nbsp;`. Đoạn đầu file/cuối file xử lý riêng (Xem `markdown-normalizations.md` mục 8). | Đảm bảo bảo toàn khoảng cách trống do người dùng tạo ra khi serialize và parse lại (tránh bị Markdown gộp dòng trống). | PO | 07/10/2026 |
| **P2-D4** | Corpus (Task 2.5b) chỉ dùng làm bộ phát hiện. Mọi sửa lỗi engine phát sinh từ corpus phải qua task card riêng (2.5c, 2.5d...) có golden snapshot bảo vệ. | Ngăn chặn việc sửa mã lan man gây lỗi hồi quy. File trượt corpus sẽ được ghi nhận và phân loại. | PO | 07/10/2026 |
| **P2-D5** | Chấp nhận hành vi `<img>` trong dòng bị thêm ` /` và tiêu đề Setext nhiều dòng bị đổi định dạng (thuộc TD-06). | Lỗi mức độ thấp, hiếm gặp và không làm mất nội dung chính yếu của người dùng. | PO | 07/10/2026 |