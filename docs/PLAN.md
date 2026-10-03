---
title: "PLAN V1.1 — FINAL"
subtitle: "Trình soạn thảo tài liệu Markdown WYSIWYG mã nguồn mở"
---

**Trạng thái:** PLAN — Đã duyệt và bắt đầu Build. Đây là bản hợp nhất cuối cùng, thay thế cả tài liệu của Gemini lẫn Plan V1.0.

**Nguồn hợp nhất:** Kế hoạch của Gemini (chi tiết kỹ thuật) + Plan V1.0 của ChatGPT (triết lý, phạm vi, quy trình) + đánh giá của Claude (các lỗ hổng cần vá).

**Cách đọc:** Người sở hữu sản phẩm (Product Owner, viết tắt PO) đọc các mục 0–3, 20 và 23. Các mục còn lại là đặc tả cho người/AI thực hiện build. PO không cần hiểu các mục kỹ thuật, chỉ cần duyệt các quyết định ở mục 3.

# 0. QUẢN LÝ TÀI LIỆU

## 0.1. Lịch sử phiên bản

| Phiên bản | Nội dung |
|---|---|
| Gemini v0 | Kế hoạch kỹ thuật đầu tiên: stack, bảng phím tắt, bảng lỗi, CSS variables. |
| V1.0 | ChatGPT viết lại: triết lý, phạm vi, MVP, Command System, Theme/Extension/AI tách biệt, quy tắc cho AI builder. |
| **V1.1** | Bản này. Vá 6 nhóm vấn đề đã nêu trong đánh giá và đưa lại các chi tiết cụ thể của Gemini. |

## 0.2. Những gì V1.1 thay đổi so với V1.0

1. **Phase 1 giờ có đủ phím tắt cho Heading, List, Quote…** (V1.0 chỉ có Ctrl+B/I/Z/Y nên người dùng buộc phải gõ cú pháp Markdown, trái với triết lý sản phẩm). Xem mục 7 và Phase 1.
2. **Chính sách Markdown được viết thành quy tắc cụ thể** (phần không hỗ trợ, escape ký tự, xuống dòng, Unicode, ghi file an toàn, tiêu chí đạt/trượt). Xem mục 9.
3. **Thêm Phase S (Spike) trước khi khóa kiến trúc** để kiểm chứng 4 rủi ro lớn nhất bằng thử nghiệm thật. **Đảo thứ tự:** Phase 0 chạy như web app thuần, Tauri vào ở Phase 3. Xem mục 20.
4. **Command Layer có đặc tả đầy đủ** (interface, registry, quy tắc bắt buộc). Xem mục 6.
5. **Theme và Settings có đặc tả thực:** bộ token duy nhất, schema file có đánh số phiên bản, kiểm tra độ tương phản. Xem mục 13 và Phụ lục C.
6. **Các quyết định sản phẩm còn bỏ ngỏ được chốt thành Sổ quyết định** (mục 3) với giá trị mặc định đề xuất để PO duyệt.
7. **Sửa các điểm kỹ thuật bị sai hoặc thiếu** ở cả hai bản trước (mục 0.3).

## 0.3. Các sai sót kỹ thuật đã sửa

| # | Vấn đề ở bản trước | Cách xử lý trong V1.1 |
|---|---|---|
| 1 | Gemini gán **Ctrl+Shift+S** cho gạch ngang (strike), nhưng đây là phím "Lưu thành" chuẩn của mọi ứng dụng. | Strike dùng Ctrl+Shift+X; Ctrl+Shift+S là Save As. Phải ghi đè phím mặc định của Tiptap. |
| 2 | V1.0 cấm underline/màu/font nhưng StarterKit của Tiptap có thể đã bật sẵn Underline và Link. | Phải cấu hình tắt/bật tường minh từng extension (mục 4.3). Ctrl+U hiện gợi ý thay vì im lặng. |
| 3 | V1.0 liệt kê "E2E test tiếng Việt" nhưng Playwright **không thể điều khiển Unikey/EVKey** thật. | Test IME là **kịch bản kiểm tra thủ công trên máy Windows thật** + test tự động mô phỏng sự kiện composition (mục 18). |
| 4 | Gemini đề xuất Web Worker + Virtual Scroll cho tài liệu lớn. Virtual scroll không khả thi trong ProseMirror. | Thay bằng giới hạn kích thước + cảnh báo + đo hiệu năng thực tế (mục 18.2). |
| 5 | Gemini và V1.0 đều **không nói bảng (table) xử lý thế nào khi ô chứa nội dung phức tạp**; Markdown GFM chỉ cho nội dung một dòng trong ô. | Bảng bị giới hạn ở dạng GFM biểu diễn được; bảng phức tạp khi mở file giữ nguyên dưới dạng khối thô (mục 9.4). |
| 6 | Không bản nào nhắc việc **ký tự Markdown người dùng gõ như văn bản** (ví dụ dấu `*`, `#` đầu dòng) phải được escape khi lưu, nếu không file bị hỏng cấu trúc. | Thành test bắt buộc P0 (mục 9.5). |
| 7 | **Extension của Tiptap/ProseMirror chạy cùng tiến trình** với app, không thể sandbox thật sự. V1.0 nói "trust/permission model" nhưng chưa nói rõ điều này. | Chia extension làm 3 cấp an toàn; mã của bên thứ ba chỉ được bật ở chế độ nhà phát triển cho tới khi có thiết kế sandbox riêng (mục 14). |
| 8 | Gemini dùng File System Access API của trình duyệt cho desktop; trong khi Tauri đã có dialog/fs native. | Dùng Tauri làm đường chính; File System Access API chỉ cho bản web dự phòng (nếu có). |
| 9 | Gemini ghi hiệu năng cứng (<200ms, <50MB RAM) khi chưa đo. | Chỉ là mục tiêu đo đạc, không cam kết (mục 18.2). |

# 1. TẦM NHÌN VÀ NGUYÊN TẮC

## 1.1. Tầm nhìn

Một **trình soạn thảo tài liệu trực quan** đơn giản như Notepad/Word, mà dữ liệu lưu dưới dạng **Markdown thuần** (`.md`). Mã nguồn mở, tùy biến được giao diện (kể cả người không biết code), mở rộng được bằng extension.

**Tuyên ngôn sản phẩm: Soạn tài liệu dễ trước. Markdown đúng phía sau.**

**Câu hỏi thành công duy nhất:** *Một người chưa từng nghe đến Markdown có thể mở app và viết một tài liệu đẹp mà không cần học gì không?*

## 1.2. Mười nguyên tắc không được tự ý thay đổi

1. WYSIWYG là giao diện mặc định. Không chia đôi màn hình Markdown + Preview.
2. Markdown là định dạng lưu trữ, không phải thứ người dùng phải học.
3. Người dùng không bao giờ bị bắt nhớ cú pháp. Mọi thao tác phải có ít nhất một đường không cần nhớ (nút, menu hoặc slash menu).
4. UI mặc định tối giản. "Simple by default, customizable by choice."
5. Extension không là phụ thuộc của core. Core chạy được khi không có extension nào.
6. Theme không chứa code.
7. AI không là phụ thuộc của core.
8. Tương thích Markdown phải được kiểm thử, không được giả định.
9. Mọi thao tác chỉnh sửa đi qua Command System (mục 6).
10. **Không bao giờ làm mất dữ liệu người dùng.** Không xóa âm thầm nội dung không hiểu, không ghi đè file khi chưa chắc an toàn.

Nguyên tắc 10 là nguyên tắc mới trong V1.1 và đứng cao nhất khi có xung đột với các nguyên tắc khác.

# 2. NGƯỜI DÙNG VÀ PHẠM VI

## 2.1. Nhóm người dùng

- **Người dùng phổ thông:** không biết Markdown, không biết code. Phải dùng được ngay không cần hướng dẫn.
- **Người dùng nâng cao:** biết Markdown, muốn đổi phím tắt, theme, cài extension, tự viết extension.

## 2.2. Phạm vi MVP

MVP (kết thúc ở Phase 3) là một ứng dụng desktop mở lên và:

- soạn văn bản, định dạng bằng **phím tắt** (Phase 1) và có **mở/lưu file `.md` an toàn** (Phase 3);
- hiển thị đúng và lưu lại đúng Markdown cho các cấu trúc nền tảng (đoạn văn, tiêu đề, in đậm, in nghiêng, danh sách);
- gõ tiếng Việt (Telex/VNI qua Unikey/EVKey) không bị lỗi;
- không làm mất dữ liệu.

Toolbar, theme tùy biến, bảng, ảnh… **không** thuộc MVP; chúng đến ở các Phase sau.

## 2.3. Không làm (ít nhất đến sau Phase 8)

Soạn thảo cộng tác; lưu trữ đám mây; tài khoản; đồng bộ; chợ extension trực tuyến; sandbox mã bên thứ ba hoàn chỉnh; mobile app; server cơ sở dữ liệu; xuất Word/PDF chất lượng cao (PDF qua chức năng in có thể có ở Phase 7); AI.

# 3. SỔ QUYẾT ĐỊNH (DECISION REGISTER)

Mỗi dòng dưới đây là một quyết định trước đây còn bỏ ngỏ. **Cột "Mặc định đề xuất" là giá trị sẽ được dùng nếu PO duyệt tài liệu này mà không sửa.** Khi PO duyệt tài liệu = duyệt toàn bộ bảng này.

