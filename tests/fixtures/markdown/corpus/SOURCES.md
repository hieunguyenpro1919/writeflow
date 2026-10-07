# WriteFlow — Corpus Test Suite (Task 2.5b)

Bộ 30 file Markdown dùng làm **Golden Master** cho kiểm thử round-trip
của Phase 2 (Markdown Engine). Mục tiêu: phát hiện mọi trường hợp mất
hoặc biến dạng dữ liệu khi `parse → serialize`.

**Tôn chỉ:** Lossless Data — không nuốt, không biến dạng dữ liệu thô.

**Cấu trúc thư mục:** phẳng, tất cả file `.md` nằm cạnh `SOURCES.md`.

**Quy ước đặt tên:**
- `01-tech-...` → `10-tech-...`: Nhóm 1 — Cấu trúc dự án & kỹ thuật
- `11-html-...` → `20-html-...`: Nhóm 2 — HTML thô & cú pháp nâng cao
- `21-edge-...` → `30-edge-...`: Nhóm 3 — Ca xấu & kiểm thử biên

---

## Bảng tổng hợp 30 file

| Số | Tên file | Nhóm | Giấy phép / Nguồn | Cấu trúc kiểm thử mục tiêu |
| :---: | --- | :---: | --- | --- |
| 01 | `01-tech-readme-standard.md` | 1 | WriteFlow Team — MIT (tự soạn) | README chuẩn: H1–H3, list, code block bash, inline code, link ngoài, horizontal rule |
| 02 | `02-tech-heading-all-levels.md` | 1 | WriteFlow Team — MIT (tự soạn) | Heading ATX đủ H1→H6, chuyển cấp không tuần tự, heading có inline code/emphasis |
| 03 | `03-tech-nested-lists.md` | 1 | WriteFlow Team — MIT (tự soạn) | Bullet/ordered lồng 4–5 cấp, đánh số bắt đầu khác 1, list chứa đoạn văn nhiều dòng |
| 04 | `04-tech-task-lists.md` | 1 | WriteFlow Team — MIT (tự soạn) | Task list `[ ]`/`[x]` lồng nhiều cấp, task có inline formatting |
| 05 | `05-tech-gfm-tables.md` | 1 | WriteFlow Team — MIT (tự soạn) | Bảng GFM căn lề trái/giữa/phải, ô chứa code/bold/link, cột rỗng, escape `\|` |
| 06 | `06-tech-code-blocks-multi-lang.md` | 1 | WriteFlow Team — MIT (tự soạn) | Fenced code block có language tag: typescript, python, bash, json, sql, rust; giữ thụt lề và ký tự đặc biệt |
| 07 | `07-tech-code-block-nested-fence.md` | 1 | WriteFlow Team — MIT (tự soạn) | Code block chứa chuỗi ``` bên trong, rào 4 dấu huyền; test chiến lược chọn rào dài hơn |
| 08 | `08-tech-blockquote-mixed.md` | 1 | WriteFlow Team — MIT (tự soạn) | Blockquote 1–3 tầng, quote chứa list, code block, heading; quote chứa quote |
| 09 | `09-tech-api-doc.md` | 1 | WriteFlow Team — MIT (tự soạn) | Tài liệu API thực tế: heading đa cấp, bảng tham số, code ví dụ, list mô tả, inline code dày |
| 10 | `10-tech-changelog.md` | 1 | WriteFlow Team — MIT (tự soạn) | CHANGELOG chuẩn Keep a Changelog: heading version, list phân loại, link, ngày tháng |
| 11 | `11-html-block-basic.md` | 2 | WriteFlow Team — MIT (tự soạn) | Khối HTML block: `<div>`, `<details><summary>`, `<table>` có thuộc tính, `<!-- comment -->` |
| 12 | `12-html-inline-tags.md` | 2 | WriteFlow Team — MIT (tự soạn) | Thẻ inline: `<kbd>`, `<b>`, `<span>`, `<code>`, `<br>`, `<sub>`, `<sup>`, `<mark>` |
| 13 | `13-html-link-img-extended.md` | 2 | WriteFlow Team — MIT (tự soạn) | `<a>`/`<img>` có `target="_blank"`, `rel`, `width`, `height`, `style`, `loading`, `alt` |
| 14 | `14-html-mixed-raw.md` | 2 | WriteFlow Team — MIT (tự soạn) | Trộn HTML block + Markdown + HTML inline, comment giữa các block |
| 15 | `15-html-frontmatter-yaml.md` | 2 | WriteFlow Team — MIT (tự soạn) | YAML Frontmatter phong phú: string, number, bool, array, nested object, date, multi-line |
| 16 | `16-html-footnotes.md` | 2 | WriteFlow Team — MIT (tự soạn) | Footnote `[^1]` và định nghĩa `[^1]:`, footnote nhiều dòng, footnote không dùng |
| 17 | `17-html-math-blocks.md` | 2 | WriteFlow Team — MIT (tự soạn) | Math inline `$...$`, block `$$...$$`, LaTeX phức tạp; math trong bảng và list |
| 18 | `18-html-reference-links.md` | 2 | WriteFlow Team — MIT (tự soạn) | Reference link `[ref]: url`, reference có title, shortcut reference, reference không dùng |
| 19 | `19-html-frontmatter-math-mix.md` | 2 | WriteFlow Team — MIT (tự soạn) | Frontmatter + Math + Footnote + Reference link + HTML inline trong cùng file |
| 20 | `20-html-full-doc.md` | 2 | WriteFlow Team — MIT (tự soạn) | Tài liệu thực tế kiểu blog: heading, ảnh HTML, code, bảng, math, footnote, reference |
| 21 | `21-edge-vietnamese-full.md` | 3 | WriteFlow Team — MIT (tự soạn) | Tiếng Việt đủ dấu thanh, đủ nguyên âm có dấu, tổ hợp dấu chồng, câu dài |
| 22 | `22-edge-vietnamese-nfc.md` | 3 | WriteFlow Team — MIT (tự soạn) | Tiếng Việt **chuẩn NFC** — baseline cho so sánh với file 23 |
| 23 | `23-edge-vietnamese-nfd.md` | 3 | WriteFlow Team — MIT (tự soạn, encode NFD) | Tiếng Việt **chuẩn NFD** — test chính sách không chuẩn hóa Unicode |
| 24 | `24-edge-bom-utf8.md` | 3 | WriteFlow Team — MIT (tự soạn) | File UTF-8 có BOM ở đầu — test phát hiện và bảo toàn BOM khi lưu |
| 25 | `25-edge-crlf-lf-mixed.md` | 3 | WriteFlow Team — MIT (tự soạn) | File có CRLF và LF xen kẽ — test phát hiện EOL và bảo toàn |
| 26 | `26-edge-hr-not-frontmatter.md` | 3 | WriteFlow Team — MIT (tự soạn) | Hai đường kẻ `---` kẹp văn bản thường ở đầu file — **không phải** frontmatter |
| 27 | `27-edge-syntax-as-text.md` | 3 | WriteFlow Team — MIT (tự soạn) | Dòng văn bản thuần bắt đầu bằng ký tự cú pháp: `# not heading`, `1986. year`, `- not list`, `\---`, `> not quote`, 4 space đầu dòng, `http://example.com/a_b_c?x=1&y=2` |
| 28 | `28-edge-empty.md` | 3 | WriteFlow Team — MIT (tự soạn) | **File rỗng hoàn toàn (0 byte)** — ca biên cô lập |
| 29 | `29-edge-only-blank-lines.md` | 3 | WriteFlow Team — MIT (tự soạn) | **File chỉ có các dòng trống liên tiếp** — ca biên cô lập |
| 30 | `30-edge-long-line.md` | 3 | WriteFlow Team — MIT (tự soạn) | **Một dòng văn bản >10KB** — ca biên cô lập, test hiệu năng và không xuống dòng |

---

## Ghi chú kỹ thuật

- File 22 và 23 là **cặp đôi có chủ đích**: cùng nội dung ngữ nghĩa, khác dạng Unicode. Test round-trip phải bảo toàn byte gốc của từng file, không được chuẩn hóa chéo.
- File 23 phải được encode NFD khi lưu. Nếu Git hoặc editor tự chuyển sang NFC thì đó là bug của môi trường, không phải của corpus.
- File 24 (BOM) và 25 (CRLF/LF) khi tạo phải dùng công cụ byte-level để đảm bảo đúng đặc tính, không dựa vào editor mặc định.
- File 30 chứa một dòng >10KB — nội dung là chuỗi lặp có chủ đích, không phải văn bản ngẫu nhiên, để dễ nhận diện khi diff.
- File 28 rỗng hoàn toàn (0 byte), không có BOM, không có ký tự newline.
- File 29 chỉ chứa `\n` (hoặc `\r\n` xen kẽ) — không có ký tự nào khác.