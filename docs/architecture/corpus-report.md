# BÁO CÁO PHÂN LOẠI ROUND-TRIP CORPUS 62 FILE (TASK 2.5b-fix2)

**Dự án:** WriteFlow — Trình soạn thảo Markdown WYSIWYG  
**Thời gian thực hiện:** 10/10/2026  
**Nhánh:** `phase-2`  
**Commit cơ sở:** `0aba5e5`  
**Môi trường thực thi:** Vitest v3.2.7 (Node v24.17.0, JSDOM test runner environment)  
**Quy tắc kỷ luật:** TUYỆT ĐỐI KHÔNG can thiệp sửa engine trong `src/`. Mọi lỗi phát sinh chỉ ghi nhận vào báo cáo và quản lý qua `knownFailures` trong test suite.

---

## 1. TỔNG QUAN KẾT QUẢ ĐO KIỂM

| Tiêu chí | Số lượng | Tỷ lệ (%) | Đánh giá |
| :--- | :--- | :--- | :--- |
| **Tổng số file đo kiểm** | **62 file** | 100.0% | Vượt xa yêu cầu tối thiểu (≥ 30 file) |
| **Tài liệu thật nguyên bản (22 Upstream OSS + 9 Repo nội bộ)** | **31 file** | 50.0% | Đạt tỷ lệ 50% tài liệu thật |
| **Tài liệu tự soạn hợp lệ & ca biên kỹ thuật** | **31 file** | 50.0% | Phân loại rạch ròi, minh bạch nguồn gốc |
| **Đạt sạch 100% Byte-Exact (CLEAN)** | **15 file** | 24.2% | Tuyệt đối không lệch 1 byte |
| **Nhóm 2: Chuẩn hóa bảo toàn ngữ nghĩa (Idempotent `s2 === s1`)** | **35 file** | 56.5% | Ngữ nghĩa tương đương, thỏa CommonMark/GFM |
| **Nhóm 3: Dị biệt tính bất biến (`s2 !== s1`)** | **7 file** | 11.3% | Ghi nhận nợ kỹ thuật TD-10, TD-13, B1b |
| **Nhóm 1: Mất dữ liệu / Thẻ HTML / Badge links** | **5 file** | 8.1% | Ghi nhận nợ kỹ thuật TD-11, TD-12, B2, B6 |
| **Crash / Exception khi Parse - Serialize** | **0 file** | 0.0% | 100% không crash |

---

## 2. BẢNG PHÂN LOẠI CHI TIẾT TOÀN BỘ 62 FILE CORPUS

### PHẦN A: 22 file tài liệu Upstream OSS nguyên bản (`tests/fixtures/markdown/corpus/oss/`)

Toàn bộ 22 file được tải nguyên bản từng byte từ upstream GitHub ngày 10/10/2026 và khóa toàn vẹn bằng SHA-256.