| Mã | Quyết định | Mặc định đề xuất | Lý do ngắn |
|---|---|---|---|
| D-01 | Tên sản phẩm | Dùng tên tạm `MarkdownEditor`; đặt tên chính thức trước Phase 11 | Không chặn build |
| D-02 | Nền tảng ưu tiên | **Windows 10/11 là nền tảng chính.** macOS/Linux build thử từ Phase 3, hỗ trợ chính thức sau Phase 11 | Engine hiển thị mỗi hệ điều hành khác nhau (WebView2 / WKWebView / WebKitGTK), lỗi gõ tiếng Việt khác nhau; làm một nền tảng thật tốt trước |
| D-03 | Mô hình tài liệu | **Một cửa sổ = một tài liệu.** Tab đa tài liệu để backlog | Giảm độ phức tạp trạng thái/recovery |
| D-04 | Giấy phép | **MIT** | Dễ đóng góp, dễ dùng lại. Chỉ dùng thư viện có giấy phép tương thích |
| D-05 | Ngôn ngữ giao diện | **Tiếng Việt + tiếng Anh**, hạ tầng i18n có từ Phase 0 | Thêm sau rất tốn kém |
| D-06 | Ảnh | Lưu file ảnh vào thư mục `<tên-tài-liệu>.assets/` cạnh file `.md`, tham chiếu bằng đường dẫn tương đối. Ảnh từ URL ngoài **bị chặn mặc định**, người dùng bấm "Tải ảnh" mới hiện | Giữ file `.md` di chuyển được; tránh theo dõi qua ảnh từ xa |
| D-07 | Xuất file | Phase 7: xuất **HTML** và **PDF qua hộp thoại in**. Xuất DOCX → backlog (làm bằng extension) | Người dùng phổ thông cần chia sẻ được tài liệu |
| D-08 | Tìm và thay thế | Có ở Phase 4 (Ctrl+F, Ctrl+H) | Người dùng Notepad/Word chắc chắn mong có |
| D-09 | Gạch chân, màu chữ, font chữ, căn lề trong tài liệu | **Không hỗ trợ** (Markdown không biểu diễn được). Bấm Ctrl+U hiện gợi ý ngắn | Giữ trung thực với Markdown |
| D-10 | Phương ngữ Markdown | **CommonMark + GFM** (bảng, task list, gạch ngang, autolink) | Chuẩn phổ biến nhất |
| D-11 | Kiểu chuẩn hóa khi lưu | Xem mục 9.3 | Cần nhất quán để diff sạch |
| D-12 | Xuống dòng mềm trong đoạn (hard-wrap 80 cột) | **Chuyển thành khoảng trắng** khi lưu, ghi vào danh sách "chuẩn hóa đã biết" | Ngữ nghĩa không đổi; có thể xem lại ở Phase 2 |
| D-13 | Sao lưu | Mỗi lần **lưu đè file đã có** thì giữ bản sao cũ trong thư mục dữ liệu của app (10 phiên bản gần nhất mỗi file). Không tạo file rác cạnh file người dùng | An toàn mà không làm bẩn thư mục |
| D-14 | Thu thập dữ liệu / mạng | **Không có telemetry, không gọi mạng mặc định.** Cập nhật tự động chỉ có ở Phase 11 và do người dùng bật | Riêng tư |
| D-15 | Chế độ xem Markdown nguồn (Source mode) | Tùy chọn cho người dùng nâng cao ở Phase 7, **không bao giờ là mặc định** | Nhất quán nguyên tắc 1–3 |
| D-16 | Trình quản lý gói | `npm` | Đơn giản nhất cho người không chuyên |
| D-17 | Font đi kèm | Đóng gói sẵn 1 font chữ thường + 1 font monospace có **hỗ trợ đầy đủ dấu tiếng Việt** (kiểm tra thực tế các tổ hợp dấu chồng) | Chạy offline, không bị mất dấu |
| D-18 | Thư viện trả phí của Tiptap | **Chỉ dùng gói mã nguồn mở (MIT).** Không dùng extension Pro/Cloud | Giữ dự án mở hoàn toàn |

# 4. CÔNG NGHỆ

## 4.1. Stack

| Lớp | Lựa chọn | Ghi chú |
|---|---|---|
| Ngôn ngữ | TypeScript (strict) | |
| UI | React + Vite | |
| Engine soạn thảo | **Tiptap (v3) trên ProseMirror** | Không tự viết engine |
| Markdown | `@tiptap/markdown` (đang Beta) | Có phương án dự phòng, xem 4.4 |
| Desktop | **Tauri 2** (Rust) | Vào từ Phase 3 |
| Test | Vitest (đơn vị), Playwright (web), tauri-driver/thủ công (desktop) | Xem mục 18 |
| i18n | `i18next` + `react-i18next` | |
| Định dạng/lint | ESLint + Prettier + `tsc --noEmit` | |

## 4.2. Chính sách phiên bản

- Ghim **phiên bản chính xác** của mọi package bằng `package-lock.json` và `Cargo.lock`, ghi lại trong `docs/architecture/versions.md` ở Phase 0.
- Package Tiptap phải cùng một phiên bản chính/phụ.
- Nâng cấp phụ thuộc là một task riêng, có chạy lại toàn bộ test round-trip.

## 4.3. Cấu hình StarterKit bắt buộc

Tiptap StarterKit bật sẵn nhiều extension. Builder **phải đối chiếu danh sách thực tế của phiên bản đã ghim** và cấu hình tường minh:

- **Tắt:** Underline (trái D-09). Link chỉ bật theo cách đã cấu hình ở Phase 6.
- **Ghi đè phím mặc định** khi trùng bảng ở mục 7 (đặc biệt strike).
- Bất kỳ extension nào bật mà không có quy tắc serialize Markdown trong mục 9 là **lỗi cấu hình**.

## 4.4. Phương án dự phòng cho Markdown (thang bậc)

| Bậc | Điều kiện chuyển | Hành động |
|---|---|---|
| A | Mặc định | `@tiptap/markdown` |
| B | A trượt tiêu chí mục 9.7 nhưng sửa được bằng handler tùy biến | Viết handler parse/render riêng cho từng node trong cơ chế extension của Tiptap, hoặc dùng `unified/remark` (mdast) cho phần parse/serialize và cầu nối sang ProseMirror |
| C | B vẫn trượt | **Architecture review** để cân nhắc engine khác (ví dụ Milkdown, nền Markdown-first). Không tự chuyển |

Không đổi bậc chỉ vì một vài edge case nhỏ. Việc đổi bậc phải dựa trên báo cáo test của Phase S/Phase 2.

# 5. KIẾN TRÚC

```
                 ┌─────────────────────┐
                 │       React UI      │  Toolbar / Menu / Dialog / Theme
                 └──────────┬──────────┘
                            │ gọi
                 ┌──────────▼──────────┐
                 │  Command Registry   │  mọi thao tác chỉnh sửa
                 └──────────┬──────────┘
                            │
                 ┌──────────▼──────────┐
                 │ Tiptap / ProseMirror│  trạng thái làm việc + undo/redo
                 └───────┬───────┬─────┘
                         │       │
        ┌────────────────▼┐     ┌▼─────────────────┐
        │ Markdown Adapter│     │ Extensions (sau) │
        └────────┬────────┘     └──────────────────┘
                 │
        ┌────────▼────────┐
        │  File Service   │  Tauri: dialog, fs, atomic write, backup
        └────────┬────────┘
                 │
              .md trên đĩa
```

## 5.1. Quy tắc dữ liệu

- **Mô hình ProseMirror là trạng thái làm việc.** Không serialize Markdown sau mỗi ký tự rồi parse ngược lại để điều khiển editor.
- **Markdown chỉ được tạo khi Lưu / Xuất / Autosave / Recovery**, và chỉ được đọc khi Mở / Dán.
- **Mọi chỉnh sửa tài liệu đi qua transaction của ProseMirror** để undo/redo hoạt động. Cấm tự viết hệ thống undo riêng.
- **Settings, Theme và nội dung tài liệu là ba kho dữ liệu tách biệt.** Theme/Settings không bao giờ được ghi vào file `.md`.

## 5.2. Dịch vụ phía ngoài editor

Giao diện với hệ điều hành đi qua các "service" có interface rõ ràng để có thể thay bản web/desktop và để mock khi test:

| Service | Trách nhiệm |
|---|---|
| `FileService` | Mở, lưu (atomic), lưu thành, đọc metadata, theo dõi thay đổi bên ngoài, sao lưu |
| `SettingsService` | Đọc/ghi settings, migrate theo phiên bản schema |
| `ThemeService` | Nạp, kiểm tra hợp lệ, áp dụng, nhập/xuất theme |
| `RecoveryService` | Ghi/đọc dữ liệu phục hồi phiên làm việc |

# 6. COMMAND SYSTEM (ĐẶC TẢ)

Đây là xương sống của kiến trúc. Phím tắt, toolbar, bubble menu, slash menu, context menu, menu bar, và (sau này) extension đều chỉ **gọi command**, không chứa logic định dạng.

## 6.1. Interface

```ts
interface CommandDef {
  id: string;                    // ví dụ "format.bold" — duy nhất, ổn định, không đổi tên về sau
  labelKey: string;              // khóa i18n, ví dụ "cmd.format.bold"
  descriptionKey?: string;       // mô tả ngắn cho tooltip
  icon?: string;                 // tên icon
  category: "format" | "block" | "insert" | "file" | "edit" | "view" | "help";
  defaultShortcut?: { win?: string; mac?: string };   // ví dụ "Mod-b"
  run(ctx: CommandContext, args?: unknown): boolean;  // trả về true nếu đã xử lý
  isEnabled?(ctx: CommandContext): boolean;           // có thể dùng lúc này không
  isActive?(ctx: CommandContext): boolean;            // trạng thái bật (nút Bold sáng lên)
  showIn?: Array<"toolbar" | "bubble" | "slash" | "context" | "menu">;
  slashAliases?: string[];       // từ khóa tìm trong slash menu, cả tiếng Việt lẫn Anh
}
```

## 6.2. Quy tắc bắt buộc

1. Mọi command built-in **đăng ký vào Command Registry ngay từ Phase 1**. Phase 8 (extension) chỉ mở registry cho bên ngoài, không phải làm lại.
2. Phím tắt được **tra cứu qua registry** (cho phép đổi phím ở Phase 5). Cấm hard-code phím ở nơi khác.
3. Một tính năng có **đúng một** hàm `run`. Toolbar, phím tắt, slash menu cùng gọi hàm đó.
4. `id` là hợp đồng công khai. Đổi `id` là thay đổi phá vỡ, cần ghi vào CHANGELOG.
5. Command thay đổi tài liệu phải dùng transaction của editor để vào lịch sử undo.
6. Command phải an toàn khi gọi lúc không có selection hoặc lúc `isEnabled` trả về false (không ném lỗi).
7. Có test đơn vị cho từng command: chạy → kiểm tra trạng thái → undo → kiểm tra trở về.

## 6.3. Danh sách command của Phase 1

`format.bold`, `format.italic`, `format.strike`, `format.code`, `block.paragraph`, `block.heading1`, `block.heading2`, `block.heading3`, `block.bulletList`, `block.orderedList`, `block.blockquote`, `edit.undo`, `edit.redo`, `help.shortcuts`. Các command còn lại (file, link, ảnh, bảng…) thêm ở Phase tương ứng.

# 7. PHÍM TẮT

Ký hiệu: **Mod** = Ctrl (Windows/Linux) hoặc Cmd (macOS). Danh sách này là mặc định; người dùng đổi được từ Phase 5.

## 7.1. Bảng phím tắt mặc định

