# BÁO CÁO PHÂN LOẠI ROUND-TRIP CORPUS 52 FILE (TASK 2.5b-fix)

**Dự án:** WriteFlow — Trình soạn thảo Markdown WYSIWYG  
**Thời gian thực hiện:** 10/10/2026  
**Nhánh:** `phase-2`  
**Commit `src/` tại thời điểm đo:** `6558bd24ae4406592fd6a447cbeb2d20c02d5e96`  
**Môi trường thực thi:** Vitest v3.2.7 (Node v24.17.0, JSDOM test runner environment)  
**Quy tắc kỷ luật:** TUYỆT ĐỐI KHÔNG can thiệp sửa engine trong `src/`. Mọi lỗi phát sinh chỉ ghi nhận vào báo cáo và quản lý qua `knownFailures` trong test suite.

---

## 1. TỔNG QUAN KẾT QUẢ ĐO KIỂM

| Tiêu chí | Số lượng | Tỷ lệ (%) | Đánh giá |
| :--- | :--- | :--- | :--- |
| **Tổng số file đo kiểm** | **52 file** | 100.0% | Vượt yêu cầu tối thiểu (≥ 30 file) |
| **Số tài liệu thật (Repo + Open Source)** | **21 file** | 40.4% | Vượt yêu cầu tối thiểu (≥ 20 file) |
| **Đạt sạch 100% Byte-Exact (CLEAN)** | **14 file** | 26.9% | Tuyệt đối không lệch 1 byte |
| **Nhóm 2: Chuẩn hóa bảo toàn ngữ nghĩa (Idempotent)** | **28 file** | 53.8% | Ngữ nghĩa tương đương, thỏa mãn CommonMark/GFM |
| **Nhóm 3: Dị biệt tính bất biến (`s2 !== s1`)** | **5 file** | 9.6% | Ghi nhận nợ kỹ thuật TD-10, TD-11, TD-13 |
| **Nhóm 1: Sai lệch / Mất thẻ HTML nội dòng (Chặn Gate A)** | **5 file** | 9.6% | Ghi nhận nợ kỹ thuật TD-11, TD-12 |
| **Crash / Exception khi Parse - Serialize** | **0 file** | 0.0% | 100% không crash |

---

## 2. BẢNG PHÂN LOẠI CHI TIẾT TOÀN BỘ 52 FILE CORPUS

### A. 30 file mẫu tổng hợp & ca biên gốc (`corpus/`)