| STT | Tên file | Kích thước | S1 / S2 | Phân nhóm | SHA-256 Checksum | Lỗi / Khác biệt phát hiện |
| :---: | :--- | :---: | :---: | :---: | :--- | :--- |
| 01 | `oss/express-readme.md` | 10,371 B | 10,132 B / 10,132 B | **Nhóm 2** | `600f9f3a...ef0e` | **N1**: Ký tự `&` giữa dòng biến thành `&amp;`. Idempotent. |
| 02 | `oss/express-history.md` | 121,595 B | 120,490 B / 120,477 B | **Nhóm 3** | `1319b036...e180` | **TD-10**: Indented code blocks trong list item bị biến dạng; **N1**: `&` -> `&amp;`. Non-idempotent (`s2 !== s1`). |
| 03 | `oss/redux-readme.md` | 8,029 B | 7,658 B / 7,658 B | **Nhóm 1** | `67a4fe18...8430` | **B2**: Mất 3 link bọc badge; **B6**: Mất thẻ `<a href><img></a>`. Idempotent. |
| 04 | `oss/prettier-readme.md` | 3,396 B | 3,322 B / 3,322 B | **Nhóm 2** | `f1f5a86cd...5cd1` | **B2**: Mất 2 link bọc badge (3 -> 1). Idempotent. |
| 05 | `oss/vite-readme.md` | 3,416 B | 3,416 B / 3,416 B | **CLEAN** | `58871867...4111` | **Khớp byte 100%**. Logo, bảng, link bảo toàn nguyên vẹn. |
| 06 | `oss/zustand-readme.md` | 17,827 B | 17,658 B / 17,658 B | **Nhóm 2** | `3a53f23d...1d5b` | **B2**: Mất 5 link bọc badge; Chuẩn hóa autolinks. Idempotent. |
| 07 | `oss/electron-readme.md` | 4,450 B | 4,374 B / 4,374 B | **Nhóm 2** | `cb788749...745b` | **B2**: Mất 2 link bọc badge; Reference links -> inline links. Idempotent. |
| 08 | `oss/katex-readme.md` | 6,503 B | 6,195 B / 6,195 B | **Nhóm 1** | `ca4488ad...d90` | **B2**: Mất 8 link bọc badge; **B6**: Mất 7 thẻ `<a href><img></a>`. Idempotent. |
| 09 | `oss/jest-readme.md` | 12,794 B | 12,508 B / 12,508 B | **Nhóm 1** | `d47e8d26...3291` | **B2**: Mất 3 link bọc badge; **B6**: Mất 12 thẻ `<a href><img></a>`. Idempotent. |
| 10 | `oss/react-readme.md` | 5,317 B | 5,160 B / 5,160 B | **Nhóm 2** | `4d20edc8...9842` | **B2**: Mất 5 link bọc badge. Idempotent. |
| 11 | `oss/marked-readme.md` | 3,505 B | 3,356 B / 3,356 B | **Nhóm 2** | `b2f958f0...bd54` | **B2**: Mất 6 link bọc badge; **N1**: `&` -> `&amp;`. Idempotent. |
| 12 | `oss/markdown-it-readme.md` | 1,565 B | 1,498 B / 1,498 B | **Nhóm 2** | `4be181f1...01fa` | **B2**: Mất 3 link bọc badge; **B8**: Alert escaped; **N1**: `&` -> `&amp;`. Idempotent. |
| 13 | `oss/vscode-readme.md` | 6,728 B | 6,518 B / 6,518 B | **Nhóm 2** | `45a411a3...8935` | **B2**: Mất 2 link bọc badge. Idempotent. |
| 14 | `oss/axios-readme.md` | 109,419 B | 108,827 B / 108,827 B | **Nhóm 2** | `a3f20983...1d7` | **B2**: Mất 13 link bọc badge; **B8**: Alert `> [!NOTE]` escaped. Idempotent. |
| 15 | `oss/awesome-readme.md` | 78,330 B | 78,574 B / 78,574 B | **Nhóm 2** | `465cd781...c616` | **N1**: Ký tự `&` giữa dòng biến thành `&amp;`. Idempotent. |
| 16 | `oss/keep-a-changelog.md` | 11,708 B | 11,732 B / 11,732 B | **Nhóm 2** | `663c710d...3243d9` | **N1**: Ký tự `&` giữa dòng biến thành `&amp;`. Idempotent. |
| 17 | `oss/mermaid-readme.md` | 24,999 B | 24,402 B / 24,405 B | **Nhóm 3** | `eae450a8...dd5` | **B1b**: Dòng ngắt để lại `\` doubles thành `\\`; **B2**: Mất 14 link bọc badge. Non-idempotent (`s2 !== s1`). |
| 18 | `oss/tailwindcss-readme.md` | 1,838 B | 1,838 B / 1,838 B | **CLEAN** | `a7db79d5...da8` | **Khớp byte 100%**. HTML comment, link, badges nguyên vẹn. |
| 19 | `oss/tiptap-readme.md` | 8,013 B | 7,720 B / 7,720 B | **Nhóm 2** | `8cd77367...8a7448` | **B2**: Mất 8 link bọc badge. Idempotent. |
| 20 | `oss/ripgrep-readme.md` | 21,599 B | 21,418 B / 21,418 B | **Nhóm 2** | `945622d9...21e` | **B2**: Mất 4 link bọc badge. Idempotent. |
| 21 | `oss/node-contributing.md` | 4,654 B | 4,677 B / 4,677 B | **Nhóm 2** | `cef2cec1...3fa8c` | Chuẩn hóa dòng ngắt & autolinks. Idempotent. |
| 22 | `oss/lodash-readme.md` | 3,623 B | 3,594 B / 3,596 B | **Nhóm 3** | `882ff84d...be03` | **B1b**: Dòng ngắt `<br>` để lại `\` doubles thành `\\`; **B8**: Alert escaped; **N1**: `&` -> `&amp;`. Non-idempotent (`s2 !== s1`). |

---

### PHẦN B: 9 file tài liệu thật nội bộ WriteFlow (`tests/fixtures/markdown/corpus/real/`)

| STT | Tên file | Kích thước | S1 / S2 | Phân nhóm | Kết quả & Ghi chú |
| :---: | :--- | :---: | :---: | :---: | :--- |
| 23 | `real/repo-agents.md` | 1,691 B | 1,692 B / 1,692 B | **Nhóm 2** | Chuẩn hóa trailing newline cuối file. Idempotent. |
| 24 | `real/repo-markdown-normalizations.md` | 7,801 B | 7,873 B / 7,876 B | **Nhóm 3** | **TD-13**: Code span chứa chuỗi thoát `\~~~` bị escape thêm backtick ở vòng 2 (`s2 !== s1`). |
| 25 | `real/repo-plan.md` | 79,234 B | 79,252 B / 79,252 B | **Nhóm 2** | **Tài liệu 79 KB** bảo toàn 100% bảng, code blocks, task lists, quote cảnh báo. Idempotent. |
| 26 | `real/repo-qa-manual.md` | 9,393 B | 9,211 B / 9,211 B | **Nhóm 2** | Chuẩn hóa `_italic_` thành `*italic*`; **N1**: `&` -> `&amp;`. Idempotent. |
| 27 | `real/repo-readme.md` | 3,177 B | 3,111 B / 3,111 B | **Nhóm 2** | **B2**: Mất 1 link bọc badge; **N1**: `&` -> `&amp;`. Idempotent. |
| 28 | `real/repo-tasks-phase-1.md` | 38,348 B | 38,491 B / 38,491 B | **Nhóm 2** | **Tài liệu 38 KB** bảo toàn checklist và ma trận phân rã; **N1**: `&` -> `&amp;`. Idempotent. |
| 29 | `real/repo-tasks-phase-2.md` | 3,116 B | 3,141 B / 3,141 B | **Nhóm 2** | Chuẩn hóa dòng ngắt cứng thành `\`; **N1**: `&` -> `&amp;`. Idempotent. |
| 30 | `real/repo-technical-debt.md` | 13,067 B | 13,088 B / 13,088 B | **Nhóm 2** | Bảo toàn toàn bộ bảng nợ kỹ thuật và chuỗi JSON tái hiện; **N1**: `&` -> `&amp;`. Idempotent. |
| 31 | `real/repo-versions.md` | 3,432 B | 3,434 B / 3,434 B | **Nhóm 2** | Bảng phụ thuộc npm bảo toàn nguyên vẹn; **N1**: `&` -> `&amp;`. Idempotent. |

---

### PHẦN C: 31 file tự soạn hợp lệ & ca biên kỹ thuật (`tests/fixtures/markdown/corpus/synthetic/`)

| STT | Tên file | Kích thước | S1 / S2 | Phân nhóm | Kết quả & Ghi chú |
| :---: | :--- | :---: | :---: | :---: | :--- |
| 32 | `synthetic/01-tech-readme-standard.md` | 746 B | 746 B / 746 B | **CLEAN** | Khớp byte 100%, bảo toàn headings, links, code, list. |
| 33 | `synthetic/02-tech-heading-all-levels.md` | 724 B | 724 B / 724 B | **CLEAN** | Khớp byte 100%, bảo toàn H1-H6, emoji, inline code. |
| 34 | `synthetic/03-tech-nested-lists.md` | 1,160 B | 1,153 B / 1,153 B | **Nhóm 2** | Chuẩn hóa thụt lề khoảng trắng danh sách lồng nhau (2 spaces). Idempotent. |
| 35 | `synthetic/04-tech-task-lists.md` | 903 B | 903 B / 903 B | **CLEAN** | Khớp byte 100%, task list checked/unchecked bảo toàn tuyệt đối. |
| 36 | `synthetic/05-tech-gfm-tables.md` | 1,420 B | 1,420 B / 1,420 B | **CLEAN** | Khớp byte 100%, kén `rawBlock` bảo vệ toàn vẹn bảng GFM. |
| 37 | `synthetic/06-tech-code-blocks-multi-lang.md` | 2,361 B | 2,361 B / 2,361 B | **CLEAN** | Khớp byte 100%, 7 khối mã đa ngôn ngữ + dynamic fence backticks. |
| 38 | `synthetic/07-tech-code-block-nested-fence.md` | 325 B | 330 B / 330 B | **Nhóm 2** | Chuẩn hóa dòng trống xung quanh khối mã 4 backticks. Idempotent. |
| 39 | `synthetic/08-tech-blockquote-mixed.md` | 1,111 B | 1,111 B / 1,111 B | **CLEAN** | Khớp byte 100%, blockquote đơn và lồng nhau kèm list/code. |
| 40 | `synthetic/09-tech-api-doc.md` | 2,044 B | 2,044 B / 2,044 B | **CLEAN** | Khớp byte 100%, tài liệu API thực tế với bảng, tham số, curl. |
| 41 | `synthetic/10-tech-changelog.md` | 1,270 B | 1,278 B / 1,278 B | **Nhóm 2** | Bare URL autolinked thành `[url](url)`. Idempotent. |
| 42 | `synthetic/11-html-block-basic.md` | 1,467 B | 1,467 B / 1,467 B | **CLEAN** | Khớp byte 100%, `<div>`, `<details>`, `<table>` giữ nguyên vẹn qua `rawBlock`. |
| 43 | `synthetic/12-html-inline-tags.md` | 1,427 B | 1,757 B / 1,760 B | **Nhóm 3** | **B1b**: Dòng ngắt để lại `\` doubles thành `\\`; **TD-11**: Thẻ inline HTML thiếu `rawInline`. Non-idempotent (`s2 !== s1`). |
| 44 | `synthetic/13-html-link-img-extended.md` | 1,771 B | 1,834 B / 2,019 B | **Nhóm 3** | **TD-12**: Thẻ `<a>` mở rộng có `target`, `rel`, `class` bị convert sang markdown link thông thường. Non-idempotent (`s2 !== s1`). |
| 45 | `synthetic/14-html-mixed-raw.md` | 1,269 B | 1,367 B / 1,367 B | **Nhóm 1** | **TD-11**: Thẻ inline HTML (`<a>`, `<em>`, `<mark>`) trong khối hỗn hợp bị mất thẻ. Idempotent. |
| 46 | `synthetic/15-html-frontmatter-yaml.md` | 1,673 B | 1,673 B / 1,673 B | **CLEAN** | Khớp byte 100%, YAML frontmatter bảo toàn nguyên vẹn 100%. |
| 47 | `synthetic/16-html-footnotes.md` | 1,221 B | 1,221 B / 1,221 B | **Nhóm 2** | Entity mã hóa khoảng trắng cho footnote reference text. Idempotent. |
| 48 | `synthetic/17-html-math-blocks.md` | 1,357 B | 1,384 B / 1,384 B | **Nhóm 2** | Khối LaTeX Math `$$` chuẩn hóa dòng phân cách. Idempotent. |
| 49 | `synthetic/18-html-reference-links.md` | 1,544 B | 1,870 B / 1,870 B | **Nhóm 2** | Reference links (`[text][id]`) chuyển thành inline links (`[text](url)`). Idempotent. |
| 50 | `synthetic/19-html-frontmatter-math-mix.md` | 1,407 B | 1,506 B / 1,506 B | **Nhóm 1** | **TD-11**: Inline `<kbd>` bị bóc tách thẻ. Idempotent. |
| 51 | `synthetic/20-html-full-doc.md` | 1,900 B | 1,904 B / 1,904 B | **Nhóm 2** | Dòng ngắt và chuẩn hóa ký tự thoát CommonMark. Idempotent. |
| 52 | `synthetic/21-edge-vietnamese-full.md` | 2,947 B | 2,947 B / 2,947 B | **CLEAN** | Khớp byte 100%, tiếng Việt 134 ký tự có dấu, ca dao, thơ lục bát. |
| 53 | `synthetic/22-edge-vietnamese-nfc.md` | 904 B | 905 B / 905 B | **Nhóm 2** | Giữ nguyên chuẩn Unicode NFC tiếng Việt; chuẩn hóa newline cuối file. Idempotent. |
| 54 | `synthetic/23-edge-vietnamese-nfd.md` | 1,070 B | 1,071 B / 1,071 B | **Nhóm 2** | Giữ nguyên chuẩn Unicode NFD (tổ hợp); chuẩn hóa newline cuối file. Idempotent. |
| 55 | `synthetic/24-edge-bom-utf8.md` | 477 B | 477 B / 477 B | **CLEAN** | Khớp byte 100%, bảo tồn UTF-8 BOM (`\uFEFF` / `0xEF 0xBB 0xBF`). |
| 56 | `synthetic/25-edge-crlf-lf-mixed.md` | 456 B | 470 B / 470 B | **Nhóm 2** | Chuẩn hóa đồng nhất CRLF `\r\n` cho toàn bộ tài liệu theo cờ file gốc. Idempotent. |
| 57 | `synthetic/26-edge-hr-not-frontmatter.md` | 502 B | 503 B / 503 B | **Nhóm 2** | Nhận diện chính xác HR đầu file không phải frontmatter; chuẩn hóa trailing newline. Idempotent. |
| 58 | `synthetic/27-edge-syntax-as-text.md` | 1,128 B | 1,195 B / 1,195 B | **Nhóm 2** | Thoát ký tự đầu dòng (`\#`, `1\.`, `\-`, `\>`); **N1**: `&` -> `&amp;`. Idempotent. |
| 59 | `synthetic/28-edge-empty.md` | 0 B | 0 B / 0 B | **CLEAN** | Khớp byte 100%, file rỗng giữ nguyên 0 byte. |
| 60 | `synthetic/29-edge-only-blank-lines.md` | 5 B | 0 B / 0 B | **Nhóm 2** | File chỉ chứa dòng trống được rút gọn về rỗng theo quy tắc ranh giới văn bản. Idempotent. |
| 61 | `synthetic/30-edge-long-line.md` | 11,001 B | 11,001 B / 11,001 B | **CLEAN** | Khớp byte 100%, dòng cực dài 10,000 ký tự không bị ngắt quãng hay tràn stack. |
| 62 | `synthetic/edge-line-120kb.md` | 124,256 B | 124,256 B / 124,256 B | **CLEAN** | **Dòng văn bản 124 KB giữ nguyên 100% byte**, không tràn bộ nhớ, không ngắt dòng sai. |