| Command | Windows / Linux | macOS | Gõ nhanh (input rule) | Phase |
|---|---|---|---|---|
| format.bold (In đậm) | Ctrl+B | Cmd+B | `**chữ**` | 1 |
| format.italic (In nghiêng) | Ctrl+I | Cmd+I | `*chữ*` | 1 |
| format.strike (Gạch ngang) | Ctrl+Shift+X | Cmd+Shift+X | `~~chữ~~` | 1 |
| format.code (Mã trong dòng) | Ctrl+E | Cmd+E | `` `chữ` `` | 1 |
| block.paragraph (Đoạn văn thường) | Ctrl+Alt+0 | Cmd+Opt+0 | | 1 |
| block.heading1 | Ctrl+Alt+1 | Cmd+Opt+1 | `# ` | 1 |
| block.heading2 | Ctrl+Alt+2 | Cmd+Opt+2 | `## ` | 1 |
| block.heading3 | Ctrl+Alt+3 | Cmd+Opt+3 | `### ` | 1 |
| block.bulletList | Ctrl+Shift+8 | Cmd+Shift+8 | `- ` hoặc `* ` | 1 |
| block.orderedList | Ctrl+Shift+7 | Cmd+Shift+7 | `1. ` | 1 |
| block.blockquote | Ctrl+Shift+B | Cmd+Shift+B | `> ` | 1 |
| edit.undo | Ctrl+Z | Cmd+Z | | 1 |
| edit.redo | Ctrl+Y hoặc Ctrl+Shift+Z | Cmd+Shift+Z | | 1 |
| help.shortcuts (Xem phím tắt) | Ctrl+/ | Cmd+/ | | 1 |
| file.new / open / save / saveAs | Ctrl+N / O / S / Shift+S | Cmd+N / O / S / Shift+S | | 3 |
| edit.find / replace | Ctrl+F / Ctrl+H | Cmd+F / Cmd+Opt+F | | 4 |
| edit.pastePlain | Ctrl+Shift+V | Cmd+Shift+V | | 4 |
| insert.link | Ctrl+K | Cmd+K | | 6 |
| block.codeBlock | Ctrl+Alt+C | Cmd+Opt+C | ` ``` ` | 6 |
| block.taskList | Ctrl+Shift+9 | Cmd+Shift+9 | `[ ] ` / `[x] ` | 6 |
| insert.horizontalRule | Ctrl+Alt+- | Cmd+Opt+- | `---` | 6 |

## 7.2. Quy tắc

1. **Phím tắt không bắt buộc người dùng phải nhớ.** Mỗi command trong bảng phải có thêm đường khác (nút, menu, slash) tới Phase 4. Từ Phase 1 tới 3 (chưa có toolbar), cửa sổ **"Xem phím tắt" (Ctrl+/)** là cách để người dùng tra cứu.
2. **Ctrl+U (gạch chân) và các phím định dạng không được hỗ trợ** (căn lề, màu…) phải hiện thông báo ngắn "Định dạng này không được hỗ trợ trong Markdown" thay vì im lặng không làm gì.
3. **Cảnh báo bàn phím AltGr:** trên một số bố cục bàn phím, AltGr được hệ điều hành xem như Ctrl+Alt. Các phím Ctrl+Alt+số có thể gõ ra ký tự thay vì chạy command. Giải pháp: cho phép gán lại phím (Phase 5) và kiểm tra trên bố cục **US** và **Vietnamese** ở Phase 1.
4. **Ngăn trình duyệt chiếm phím** chỉ cần khi chạy bản web (dev/dự phòng): đăng ký listener ở cấp window với `capture: true`, gọi `preventDefault()` trước khi sự kiện tới DOM con. Trong app Tauri, WebView không có phím tắt trình duyệt, nhưng vẫn phải test Ctrl+S/O/N/F/P.
5. **Enter thông minh** (chống mắc kẹt trong cấu trúc, lỗi ERR-06 của Gemini):
   - Enter trên dòng trống trong danh sách → thoát khỏi danh sách.
   - Enter trên dòng trống trong trích dẫn → thoát khỏi trích dẫn.
   - Enter ở cuối tiêu đề → tạo đoạn văn thường bên dưới.
   - Mũi tên xuống / Ctrl+Enter ở dòng cuối của khối mã → tạo đoạn văn bên dưới (Phase 6).
   - Backspace ở đầu một khối đặc biệt → chuyển về đoạn văn thường.
   - Shift+Enter → ngắt dòng cứng trong cùng đoạn.
   - Tab / Shift+Tab trong danh sách → thụt vào / lùi ra.
6. Thông báo lỗi và tên phím tắt hiển thị đúng theo hệ điều hành (Ctrl hay Cmd, ⌥ hay Alt).

# 8. INPUT RULES VÀ GÕ TIẾNG VIỆT

## 8.1. Input rules

Input rule (gõ `# ` ra tiêu đề) là **tiện ích cho người dùng nâng cao**, không phải đường trải nghiệm chính. Danh sách ở cột "Gõ nhanh" của bảng 7.1.

Mỗi input rule phải:
- **hoàn tác được bằng một lần Ctrl+Z** (lần Undo đầu tiên trả lại đúng ký tự đã gõ, ví dụ `# `);
- chỉ kích hoạt ở vị trí hợp lệ (ví dụ `# ` chỉ ở đầu dòng);
- **không kích hoạt khi đang soạn dấu tiếng Việt** (xem 8.2).

## 8.2. Chính sách IME / tiếng Việt (bắt buộc)

Bộ gõ như Unikey/EVKey gửi chuỗi ký tự trung gian qua `compositionstart`, `compositionupdate`, `compositionend`. Quy tắc:

1. Khi `isComposing === true` (hoặc `editor.view.composing`), **tạm khóa toàn bộ input rules, phím tắt định dạng, và logic tự động chuyển đổi.**
2. Không chặn các phím mà bộ gõ cần (Backspace, Space, các phím chữ).
3. Không chuẩn hóa Unicode (NFC/NFD) bất kỳ chuỗi nào người dùng gõ hoặc nạp từ file. Giữ nguyên byte (xem 9.6).
4. Không thêm phím tắt cần thao tác dễ vô tình chạm khi đang gõ dấu (như Alt+chữ đơn lẻ).
5. Layout chữ: dòng chữ phải đủ cao để không cắt dấu chồng (`line-height` mặc định ≥ 1.5; xem token ở Phụ lục C).

## 8.3. Phải test (xem mục 18.3)

Telex: `aa→â`, `aw→ă`, `ee→ê`, `oo→ô`, `ow→ơ`, `uw→ư`, `dd→đ`, thanh `s f r x j`, và gõ liền cả từ dài ("nghiêng", "thương", "Việt Nam"). VNI tương đương. Kiểm tra trong đoạn văn, tiêu đề, danh sách, trích dẫn, cạnh ký tự `*`, `_`, `#`. Kiểm tra trên **WebView2 trong Tauri**, không chỉ trên Chrome.

# 9. CHÍNH SÁCH MARKDOWN

Phần quan trọng nhất của dự án. Mục tiêu là **bảo toàn ý nghĩa tài liệu và bảo toàn dữ liệu**, không bảo toàn từng byte.

## 9.1. Phạm vi hỗ trợ

| Cấu trúc | Mức hỗ trợ | Phase |
|---|---|---|
| Đoạn văn, ngắt dòng cứng | Đầy đủ | 2 |
| Tiêu đề ATX `# … ######` | Đầy đủ (H1–H6 hiển thị; UI chính cung cấp H1–H3) | 2 |
| In đậm, in nghiêng, gạch ngang, mã trong dòng | Đầy đủ | 2 |
| Danh sách có thứ tự / không thứ tự, lồng nhau | Đầy đủ | 2 |
| Trích dẫn (cả lồng nhau) | Đầy đủ | 2 |
| Đường kẻ ngang | Đầy đủ | 6 |
| Liên kết, tự động liên kết (autolink) | Đầy đủ | 6 |
| Ảnh | Đầy đủ (xem D-06) | 6 |
| Khối mã có ngôn ngữ | Đầy đủ | 6 |
| Task list (GFM) | Đầy đủ | 6 |
| Bảng (GFM) | Chỉ bảng biểu diễn được bằng GFM (xem 9.4) | 6 |
| Front matter YAML đầu file | **Giữ nguyên** dưới dạng khối thô (9.2) | 2 |
| HTML thô (khối và trong dòng) | **Giữ nguyên** dưới dạng khối thô | 2 |
| Chú thích cuối (footnote), công thức toán, sơ đồ Mermaid, container tùy biến… | **Giữ nguyên** dưới dạng khối thô; hỗ trợ thật nếu có extension | 2 |
| Định nghĩa liên kết tham chiếu (`[a]: url`) | Phải được xử lý có chủ đích: chuyển liên kết dạng tham chiếu thành liên kết thường **hoặc** giữ nguyên. Chốt ở Phase 2, ghi vào danh sách chuẩn hóa | 2 |

## 9.2. Khối thô (Raw Block) — chống mất dữ liệu

Mọi nội dung hợp lệ trong file nhưng **chưa có node tương ứng trong editor** phải được giữ lại nguyên văn trong một node `rawBlock` (hoặc `rawInline`) và **ghi ra đúng nguyên văn khi lưu**.

- Hiển thị: khối có viền nhạt, nhãn "Nội dung chưa hỗ trợ chỉnh sửa trực quan", văn bản trong phông monospace.
- Phase 2: chỉ đọc (không sửa trong editor, nhưng xóa/di chuyển được cả khối).
- Phase 6–7: cho phép "Sửa dạng văn bản" từng khối.
- **Cấm tuyệt đối** parser âm thầm bỏ qua cấu trúc không nhận ra.

## 9.3. Quy tắc chuẩn hóa khi lưu (D-11)

| Hạng mục | Quy tắc |
|---|---|
| In đậm / in nghiêng | `**chữ**` / `*chữ*` |
| Gạch ngang | `~~chữ~~` |
| Danh sách không thứ tự | `-` |
| Danh sách có thứ tự | `1.` `2.` `3.` (đánh số tăng dần; **giữ nguyên số bắt đầu** nếu khác 1) |
| Lồng danh sách | Thụt 2 khoảng trắng cho `-`, theo độ rộng dấu cho danh sách số |
| Tiêu đề | Kiểu ATX (`#`). Tiêu đề Setext (`===`) được chuyển thành ATX |
| Khối mã | Rào ba dấu huyền ` ``` ` kèm ngôn ngữ. Đủ dài để không xung đột nếu nội dung có ` ``` ` |
| Đường kẻ ngang | `---` |
| Ngắt dòng cứng | Dấu `\` cuối dòng |
| Danh sách chặt / lỏng (tight/loose) | Bảo toàn nếu engine hỗ trợ; nếu không, ghi vào danh sách "chuẩn hóa đã biết" |
| Dòng trống | Đúng một dòng trống giữa các khối; file kết thúc bằng đúng một ký tự xuống dòng |

**Danh sách chuẩn hóa đã biết** (known normalizations) được duy trì trong `docs/architecture/markdown-normalizations.md`. Mọi thay đổi định dạng khi lưu **không nằm trong danh sách này đều coi là lỗi**.

## 9.4. Bảng

Markdown GFM chỉ cho nội dung **một dòng** trong ô, không có ô gộp, không có danh sách trong ô.

- Editor chỉ cho phép tạo/sửa bảng mà GFM biểu diễn được: ô chỉ chứa nội dung trong dòng (chữ, in đậm, mã, liên kết).
- Khi mở file có bảng **không biểu diễn được** (ví dụ bảng HTML có `colspan`), giữ nguyên dưới dạng khối thô (9.2).
- Căn lề cột (`:---`, `:---:`) được bảo toàn.

## 9.5. Escape ký tự đặc biệt (P0)

Khi người dùng **gõ chữ** `*`, `_`, `#`, `>`, `-`, `1.`, `[`, `` ` ``, `|`, `\`, `<` ở vị trí mà Markdown sẽ hiểu là cú pháp, serializer phải **escape** (ví dụ `\*`) để mở lại file vẫn ra đúng chữ ban đầu.

