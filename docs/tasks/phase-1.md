# PHASE 1 — BỘ TASK THỰC THI

**Dự án:** WriteFlow — Phase 1: Core Editor + Command System + Phím tắt
**Nguồn sự thật:** `docs/PLAN.md` (V1.1) và `AGENTS.md`. Tài liệu này chỉ cụ thể hóa Phase 1, **không thay thế Plan**. Nếu có mâu thuẫn, Plan thắng, trừ các điểm được PO duyệt ở Mục 2.
**Người soạn:** Claude (giám sát viên) · **Người điều phối:** Gemini · **Người thực thi:** Antigravity · **Người quyết định cuối:** PO

**Đặt tại repo:** `docs/tasks/phase-1.md`

---

## 0. CÁCH DÙNG TÀI LIỆU

1. Gemini đọc toàn bộ tài liệu, **trình PO duyệt Mục 2** (các quyết định), ghi kết quả vào `docs/architecture/decisions/phase-1-decisions.md`.
2. Gemini giao từng task (Mục 6) cho Antigravity **theo đúng thứ tự phụ thuộc**. Mỗi task = một thẻ task hoàn chỉnh; không gộp, không bỏ qua.
3. Antigravity làm trên nhánh riêng của Phase (Mục 4), commit theo từng task, đẩy lên GitHub thường xuyên.
4. Khi **tất cả** task xong, Gemini báo PO. PO nhờ Claude kiểm tra tổng Phase 1 (Mục 7).
5. Claude kết luận **ĐẠT / ĐẠT CÓ ĐIỀU KIỆN / CHƯA ĐẠT** kèm danh sách việc cần sửa. Chưa đạt thì sửa rồi kiểm tra lại. **PO quyết định cuối cùng việc gộp vào `main`.**

**Quy tắc dừng:** Gặp điều Plan hoặc tài liệu này chưa nói rõ, hoặc kết quả đo thực tế khác điều Plan nói → **dừng task, ghi câu hỏi, hỏi PO.** Không tự đoán rồi làm (AGENTS.md mục 1–3, Plan 21.1 mục 8).

---

## 1. MỤC TIÊU VÀ PHẠM VI

**Mục tiêu:** Một trình soạn thảo chạy trên trình duyệt (chưa Tauri) mà PO dùng thử được: gõ chữ, định dạng bằng **phím tắt**, tra cứu phím bằng hộp thoại, gõ tiếng Việt không lỗi, không bị mắc kẹt trong danh sách/trích dẫn, và **mọi thao tác định dạng đi qua Command Registry**.

**Làm (Plan 20, Phase 1):**
- Command Registry (Plan 6) + 14 command (Plan 6.3).
- Cấu hình Tiptap/StarterKit đúng Plan 4.3.
- Paragraph, Heading 1–3, Bold, Italic, Strike, Inline code, Bullet list, Ordered list, Blockquote, Undo/Redo.
- Toàn bộ phím tắt Phase 1 (Plan 7.1), Enter thông minh (Plan 7.2), input rules cơ bản (Plan 8.1) có khóa khi đang soạn dấu (Plan 8.2).
- Thông báo cho phím không hỗ trợ (Ctrl+U).
- Hộp thoại "Xem phím tắt" (Ctrl+/), thanh trạng thái tối giản (số từ/ký tự).
- Bộ test đơn vị + E2E cơ bản + kịch bản kiểm tra thủ công cho PO.

**KHÔNG làm (tuyệt đối):** toolbar, menu bar, bubble/slash/context menu, đọc/ghi Markdown, file, Tauri, theme tùy biến, Settings, liên kết, ảnh, bảng, khối mã, task list, đường kẻ ngang, tìm/thay thế, đổi phím tắt bởi người dùng, extension, AI. **Không thêm tính năng ngoài danh sách trên, kể cả "cho tiện".**

---

## 2. QUYẾT ĐỊNH CẦN PO DUYỆT TRƯỚC KHI BUILD

Mỗi dòng có **mặc định đề xuất**. PO duyệt hoặc sửa; Gemini ghi kết quả lại.