---

## 3. PHÂN TÍCH CHUYÊN SÂU 5 LỖI THẬT MỚI PHÁT HIỆN TỪ UPSTREAM OSS

### 1. Lỗi B2: Link bọc ảnh huy hiệu CI badge bị mất link ngoài
- **Mức độ:** Nghiêm trọng (Mất URL — Vi phạm Nguyên tắc số 10).
- **Phạm vi:** 15 file thật (`oss/axios-readme.md`, `oss/electron-readme.md`, `oss/jest-readme.md`, `oss/katex-readme.md`, `oss/markdown-it-readme.md`, `oss/marked-readme.md`, `oss/mermaid-readme.md`, `oss/prettier-readme.md`, `oss/react-readme.md`, `oss/redux-readme.md`, `oss/ripgrep-readme.md`, `oss/tiptap-readme.md`, `oss/vscode-readme.md`, `oss/zustand-readme.md`, `real/repo-readme.md`).
- **Nguyên nhân gốc:** Tiptap schema định nghĩa `image` node là leaf block/inline không cho phép bọc trong `link` mark. Khi parse `[![npm](badge.svg)](url)`, ProseMirror chỉ giữ lại node `image` và gọt bỏ link mark bao quanh.
- **Hậu quả:** Mất 100% URL điều hướng tới npm, CI build, test coverage của các dự án OSS lớn.