Test bắt buộc: gõ văn bản chứa các ký tự này (cả cạnh chữ tiếng Việt) → lưu → mở lại → **kết quả phải giống hệt lúc gõ**.

## 9.6. Tệp và mã hóa

- **UTF-8.** Nếu file gốc có BOM thì giữ BOM; file mới không BOM.
- **Kết thúc dòng:** phát hiện LF hay CRLF khi mở và **giữ nguyên** khi lưu. File mới: LF.
- **Không chuẩn hóa Unicode.** Chuỗi `ế` ở dạng NFC hay NFD phải được giữ nguyên đúng như file gốc. (Đây là rủi ro riêng của tiếng Việt: hai dạng này hiển thị giống nhau nhưng khác byte.)
- File không phải UTF-8 hợp lệ: hỏi người dùng trước khi mở, không đoán rồi ghi đè.

## 9.7. Tiêu chí đạt / trượt (gate của Phase 2)

Tập kiểm thử (**corpus**) gồm: ví dụ cho từng cấu trúc mục 9.1; tối thiểu **30 file Markdown thật** (README, ghi chú, tài liệu tiếng Việt, file có bảng, danh sách lồng, khối mã); và các ca xấu (file rỗng, dòng rất dài, ký tự lạ, CRLF, BOM, NFD).

Điều kiện **ĐẠT** để khóa kiến trúc Markdown:

1. **0 mất dữ liệu:** với mọi file trong corpus, tập hợp văn bản và liên kết/ảnh sau round-trip phải bằng ban đầu (so sánh cây ngữ nghĩa sau chuẩn hóa).
2. **Idempotent:** `lưu(mở(lưu(mở(x)))) == lưu(mở(x))` với mọi file.
3. Mọi cấu trúc mục 9.1 ở mức "Đầy đủ" và đã thuộc phase hiện tại: round-trip đúng 100%.
4. Cấu trúc ở mức "Giữ nguyên" được ghi ra **đúng nguyên văn**.
5. Mọi khác biệt byte còn lại đều nằm trong danh sách chuẩn hóa đã biết.
6. Test escape (9.5) và test tiếng Việt (NFC/NFD) đạt.

**Trượt** một trong các điều kiện trên → chuyển bậc phương án dự phòng (mục 4.4). Cho phép tối đa 2 lỗi mức thấp đã biết có cách tránh nếu PO chấp thuận.

## 9.8. An toàn khi mở và lưu

Chi tiết ở mục 11. Tóm tắt: khi mở một file, nếu nội dung sau round-trip **khác về ngữ nghĩa** so với file gốc thì cảnh báo trước và vẫn không ghi gì; mọi lần lưu đè đều tạo bản sao lưu và ghi bằng cách tạo file tạm rồi đổi tên (atomic).

# 10. TÍNH NĂNG NGOÀI MARKDOWN, PASTE VÀ ẢNH

## 10.1. Phân loại tính năng

| Loại | Ví dụ | Quy tắc |
|---|---|---|
| **UI-only** | Font giao diện, màu nền, độ rộng trang, kiểu toolbar | Lưu trong Settings/Theme, **không bao giờ** vào file `.md` |
| **Document-level chuẩn** | Mọi cấu trúc ở 9.1 | Có quy tắc serialize rõ |
| **Document-level tùy biến** | Mermaid, công thức… | Chỉ qua extension, và **extension phải khai báo cách serialize** (không được làm mất khi không có extension: dùng khối thô) |
| **Không hỗ trợ** | Gạch chân, màu chữ, cỡ chữ, căn lề, nền chữ | Không có trong tài liệu (D-09). Không thêm vì "người dùng quen Word" |

## 10.2. Chính sách dán (paste)

| Nguồn trên clipboard | Hành vi |
|---|---|
| Văn bản thuần | Dán nguyên văn. Nếu nội dung **rõ ràng là Markdown** (có từ 2 dấu hiệu cấu trúc như tiêu đề + danh sách + in đậm) → chuyển thành định dạng và hiện thông báo nhỏ "Đã chuyển từ Markdown. Hoàn tác để dán nguyên văn". Có thể tắt trong Settings |
| HTML (từ web, Word, Google Docs) | Ánh xạ về các node/mark được hỗ trợ theo schema. Bỏ màu, font, cỡ chữ, căn lề, style rác. Không báo lỗi |
| Ảnh | Phase 6: lưu vào thư mục assets (D-06). Trước Phase 6: bỏ qua và hiện thông báo |
| Ctrl+Shift+V | Luôn dán thành văn bản thuần |
| Nội dung lớn | Dưới 500 KB: dán bình thường. 500 KB – 5 MB: hiện "Đang xử lý…" và cảnh báo có thể chậm. Trên 5 MB: hỏi xác nhận; mặc định dán thành văn bản thuần. Ngưỡng điều chỉnh sau khi đo ở Phase S |

Nguyên tắc: **không "thông minh" đến mức gây bất ngờ.** Mọi chuyển đổi tự động đều có thông báo và hoàn tác được.

## 10.3. Ảnh (Phase 6)

- Dán/kéo thả/chèn ảnh → sao chép vào `<tên-tài-liệu>.assets/` với tên duy nhất; Markdown ghi `![mô tả](tên-tài-liệu.assets/ten-file.png)`.
- Tài liệu **chưa lưu lần nào**: giữ ảnh trong bộ nhớ tạm, ghi ra khi lưu lần đầu (hoặc yêu cầu lưu trước).
- Hiển thị ảnh cục bộ qua cơ chế asset của Tauri (không mở quyền đọc toàn bộ ổ đĩa).
- Ảnh từ URL ngoài: chặn mặc định (D-06).
- Giới hạn kích thước ảnh và cảnh báo ảnh quá lớn.
- Văn bản thay thế (alt) có ô nhập, hỗ trợ khả năng tiếp cận.

# 11. TỆP, TRẠNG THÁI, AUTOSAVE, PHỤC HỒI

## 11.1. Thao tác tệp (Phase 3)

Mới, Mở, Lưu, Lưu thành, Mở file gần đây, mở file bằng kéo thả vào cửa sổ, mở file bằng đối số dòng lệnh / liên kết file `.md` của hệ điều hành. Dùng dialog gốc của Tauri. Chỉ được truy cập file mà **người dùng chọn qua dialog hoặc hệ điều hành đưa vào** (xem mục 17).

## 11.2. Trạng thái tài liệu

| Trạng thái | Hiển thị |
|---|---|
| Mới, chưa lưu | `Không có tiêu đề` |
| Đã lưu | `ten-file.md` |
| Đã sửa | `ten-file.md *` |
| Đang lưu | chỉ báo nhẹ |
| Lưu lỗi | thông báo rõ + **giữ nguyên trạng thái đã sửa**, không đánh dấu là đã lưu |

Đóng cửa sổ khi chưa lưu → hộp thoại `[Lưu] [Không lưu] [Hủy]`.

## 11.3. Ghi file an toàn (atomic write)

Mọi lần lưu:
1. Serialize Markdown ra bộ nhớ.
2. Nếu file đích đã tồn tại: sao chép bản hiện tại vào thư mục backup của app (D-13).
3. Ghi ra **file tạm cùng thư mục**, đồng bộ xuống đĩa.
4. Đổi tên file tạm đè file đích.
5. Chỉ khi cả bốn bước thành công mới chuyển trạng thái sang "Đã lưu".
6. Nếu có bước thất bại: giữ file gốc nguyên vẹn, hiển thị lỗi dễ hiểu, giữ nội dung đang soạn.

## 11.4. Mở file có nguy cơ thay đổi

Khi mở file, chạy thử `parse → serialize` trong bộ nhớ (chưa ghi). Nếu kết quả khác file gốc ngoài danh sách chuẩn hóa đã biết (9.3):
- Hiện thông báo không đáng sợ: "Tệp này có thể được định dạng lại khi lưu. Bản gốc sẽ được sao lưu."
- Cho phép "Mở ở chế độ chỉ đọc".

## 11.5. Thay đổi từ bên ngoài

Theo dõi thời gian sửa/hash của file đang mở. Khi file bị sửa hoặc xóa bởi chương trình khác:
- Chưa có thay đổi chưa lưu → hỏi "Tải lại?".
- Có thay đổi chưa lưu → hỏi "Giữ bản của tôi / Tải bản trên đĩa / Lưu thành bản khác". **Không bao giờ ghi đè mà không hỏi.**

## 11.6. Autosave và phục hồi (Phase 3b)

- **Autosave ghi vào kho phục hồi riêng của app, không ghi đè file `.md` của người dùng**, trừ khi người dùng bật tùy chọn "Tự động lưu vào file" (mặc định tắt).
- Có debounce (ví dụ 2–3 giây sau lần gõ cuối), hàng đợi ghi, xử lý lỗi, không ghi liên tục từng ký tự.
- Khi app khởi động sau sự cố: "Phát hiện phiên làm việc chưa lưu. [Khôi phục] [Bỏ]". Dữ liệu phục hồi không tự động đè file gốc.
- Dọn dữ liệu phục hồi khi tài liệu được lưu hoặc người dùng bỏ.

# 12. GIAO DIỆN NGƯỜI DÙNG (UX LAYER)

Áp dụng từ Phase 4. Mọi thành phần chỉ gọi Command.

## 12.1. Bố cục mặc định

```
┌──────────────────────────────────────────────────────┐
│ Tệp   Chỉnh sửa   Xem   Định dạng   Trợ giúp         │  Menu bar
├──────────────────────────────────────────────────────┤
│ ↶ ↷ │ B I S │ Tiêu đề ▾ │ • 1. ❝ │ </> 🔗 🖼 │ ⋯     │  Toolbar (có thể ẩn)
├──────────────────────────────────────────────────────┤
│                                                      │
│               Vùng soạn thảo (tờ giấy)               │
│                                                      │
├──────────────────────────────────────────────────────┤
│ ten-file.md *                     1.234 chữ │ Đã sửa │  Status bar
└──────────────────────────────────────────────────────┘
```

Không hiển thị 20 nút ngay khi mở: toolbar mặc định gồm đúng danh sách ở 12.2, phần còn lại nằm sau nút "Thêm (⋯)".

## 12.2. Thành phần

| Thành phần | Nội dung | Ghi chú |
|---|---|---|
| Toolbar | Undo, Redo, Bold, Italic, Strike, Tiêu đề (dropdown), Danh sách, Danh sách số, Trích dẫn, Mã, Liên kết, Ảnh, Thêm (⋯) | Tooltip có tên + phím tắt; trạng thái active; điều hướng bằng bàn phím; nhãn ARIA |
| Bubble menu | Hiện khi bôi đen chữ: B, I, S, Liên kết | Chỉ thao tác nhanh trên vùng chọn |
| Slash menu | Gõ `/` ở dòng trống: Tiêu đề 1–3, Danh sách, Danh sách số, Trích dẫn, Khối mã, Bảng, Đường kẻ… Lọc theo từ khóa, **cả tiếng Việt lẫn tiếng Anh** (`/bang`, `/table`) | Không kích hoạt khi đang soạn dấu tiếng Việt (8.2) |
| Context menu | Chuột phải: Cắt/Sao chép/Dán/Dán thuần văn bản + định dạng thường dùng | |
| Menu bar | Tệp, Chỉnh sửa, Xem, Định dạng, Trợ giúp | Mọi mục lấy từ Command Registry |
| Tìm / Thay thế | Thanh nhỏ phía trên; đếm kết quả; phân biệt hoa/thường; thay một / thay tất cả; hoàn tác được | Phase 4 |
| Status bar | Tên file + trạng thái, số chữ/ký tự | |
| Hộp thoại phím tắt | Danh sách tất cả command + phím, có tìm kiếm | Có từ Phase 1 |

