# BÁO CÁO PHÂN LOẠI ROUND-TRIP CORPUS 30 FILE (TASK 2.5b)

**Dự án:** WriteFlow — Trình soạn thảo Markdown WYSIWYG  
**Thời gian thực hiện:** 07/10/2026  
**Nhánh:** `phase-2`  
**Quy tắc:** Đánh giá tính toàn vẹn và mức độ bảo toàn dữ liệu trên 30 file Markdown đa dạng (GFM, Tech Docs, HTML thô, Ca biên Unicode/Encoding) mà TUYỆT ĐỐI KHÔNG can thiệp sửa engine `src/`.

---

## 1. TỔNG QUAN KẾT QUẢ ĐO KIỂM

| Tiêu chí | Số lượng | Tỷ lệ (%) | Đánh giá |
| :--- | :--- | :--- | :--- |
| **Tổng số file đo kiểm** | **30 file** | 100.0% | Đạt chuẩn dung lượng mẫu |
| **Đạt sạch 100% Byte-Exact (CLEAN)** | **13 file** | 43.3% | Tuyệt đối không lệch 1 byte |
| **Nhóm 2: Khác biệt chuẩn hóa (Giữ nguyên ngữ nghĩa)** | **13 file** | 43.3% | Ngữ nghĩa tương đương, thỏa mãn CommonMark/GFM |
| **Nhóm 3: Không Idempotent (`s2 !== s1`)** | **1 file** | 3.3% | Ghi nhận nợ kỹ thuật TD-12 |
| **Nhóm 1: Sai lệch / Thoát Inline HTML (Chặn Gate A)** | **3 file** | 10.0% | Ghi nhận nợ kỹ thuật TD-11 |
| **Crash / Exception khi Parse - Serialize** | **0 file** | 0.0% | 100% không crash |

---

## 2. BẢNG PHÂN LOẠI CHI TIẾT TỪNG FILE CORPUS

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
| 11 | `11-html-block-basic.md` | 1,467 B | 1,467 B / 1,467 B | **CLEAN** | Khớp byte 100%, `<div>`, `<video>`, `<iframe>`, `<details>` giữ nguyên vẹn qua `rawBlock`. |
| 12 | `12-html-inline-tags.md` | 1,427 B | 1,757 B / 1,757 B | **Nhóm 1** | `<abbr>`, `<b>`, `<code>`, `<kbd>` nội dòng bị escape thành `&lt;...&gt;` (**TD-11**). |
| 13 | `13-html-link-img-extended.md` | 1,771 B | 1,834 B / 2,019 B | **Nhóm 3** | Thẻ `<a target="_blank">` chứa bare URL bị nhân bản link token ở vòng 2 (**TD-12**). |
| 14 | `14-html-mixed-raw.md` | 1,269 B | 1,367 B / 1,367 B | **Nhóm 1** | Inline HTML trong văn bản Markdown hỗn hợp bị escape (`&lt;a&gt;`) (**TD-11**). |
| 15 | `15-html-frontmatter-yaml.md` | 1,673 B | 1,673 B / 1,673 B | **CLEAN** | Khớp byte 100%, YAML frontmatter bảo toàn nguyên vẹn 100%. |
| 16 | `16-html-footnotes.md` | 1,221 B | 1,221 B / 1,221 B | **Nhóm 2** | Entity mã hóa khoảng trắng cho footnote reference text. Idempotent. |
| 17 | `17-html-math-blocks.md` | 1,357 B | 1,384 B / 1,384 B | **Nhóm 2** | Khối LaTeX Math `$$` chuẩn hóa dòng phân cách. Idempotent. |
| 18 | `18-html-reference-links.md` | 1,544 B | 1,870 B / 1,870 B | **Nhóm 2** | Reference links (`[text][id]`) chuyển thành inline links (`[text](url)`). Idempotent. |
| 19 | `19-html-frontmatter-math-mix.md` | 1,407 B | 1,506 B / 1,506 B | **Nhóm 1** | Frontmatter + Math giữ nguyên, nhưng thẻ `<kbd>` nội dòng bị escape (**TD-11**). |
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

## 3. PHÂN TÍCH CHI TIẾT CÁC NHÓM BIẾN ĐỔI