| Mã | Vấn đề | Mặc định đề xuất | Lý do |
|---|---|---|---|
| P1-D1 | Bấm lại phím Heading/List/Quote khi đang ở đúng kiểu đó | **Bật/tắt (toggle)**: Ctrl+Alt+1 lần nữa → về đoạn thường | Hành vi mặc định của Tiptap; dễ đoán |
| P1-D2 | Cấp tiêu đề trong schema | Schema giữ **H1–H6** (để Phase 2 không mất dữ liệu khi mở file), nhưng **chỉ có phím tắt cho H1–H3** | Plan 9.1; tránh làm hỏng file Markdown có `####` |
| P1-D3 | Playwright (E2E) | **Thêm ngay ở Phase 1**, chỉ Chromium, chạy trong CI | Plan có **mâu thuẫn nội bộ**: Phase 1 yêu cầu "E2E cơ bản (Playwright) đạt" nhưng mục 19 nói Playwright vào từ Phase 4. Phím tắt cần bàn phím thật nên E2E rất đáng giá. Sửa Plan mục 19 cho khớp sau khi duyệt |
| P1-D4 | Điều chỉnh interface Plan 6.1 | (a) `defaultShortcut.win/mac` cho phép `string` **hoặc** `string[]` (Redo cần 2 phím); (b) `CommandContext` có `editor` (bắt buộc) và `ui` (cầu nối mở hộp thoại/hiện thông báo) | Interface hiện tại không biểu diễn được Ctrl+Y và Ctrl+Shift+Z cùng lúc. Sau khi duyệt phải cập nhật Plan 6.1 |
| P1-D5 | Tắt các extension chưa thuộc Phase 1 | Tắt **Underline, Link, CodeBlock, HorizontalRule, TrailingNode**. Hệ quả tạm thời: dán HTML có liên kết/khối mã sẽ mất phần định dạng đó. Bật lại ở Phase 6 | Chúng có input rule và phím riêng (``` ``` ```, `---`, autolink) sẽ kích hoạt ngoài ý muốn; chưa có quy tắc serialize (Plan 4.3). Chấp nhận được vì chưa có lưu file |
| P1-D6 | Ngắt dòng cứng | Chỉ **Shift+Enter**. Bỏ Ctrl+Enter khỏi ngắt dòng | Ctrl+Enter dành cho "thoát khối mã" ở Phase 6 (Plan 7.2) |
| P1-D7 | Nội dung khởi đầu của editor | Một tài liệu chào ngắn tạo từ i18n (tiêu đề + 1 đoạn gợi ý "Nhấn Ctrl+/ để xem phím tắt"), thay nội dung "Phase 0 đã thiết lập" | Nội dung cũ đã lỗi thời; gợi ý giúp người dùng tự khám phá |

---

## 3. SỰ THẬT KỸ THUẬT ĐÃ KIỂM CHỨNG (Tiptap 3.31.4 đang ghim)

Các điểm dưới đây được đọc trực tiếp từ `node_modules` của repo. **Builder phải đối chiếu lại với phiên bản ghim, không dựa vào trí nhớ.**

1. `StarterKit` đang bật sẵn: blockquote, bold, bulletList, code, codeBlock, document, dropcursor, gapcursor, hardBreak, heading, undoRedo, horizontalRule, italic, listItem, listKeymap, **link**, orderedList, paragraph, strike, text, **underline**, **trailingNode**. Code hiện tại (`StarterKit` nguyên bản) tức là đang bật Underline và Link, **trái Plan 4.3**.
2. **Strike mặc định là `Mod-Shift-s`**, trùng "Lưu thành". Plan 7.1 dùng `Mod-Shift-x`.
3. Phím mặc định khác của Tiptap cần xử lý: `Mod-Alt-c` (khối mã), `Mod-Shift-9` (task list, thuộc extension-list), `Mod-Enter` **và** `Shift-Enter` (ngắt dòng cứng), `Mod-Alt-1…6` (heading), `Mod-u` (underline), `Mod-z` / `Shift-Mod-z` / `Mod-y` (undo/redo), `Mod-Shift-7/8` (danh sách), `Mod-Shift-b` (trích dẫn), `Mod-e` (code).
4. `view.composing` đang chặn input rule trong `@tiptap/core` (dòng `if (view.composing) return false;`). Tốt, nhưng **phím tắt định dạng không được chặn tự động**; ta phải tự chặn (Task 1.8).
5. **`editor.getText()` không đáng tin để đếm từ/ký tự** (cách nối khối khác nhau). Dùng `doc.textBetween(0, doc.content.size, '\n', ' ')`, nếu không các từ giữa hai khối sẽ dính nhau.
6. Mark `code` loại trừ các mark khác (không thể vừa code vừa đậm). Đây là hành vi đúng và khớp Markdown; không "sửa".
7. Trong ProseMirror, **Backspace ngay sau khi input rule kích hoạt** sẽ hoàn tác input rule. Plan 8.1 và Phụ lục E kịch bản 1 lại nói "Ctrl+Z trả lại `# `". **Phải đo hành vi thật** của Ctrl+Z và Backspace, báo kết quả cho PO; nếu khác Plan, dừng và hỏi (Task 1.10).
8. `prosemirror-keymap` xử lý phím có Alt/Shift theo `key` và `keyCode`. Trên macOS, Option+số sinh ký tự đặc biệt. **Test phím phải dùng sự kiện bàn phím thật (E2E), không chỉ giả lập.**
9. `React.StrictMode` đang bật trong `main.tsx` (mount hai lần ở dev). Editor và listener phải dọn sạch khi unmount, không nhân đôi phím.

---

## 4. QUY TRÌNH GIT VÀ BÁO CÁO

- **Nhánh:** tạo `phase-1` từ `main`. Mỗi task commit trực tiếp lên `phase-1` hoặc qua nhánh con `phase-1/<task-id>` gộp vào `phase-1` (tùy Gemini, nhưng **không gộp vào `main`**).
- **Commit:** `feat(phase1/T1.5): đăng ký format commands`, `test(phase1/T1.8): ...`, `docs(phase1/T1.14): ...`. Mỗi commit một ý.
- **Đẩy lên GitHub sau mỗi task** và đảm bảo CI xanh. Task có CI đỏ coi như chưa xong.
- **Cấm:** sửa `docs/PLAN.md`, hạ mức lint/test, tắt rule, xóa/bỏ qua test, thêm dependency ngoài danh sách (trừ Playwright nếu P1-D3 được duyệt).
- **Báo cáo mỗi task** (Antigravity → Gemini), dùng mẫu ở Phụ lục C: commit, file đổi, kết quả 6 cổng, đối chiếu từng ô tiêu chí xong, **điểm lệch so với thẻ task (nếu có) và lý do**, câu hỏi còn treo.

> *Khuyến nghị của giám sát (PO quyết):* Claude có thể xem nhanh `phase-1` một lần sau khi xong Task 1.8 (khi lõi command + phím đã hoàn chỉnh) để bắt lỗi kiến trúc sớm, rẻ hơn nhiều so với sửa sau Task 1.15. Việc này không bắt buộc.

---

## 5. KIẾN TRÚC MỤC TIÊU CỦA PHASE 1

```
src/
├── core/
│   ├── commands/
│   │   ├── types.ts              # CommandDef, CommandContext, UiBridge, Platform
│   │   ├── registry.ts           # createCommandRegistry() + registry mặc định
│   │   ├── definitions/          # format.ts  block.ts  edit.ts  help.ts
│   │   └── index.ts              # đăng ký tất cả, export registry
│   ├── keymap/
│   │   ├── platform.ts           # detectPlatform()
│   │   ├── shortcuts.ts          # tra cứu phím theo nền tảng, chuẩn hóa
│   │   ├── format.ts             # formatShortcut("Mod-Shift-x", platform) → "Ctrl+Shift+X" / "⌘⇧X"
│   │   └── keymap-extension.ts   # Tiptap Extension: registry → phím ProseMirror
│   └── editor/
│       ├── extensions.ts         # createExtensions(): hàm thuần, test được
│       └── use-app-editor.ts     # hook tạo editor, expose cho App
├── components/
│   ├── editor/TiptapEditor.tsx   # chỉ hiển thị EditorContent
│   ├── shortcuts/ShortcutsDialog.tsx
│   ├── status/StatusBar.tsx
│   └── ui/ToastHost.tsx          # thông báo aria-live
├── i18n/locales/{vi,en}.json     # thêm khóa mới, hai file phải đồng bộ khóa
└── App.tsx                       # lắp ghép
tests/
├── unit/  integration/  e2e/     # e2e dùng Playwright (nếu P1-D3 duyệt)
docs/qa/phase-1-manual.md         # kịch bản thủ công cho PO
```

**Luồng:** phím bấm → `keymap-extension` tra `registry` → `registry.run(id, ctx)` → lệnh Tiptap qua transaction. Nút/menu sau này (Phase 4) cũng chỉ gọi `registry.run`. **Không component nào được gọi `editor.chain()` định dạng trực tiếp.**

---

## 6. DANH SÁCH TASK

**Thứ tự và phụ thuộc:**

| Nhóm | Task | Tên | Phụ thuộc |
|---|---|---|---|
| A. Nền tảng | 1.1 | Command Registry (lõi) | — |
| | 1.2 | Nền tảng & định dạng phím | — |
| | 1.3 | Cấu hình editor + schema guard | — |
| | 1.4 | UiBridge + ToastHost | — |
| B. Command | 1.5 | Format commands | 1.1, 1.3 |
| | 1.6 | Block commands | 1.1, 1.3 |
| | 1.7 | Edit commands (undo/redo) | 1.1, 1.3 |
| | 1.8 | Keymap extension + Ctrl+U + khóa IME | 1.2, 1.4, 1.5, 1.6, 1.7 |
| C. Hành vi | 1.9 | Enter thông minh & Backspace | 1.3, 1.6 |
| | 1.10 | Input rules (kiểm chứng + undo) | 1.3, 1.8 |
| D. Giao diện | 1.11 | Thanh trạng thái | 1.3 |
| | 1.12 | Hộp thoại phím tắt + `help.shortcuts` | 1.1, 1.2, 1.8 |
| E. Đóng phase | 1.13 | Guard tests & i18n parity | 1.1–1.12 |
| | 1.14 | E2E (Playwright) | 1.8–1.12 |
| | 1.15 | Tài liệu & kịch bản QA thủ công | tất cả |

Task cùng nhóm không phụ thuộc nhau có thể làm song song. **Không bắt đầu nhóm sau khi nhóm trước chưa xanh.**

**Quy ước chung cho mọi task:** TypeScript strict; không `any` (không `as any` mới); không hard-code chuỗi giao diện (qua i18n, **thêm cả `vi.json` và `en.json`**); không hard-code màu (CSS variables); mọi thay đổi hành vi có test; sau task phải chạy sạch `npm ci && npm run typecheck && npm run lint && npm run format && npm run test && npm run build`.

---

### TASK 1.1 — Command Registry (lõi)

- **Mục tiêu:** Hiện thực xương sống Plan 6.
- **Phạm vi:** `src/core/commands/types.ts`, `registry.ts`, `index.ts` (thay file interface hiện tại). Interface theo Plan 6.1 **kèm điều chỉnh P1-D4**: `defaultShortcut?: { win?: string | string[]; mac?: string | string[] }`; `CommandContext { editor: Editor; ui: UiBridge }`. `createCommandRegistry()` trả về: `register(def)`, `get(id)`, `list(filter?)`, `run(id, ctx, args?)`, `isEnabled(id, ctx)`, `isActive(id, ctx)`, `getShortcuts(id, platform): string[]`. Cũng export một `registry` mặc định.
- **Quy tắc kiểm tra khi đăng ký (ném lỗi rõ ràng):** `id` đúng dạng `nhóm.tên` (`/^[a-z]+\.[A-Za-z0-9]+$/`) và **duy nhất**; `labelKey` không rỗng; **hai command không được trùng phím tắt trên cùng nền tảng**.
- **Hành vi `run`:** nếu `isEnabled` trả false → không chạy, trả `false`, không ném lỗi (Plan 6.2 mục 6). Không có selection vẫn an toàn.
- **Ngoài phạm vi:** định nghĩa command cụ thể (task 1.5–1.7), phím, UI.
- **Tiêu chí xong:** [ ] đăng ký trùng id → lỗi; [ ] trùng phím → lỗi; [ ] `run` command bị tắt trả false; [ ] `getShortcuts` hỗ trợ mảng; [ ] không import React hay DOM trong `core/commands/registry.ts`.
- **Test:** unit cho toàn bộ quy tắc trên (dùng `createCommandRegistry()` mới cho mỗi test, không dùng singleton).

### TASK 1.2 — Nền tảng và định dạng phím

- **Mục tiêu:** Một nơi duy nhất biết "Mod là Ctrl hay Cmd" và cách hiển thị phím.
- **Phạm vi:** `src/core/keymap/platform.ts` (`detectPlatform(): 'win' | 'mac'`; Linux → `'win'`; ưu tiên `navigator.userAgentData?.platform`, dự phòng `navigator.platform`; cho phép tiêm giá trị để test), `shortcuts.ts` (chuẩn hóa chuỗi phím), `format.ts` (`formatShortcut(accel, platform)`): Windows → `Ctrl+Shift+X`, `Ctrl+Alt+1`; macOS → `⌘⇧X`, `⌘⌥1`.
- **Tiêu chí xong:** [ ] bảng chuyển đổi đúng cho mọi phím ở Phụ lục A, cả hai nền tảng; [ ] `/` hiển thị `Ctrl+/`, `⌘/`; [ ] phím lạ không làm app sập (trả chuỗi gốc).
- **Test:** unit theo bảng Phụ lục A.

### TASK 1.3 — Cấu hình editor + schema guard

- **Mục tiêu:** Editor đúng Plan 4.3 và P1-D2/D5.
- **Phạm vi:** `src/core/editor/extensions.ts` xuất `createExtensions(): Extensions` (hàm thuần). `use-app-editor.ts` tạo editor, nhận `initialContent` dạng **JSON của Tiptap** (không nối chuỗi HTML từ bản dịch: đây cũng là cách chặn chèn thẻ qua i18n). `TiptapEditor.tsx` chỉ còn render `EditorContent` (nhận `editor` qua props). Cấu hình:
  - **Tắt:** underline, link, codeBlock, horizontalRule, trailingNode.
  - **Giữ:** document, paragraph, text, heading (`levels: [1,2,3,4,5,6]`), bold, italic, strike, code, bulletList, orderedList, listItem, listKeymap, blockquote, hardBreak (**chỉ** `Shift-Enter`, gỡ `Mod-Enter`), undoRedo, dropcursor, gapcursor.
  - **Gỡ toàn bộ phím tắt định dạng mặc định** của Tiptap (Phụ lục A, cột "mặc định Tiptap cần gỡ"). **Giữ** phím cấu trúc: Enter, Backspace, Delete, Tab, Shift-Tab (của list/listKeymap), Shift-Enter. Phím định dạng sẽ do task 1.8 gắn từ registry.
  - Thuộc tính truy cập: `editorProps.attributes` với `role="textbox"`, `aria-multiline="true"`, `aria-label` qua i18n.
  - Nội dung khởi đầu theo **P1-D7**, dựng bằng JSON, gợi ý phím lấy từ `formatShortcut` (hiển thị đúng Ctrl/⌘).
- **Ngoài phạm vi:** command, phím tắt.
- **Tiêu chí xong:** [ ] schema **không** chứa mark `underline`/`link` và node `codeBlock`/`horizontalRule` (test kiểm tra `editor.schema.marks/nodes`); [ ] heading có 6 cấp; [ ] gõ ``` ``` ```, `---`, URL **không** kích hoạt gì (nhập chữ thường); [ ] không còn trailing node (tài liệu kết thúc bằng một tiêu đề **không** tự sinh đoạn rỗng sau nó); [ ] chạy dưới `StrictMode` không nhân đôi editor.
- **Test:** unit trên `createExtensions()` + schema; render dưới StrictMode; test nội dung khởi đầu ra đủ tiêu đề + đoạn.

### TASK 1.4 — UiBridge + ToastHost

- **Mục tiêu:** Cho command tương tác UI mà không phụ thuộc React.
- **Phạm vi:** `UiBridge { openShortcutsDialog(): void; notify(messageKey: string, opts?): void }` trong `types.ts`. `components/ui/ToastHost.tsx`: thông báo ngắn tự tắt (≈3–4 giây), `role="status"` `aria-live="polite"`, dùng CSS variables hiện có (`--editor-*`), **không thêm màu mới ngoài file token**; nếu cần token mới (nền toast), thêm vào `variables.css` theo đúng tên `--editor-*` và ghi chú trong PR. Tôn trọng `prefers-reduced-motion`.
- **Tiêu chí xong:** [ ] gọi `notify` hiện thông báo đúng ngôn ngữ; [ ] tự biến mất; [ ] nhiều thông báo liên tiếp không chồng lấp lỗi; [ ] có thể focus editor tiếp tục gõ, toast không cướp focus.
- **Test:** component test với fake timers.

### TASK 1.5 — Format commands

- **Mục tiêu:** `format.bold`, `format.italic`, `format.strike`, `format.code`.
- **Phạm vi:** `definitions/format.ts` theo Phụ lục A (id, nhãn i18n `cmd.format.*`, phím, lệnh Tiptap, `isActive`). `run` dùng `editor.chain().focus().toggleX().run()`.
- **Tiêu chí xong:** [ ] mỗi command đăng ký đúng id/phím; [ ] `isActive` đúng; [ ] `format.code` trên chữ đang đậm: hành vi theo Mục 3 điểm 6 (ghi lại, không "sửa").
- **Test (bắt buộc cho từng command, Plan 6.2 mục 7):** chọn chữ → `run` → kiểm tra mark → `undo` → kiểm tra trở về → `redo`. Thêm: không có selection (con trỏ giữa từ, con trỏ ở dòng trống) không ném lỗi; có chữ **tiếng Việt có dấu** trong vùng chọn.

### TASK 1.6 — Block commands

- **Mục tiêu:** `block.paragraph`, `block.heading1/2/3`, `block.bulletList`, `block.orderedList`, `block.blockquote`.
- **Phạm vi:** `definitions/block.ts` theo Phụ lục A, hành vi toggle theo **P1-D1**. `block.paragraph` chuyển mọi khối (heading, list, quote) về đoạn thường.
- **Tiêu chí xong:** [ ] bullet ↔ ordered chuyển trực tiếp không lỗi; [ ] áp dụng trên nhiều đoạn được chọn: mỗi đoạn thành một mục, không gộp; [ ] heading trong list/quote không làm hỏng cấu trúc (ghi lại hành vi); [ ] `isActive` đúng cho từng kiểu.
- **Test:** như 1.5 (chạy → undo → redo) cho từng command; thêm ca chọn nhiều đoạn, ca lồng (quote chứa list), ca đoạn rỗng.

### TASK 1.7 — Edit commands

- **Mục tiêu:** `edit.undo`, `edit.redo` (+ `isEnabled` theo `editor.can()`).
- **Phạm vi:** `definitions/edit.ts`. Phím: undo `Mod-z`; redo Windows `['Mod-y','Mod-Shift-z']`, macOS `['Mod-Shift-z']`.
- **Tiêu chí xong:** [ ] undo/redo đúng với mọi định dạng của task 1.5–1.6 (chuỗi nhiều bước); [ ] `isEnabled=false` khi lịch sử rỗng; [ ] sau undo rồi gõ tiếp, redo bị xóa đúng chuẩn.
- **Test:** chuỗi 10+ thao tác hỗn hợp, undo hết rồi redo hết, so sánh JSON tài liệu từng bước.

### TASK 1.8 — Keymap extension + Ctrl+U + khóa khi soạn dấu

- **Mục tiêu:** Nối registry với bàn phím; xử lý phím không hỗ trợ; bảo vệ IME.
- **Phạm vi:** `keymap-extension.ts` (Tiptap `Extension`): ở `addKeyboardShortcuts` **đọc registry** và gắn mọi `defaultShortcut` của nền tảng hiện tại (cả mảng). Bọc handler:
  - **Khóa khi đang soạn dấu:** nếu `view.composing`, hoặc `event.isComposing`, hoặc `event.keyCode === 229` → **không chạy command, không `preventDefault`**, để bộ gõ làm việc (Plan 8.2 mục 1–2).
  - Command không `isEnabled` → trả `false` (để sự kiện đi tiếp).
  - **Ctrl+U (`Mod-u`)**: chặn, **không đổi tài liệu**, gọi `ui.notify('hint.unsupportedFormat')` ("Định dạng này không được hỗ trợ trong Markdown"). Chỉ Ctrl+U trong Phase 1 (các phím căn lề… quyết định ở Phase 4).
  - Không để phím mặc định của trình duyệt chiếm các phím Phase 1 khi editor đang focus (`preventDefault` khi đã xử lý).
- **Tiêu chí xong:** [ ] mọi phím Phụ lục A hoạt động; [ ] **Ctrl+Shift+S không còn gạch ngang** (không đổi tài liệu); [ ] Ctrl+Alt+C, Ctrl+Enter, Ctrl+Shift+9 **không** làm gì (Phase 6); [ ] Ctrl+U chỉ hiện gợi ý; [ ] trong lúc `composing`, Ctrl+B không định dạng; [ ] đổi `platform` giả lập sang `mac` thì dùng đúng phím mac; [ ] không còn chuỗi `Mod-…` nào hard-code ngoài `core/commands/definitions` (xem 1.13).
- **Test:** unit mô phỏng `KeyboardEvent` (`key`, `code`, `keyCode`, modifier) cho mọi phím; test `composing` (đặt `view.composing`/`isComposing`); test "phím mặc định Tiptap cần gỡ" **không còn tác dụng**. *Lưu ý:* giả lập jsdom không thay thế E2E (Task 1.14).

### TASK 1.9 — Enter thông minh & Backspace

- **Mục tiêu:** Không bị mắc kẹt trong cấu trúc (Plan 7.2 mục 5).
- **Cách làm:** **Viết test trước để xem hành vi mặc định của Tiptap**, chỉ viết thêm code cho phần còn thiếu (mặc định đã xử lý nhiều trường hợp). Yêu cầu:
  1. Enter trên mục danh sách **rỗng** → thoát danh sách (về đoạn thường); lồng nhiều cấp → lùi một cấp rồi mới thoát.
  2. Enter trên dòng trống trong trích dẫn → thoát trích dẫn.
  3. Enter ở **cuối** tiêu đề → đoạn thường bên dưới; Enter **giữa** tiêu đề → tách thành hai tiêu đề (không mất chữ).
  4. Backspace ở **đầu** tiêu đề (con trỏ trống, không chọn) → chuyển thành đoạn thường (lần Backspace kế tiếp mới gộp với khối trước).
  5. Backspace ở đầu mục danh sách / đầu trích dẫn → thoát/lùi khối, không xóa chữ của khối trước.
  6. `Shift+Enter` ngắt dòng cứng trong cùng đoạn (kể cả trong list/quote/heading).
  7. `Tab`/`Shift+Tab` trong danh sách thụt vào/lùi ra; **Tab ngoài danh sách không mất focus** của editor một cách bất ngờ (ghi lại hành vi, không tự chặn nếu ảnh hưởng truy cập bàn phím; nếu muốn đổi, hỏi PO).
- **Tiêu chí xong:** [ ] 7 hành vi trên có test và đạt; [ ] không có chuỗi phím nào khiến con trỏ kẹt không thoát được cấu trúc; [ ] mọi phím trên hoàn tác được bằng Undo.
- **Test:** unit/integration cho từng hành vi, gồm ca có **chữ tiếng Việt**; E2E ở 1.14 xác nhận lại bằng bàn phím thật.

### TASK 1.10 — Input rules (kiểm chứng + hoàn tác)

- **Mục tiêu:** Xác nhận và hoàn thiện input rule Plan 8.1; **đo thực tế hành vi hoàn tác**.
- **Danh sách:** `# `/`## `/`### ` (và `#### `…`###### ` do schema giữ 6 cấp), `- ` và `* `, `1. `, `> `, `**x**`, `*x*`, `~~x~~`, `` `x` ``.
- **Phạm vi:** kiểm chứng từng rule hoạt động, chỉ kích hoạt ở vị trí hợp lệ (`# ` chỉ ở đầu dòng). Đo và **ghi vào báo cáo**: (a) Backspace ngay sau khi rule kích hoạt trả về điều gì; (b) Ctrl+Z ngay sau khi rule kích hoạt trả về điều gì (đúng `# `, hay `#`, hay trạng thái khác). Plan 8.1 yêu cầu "một lần Ctrl+Z trả lại đúng ký tự đã gõ".
- **Quy tắc dừng:** nếu kết quả (b) **khác** Plan 8.1 → **dừng, báo PO** kèm bằng chứng (đoạn test, ảnh/ghi hình ngắn). PO quyết: chấp nhận hành vi thực tế (rồi sửa Plan 8.1 và kịch bản Phụ lục E) hoặc yêu cầu bổ sung cơ chế. Không tự bịa cơ chế.
- **Tiêu chí xong:** [ ] mọi rule hoạt động; [ ] không kích hoạt giữa dòng; [ ] **không kích hoạt khi `view.composing`** (test mô phỏng); [ ] kết quả đo (a)(b) đã ghi trong báo cáo; [ ] gõ `*` `_` `#` cạnh chữ có dấu (ví dụ `việt*`) không phát sinh định dạng ngoài ý muốn.
- **Test:** unit mô phỏng gõ ký tự (`handleTextInput`) cho từng rule; ca âm (không nên kích hoạt).

### TASK 1.11 — Thanh trạng thái

- **Mục tiêu:** Đếm từ/ký tự đúng, không dính chữ giữa các khối.
- **Phạm vi:** `StatusBar.tsx` ở cuối trang: số từ + số ký tự (khóa i18n có sẵn `status.words`/`status.chars`) và nút "Phím tắt" mở hộp thoại (đường chuột dẫn tới Ctrl+/ , phục vụ người không biết phím). Chuyển bộ đếm ký tự khỏi `<header>`. Văn bản lấy bằng `doc.textBetween(0, size, '\n', ' ')`. **Từ = chuỗi ký tự cách nhau bởi khoảng trắng** (với tiếng Việt đây là đếm âm tiết; ghi chú trong code, không nhận là "từ ghép").
- **Tiêu chí xong:** [ ] `<h1>Xin chào</h1><p>các bạn</p>` → 4 từ (không phải 3); [ ] tài liệu rỗng → 0; [ ] ký tự có dấu tính đúng (không đếm theo byte); [ ] cập nhật mượt khi gõ; [ ] vùng trạng thái có nhãn truy cập hợp lý.
- **Test:** unit cho hàm đếm (tách thành hàm thuần); component test.

### TASK 1.12 — Hộp thoại phím tắt + command `help.shortcuts`

- **Mục tiêu:** Người dùng tra phím mà không cần nhớ (Plan 7.2 mục 1, 12.2).
- **Phạm vi:** `definitions/help.ts` (`help.shortcuts`, phím `Mod-/`, gọi `ui.openShortcutsDialog()`). `ShortcutsDialog.tsx`: **sinh danh sách từ registry** (không hard-code bảng), nhóm theo `category`, hiển thị phím theo nền tảng bằng `formatShortcut`, có **ô tìm kiếm** lọc theo tên/phím. Truy cập: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, **bẫy focus**, **Esc đóng**, đóng xong **trả focus về editor**, Ctrl+/ bật/tắt, bấm nền để đóng.
- **Tiêu chí xong:** [ ] thêm một command mới vào registry thì tự xuất hiện trong hộp thoại (có test); [ ] phím hiển thị đúng Ctrl hay ⌘ theo nền tảng giả lập; [ ] Redo hiển thị cả hai phím trên Windows; [ ] điều hướng hoàn toàn bằng bàn phím; [ ] mở bằng nút ở thanh trạng thái và bằng Ctrl+/.
- **Test:** component test (focus trap, Esc, trả focus, lọc), test sinh từ registry.

### TASK 1.13 — Guard tests & i18n parity

- **Mục tiêu:** Biến các quy tắc AGENTS.md thành test tự động để không ai vô tình vi phạm.
- **Phạm vi (tests/unit/guards.test.ts hoặc tách file):**
  1. **Không hard-code phím:** quét `src/` — chuỗi dạng `'Mod-…'`/`"Mod-…"` chỉ được xuất hiện trong `src/core/commands/definitions/` và `src/core/keymap/`.
  2. **Không hard-code màu:** quét `src/**/*.{ts,tsx,css}` — mã `#hex`/`rgb()`/`hsl()` chỉ được phép trong `src/styles/variables.css`.
  3. **Không gọi định dạng trực tiếp trong component:** quét `src/components/**` — cấm `.toggleBold(`, `.toggleItalic(`, `.toggleHeading(`, `.toggleBulletList(`… (phải qua `registry.run`).
  4. **i18n đồng bộ:** `vi.json` và `en.json` có **cùng tập khóa**; mọi `labelKey` của mọi command đều tồn tại ở cả hai.
  5. **Schema guard** (nếu chưa ở 1.3): không có underline/link/codeBlock/horizontalRule.
  6. **Phím mặc định Tiptap cần gỡ không còn tác dụng** (gom lại từ 1.8 nếu cần).
- **Tiêu chí xong:** [ ] mỗi guard có thông báo lỗi chỉ rõ file/dòng vi phạm; [ ] cố tình vi phạm thử thì test đỏ (ghi vào báo cáo cách đã thử).

### TASK 1.14 — E2E (Playwright), nếu P1-D3 được duyệt

- **Mục tiêu:** Kiểm tra phím tắt bằng bàn phím thật trong Chromium.
- **Phạm vi:** thêm `@playwright/test` (ghim phiên bản chính xác, ghi `versions.md`, trả lời 4 câu ở Plan 21.2), `playwright.config.ts` (chỉ Chromium, khởi động `vite preview`/`dev`), script `npm run test:e2e`, bước CI cài Chromium và chạy E2E. Kịch bản (mỗi cái một test):
  1. Gõ, bôi đen, Ctrl+B / Ctrl+I / Ctrl+Shift+X / Ctrl+E → đúng thẻ `<strong> <em> <s> <code>`.
  2. Ctrl+Alt+1/2/3 → h1/h2/h3; Ctrl+Alt+0 → `<p>`.
  3. Ctrl+Shift+8 / Ctrl+Shift+7 / Ctrl+Shift+B → ul / ol / blockquote.
  4. **Ctrl+Shift+S** không tạo gạch ngang.
  5. **Ctrl+U** hiện thông báo và không đổi nội dung.
  6. Ctrl+/ mở hộp thoại; Esc đóng; focus về editor.
  7. Enter trên dòng trống trong list/quote → thoát; Backspace đầu heading → thành đoạn.
  8. Undo/Redo bằng Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z.
  9. Gõ `# ` rồi chữ → h1; gõ chuỗi có dấu tiếng Việt dạng đã dựng sẵn không bị phá.
- **Lưu ý:** E2E **không thể** mô phỏng Unikey/EVKey thật; phần tiếng Việt qua bộ gõ là kiểm tra thủ công (Task 1.15).
- **Tiêu chí xong:** [ ] 9 kịch bản xanh cục bộ và trên CI; [ ] không flaky (chạy lại 3 lần liên tiếp đều xanh).

### TASK 1.15 — Tài liệu và kịch bản QA thủ công

- **Mục tiêu:** PO tự kiểm tra được; tài liệu khớp thực tế.
- **Phạm vi:**
  1. `docs/qa/phase-1-manual.md`: **Kịch bản 1 của Plan Phụ lục E** (đã chỉnh theo kết quả đo ở 1.10) + **kịch bản tiếng Việt Plan 18.3** + kiểm tra phím **AltGr** trên bố cục **US** và **Vietnamese** (Ctrl+Alt+số có chạy hay gõ ra ký tự?) + bảng ghi kết quả (Đạt/Lỗi/ghi chú).
  2. `README.md`: trạng thái Phase 1, cách chạy test/E2E.
  3. `CHANGELOG.md` (tạo mới nếu chưa có): mục Phase 1.
  4. `docs/architecture/versions.md`: cập nhật nếu có dependency mới (test `versions.test.ts` phải xanh).
  5. `docs/architecture/decisions/phase-1-decisions.md`: kết quả duyệt P1-D1…D7 và các điều chỉnh Plan (6.1; mục 19 về Playwright; Phụ lục E nếu đổi).
  6. **Không sửa `docs/PLAN.md`.** Điều chỉnh Plan được liệt kê thành đề xuất để PO duyệt rồi mới sửa.
- **Tiêu chí xong:** [ ] một người mới làm theo `phase-1-manual.md` chạy được toàn bộ; [ ] danh sách điểm lệch Plan được liệt kê đầy đủ.

---

## 7. TIÊU CHÍ CHỐT PHASE 1 (CLAUDE SẼ KIỂM TRA)

Khi PO yêu cầu, Claude pull nhánh `phase-1`, cài sạch, chạy đủ cổng, rồi đối chiếu. **Bất kỳ mục nào dưới đây trượt thì kết luận không thể là "ĐẠT".**

**A. Cổng tự động**
- [ ] `npm ci`, `typecheck`, `lint`, `format`, `test`, `build` sạch; E2E xanh (nếu P1-D3); CI xanh trên commit cuối.
- [ ] Không test bị `skip`/`only`/xóa; không rule lint bị tắt; không `as any` mới; không `eslint-disable` không có lý do.

**B. Chức năng (theo Plan 20, checklist Phase 1)**
- [ ] Gõ, chọn, xóa, di chuyển con trỏ tự nhiên.
- [ ] Mọi command Phase 1 chạy bằng phím tắt và bằng input rule (nơi có).
- [ ] Mỗi command có test đơn vị gồm cả undo (Plan 6.2 mục 7).
- [ ] Undo/Redo đúng với mọi định dạng.
- [ ] Không thể bị mắc kẹt trong danh sách/trích dẫn.
- [ ] Ctrl+U và phím không hỗ trợ hiện gợi ý; Ctrl+Shift+S **không** gạch ngang.
- [ ] Hộp thoại phím tắt sinh từ registry, truy cập được bằng bàn phím.

**C. Kiến trúc & nguyên tắc**
- [ ] Mọi định dạng đi qua `registry.run`; không có `editor.chain().toggle…` trong component.
- [ ] Không hard-code phím/màu/chuỗi giao diện (guard test xanh).
- [ ] Schema đúng Plan 4.3/P1-D5; không phát sinh node/mark chưa có quy tắc serialize.
- [ ] Không làm trước tính năng Phase sau; không dependency ngoài danh sách được duyệt.
- [ ] Không phá nguyên tắc 10 (chưa có file I/O nên chủ yếu kiểm tra không có chỗ xóa/mất dữ liệu bất ngờ trong thao tác soạn thảo, đặc biệt Undo, dán, Backspace).

**D. Chất lượng test**
- [ ] Test kiểm tra **hành vi thực** (trạng thái tài liệu), không chỉ "không ném lỗi".
- [ ] Có ca biên: không selection, đoạn rỗng, chọn nhiều đoạn, lồng cấu trúc, chữ tiếng Việt có dấu.

**E. Tài liệu & phiên bản**
- [ ] `versions.md` khớp `package.json`; README/CHANGELOG cập nhật; điểm lệch Plan đã liệt kê.

**F. Thủ công (do PO thực hiện, Claude xem báo cáo)**
- [ ] Kịch bản 1 đạt; **kịch bản tiếng Việt Plan 18.3 đạt** với Unikey/EVKey, Telex/VNI (hoặc ghi rõ phần chưa kiểm tra); AltGr đã kiểm tra trên US và Vietnamese.

**Kết luận có 3 mức:** **ĐẠT** (đủ A–F); **ĐẠT CÓ ĐIỀU KIỆN** (chỉ lỗi nhỏ, có danh sách sửa, PO chấp thuận gộp rồi sửa sau hoặc sửa trước); **CHƯA ĐẠT** (có lỗi chặn: mất dữ liệu, kẹt cấu trúc, phím sai, vi phạm kiến trúc). Quyền gộp `main` **thuộc PO**.

---

## PHỤ LỤC A — BẢNG COMMAND PHASE 1

`Mod` = Ctrl (Windows/Linux) hoặc Cmd (macOS). Chuỗi phím dùng cú pháp `prosemirror-keymap` / Tiptap.

| id | Phím Windows/Linux | Phím macOS | Lệnh Tiptap | isActive | Khóa i18n nhãn |
|---|---|---|---|---|---|
| `format.bold` | `Mod-b` | `Mod-b` | `toggleBold` | `bold` | `cmd.format.bold` |
| `format.italic` | `Mod-i` | `Mod-i` | `toggleItalic` | `italic` | `cmd.format.italic` |
| `format.strike` | `Mod-Shift-x` | `Mod-Shift-x` | `toggleStrike` | `strike` | `cmd.format.strike` |
| `format.code` | `Mod-e` | `Mod-e` | `toggleCode` | `code` | `cmd.format.code` |
| `block.paragraph` | `Mod-Alt-0` | `Mod-Alt-0` | `setParagraph` | `paragraph` | `cmd.block.paragraph` |
| `block.heading1` | `Mod-Alt-1` | `Mod-Alt-1` | `toggleHeading({level:1})` | `heading` lv1 | `cmd.block.heading1` |
| `block.heading2` | `Mod-Alt-2` | `Mod-Alt-2` | `toggleHeading({level:2})` | `heading` lv2 | `cmd.block.heading2` |
| `block.heading3` | `Mod-Alt-3` | `Mod-Alt-3` | `toggleHeading({level:3})` | `heading` lv3 | `cmd.block.heading3` |
| `block.bulletList` | `Mod-Shift-8` | `Mod-Shift-8` | `toggleBulletList` | `bulletList` | `cmd.block.bulletList` |
| `block.orderedList` | `Mod-Shift-7` | `Mod-Shift-7` | `toggleOrderedList` | `orderedList` | `cmd.block.orderedList` |
| `block.blockquote` | `Mod-Shift-b` | `Mod-Shift-b` | `toggleBlockquote` | `blockquote` | `cmd.block.blockquote` |
| `edit.undo` | `Mod-z` | `Mod-z` | `undo` | (isEnabled: `can().undo()`) | `cmd.edit.undo` |
| `edit.redo` | `['Mod-y','Mod-Shift-z']` | `['Mod-Shift-z']` | `redo` | (isEnabled: `can().redo()`) | `cmd.edit.redo` |
| `help.shortcuts` | `Mod-/` | `Mod-/` | (qua `ui`) | — | `cmd.help.shortcuts` |

**Phím mặc định Tiptap cần gỡ (không còn tác dụng sau Task 1.3/1.8):** `Mod-Shift-s` (strike), `Mod-u` (underline; **thay bằng gợi ý ở 1.8**), `Mod-Alt-c`, `Mod-Enter`, `Mod-Shift-9`, `Mod-Alt-4/5/6`, và các biến thể viết hoa (`Mod-B`, `Mod-I`, `Mod-U`).
**Phím cấu trúc giữ nguyên:** Enter, Backspace, Delete, Tab, Shift-Tab, Shift-Enter.

**Cảnh báo kiểm tra:** `Mod-Alt-0/1/2/3` và `Mod-Alt-…` có thể bị bố cục AltGr (Ctrl+Alt) chiếm. Không đổi phím trong Phase 1; ghi kết quả kiểm tra vào báo cáo để PO quyết ở Phase 5 (cho đổi phím).

## PHỤ LỤC B — KHÓA i18N TỐI THIỂU (thêm vào cả `vi.json` và `en.json`)

`cmd.<id>` cho 14 command (ví dụ `cmd.format.bold` = "In đậm"/"Bold"); `category.format|block|edit|help`; `hint.unsupportedFormat`; `shortcuts.title`, `shortcuts.search`, `shortcuts.noResult`, `shortcuts.close`, `shortcuts.open`; `status.words`, `status.chars` (đã có); `editor.ariaLabel`; `welcome.title`, `welcome.hint` (nhận `{{shortcut}}`). Gemini được thêm khóa khi cần, nhưng **hai file phải luôn đồng bộ** (guard 1.13).

## PHỤ LỤC C — MẪU BÁO CÁO TASK

```
Task:                 (ví dụ 1.8)
Nhánh / commit:       
File đã thay đổi:     
Kết quả 6 cổng:       typecheck ✓/✗  lint ✓/✗  format ✓/✗  test ✓/✗ (n test)  build ✓/✗  CI ✓/✗
Đối chiếu tiêu chí:   [x] ... [x] ... (từng ô của thẻ task)
Điểm lệch thẻ task:   (không có / liệt kê + lý do)
Dependency mới:       (không có / liệt kê + trả lời 4 câu Plan 21.2)
Phát hiện đáng chú ý: (hành vi bất ngờ, rủi ro, dữ liệu đo)
Câu hỏi cho PO:       
```

## PHỤ LỤC D — BÁO CÁO HOÀN THÀNH PHASE 1 (Gemini nộp cho PO trước khi nhờ Claude kiểm tra)

1. Bảng 15 task: trạng thái, commit cuối, ghi chú.
2. Kết quả 6 cổng + E2E trên commit cuối; liên kết lần chạy CI.
3. Danh sách điểm lệch Plan/tài liệu này và quyết định PO tương ứng.
4. Kết quả đo ở Task 1.10 (Backspace/Ctrl+Z sau input rule).
5. Kết quả kịch bản thủ công (nếu PO đã chạy).
6. Rủi ro và nợ kỹ thuật còn lại (ví dụ: lint cấm chuỗi cứng trong JSX chưa có, để Phase 4).

---

**Hết tài liệu Phase 1.** Sau khi PO duyệt Mục 2, Gemini bắt đầu giao từ nhóm A.
