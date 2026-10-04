# QUYẾT ĐỊNH THIẾT KẾ CHO PHASE 1 (P1-D1 → P1-D7)

**Dự án:** WriteFlow — Phase 1: Core Editor + Command System + Phím tắt  
**Nguồn tham chiếu:** `docs/tasks/phase-1.md` (Mục 2)  
**Trạng thái:** Đã duyệt bởi PO  

---

| Mã | Vấn đề | Quyết định | Lý do & Hệ quả |
|---|---|---|---|
| **P1-D1** | Bấm lại phím Heading/List/Quote khi đang ở đúng kiểu đó | **Bật/tắt (toggle)**: Ctrl+Alt+1 lần nữa → về đoạn thường | Hành vi nhất quán với Tiptap; trực quan, dễ đoán cho người dùng. |
| **P1-D2** | Cấp tiêu đề trong schema | Schema giữ **H1–H6**, nhưng **chỉ gán phím tắt cho H1–H3** | Giữ tính tương thích với Markdown đa cấp để Phase 2 mở file không mất thẻ H4–H6; tránh phình tổ hợp phím ở Phase 1. |
| **P1-D3** | Playwright (E2E) | **Thêm ở Phase 1**, chỉ chạy Chromium trên CI | Kiểm chứng các phím tắt và tổ hợp phím bằng sự kiện bàn phím thật trên trình duyệt. |
| **P1-D4** | Điều chỉnh interface Command System (Plan 6.1) | `defaultShortcut.win/mac` cho phép `string` **hoặc** `string[]`; `CommandContext` có `editor` (bắt buộc) và `ui` (cầu nối UI/thông báo) | Cho phép một lệnh (như Redo) có nhiều phím tắt (`Ctrl+Y` và `Ctrl+Shift+Z`), cho phép lệnh gọi hiển thị dialog/toast mà không phụ thuộc React state nội bộ. |
| **P1-D5** | Tắt các extension chưa thuộc Phase 1 | Tắt **Underline, Link, CodeBlock, HorizontalRule, TrailingNode** | Tránh kích hoạt ngoài ý muốn các rule chưa có cơ chế serialize (Plan 4.3). Dán HTML có chứa link/code block tạm thời chỉ giữ text thuần ở Phase 1; sẽ hỗ trợ đầy đủ tại Phase 6. |
| **P1-D6** | Ngắt dòng cứng | Chỉ **Shift+Enter**. Bỏ `Mod-Enter` khỏi ngắt dòng | Dành `Mod-Enter` cho tính năng thoát khối mã ở Phase 6 (Plan 7.2). |
| **P1-D7** | Nội dung khởi đầu của editor | Văn bản chào ngắn tạo từ i18n kèm gợi ý phím tắt `Ctrl+/` (hoặc `⌘/`) | Tạo trải nghiệm tự khám phá thân thiện cho người dùng ngay lần đầu mở app. |

---

### Ghi chú bổ sung cuối Phase 1:
- **Quyết định tinh gọn Task 1.14 (E2E Playwright):** Theo chỉ đạo của PO trong Task Card Nhóm E, dự án tạm hoãn triển khai Playwright E2E tự động tại Phase 1 để giữ nhịp độ tinh gọn; toàn bộ 9 kịch bản tương tác bàn phím và bộ gõ tiếng Việt được chuyển sang thực hiện thủ công có hướng dẫn tại `docs/qa/phase-1-manual.md`, kết hợp cùng 174 test tự động (unit/component/guards) đạt 100% tỷ lệ vượt qua.