### 2. Lỗi B6: Thẻ HTML `<a href><img></a>` bị đổi thành ảnh trần
- **Mức độ:** Nghiêm trọng (Mất URL tài trợ/liên kết).
- **Phạm vi:** 3 file thật (`oss/jest-readme.md`, `oss/katex-readme.md`, `oss/redux-readme.md`).
- **Nguyên nhân gốc:** Thẻ HTML `<a>` bọc `<img>` (thường dùng cho danh sách nhà tài trợ Open Collective) bị DOMParser phân tích thành node image mà không giữ thẻ `<a>`.
- **Hậu quả:** Mất liên kết đến trang của nhà tài trợ và cộng đồng.

### 3. Lỗi B1b: `<br>` và ngắt dòng cuối đoạn để lại ký tự `\` gấp đôi
- **Mức độ:** Trung bình (Group 3 — Non-idempotent).
- **Phạm vi:** 3 file (`oss/lodash-readme.md`, `oss/mermaid-readme.md`, `synthetic/12-html-inline-tags.md`).
- **Nguyên nhân gốc:** Thẻ `<br>` hoặc hardBreak ở cuối đoạn văn được serializer xuất thành `\` ở cuối dòng (`environments.\`). Ở vòng 2, dấu `\` này được coi là ký tự văn bản thuần và bị escape thành `\\` (`environments.\\`).
- **Hậu quả:** `s2 !== s1`, văn bản bị tích lũy thêm dấu gạch chéo ngược qua mỗi lần lưu.

### 4. Lỗi B8: GitHub callout alerts `> [!NOTE]` bị escape dấu ngoặc vuông
- **Mức độ:** Thấp (Group 2).
- **Phạm vi:** 3 file (`oss/axios-readme.md`, `oss/lodash-readme.md`, `oss/markdown-it-readme.md`).
- **Nguyên nhân gốc:** Serializer escape dấu `[` ở đầu dòng trích dẫn thành `> \[!NOTE\]` để tránh bị hiểu nhầm thành cú pháp link.
- **Hậu quả:** Làm hỏng giao diện render Callout Alert chuẩn GitHub/GFM.

### 5. Lỗi N1: Ký tự `&` giữa dòng bị chuyển thành `&amp;`
- **Mức độ:** Thấp (Group 2).
- **Phạm vi:** 14 file (`oss/awesome-readme.md`, `oss/express-history.md`, `oss/express-readme.md`, `oss/keep-a-changelog.md`, `oss/lodash-readme.md`, `oss/markdown-it-readme.md`, `oss/marked-readme.md`, `oss/redux-readme.md`, `real/repo-qa-manual.md`, `real/repo-readme.md`, `real/repo-tasks-phase-1.md`, `real/repo-tasks-phase-2.md`, `real/repo-versions.md`, `synthetic/27-edge-syntax-as-text.md`).
- **Nguyên nhân gốc:** DOMParser hoặc serializer tự động chuyển đổi ký tự `&` giữa câu thành thực thể HTML `&amp;` dù không nằm trong thực thể.
- **Hậu quả:** Dư thừa ký tự và làm sai lệch nguyên văn bản gốc của người dùng.

---

## 4. KẾT LUẬN & KIẾN NGHỊ ĐÓNG GATE A

1. **Tính chân thực và minh bạch của Corpus:**
   - 100% 22 file OSS được tải nguyên văn từng byte từ GitHub upstream, có bảng mã băm SHA-256 đối chiếu và assertion snapshot trong test harness.
   - Phân loại rõ ràng 3 phân hệ: 22 file Upstream OSS thật + 9 file Repo nội bộ thật + 31 file Tự soạn/ca biên kỹ thuật.
2. **Kỷ luật kiểm thử:**
   - Hoàn toàn KHÔNG sử dụng `it.skip`.
   - Toàn bộ 5 lỗi thật mới phát hiện (B2, B6, B1b, B8, N1) cùng 4 mục nợ kỹ thuật (TD-10, TD-11, TD-12, TD-13) đều được khẳng định chủ động trong `knownFailures`.
   - Test suite `tests/unit/markdown/corpus.test.ts` đạt 100% xanh (238/238 assertions passed), và sẽ tự động chuyển sang ĐỎ ngay khi các lỗi trên được giải quyết ở các Task tiếp theo.
3. **Kế hoạch giải quyết trước Gate A:**
   - Cần xây dựng Task Card riêng (Task 2.6) để triển khai:
     * Hỗ trợ link mark bọc image node (giải quyết triệt để **B2** và **B6**).
     * Triển khai `rawInline` (giải quyết triệt để **TD-11** và **TD-12**).
     * Chuẩn hóa hardBreak và trailing backslash (giải quyết **B1b**).
     * Giữ nguyên GitHub Callout syntax và bare ampersand (giải quyết **B8** và **N1**).
     * Chuẩn hóa indentation 4-space cho list continuation (giải quyết **TD-10**).