### Nhóm 2: Khác biệt chuẩn hóa bảo toàn ngữ nghĩa (13 file)
Các biến đổi sau đây được xác nhận là hành vi chuẩn hóa canonical của Markdown Engine, không làm thay đổi ngữ nghĩa hiển thị và đạt tính bất biến (Idempotent 100%):
1. **Autolink chuyển thành explicit link format (3 file):** `10`, `18`, `27`.
   - Bare URL được bọc kén `[url](url)` hoặc autolink theo chuẩn CommonMark.
2. **Reference-style link -> Inline link (1 file):** `18`.
   - Chuyển đổi tham chiếu `[text][id]` về dạng `[text](url)` inline trực tiếp.
3. **Thụt lề danh sách & chuẩn hóa dòng trống (3 file):** `03`, `07`, `20`.
   - Chuẩn hóa thụt lề 2 khoảng trắng cho bullet list và dòng trống cách ly khối mã 4 backticks.
4. **Chuẩn hóa ngắt dòng & Trailing newline (4 file):** `22`, `23`, `25`, `26`.
   - Thêm dòng trống cuối file theo chuẩn POSIX/CommonMark; đồng nhất CRLF cho file có hỗn hợp ngắt dòng.
5. **Escape ký tự cú pháp đầu dòng (1 file):** `27`.
   - Ký tự `#`, `1.`, `-` ở đầu dòng văn bản thường được escape dấu `\` để ngăn biến dạng thành cấu trúc khối khi mở lại.
6. **File chỉ chứa dòng trống (1 file):** `29`.
   - Rút gọn 5 byte dòng trống về 0 byte canonical rỗng.

### Nhóm 3: Dị biệt tính bất biến (Non-Idempotent) (1 file)
- **File:** `13-html-link-img-extended.md`
- **Hiện tượng:** Serializer lần 1 sinh ra chuỗi có kích thước 1,834 B; Serializer lần 2 sinh ra chuỗi có kích thước 2,019 B (`s2 !== s1`).
- **Nguyên nhân gốc:** Thẻ `<a href="..." target="_blank">` chứa nội dung text là URL trần bị cơ chế autolinker nhận diện và bọc thêm dấu ngoặc vuông `[ ]` trong vòng parse thứ 2, dẫn đến việc token link bị lặp lại.
- **Mã theo dõi:** **TD-12** (Đã ghi vào sổ nợ kỹ thuật).

### Nhóm 1: Sai lệch / Thoát Inline HTML (3 file - Lỗi CHẶN Gate A)
- **Các file:** `12-html-inline-tags.md`, `14-html-mixed-raw.md`, `19-html-frontmatter-math-mix.md`.
- **Hiện tượng:** Các thẻ HTML nội dòng (`<abbr>`, `<b>`, `<code>`, `<kbd>`) nằm xen kẽ trong đoạn văn bản thông thường bị ProseMirror schema bóc tách hoặc Serializer escape thành chuỗi thực thể `&lt;abbr&gt;`, `&lt;b&gt;`, `&lt;kbd&gt;`.
- **Đánh giá mức độ:** Lỗi nghiêm trọng (Data Loss / Semantic Mutation).
- **Mã theo dõi:** **TD-11** (Đã ghi vào sổ nợ kỹ thuật, bắt buộc xử lý qua Task Card riêng trước khi nghiệm thu Gate A).

---

## 4. KẾT LUẬN & KIẾN NGHỊ

1. **Hiệu năng và độ tin cậy nền tảng:**
   - Markdown Engine đã đạt **100% không crash** trên toàn bộ 30 file corpus phức tạp (kể cả Unicode NFD/NFC, UTF-8 BOM, file rỗng, và dòng siêu dài 11 kB).
   - Tỷ lệ hoàn toàn bảo toàn (Clean + Nhóm 2) đạt **86.6%** (26/30 file).
2. **Kế hoạch xử lý tiếp theo:**
   - Đưa **TD-11** (Hỗ trợ `rawInline` cho inline HTML tags) và **TD-12** (Bảo toàn link HTML mở rộng) vào Task Card 2.6 (hoặc task sửa lỗi chuyên biệt) để giải quyết dứt điểm trước khi đóng Phase 2.
