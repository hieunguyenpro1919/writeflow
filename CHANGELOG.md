# Nhật ký thay đổi (Changelog)

Mọi thay đổi đáng chú ý của dự án WriteFlow sẽ được ghi nhận tại tài liệu này theo từng Phase và phiên bản phát hành.

Định dạng tuân thủ theo nguyên tắc [Keep a Changelog](https://keepachangelog.com/vi/1.0.0/).

---

## [Phase 1] - 2026-10-04

### Đã thêm (Added)
- **Command System (Task 1.1):**
  - Khởi tạo hệ thống Command Registry trung tâm (`src/core/commands/`) phân tách hoàn toàn tầng lệnh và tầng giao diện UI.
  - Hỗ trợ định nghĩa lệnh linh hoạt: `defaultShortcut` mảng hoặc chuỗi, `CommandContext` cung cấp `editor` và `ui` bridge.
  - Đăng ký đầy đủ 14 command lõi của Phase 1 (`format.bold`, `format.italic`, `format.strike`, `format.code`, `block.paragraph`, `block.heading1..3`, `block.bulletList`, `block.orderedList`, `block.blockquote`, `edit.undo`, `edit.redo`, `help.shortcuts`).
- **Nền tảng & Phím tắt (Task 1.2):**
  - Hệ thống phát hiện nền tảng (`detectPlatform`) hỗ trợ Windows/Linux (`Ctrl`) và macOS (`⌘`).
  - Hàm định dạng phím tắt (`formatShortcut`) hiển thị chuẩn xác biểu tượng và tên phím theo nền tảng.
- **Cấu hình Editor Chuẩn & Schema Guard (Task 1.3):**
  - Cấu hình Tiptap Editor chuẩn (`CustomStarterKit`) tắt triệt để các extension chưa thuộc phạm vi Phase 1 (Underline, Link, CodeBlock, HorizontalRule) theo quyết định P1-D5.
  - Vô hiệu hóa các phím tắt mặc định không mong muốn từ Tiptap StarterKit.
- **UiBridge & ToastHost (Task 1.4):**
  - Cầu nối giao diện `UiBridge` phục vụ thông báo ngắn (`notify`) và mở hộp thoại phím tắt (`openShortcutsDialog`).
  - Component `ToastHost` hiển thị thông báo với `role="status"`, `aria-live="polite"`, tự biến mất sau 3.5s và dùng 100% token CSS.
- **Các nhóm lệnh định dạng văn bản (Task 1.5 - 1.7):**
  - Format commands (`bold`, `italic`, `strike`, `code`) với phím chuẩn (gạch ngang bằng `Mod-Shift-x`).
  - Block commands (`paragraph`, `heading1..3`, `bulletList`, `orderedList`, `blockquote`) hỗ trợ toggle linh hoạt (P1-D1).
  - Edit commands (`undo`, `redo`) hỗ trợ phím kép trên Windows (`Ctrl+Y` và `Ctrl+Shift+Z`).
- **Keymap Extension & Bảo vệ bộ gõ tiếng Việt (Task 1.8):**
  - Extension bàn phím gắn kết Registry với ProseMirror keymap.
  - Cơ chế chặn phím bảo vệ gõ tiếng Việt: kiểm tra `isComposing` để không nuốt ký tự Telex/VNI khi đang gõ dở.
  - Chặn `Mod-u` và hiển thị gợi ý *"Định dạng này không được hỗ trợ trong Markdown"*.
- **Hành vi Enter & Backspace thông minh (Task 1.9):**
  - Enter trên dòng danh sách hoặc trích dẫn trống sẽ thoát khối về đoạn văn bản thường một cách mượt mà.
  - Backspace ở đầu heading chuyển khối thành đoạn văn bản thường thay vì xóa dòng.
- **Kiểm chứng Input Rules (Task 1.10):**
  - Kiểm thử 7 luật gõ nhanh Markdown (`# `, `## `, `### `, `- `, `* `, `1. `, `> `) và cơ chế hoàn tác bằng Backspace/Undo.
- **Thanh trạng thái thời gian thực (Task 1.11):**
  - Component `StatusBar` đếm số từ và số ký tự thời gian thực chuẩn ngữ nghĩa tiếng Việt (đếm âm tiết qua khoảng trắng).
  - Nút "Phím tắt" ở góc thanh trạng thái giúp người dùng chuột mở nhanh bảng tra cứu.
- **Hộp thoại phím tắt & Help Command (Task 1.12):**
  - Command `help.shortcuts` (`Mod-/`).
  - Component `ShortcutsDialog` sinh động 100% từ Command Registry, nhóm theo danh mục, tích hợp ô tìm kiếm, bẫy focus (Focus Trap), phím Esc và backdrop đóng.
- **Hệ thống Guard Tests (Task 1.13):**
  - Bộ test phòng thủ tự động (`tests/unit/guards.test.ts`) kiểm tra nghiêm ngặt: cấm hard-code màu (ngoài `variables.css`), cấm hard-code phím tắt (ngoài definitions/keymap), cấm gọi định dạng trực tiếp trong component UI, và bảo đảm đồng bộ 100% từ khóa i18n (`vi.json` và `en.json`).
- **Tài liệu QA thủ công (Task 1.15):**
  - Tạo `docs/qa/phase-1-manual.md` hướng dẫn chi tiết kiểm thử Kịch bản 1, Kịch bản tiếng Việt 18.3, và kiểm tra phím AltGr.

---

## [Phase 0] - 2026-10-04

### Đã thêm (Added)
- Khởi tạo mã nguồn chính thức WriteFlow bằng React 19 + TypeScript (strict) + Vite 8.
- Cấu hình Tiptap Core v3.
- Hệ thống Design Tokens CSS Variables (`src/styles/variables.css`).
- Hạ tầng i18n hỗ trợ song ngữ Tiếng Việt (`vi.json`) và Tiếng Anh (`en.json`).
- Pipeline CI GitHub Actions với đầy đủ 6 cổng kiểm soát (Typecheck, Lint, Format, Test, Build, CI).