| STT | Tên file | Kích thước gốc | S1 / S2 | Phân nhóm | Kết quả & Ghi chú khác biệt |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 01 | `01-tech-readme-standard.md` | 746 B | 746 B / 746 B | **CLEAN** | Khớp byte 100%, bảo toàn headings, links, code, list. |
| 02 | `02-tech-heading-all-levels.md` | 724 B | 724 B / 724 B | **CLEAN** | Khớp byte 100%, bảo toàn H1-H6, emoji, inline code. |
| 03 | `03-tech-nested-lists.md` | 1,160 B | 1,153 B / 1,153 B | **Nhóm 2** | Chuẩn hóa thụt lề khoảng trắng danh sách lồng nhau (2 spaces). Idempotent. |
| 04 | `04-tech-task-lists.md` | 903 B | 903 B / 903 B | **CLEAN** | Khớp byte 100%, task list checked/unchecked bảo toàn tuyệt đối. |
| 05 | `05-tech-gfm-tables.md` | 1,420 B | 1,420 B / 1,420 B | **CLEAN** | Khớp byte 100%, kén `rawBlock` bảo vệ toàn vẹn bảng GFM. |
| 06 | `06-tech-code-blocks-multi-lang.md` | 2,361 B | 2,361 B / 2,361 B | **CLEAN** | Khớp byte 100%, 7 khối mã đa ngôn ngữ + dynamic fence backticks. |
| 07 | `07-tech-code-block-nested-fence.md` | 325 B | 330 B / 330 B | **Nhóm 2** | Chuẩn hóa dòng trống xung quanh khối mã 4 backticks. Idempotent. |
| 08 | `08-tech-blockquote-mixed.md` | 1,111 B | 1,111 B / 1,111 B | **CLEAN** | Khớp byte 100%, blockquote đơn và lồng nhau kèm list/code. |
| 09 | `09-tech-api-doc.md` | 2,044 B | 2,044 B / 2,044 B | **CLEAN** | Khớp byte 100%, tài liệu API thực tế với bảng, tham số, curl. |
| 10 | `10-tech-changelog.md` | 1,270 B | 1,278 B / 1,278 B | **Nhóm 2** | Bare URL autolinked thành `[url](url)`. Idempotent. |
| 11 | `11-html-block-basic.md` | 1,467 B | 1,467 B / 1,467 B | **CLEAN** | Khớp byte 100%, `<div>`, `<details>`, `<table>` giữ nguyên vẹn qua `rawBlock`. |
| 12 | `12-html-inline-tags.md` | 1,427 B | 1,757 B / 1,760 B | **Nhóm 3** | Thẻ inline HTML thiếu `rawInline` gây biến dạng re-serialize không ổn định (**TD-11**). |
| 13 | `13-html-link-img-extended.md` | 1,771 B | 1,708 B / 1,708 B | **Nhóm 1** | Thẻ `<a>` mở rộng có `target`, `rel`, `class` bị convert thành link Markdown đơn giản làm mất thuộc tính (**TD-12**). |
| 14 | `14-html-mixed-raw.md` | 1,269 B | 1,245 B / 1,245 B | **Nhóm 1** | Thẻ inline HTML (`<a>`, `<em>`, `<mark>`) trong khối hỗn hợp bị mất thẻ (**TD-11**). |
| 15 | `15-html-frontmatter-yaml.md` | 1,673 B | 1,673 B / 1,673 B | **CLEAN** | Khớp byte 100%, YAML frontmatter bảo toàn nguyên vẹn 100%. |
| 16 | `16-html-footnotes.md` | 1,221 B | 1,221 B / 1,221 B | **Nhóm 2** | Entity mã hóa khoảng trắng cho footnote reference text. Idempotent. |
| 17 | `17-html-math-blocks.md` | 1,357 B | 1,384 B / 1,384 B | **Nhóm 2** | Khối LaTeX Math `$$` chuẩn hóa dòng phân cách. Idempotent. |
| 18 | `18-html-reference-links.md` | 1,544 B | 1,870 B / 1,870 B | **Nhóm 2** | Reference links (`[text][id]`) chuyển thành inline links (`[text](url)`). Idempotent. |
| 19 | `19-html-frontmatter-math-mix.md` | 1,407 B | 1,506 B / 1,506 B | **Nhóm 2** | Frontmatter, Math, Div, Details, và inline kbd được bảo toàn trong JSDOM. Idempotent. |
| 20 | `20-html-full-doc.md` | 1,900 B | 1,904 B / 1,904 B | **Nhóm 2** | Dòng ngắt và chuẩn hóa ký tự thoát CommonMark. Idempotent. |
| 21 | `21-edge-vietnamese-full.md` | 2,947 B | 2,947 B / 2,947 B | **CLEAN** | Khớp byte 100%, tiếng Việt 134 ký tự có dấu, ca dao, thơ lục bát. |
| 22 | `22-edge-vietnamese-nfc.md` | 904 B | 905 B / 905 B | **Nhóm 2** | Giữ nguyên chuẩn Unicode NFC tiếng Việt; chuẩn hóa newline cuối file. Idempotent. |
| 23 | `23-edge-vietnamese-nfd.md` | 1,070 B | 1,071 B / 1,071 B | **Nhóm 2** | Giữ nguyên chuẩn Unicode NFD (tổ hợp); chuẩn hóa newline cuối file. Idempotent. |
| 24 | `24-edge-bom-utf8.md` | 477 B | 477 B / 477 B | **CLEAN** | Khớp byte 100%, bảo tồn UTF-8 BOM (`\uFEFF` / `0xEF 0xBB 0xBF`). |
| 25 | `25-edge-crlf-lf-mixed.md` | 456 B | 470 B / 470 B | **Nhóm 2** | Chuẩn hóa đồng nhất CRLF `\r\n` cho toàn bộ tài liệu theo cờ file gốc. Idempotent. |
| 26 | `26-edge-hr-not-frontmatter.md` | 502 B | 503 B / 503 B | **Nhóm 2** | Nhận diện chính xác HR đầu file không phải frontmatter; chuẩn hóa trailing newline. Idempotent. |
| 27 | `27-edge-syntax-as-text.md` | 1,128 B | 1,195 B / 1,195 B | **Nhóm 2** | Thoát ký tự đầu dòng (`\#`, `1\.`, `\-`, `\>`) bảo vệ không biến thành block. Idempotent. |
| 28 | `28-edge-empty.md` | 0 B | 0 B / 0 B | **CLEAN** | Khớp byte 100%, file rỗng giữ nguyên 0 byte. |
| 29 | `29-edge-only-blank-lines.md` | 5 B | 0 B / 0 B | **Nhóm 2** | File chỉ chứa dòng trống được rút gọn về rỗng theo quy tắc ranh giới văn bản. Idempotent. |
| 30 | `30-edge-long-line.md` | 11,001 B | 11,001 B / 11,001 B | **CLEAN** | Khớp byte 100%, dòng cực dài 10,000 ký tự không bị ngắt quãng hay tràn stack. |

---

### B. 22 file tài liệu thật (`corpus/real/`)