**Tiêu chí hoàn thành Phase 4:** người dùng thao tác được mọi tính năng mà **không cần nhớ phím tắt nào** ngoài Ctrl+B/I (và Ctrl+S).

# 13. THEME VÀ SETTINGS

## 13.1. Nguyên tắc

- Theme chỉ là **dữ liệu** (JSON gồm các giá trị token). **Không chứa mã, không chứa CSS tự do.**
- Mọi màu, cỡ chữ, khoảng cách trong UI **bắt buộc dùng CSS variable** từ Phase 0; cấm hard-code giá trị màu trong component.
- Theme không bao giờ ảnh hưởng nội dung Markdown.

## 13.2. Bộ token (nguồn duy nhất)

Tên token lấy từ Gemini, **là chuẩn duy nhất** (bỏ các tên rời rạc ở V1.0). Danh sách đầy đủ ở Phụ lục C. Nhóm token: nền/bề mặt, chữ, viền, bo góc, font, kích thước, bố cục tờ giấy, đổ bóng, màu chọn/focus, trạng thái (lỗi, cảnh báo, thành công).

Theme có sẵn: **Sáng, Tối, Sepia** (Nordic tùy chọn). Chuyển theme tức thì, không tải lại.

## 13.3. Tệp theme

Theme là JSON (ví dụ ở Phụ lục C) với `schemaVersion`, `name`, `author`, `version`, `variables`. Quy tắc kiểm tra khi nhập (`ThemeService`):

1. Chỉ chấp nhận khóa nằm trong danh sách token đã biết; khóa lạ bị bỏ qua kèm cảnh báo.
2. Giá trị phải đúng kiểu: màu (`#rgb`, `#rrggbb`, `#rrggbbaa`, `rgb()`, `hsl()`), độ dài (số + đơn vị `px`/`rem`/`em`), số, danh sách tên font.
3. **Từ chối** mọi giá trị chứa `url(`, `@import`, `expression(`, `javascript:`, dấu `;` hoặc `{}` (không được lách thành CSS tùy ý).
4. Font chỉ là tên font hệ thống hoặc font đã đóng gói; không tải font từ mạng.
5. Theme lỗi **không làm app hỏng**: quay về theme mặc định và báo "Theme không hợp lệ" (nhóm lỗi *Theme corruption*).
6. File lớn hơn 1 MB bị từ chối.

## 13.4. Kiểm tra độ tương phản

Khi người dùng tự chỉnh màu: tính tỉ lệ tương phản chữ/nền theo WCAG. Dưới 4.5:1 thì hiện cảnh báo "Chữ khó đọc" kèm nút "Sửa tự động". Không chặn (người dùng quyết định), nhưng không để họ vô tình tạo ra theme không đọc được.

## 13.5. Trình tùy biến không cần code (Phase 5)

Màn hình **Cài đặt → Giao diện → Tùy biến theme**:

- Ô chọn màu: nền, chữ, nhấn, viền, nền mã.
- Font chữ (chọn từ danh sách), cỡ chữ, giãn dòng, độ rộng vùng soạn thảo.
- Bật/tắt: thanh công cụ, chế độ gọn, hiển thị tờ giấy.
- **Xem trước trực tiếp** ngay trong editor.
- Nút: Lưu theme, Nhân bản, Xuất, Nhập, Đặt lại.
- **Tùy biến thanh công cụ:** chọn command nào hiện, kéo để sắp xếp (lấy danh sách từ Command Registry).
- **Tùy biến phím tắt:** chọn command → bấm phím mới; cảnh báo xung đột; "Đặt lại mặc định".

## 13.6. Settings

Lưu ở thư mục cấu hình của app (không nằm trong file tài liệu). Cấu trúc ở Phụ lục C có `schemaVersion`; khi nâng phiên bản, `SettingsService` có hàm migrate. File settings hỏng → dùng mặc định, đổi tên file hỏng thành `.broken` để không mất, báo người dùng.

# 14. EXTENSION

## 14.1. Sự thật kỹ thuật cần nói rõ

Extension của Tiptap/ProseMirror là mã JavaScript **chạy cùng tiến trình** với app và truy cập được toàn bộ editor. **Không thể sandbox chúng một cách thật sự** chỉ bằng cấu hình. Vì vậy extension được chia theo mức an toàn, và mức có mã bên thứ ba bị hạn chế chặt.

## 14.2. Ba cấp extension

| Cấp | Là gì | Chạy mã? | Ai cài được |
|---|---|---|---|
| **0 — Built-in** | Tính năng đi kèm app (bold, table…) | Mã của dự án | Mặc định |
| **1 — Khai báo (Declarative)** | Gói **dữ liệu**: preset thanh công cụ, bộ phím tắt, theme, mẫu văn bản (snippet), danh sách slash command trỏ tới command có sẵn | **Không** | Mọi người dùng — an toàn như theme |
| **2 — Có mã (Code)** | Thêm node/mark/command/parser mới | **Có** | **Chỉ ở Chế độ nhà phát triển** cho tới khi có thiết kế sandbox riêng được review |

Người dùng không biết code có thể tùy biến phần lớn nhu cầu qua **cấp 1** (đúng mục tiêu "không cần code").

## 14.3. API đăng ký (Phase 8)

`registerCommand`, `registerShortcut`, `registerToolbarItem`, `registerSlashCommand`, `registerNode`, `registerMark`, `registerMarkdownHandler`, `registerSettingsPanel`, `registerThemeToken`. Các hàm này mở cùng registry mà built-in đã dùng từ Phase 1 (mục 6).

## 14.4. Manifest

Mỗi extension có `extension.json`:

```json
{
  "id": "vi.example.mermaid",
  "name": "Mermaid",
  "version": "1.0.0",
  "apiVersion": 1,
  "author": "Tên tác giả",
  "license": "MIT",
  "level": 2,
  "permissions": [],
  "contributes": {
    "commands": ["insertMermaid"],
    "slashCommands": ["mermaid"],
    "markdown": { "fence": "mermaid" }
  }
}
```

- `apiVersion` gắn với phiên bản API; app từ chối extension có `apiVersion` không tương thích.
- `permissions` khai báo mọi quyền cần (đọc file, mạng…). Cấp 1 luôn rỗng.
- Extension lỗi **không làm sập app**: bắt lỗi, tự vô hiệu hóa, hiện thông báo "Extension X gặp lỗi và đã bị tắt".
- Extension thêm cấu trúc mới **bắt buộc** khai báo cách serialize; nếu tắt/gỡ extension thì nội dung vẫn được giữ qua khối thô (9.2).

## 14.5. Chợ extension

Chưa xây. Điều kiện tối thiểu trước khi có bất kỳ kênh phân phối công khai nào cho extension cấp 2: thiết kế sandbox đã review, mô hình quyền hạn, ký/xác minh gói, quy trình báo cáo extension độc hại.

# 15. AI (CHỈ CHUẨN BỊ, CHƯA BUILD)

- AI là **extension**, không là phụ thuộc của core. Mất AI/API thì editor chạy bình thường.
- AI **không sửa chuỗi Markdown trực tiếp**. AI tạo ra đề xuất thông qua command/transaction → người dùng xem lại (chấp nhận/từ chối) → vào lịch sử undo.
- Điều kiện kiến trúc cần có từ trước: Command Registry (mục 6), khả năng lấy văn bản vùng chọn/toàn tài liệu, khả năng áp đặt thay đổi dưới dạng transaction có thể hoàn tác.
- Quyền riêng tư: gửi nội dung lên dịch vụ ngoài **chỉ khi người dùng chủ động kích hoạt** và thấy rõ dữ liệu nào được gửi. Khóa API do người dùng tự cung cấp, lưu bằng kho khóa của hệ điều hành, không lưu trong settings dạng văn bản thường.

# 16. KHẢ NĂNG TIẾP CẬN VÀ ĐA NGÔN NGỮ

## 16.1. Khả năng tiếp cận (từ Phase 1)

Điều hướng bằng bàn phím cho mọi thành phần; focus nhìn thấy rõ; tooltip; nhãn ARIA; tương phản đủ (mục 13.4); tôn trọng "giảm chuyển động" của hệ điều hành; thông báo trạng thái đọc được bằng trình đọc màn hình (ví dụ "Đã lưu"). Kiểm tra bằng công cụ tự động (axe) trong CI và rà soát thủ công trước Phase 11.

## 16.2. Đa ngôn ngữ

- Mọi chuỗi giao diện đi qua i18n, **cấm chuỗi cứng trong component** (thêm quy tắc lint).
- Ngôn ngữ ban đầu: `vi`, `en`. Mặc định theo ngôn ngữ hệ điều hành, đổi được trong Settings.
- Khóa ngôn ngữ ổn định để cộng đồng dịch thêm (`locales/<mã>.json`).
- Định dạng số/ngày theo locale. Từ khóa slash menu có cả vi/en (mục 12.2).

# 17. BẢO MẬT

## 17.1. Tauri

- **Quyền tối thiểu (capabilities):** chỉ bật các quyền thật sự dùng (dialog, đọc/ghi file người dùng đã chọn, thư mục dữ liệu app). **Không cấp quyền fs rộng** (không phạm vi `**` toàn ổ đĩa).
- File được truy cập: file người dùng chọn qua dialog, file mở bằng hệ điều hành, thư mục `.assets` cạnh tài liệu đó, và thư mục dữ liệu riêng của app.
- **CSP nghiêm:** không `unsafe-eval`; không tải script/stylesheet/ảnh từ mạng; kết nối mạng bị chặn mặc định.
- Không bật `devtools` ở bản phát hành thường (chỉ trong Chế độ nhà phát triển).

## 17.2. Nội dung

- **HTML dán vào** đi qua schema của ProseMirror (chỉ giữ node/mark được định nghĩa), nên script/style/thuộc tính nguy hiểm tự bị loại. Vẫn phải có test với payload XSS thường gặp.
- **Liên kết:** chỉ cho phép `http`, `https`, `mailto` và đường dẫn tương đối. **Chặn** `javascript:`, `data:`, `file:` tùy ý. Mở liên kết ngoài bằng trình duyệt hệ thống, không mở trong cửa sổ app.
- **Khối HTML thô** trong tài liệu chỉ hiển thị dưới dạng văn bản (khối thô, 9.2), **không bao giờ được render thành HTML chạy được**.
- **Ảnh từ xa:** chặn mặc định (D-06).
- **Đường dẫn ảnh tương đối:** chuẩn hóa và kiểm tra không thoát ra khỏi thư mục tài liệu/`assets` (chống `../`).