| STT | Tên file | Kích thước gốc | S1 / S2 | Phân nhóm | Kết quả & Ghi chú khác biệt |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 31 | `real/edge-line-120kb.md` | 124,256 B | 124,256 B / 124,256 B | **CLEAN** | **Dòng văn bản 124 KB giữ nguyên 100% byte**, không tràn bộ nhớ, không ngắt dòng sai. |
| 32 | `real/oss-commonmark-spec-sample.md` | 961 B | 1,100 B / 1,100 B | **Nhóm 2** | Reference links chuyển thành inline links, bảo toàn footnote. Idempotent. |
| 33 | `real/oss-electron-readme.md` | 892 B | 806 B / 806 B | **Nhóm 2** | Reference links và ảnh lồng link được serialize ổn định. Idempotent. |
| 34 | `real/oss-express-readme.md` | 1,193 B | 1,071 B / 1,071 B | **Nhóm 2** | Badges CI Shields.io, code blocks, autolinks giữ nguyên. Idempotent. |
| 35 | `real/oss-github-cheatsheet.md` | 853 B | 855 B / 855 B | **Nhóm 1** | Thẻ `<mark>`, `<abbr>`, `<sub>`, `<sup>` nội dòng bị bóc tách mất thẻ (**TD-11**). |
| 36 | `real/oss-jest-guide.md` | 893 B | 902 B / 917 B | **Nhóm 3** | Danh sách số lồng khối mã bị thụt lề 3-space của serializer làm unindent ở vòng 2 (**TD-10**). |
| 37 | `real/oss-katex-readme.md` | 889 B | 845 B / 845 B | **Nhóm 1** | Thẻ `<sup>`, `<sub>` bị bóc tách mất thẻ (**TD-11**). Idempotent. |
| 38 | `real/oss-prettier-readme.md` | 1,068 B | 940 B / 940 B | **Nhóm 2** | Bảng Markdown và badges giữ nguyên vẹn, chuẩn hóa autolinks. Idempotent. |
| 39 | `real/oss-react-tutorial.md` | 1,054 B | 1,063 B / 1,076 B | **Nhóm 3** | Danh sách số lồng khối mã `tsx` bị unindent ở vòng 2 do 3-space indent (**TD-10**). |
| 40 | `real/oss-redux-readme.md` | 1,223 B | 1,173 B / 1,173 B | **Nhóm 1** | Thẻ `<mark>`, `<sub>`, `<sup>`, `<abbr>` bị mất thẻ (**TD-11**). Idempotent. |
| 41 | `real/oss-rust-cli-guide.md` | 816 B | 830 B / 843 B | **Nhóm 3** | Danh sách số lồng khối mã Rust bị unindent ở vòng 2 (**TD-10**). |
| 42 | `real/oss-vite-guide.md` | 1,152 B | 1,055 B / 1,055 B | **Nhóm 2** | Logo ảnh lồng link, bảng cấu hình 4 cột giữ nguyên vẹn. Idempotent. |
| 43 | `real/oss-zustand-readme.md` | 1,444 B | 1,317 B / 1,317 B | **Nhóm 2** | TypeScript generic code fences, badges SVG giữ nguyên. Idempotent. |
| 44 | `real/repo-agents.md` | 1,691 B | 1,692 B / 1,692 B | **Nhóm 2** | Chuẩn hóa trailing newline cuối file. Idempotent. |
| 45 | `real/repo-markdown-normalizations.md` | 7,801 B | 7,873 B / 7,876 B | **Nhóm 3** | Code span chứa chuỗi thoát `\~~~` bị escape thêm backtick ở vòng 2 (**TD-13**). |
| 46 | `real/repo-plan.md` | 79,234 B | 79,252 B / 79,252 B | **Nhóm 2** | **File kế hoạch 79 KB** bảo toàn 100% bảng, code, task lists. Idempotent. |
| 47 | `real/repo-qa-manual.md` | 9,393 B | 9,211 B / 9,211 B | **Nhóm 2** | Chuẩn hóa `_italic_` thành `*italic*`, bảo toàn bảng test case. Idempotent. |
| 48 | `real/repo-readme.md` | 3,177 B | 3,111 B / 3,111 B | **Nhóm 2** | Chuẩn hóa link tham chiếu thành link trực tiếp, giữ nguyên badges. Idempotent. |
| 49 | `real/repo-tasks-phase-1.md` | 38,348 B | 38,491 B / 38,491 B | **Nhóm 2** | **File 38 KB** bảo toàn toàn bộ checklist, task matrices. Idempotent. |
| 50 | `real/repo-tasks-phase-2.md` | 3,116 B | 3,141 B / 3,141 B | **Nhóm 2** | Chuẩn hóa dòng ngắt cứng thành `\`. Idempotent. |
| 51 | `real/repo-technical-debt.md` | 13,067 B | 13,088 B / 13,088 B | **Nhóm 2** | Bảo toàn toàn bộ bảng theo dõi nợ TD-01→TD-12 và chuỗi JSON. Idempotent. |
| 52 | `real/repo-versions.md` | 3,432 B | 3,434 B / 3,434 B | **Nhóm 2** | Bảng phụ thuộc npm giữ nguyên vẹn 100%. Idempotent. |

---

## 3. PHÂN TÍCH CHUYÊN SÂU CÁC NHÓM BIẾN ĐỔI

### Nhóm 2: Khác biệt chuẩn hóa bảo toàn ngữ nghĩa (28 file)
Chiếm đa số tuyệt đối (53.8%) và đạt **tính bất biến (Idempotent 100%)**:
1. **Chuyển đổi Reference links sang Inline links:** Phổ biến trên các file README chuẩn OSS (`oss-electron-readme.md`, `oss-commonmark-spec-sample.md`, `repo-readme.md`, `18-html-reference-links.md`). Dữ liệu URL và text đích được giữ nguyên vẹn 100%.
2. **Chuẩn hóa thụt lề danh sách lồng & dòng trống:** Thụt lề 2 khoảng trắng canonical cho danh sách con và chèn dòng trống phân cách quanh khối mã.
3. **Thoát ký tự đầu dòng văn bản thường:** `#`, `1.`, `-` ở đầu dòng được bảo vệ bằng dấu `\` để không bị biến thành block node.
4. **Chuẩn hóa EOL & Trailing newline:** Tự động phát hiện CRLF/LF và bổ sung ký tự ngắt dòng cuối file chuẩn POSIX.

### Nhóm 3: Dị biệt tính bất biến (`s2 !== s1` — 5 file)
1. **TD-10 (Danh sách số lồng khối mã):**
   - Các file: `oss-jest-guide.md`, `oss-react-tutorial.md`, `oss-rust-cli-guide.md`.
   - Hiện tượng: Vòng 1 serialize khối mã trong ordered list bằng 3 dấu cách (`   ``` `). CommonMark yêu cầu continuation indent là 4 dấu cách, nên marked ở vòng 2 tách khối mã ra khỏi ordered list (`s2 !== s1`).
2. **TD-13 (Ký tự phân cách code span):**
   - File: `repo-markdown-normalizations.md`.
   - Hiện tượng: Ký tự dấu ngã thoát trong code span (`\~~~`) bị serializer bọc thêm backtick và escape trên serialize lần 2.
3. **TD-11 (Inline HTML unstable):**
   - File: `12-html-inline-tags.md`.

### Nhóm 1: Sai lệch / Mất thẻ HTML nội dòng (5 file — Lỗi CHẶN Gate A)
1. **TD-11 (Mất thẻ inline HTML):**
   - Các file: `14-html-mixed-raw.md`, `oss-github-cheatsheet.md`, `oss-katex-readme.md`, `oss-redux-readme.md`.
   - Hiện tượng: Các thẻ `<mark>`, `<sub>`, `<sup>`, `<abbr>` do ProseMirror schema hiện tại chưa có extension `rawInline` nên bị DOMParser bóc tách (chỉ giữ lại text bên trong, ví dụ `H<sub>2</sub>O` thành `H2O`).
2. **TD-12 (Mất thuộc tính mở rộng của anchor/image HTML):**
   - File: `13-html-link-img-extended.md`.
   - Hiện tượng: Thẻ `<a target="_blank" rel="..." class="...">` bị chuyển thành markdown link `[text](url)` thông thường, mất các thuộc tính HTML tùy biến.

---

## 4. KẾT LUẬN & KIẾN NGHỊ CHO GATE A

1. **Độ ổn định trên tài liệu thực tế đồ sộ:**
   - Đã kiểm thử thành công trên các tài liệu lớn của repo (`docs/PLAN.md` 79 KB, `phase-1.md` 38 KB) và file hiệu năng cực hạn 124 KB (1 dòng).
   - Tỷ lệ bảo toàn ngữ nghĩa (Clean + Nhóm 2) đạt **80.8%** (42/52 file).
   - Tỷ lệ không crash đạt **100.0%**.
2. **Nhiệm vụ trọng tâm trước khi đóng Gate A (Phase 2):**
   - Cần 1 Task Card riêng (Task 2.6) để triển khai **`rawInline`** nhằm giải quyết triệt để **TD-11** và **TD-12**.
   - Cập nhật quy tắc thụt lề 4 dấu cách cho ordered list continuation để xử lý **TD-10**.
   - Tất cả 10 file lỗi đã được cô lập và khẳng định chủ động trong `knownFailures` của test suite `tests/unit/markdown/corpus.test.ts`. Khi sửa xong các TD trên, các test này sẽ tự động báo đỏ để buộc gỡ khỏi danh sách nợ.