## 17.3. Chuỗi cung ứng

Mỗi dependency mới phải trả lời 4 câu (mục 21.2). Chạy kiểm tra lỗ hổng (`npm audit`, `cargo audit`) trong CI. Dùng lockfile và cài đặt theo lockfile.

# 18. HIỆU NĂNG VÀ KIỂM THỬ

## 18.1. Tháp kiểm thử

| Tầng | Công cụ | Nội dung |
|---|---|---|
| Đơn vị | Vitest | Command, keymap, theme validator, settings migrate, file state machine, Markdown adapter |
| Round-trip Markdown | Vitest + corpus | Mục 9.7 — chạy mỗi lần thay đổi code liên quan |
| Tích hợp | Vitest + Testing Library | Toolbar gọi đúng command; theme áp dụng; dialog |
| E2E web | Playwright (trên bản web/Chromium) | Gõ → chọn → Ctrl+B → kiểm tra → … |
| Desktop | tauri-driver (WebDriver) cho kịch bản khói; còn lại **thủ công** | Mở/lưu file thật, đóng khi chưa lưu, kéo thả, file association |
| Thủ công có kịch bản | PO / QA trên máy Windows thật | IME tiếng Việt, cảm giác gõ, hiệu năng |

## 18.2. Hiệu năng (mục tiêu đo, không cam kết)

Đo ở Phase S và Phase 2, sau đó chốt ngưỡng:

- Tài liệu 1 KB, 100 KB, 1 MB, 5 MB; danh sách rất dài; khối mã lớn; dán lớn.
- Chỉ số: thời gian khởi động, độ trễ gõ (không thấy trễ ở tài liệu ≤ 100 KB), thời gian mở file, bộ nhớ.
- Nếu không đạt: đưa ra giới hạn kích thước và cảnh báo (mục 10.2) thay vì cam kết hứa hẹn.

## 18.3. Kịch bản kiểm tra tiếng Việt (thủ công, bắt buộc)

Thực hiện trên Windows thật với **Unikey và EVKey**, kiểu **Telex và VNI**, trong WebView2 của app Tauri:

1. Gõ đoạn văn dài có đủ `ă â ê ô ơ ư đ` và 5 thanh; không dấu nhân đôi, không mất dấu.
2. Gõ trong: đoạn thường, tiêu đề, danh sách, trích dẫn, ô bảng.
3. Gõ `# ` rồi chữ có dấu; gõ `*` cạnh chữ có dấu; gõ ngay sau khi chuyển khối.
4. Sửa dấu giữa từ (gõ lại), xóa bằng Backspace giữa chuỗi đang soạn.
5. Chọn chữ có dấu → Ctrl+B → tiếp tục gõ.
6. Lưu → đóng → mở lại → so sánh từng ký tự (cả dạng NFC/NFD nếu file gốc có).
7. Bật/tắt tùy chọn "kiểm tra chính tả/gạch chân đỏ" của bộ gõ nếu có.

**Tiêu chí:** không lỗi ở 7 mục. Bất kỳ lỗi nào trên đây là **lỗi chặn** của phase.

# 19. CẤU TRÚC DỰ ÁN

```
markdown-editor/
├── AGENTS.md                  # Quy tắc cho AI builder (mục 21), đọc đầu tiên
├── README.md  LICENSE  CONTRIBUTING.md  CODE_OF_CONDUCT.md  CHANGELOG.md
├── docs/
│   ├── PLAN.md                # Bản Plan này (nguồn sự thật)
│   ├── architecture/          # versions.md, markdown-normalizations.md, decisions/
│   ├── extensions/            # hướng dẫn viết extension
│   └── themes/                # hướng dẫn tạo theme
├── spikes/                    # Mã thử nghiệm Phase S (KHÔNG thuộc sản phẩm)
├── src/
│   ├── app/                   # khởi tạo, bố cục, provider
│   ├── components/            # editor, toolbar, menus, dialogs, ui
│   ├── core/
│   │   ├── commands/          # Command Registry + định nghĩa command
│   │   ├── keymap/            # tra cứu/ghi đè phím, phát hiện nền tảng
│   │   ├── editor/            # cấu hình Tiptap, schema, node tùy biến (rawBlock…)
│   │   ├── markdown/          # adapter, handler, quy tắc chuẩn hóa, escape
│   │   ├── extensions/        # API extension (Phase 8)
│   │   └── document/          # trạng thái tài liệu (dirty, path…)
│   ├── features/              # file, appearance, settings, themes, recovery, search
│   ├── services/              # file-service, settings-service, theme-service, recovery-service
│   ├── i18n/ locales/         # vi.json, en.json
│   ├── styles/                # globals.css, editor.css, themes/
│   ├── types/  utils/  hooks/
├── src-tauri/                 # (từ Phase 3) lib.rs, commands/, capabilities/, tauri.conf.json
├── tests/
│   ├── unit/  integration/  e2e/
│   └── fixtures/markdown/     # corpus round-trip (mục 9.7)
└── .github/                   # workflows CI, issue templates
```

Nguyên tắc: module phản ánh **trách nhiệm**, không tách file chỉ để đạt số dòng.

**CI tối thiểu (từ Phase 0):** cài đặt theo lockfile → `tsc --noEmit` → lint → Vitest → build. Từ Phase 2 thêm round-trip corpus. Từ Phase 4 thêm Playwright. Pull request không qua CI thì không merge.

# 20. ROADMAP BUILD

Mỗi phase có: **mục tiêu, việc làm, không làm, tiêu chí hoàn thành, kiểm tra của PO, cổng (gate)**. Một phase chỉ xong khi đủ Định nghĩa Hoàn thành (mục 21.5).

Tổng quan thứ tự: **S → 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11**. MVP kết thúc ở **Phase 3**.

## PHASE S — Thử nghiệm kiểm chứng (Spike), 2–3 ngày

**Mục tiêu:** trả lời bằng thực nghiệm 4 câu hỏi rủi ro lớn nhất trước khi khóa kiến trúc. Mã trong `spikes/` là mã bỏ đi.

| Mã | Câu hỏi | Cách kiểm chứng | Kết quả cần có |
|---|---|---|---|
| S1 | Gõ Telex/VNI bằng Unikey/EVKey trong WebView2 của Tauri + Tiptap có lỗi không? Input rule có xung đột? | Shell Tauri tối thiểu + editor Tiptap; chạy kịch bản 18.3 | Danh sách lỗi (nếu có) + cách tránh |
| S2 | `@tiptap/markdown` round-trip có đạt tiêu chí 9.7 không? | Nạp corpus thử (≥ 30 file), so sánh | Bảng đạt/trượt theo từng cấu trúc; quyết định bậc A/B/C (mục 4.4) |
| S3 | Môi trường Tauri 2 build được trên máy build/PO? Dialog + ghi atomic hoạt động? | Cài Rust/Tauri, mở/lưu file thử | Hướng dẫn cài đặt đã kiểm chứng; ghi chú vấn đề |
| S4 | In ra PDF từ WebView2 có chấp nhận được? Hiệu năng tài liệu lớn? | Thử in; đo 100 KB/1 MB/5 MB | Quyết định cho D-07; ngưỡng ở 10.2 và 18.2 |

**Gate S:** báo cáo `docs/architecture/spike-report.md` với kết luận **GO** hoặc **ADJUST** (kèm điều chỉnh Plan). Nếu S1 hoặc S2 cho kết quả tệ, **dừng và xem lại Plan** trước khi sang Phase 0. Đây là lý do Phase S tồn tại.

## PHASE 0 — Khởi tạo (Bootstrap, bản web)

**Việc làm:** Vite + React + TypeScript (strict) + Tiptap; ESLint/Prettier/Vitest; CI cơ bản; `AGENTS.md`; i18n khung (`vi`, `en`); file CSS variables khung (chỉ theme Sáng) và quy tắc "không hard-code màu"; `docs/architecture/versions.md`; README tối thiểu.

**Không làm:** Tauri, theme, toolbar, file system, Markdown.

**Hoàn thành khi:**

- [ ] `npm install` và `npm run build` thành công từ máy sạch
- [ ] Editor hiển thị và nhận input
- [ ] Không có lỗi nghiêm trọng trong console
- [ ] CI chạy xanh
- [ ] Phiên bản đã ghim và ghi lại

## PHASE 1 — Core editor + Command + Phím tắt (**mốc đầu tiên PO dùng thử**)

**Việc làm:** Command Registry (mục 6) và các command ở 6.3; cấu hình StarterKit (4.3); Paragraph, Heading 1–3, Bold, Italic, Strike, Inline code, Bullet list, Ordered list, Blockquote, Undo/Redo; **toàn bộ phím tắt Phase 1 ở bảng 7.1**; Enter thông minh (7.2); input rules cơ bản (8.1) với khóa khi đang soạn dấu (8.2); thông báo cho phím không hỗ trợ (Ctrl+U); cửa sổ "Xem phím tắt"; status bar tối giản (số chữ).

**Không làm:** toolbar, menu, file, Markdown I/O, theme, link, ảnh, bảng, code block.

**Hoàn thành khi:**

- [ ] Gõ, chọn, xóa, di chuyển con trỏ tự nhiên
- [ ] Mọi command Phase 1 chạy bằng phím tắt và bằng input rule (nơi có)
- [ ] Mỗi command có test đơn vị gồm cả undo (6.2 mục 7)
- [ ] Undo/Redo hoạt động đúng với mọi định dạng
- [ ] Không thể bị mắc kẹt trong danh sách/trích dẫn (7.2)
- [ ] Ctrl+U và phím không hỗ trợ hiện gợi ý
- [ ] Phím Ctrl+Alt+số hoạt động trên bố cục US và Vietnamese
- [ ] **Kịch bản tiếng Việt (18.3) đạt trong WebView2 hoặc, nếu chưa có Tauri, trong Edge/Chrome** (kiểm lại ở Phase 3)
- [ ] E2E cơ bản (Playwright) đạt

**PO kiểm tra:** Phụ lục E, Kịch bản 1.

## PHASE 2 — Markdown Engine

**Việc làm:** Mở Markdown → editor; editor → Markdown (qua `getMarkdown()` hoặc adapter bậc B); `rawBlock`/`rawInline` (9.2); quy tắc chuẩn hóa (9.3) và file `markdown-normalizations.md`; escape (9.5); phát hiện BOM/EOL (9.6); **corpus ≥ 30 file thật + ca xấu**; test round-trip tự động; công cụ nội bộ để dán Markdown vào và xem kết quả (chỉ cho dev).

**Không làm:** tính năng UI mới nếu chưa biết cách serialize (quy tắc V1.0 giữ nguyên); Tauri; file dialog.

**Hoàn thành khi:** toàn bộ **tiêu chí 9.7** đạt; danh sách chuẩn hóa đã biết được duyệt; quyết định về định nghĩa liên kết tham chiếu (9.1) đã ghi.

**Gate A (kiến trúc Markdown):** PO duyệt báo cáo round-trip. Trượt → dùng thang 4.4, **không tiến tiếp** khi chưa xử lý.

## PHASE 3 — Tauri + Tệp + Autosave/Phục hồi (**kết thúc MVP**)

**3a — Tệp:** thêm Tauri 2 vào dự án; `FileService` bản Tauri; Mới/Mở/Lưu/Lưu thành; ghi atomic (11.3); backup (D-13); trạng thái dirty và tiêu đề `*`; cảnh báo khi đóng; cảnh báo mở file có nguy cơ thay đổi (11.4); phát hiện thay đổi bên ngoài (11.5); file gần đây; kéo thả; mở bằng đối số/liên kết `.md`; Capabilities tối thiểu và CSP (mục 17); lỗi dễ hiểu (mục 20.2 bảng lỗi).

**3b — Autosave và phục hồi:** theo 11.6.

**Hoàn thành khi:**

- [ ] Mở `.md` → sửa → lưu → mở lại: dữ liệu giữ nguyên, khác biệt chỉ trong danh sách chuẩn hóa
- [ ] Ghi thất bại (ổ đầy, không có quyền, file bị khóa) **không làm hỏng file gốc**, không mất nội dung đang soạn
- [ ] Lưu thành, đóng khi chưa lưu, file bị sửa bên ngoài đều xử lý đúng
- [ ] Giả lập app bị tắt đột ngột → khôi phục được phiên làm việc
- [ ] Build chạy trên Windows; build thử macOS/Linux ghi nhận vấn đề (D-02)
- [ ] **Kịch bản tiếng Việt (18.3) đạt trong WebView2 của app thật**
- [ ] Kiểm tra quyền hạn Tauri không rộng hơn mục 17.1

**PO kiểm tra:** Phụ lục E, Kịch bản 2.
**Gate B (MVP):** PO dùng thật để viết một tài liệu thật trong ít nhất vài ngày trước khi sang Phase 4.

## PHASE 4 — Lớp giao diện (UX)

Menu bar, Toolbar, Bubble menu, Slash menu, Context menu, Tìm/Thay thế, Dán thuần văn bản, i18n vi/en đầy đủ, hộp thoại phím tắt (mở rộng). Mọi thứ gọi Command Registry. **Không viết logic định dạng trong nút.**

**Hoàn thành khi:** tiêu chí cuối mục 12; axe không lỗi nghiêm trọng; Playwright cho luồng chính; slash menu không xung đột gõ tiếng Việt.

## PHASE 5 — Tùy biến

Theme Sáng/Tối/Sepia/Tùy chỉnh; Settings; trình tùy biến không cần code (13.5); tùy biến thanh công cụ và phím tắt; nhập/xuất theme; kiểm tra tương phản; validator theme (13.3).

**Hoàn thành khi:** một người không biết code tạo được theme riêng, đổi font/cỡ chữ/độ rộng/màu, lưu, tắt app, mở lại vẫn còn; nhập theme lỗi không làm hỏng app; nhập theme độc hại (chứa `url(`) bị từ chối.

## PHASE 6 — Tính năng tài liệu nâng cao

Liên kết (+ chính sách giao thức, 17.2), Ảnh (10.3), Khối mã + tô màu cú pháp, Bảng (9.4), Task list, Đường kẻ ngang; "Sửa dạng văn bản" cho khối thô. **Mỗi tính năng thêm vào corpus round-trip trước khi merge.**

## PHASE 7 — Xuất file và chế độ nâng cao

Xuất HTML; PDF qua in (theo kết quả S4); Chế độ xem Markdown nguồn tùy chọn (D-15); thống kê tài liệu.

## PHASE 8 — Hệ thống extension

API công khai trên registry (14.3); manifest và kiểm tra `apiVersion`; extension cấp 1 (khai báo) cài/gỡ/bật/tắt được; cấp 2 chỉ ở Chế độ nhà phát triển, có cảnh báo rõ; cô lập lỗi extension; tài liệu `docs/extensions/`; một extension mẫu.

## PHASE 9 — Theme và preset cộng đồng

Gói theme/preset (theme + thanh công cụ + phím tắt) nhập/xuất, xem trước, bật/tắt/gỡ; thư viện cộng đồng dạng danh sách liên kết hoặc kho GitHub (chưa cần server riêng).

## PHASE 10 — AI Extension

Theo mục 15. Chỉ bắt đầu khi Phase 8 ổn định.

## PHASE 11 — Chất lượng phát hành

Trình cài đặt Windows (macOS/Linux theo D-02); ký mã nếu có điều kiện; cập nhật tự động (tùy chọn, D-14); rà soát khả năng tiếp cận; profiling hiệu năng; kiểm tra giấy phép dependency; tài liệu; đặt tên chính thức; CONTRIBUTING, CODE_OF_CONDUCT, CHANGELOG, mẫu issue.

## 20.2. Bảng xử lý lỗi (áp dụng từ Phase 3)

| Tình huống | Hành vi |
|---|---|
| Không mở được file | Nêu lý do dễ hiểu; không làm gì khác |
| Không lưu được | Giữ nội dung và trạng thái "đã sửa"; đề nghị Lưu thành |
| Không có quyền | Thông báo + gợi ý Lưu thành vị trí khác |
| File bị xóa/sửa bên ngoài | Mục 11.5 |
| Markdown có cấu trúc chưa hỗ trợ | Giữ khối thô, không báo lỗi |
| File không phải UTF-8 | Hỏi trước (9.6) |
| Theme/Settings hỏng | Dùng mặc định, giữ bản hỏng đổi tên |
| Extension lỗi | Tắt extension, báo tên (14.4) |

Thông báo cho người dùng không bao giờ hiển thị lỗi kỹ thuật thô (`Uncaught TypeError…`). Chi tiết kỹ thuật chỉ ở **Chế độ nhà phát triển** (Trợ giúp → Chế độ nhà phát triển: JSON tài liệu, extension, theme, đường dẫn, kết quả Markdown, nhật ký).

# 21. QUY TẮC CHO AI BUILDER VÀ QUY TRÌNH PO

## 21.1. Quy tắc làm việc

1. **Đọc `AGENTS.md` và `docs/PLAN.md` trước khi làm.** Chỉ làm đúng Phase hiện tại.
2. **Không tự ý thêm tính năng.** Task "Implement Bold" chỉ làm Bold (kèm command, test, phím tắt). Không thêm màu, font, theme.
3. **Không tự đổi kiến trúc hay stack** (Tiptap → khác, Tauri → Electron…). Muốn đổi phải có Architecture Review được PO duyệt (ghi vào `docs/architecture/decisions/`).
4. **Không viết logic định dạng trong component UI.** Chỉ gọi command.
5. **Không hard-code màu, chuỗi giao diện, phím tắt.**
6. **Không bao giờ ghi/xóa file của người dùng mà không qua `FileService`.**
7. **Task nhỏ, kiểm thử được, hoàn tác được.** Một task không sửa nhiều hệ thống.
8. **Khi gặp mâu thuẫn hoặc điều Plan chưa nói rõ: dừng và hỏi PO.** Không đoán rồi làm.
9. **Mỗi thay đổi hành vi phải có test.** Không hạ ngưỡng test để cho xanh.
10. **Không xóa hoặc "tạm bỏ" test đang đỏ.** Báo lỗi.

## 21.2. Dependency mới phải trả lời

1. Giải quyết vấn đề gì? 2. Có làm được bằng dependency hiện có không? 3. Giấy phép có tương thích MIT không (D-04, D-18)? 4. Ảnh hưởng dung lượng/hiệu năng/bảo mật thế nào? Có đang được bảo trì không?

## 21.3. Mẫu thẻ task (Task Card)

```
Phase:            (ví dụ Phase 1)
Mục tiêu:         (một câu)
Phạm vi:          (làm gì)
Ngoài phạm vi:    (không làm gì)
Tham chiếu Plan:  (mục nào)
Tiêu chí xong:    (checklist có thể kiểm chứng)
Test cần có:
Rủi ro / lưu ý:
```

## 21.4. Quy trình của PO

```
Milestone → Build chạy → PO dùng thử theo kịch bản (Phụ lục E)
          → Đánh giá cảm giác sử dụng → Pass / Fix → Milestone tiếp theo
```

PO **không** cần theo dõi transaction, vòng đời React, lệnh Rust hay tokenizer. PO đánh giá bằng kịch bản dùng thật và câu hỏi: *"Mình thấy tự nhiên chưa? Có chỗ nào phải nghĩ đến Markdown không?"*

## 21.5. Định nghĩa Hoàn thành (Definition of Done)

Một phase xong khi **tất cả** đúng:

- Code đã làm xong và đã review.
- Test tự động đạt (gồm round-trip nếu có đụng Markdown).
- Không có lỗi chặn đã biết; lỗi còn lại được ghi và PO chấp thuận.
- Tiêu chí hoàn thành của phase đạt.
- **PO tự dùng được** theo kịch bản.
- Tài liệu và CHANGELOG đã cập nhật.

`npm run build` chạy được **không** có nghĩa là xong.

# 22. SỔ RỦI RO

| Mã | Rủi ro | Mô tả | Biện pháp | Phase xử lý |
|---|---|---|---|---|
| R-01 | Mất/biến đổi dữ liệu khi round-trip | Mở file → lưu → mất nội dung (ERR-01 của Gemini) | Khối thô; corpus; tiêu chí 9.7; backup; atomic write; cảnh báo 11.4 | S, 2, 3 |
| R-02 | `@tiptap/markdown` còn Beta | API/hành vi có thể đổi | Ghim phiên bản; thang 4.4; test corpus mỗi lần nâng cấp | S, 2 |
| R-03 | Xung đột phím tắt | Trình duyệt/hệ điều hành/AltGr chiếm phím (ERR-02) | Mục 7.2; kiểm tra bố cục; gán lại được | 1, 5 |
| R-04 | Lỗi gõ tiếng Việt | Unikey/EVKey + input rule (ERR-03) | Khóa khi composing; test thủ công trên WebView2 | S, 1, 3 |
| R-05 | Dán dữ liệu lớn / tài liệu lớn | Đơ ứng dụng (ERR-04) | Ngưỡng và cảnh báo (10.2); đo hiệu năng | S, 2 |
| R-06 | Mất dữ liệu khi lưu/ngắt kết nối | USB rút, ổ đầy (ERR-05) | Atomic write; backup; recovery; giữ trạng thái dirty | 3 |
| R-07 | Mắc kẹt trong list/code block | (ERR-06) | Enter thông minh (7.2) + test | 1, 6 |
| R-08 | Editor phình phức tạp | Quá nhiều nút/menu/cài đặt | UI tối giản, "Simple by default"; mọi thêm UI cần lý do | 4, 5 |
| R-09 | Tính năng vượt khỏi Markdown | Màu/font/căn lề phá tính trung thực | Bảng phân loại 10.1; D-09 | Mọi phase |
| R-10 | Extension độc hại | Mã bên thứ ba chạy cùng tiến trình | 3 cấp extension; cấp 2 chỉ dev mode; chưa có chợ | 8, 9 |
| R-11 | Khác biệt giữa WebView các hệ điều hành | WebView2/WKWebView/WebKitGTK ứng xử khác | Windows trước (D-02); test từng nền tảng khi hỗ trợ | 3, 11 |
| R-12 | Môi trường build Tauri/Rust khó cài | Người không chuyên gặp vướng mắc | Spike S3; hướng dẫn cài đã kiểm chứng; web-first | S, 0 |
| R-13 | Phạm vi trôi (scope creep) bởi AI builder | AI tự thêm tính năng/dependency | Mục 21; task card; review từng task | Mọi phase |
| R-14 | Theme gây khó đọc/hỏng | Màu tương phản kém, JSON hỏng/độc | Validator + kiểm tra tương phản + fallback (13.3–13.4) | 5 |
| R-15 | Font thiếu dấu tiếng Việt | Dấu chồng bị cắt/thiếu glyph | D-17; kiểm tra thực tế; line-height ≥ 1.5 | 0, 5 |
| R-16 | Phụ thuộc/giấy phép | Gói không tương thích MIT, hoặc dùng nhầm gói trả phí | D-04, D-18, mục 21.2 | Mọi phase |
| R-17 | Nợ kỹ thuật do không có phiên bản schema | Settings/theme đổi cấu trúc về sau | `schemaVersion` + migrate | 5 |

# 23. CỔNG CHỐT PLAN (PLAN GATE)

V1.0 tự đánh dấu "BUILD-READY" bằng các dấu tích. V1.1 thay bằng điều kiện có thể kiểm chứng. **Plan được xem là chốt khi:**

- [ ] PO đã đọc mục 0–3, 20 và chấp thuận (hoặc sửa) toàn bộ Sổ quyết định D-01 → D-18.
- [ ] PO xác nhận nền tảng ưu tiên (D-02) là Windows và có máy Windows để tự test gõ tiếng Việt.
- [ ] Đã quyết định bên thực hiện build (AI nào, quy trình review thế nào) và PO biết cách chạy bản build để dùng thử.
- [ ] Tài liệu này được đặt vào `docs/PLAN.md` trong repo và `AGENTS.md` được tạo từ mục 21.
- [ ] Hai bên hiểu và đồng ý: **Phase S có thể làm thay đổi Plan**; Plan này không phải hợp đồng cứng khi có kết quả thực nghiệm.

**Bước kế tiếp sau khi chốt:** thực hiện **Phase S**, sau đó **Phase 0**. Không bắt đầu Phase nào khác cho tới khi Gate của phase trước đã qua.

---

# PHỤ LỤC

## Phụ lục A — Thuật ngữ cho PO

| Thuật ngữ | Nghĩa dễ hiểu |
|---|---|
| WYSIWYG | "Thấy gì được nấy": đang soạn thế nào thì hiển thị thế đó |
| Markdown / `.md` | Định dạng file văn bản thuần có ký hiệu đơn giản (`#`, `**`) để biểu diễn tiêu đề, in đậm… |
| Round-trip | Mở file → hiển thị → lưu lại; kiểm tra xem nội dung có còn nguyên vẹn không |
| Corpus | Bộ file mẫu dùng để kiểm thử |
| Tiptap / ProseMirror | Thư viện làm "động cơ" soạn thảo, đã giải quyết sẵn việc con trỏ, chọn chữ, hoàn tác |
| Tauri | Công cụ đóng gói trang web thành ứng dụng máy tính nhẹ |
| Command | Một hành động của editor (in đậm, tạo danh sách…), dùng chung cho phím tắt và nút bấm |
| Theme | Bộ màu/font cho giao diện, chỉ là dữ liệu, không chạy mã |
| Extension | Thành phần thêm tính năng; có thể là dữ liệu (an toàn) hoặc có mã (cần cẩn trọng) |
| Spike | Thử nghiệm ngắn để kiểm chứng một rủi ro, mã bỏ đi sau đó |
| IME | Bộ gõ (Unikey, EVKey…) |
| Atomic write | Cách ghi file an toàn: ghi ra file tạm rồi đổi tên, tránh hỏng file khi đang ghi |
| Khối thô (raw block) | Phần nội dung app chưa hiểu, được giữ nguyên để không mất |

## Phụ lục B — Bảng phím tắt đầy đủ

Xem mục 7.1 (nguồn duy nhất). Khi thêm/đổi command, **chỉ sửa ở Command Registry**; bảng này và cửa sổ "Xem phím tắt" được sinh từ registry.

## Phụ lục C — Token theme, tệp theme, settings

### C.1. Token (theme Sáng — giá trị mặc định)

```css
:root {
  /* Nền & bề mặt */
  --editor-bg-main: #ffffff;
  --editor-bg-paper: #ffffff;
  --editor-bg-toolbar: #f8fafc;
  --editor-bg-hover: #f1f5f9;
  --editor-bg-active: #e2e8f0;
  --editor-bg-code: #f1f5f9;
  --editor-bg-selection: #c7d2fe;

  /* Chữ */
  --editor-text-primary: #0f172a;
  --editor-text-secondary: #475569;
  --editor-text-muted: #94a3b8;
  --editor-text-accent: #2563eb;
  --editor-text-code: #0f172a;

  /* Trạng thái */
  --editor-text-error: #b91c1c;
  --editor-text-warning: #b45309;
  --editor-text-success: #15803d;

  /* Viền, bo góc */
  --editor-border-color: #e2e8f0;
  --editor-border-focus: #3b82f6;
  --editor-radius-sm: 4px;
  --editor-radius-md: 8px;
  --editor-radius-lg: 12px;

  /* Font & cỡ chữ (font phải hỗ trợ dấu tiếng Việt) */
  --editor-font-family: 'Inter', -apple-system, 'Segoe UI', sans-serif;
  --editor-font-mono: 'JetBrains Mono', 'Cascadia Code', monospace;
  --editor-font-size: 16px;
  --editor-line-height: 1.6;       /* tối thiểu 1.5 để không cắt dấu chồng */

  /* Tờ giấy */
  --editor-max-width: 800px;
  --editor-padding-horizontal: 32px;
  --editor-padding-vertical: 40px;

  /* Đổ bóng */
  --editor-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --editor-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --editor-shadow-bubble: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

[data-theme='dark'] {
  --editor-bg-main: #0f172a;
  --editor-bg-paper: #1e293b;
  --editor-bg-toolbar: #0f172a;
  --editor-bg-hover: #334155;
  --editor-bg-active: #475569;
  --editor-bg-code: #0f172a;
  --editor-bg-selection: #3730a3;
  --editor-text-primary: #f8fafc;
  --editor-text-secondary: #cbd5e1;
  --editor-text-muted: #64748b;
  --editor-text-accent: #60a5fa;
  --editor-text-code: #f1f5f9;
  --editor-border-color: #334155;
  --editor-border-focus: #60a5fa;
}
```

Theme Sepia và (tùy chọn) Nordic bổ sung ở Phase 5 theo đúng danh sách token trên. Danh sách token là hợp đồng: thêm token mới phải cập nhật validator và tài liệu theme.

### C.2. Tệp theme

```json
{
  "schemaVersion": 1,
  "name": "My Dark Theme",
  "author": "User",
  "version": "1.0.0",
  "variables": {
    "editor-bg-main": "#111111",
    "editor-text-primary": "#ffffff",
    "editor-text-accent": "#7c3aed"
  }
}
```

Khóa trong `variables` là tên token **không có tiền tố `--`**. Các token không khai báo kế thừa từ theme gốc.

### C.3. Tệp settings

```json
{
  "schemaVersion": 1,
  "language": "vi",
  "appearance": {
    "themeId": "light",
    "fontFamily": "Inter",
    "fontSize": 16,
    "lineHeight": 1.6,
    "editorWidth": 800,
    "paper": true,
    "compactToolbar": false,
    "showToolbar": true
  },
  "toolbar": { "layout": ["edit.undo", "edit.redo", "|", "format.bold", "format.italic"] },
  "keybindings": { "format.bold": "Mod-b" },
  "editor": { "autoConvertPastedMarkdown": true, "autosaveToFile": false }
}
```

## Phụ lục D — Mẫu interface dịch vụ

```ts
interface FileService {
  open(): Promise<OpenResult | null>;            // qua dialog gốc
  openPath(path: string): Promise<OpenResult>;   // từ hệ điều hành / file gần đây
  save(doc: DocumentRef, markdown: string): Promise<SaveResult>;   // atomic + backup
  saveAs(markdown: string): Promise<SaveResult | null>;
  watch(path: string, onChange: (e: ExternalChange) => void): Unwatch;
}
type OpenResult = { path: string; text: string; encoding: "utf-8"; bom: boolean; eol: "lf" | "crlf" };
```

## Phụ lục E — Kịch bản kiểm tra của PO

### Kịch bản 1 — Phase 1 (khoảng 10 phút)

1. Mở app, gõ vài đoạn văn. *Có tự nhiên không? Có độ trễ không?*
2. Gõ một câu, bôi đen, bấm **Ctrl+B**, rồi **Ctrl+I**. Bấm lại để tắt.
3. Bấm **Ctrl+Alt+1** ở một dòng → thành tiêu đề lớn; **Ctrl+Alt+0** → trở lại chữ thường.
4. Bấm **Ctrl+Shift+8** → danh sách; Enter vài lần; Enter ở dòng trống → thoát danh sách.
5. Gõ `# ` rồi chữ → thành tiêu đề; Ctrl+Z → trả lại `# `.
6. Bấm **Ctrl+U** → có gợi ý "không hỗ trợ".
7. **Ctrl+/** → xem danh sách phím tắt.
8. Gõ tiếng Việt dài bằng Unikey/EVKey (Telex hoặc VNI) trong đoạn, tiêu đề, danh sách.
9. Undo/Redo nhiều bước liên tiếp.

Câu hỏi chốt: *"Mình có phải nghĩ đến Markdown ở chỗ nào không? Chỗ nào gây khó chịu?"*

### Kịch bản 2 — Phase 3 (khoảng 20 phút)

1. Viết tài liệu có tiêu đề, danh sách, đoạn in đậm/nghiêng, tiếng Việt. **Ctrl+S** → chọn nơi lưu.
2. Đóng app, mở lại file → nội dung giống hệt.
3. Mở file `.md` có sẵn (README bất kỳ) → sửa → lưu → mở lại.
4. Sửa file bằng Notepad trong khi đang mở trong app → xem app xử lý thế nào.
5. Sửa nội dung, **đóng cửa sổ khi chưa lưu** → hộp thoại hiện ra; thử cả ba lựa chọn.
6. Tắt app đột ngột (kết thúc tác vụ) khi đang sửa → mở lại → khôi phục.
7. Mở file chỉ đọc hoặc để ổ gần đầy → xem thông báo lỗi và việc nội dung có còn không.

Câu hỏi chốt: *"Mình có tin tưởng giao tài liệu thật cho app này chưa?"*

---

**Hết tài liệu PLAN V1.1.** Sau khi PO duyệt, tài liệu này được lưu thành `docs/PLAN.md` và trở thành nguồn sự thật cho toàn bộ quá trình Build.
