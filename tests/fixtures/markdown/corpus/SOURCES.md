# WriteFlow — Corpus Test Suite (Task 2.5b & Task 2.5b-fix)

Bộ file Markdown dùng làm **Golden Master** cho kiểm thử round-trip của Phase 2 (Markdown Engine).
Mục tiêu: Đánh giá tính toàn vẹn và phát hiện mọi trường hợp mất hoặc biến dạng dữ liệu khi `parse → serialize`.

**Tôn chỉ cốt lõi:** Lossless Data (Nguyên tắc số 10) — không nuốt dữ liệu, không biến dạng dữ liệu thô.

---

## 1. Cấu trúc thư mục

- `tests/fixtures/markdown/corpus/`:
  - `01-tech-...` → `10-tech-...`: Nhóm 1 — Cấu trúc dự án & kỹ thuật chuẩn
  - `11-html-...` → `20-html-...`: Nhóm 2 — HTML thô & cú pháp nâng cao
  - `21-edge-...` → `30-edge-...`: Nhóm 3 — Ca xấu & kiểm thử biên
- `tests/fixtures/markdown/corpus/real/`:
  - `repo-...`: 9 file tài liệu thật lấy trực tiếp từ dự án WriteFlow
  - `oss-...`: 12 file tài liệu thật từ các dự án mã nguồn mở uy tín (MIT / Apache / BSD / CC)
  - `edge-line-120kb.md`: Ca biên hiệu năng cực hạn (1 dòng văn bản 124 KB)

Tổng cộng: **52 file** (trong đó **21 file tài liệu thật** từ repo và open-source).

---

## 2. Bảng 30 file mẫu tổng hợp & ca biên (Gốc)

| Số | Tên file | Nhóm | Giấy phép / Nguồn | Cấu trúc kiểm thử mục tiêu |
| :---: | --- | :---: | --- | --- |
| 01 | `01-tech-readme-standard.md` | 1 | WriteFlow Team — MIT (tự soạn) | README chuẩn: H1–H3, list, code block bash, inline code, link ngoài, horizontal rule |
| 02 | `02-tech-heading-all-levels.md` | 1 | WriteFlow Team — MIT (tự soạn) | Heading ATX đủ H1→H6, chuyển cấp không tuần tự, heading có inline code/emphasis |
| 03 | `03-tech-nested-lists.md` | 1 | WriteFlow Team — MIT (tự soạn) | Bullet/ordered lồng 4–5 cấp, đánh số bắt đầu khác 1, list chứa đoạn văn nhiều dòng |
| 04 | `04-tech-task-lists.md` | 1 | WriteFlow Team — MIT (tự soạn) | Task list `[ ]`/`[x]` lồng nhiều cấp, task có inline formatting |
| 05 | `05-tech-gfm-tables.md` | 1 | WriteFlow Team — MIT (tự soạn) | Bảng GFM căn lề trái/giữa/phải, ô chứa code/bold/link, cột rỗng, escape `\|` |
| 06 | `06-tech-code-blocks-multi-lang.md` | 1 | WriteFlow Team — MIT (tự soạn) | Fenced code block có language tag: typescript, python, bash, json, sql, rust |
| 07 | `07-tech-code-block-nested-fence.md` | 1 | WriteFlow Team — MIT (tự soạn) | Code block chứa chuỗi ``` bên trong, rào 4 dấu huyền |
| 08 | `08-tech-blockquote-mixed.md` | 1 | WriteFlow Team — MIT (tự soạn) | Blockquote 1–3 tầng, quote chứa list, code block, heading; quote chứa quote |
| 09 | `09-tech-api-doc.md` | 1 | WriteFlow Team — MIT (tự soạn) | Tài liệu API thực tế: heading đa cấp, bảng tham số, code ví dụ, inline code |
| 10 | `10-tech-changelog.md` | 1 | WriteFlow Team — MIT (tự soạn) | CHANGELOG chuẩn Keep a Changelog: heading version, list phân loại, link |
| 11 | `11-html-block-basic.md` | 2 | WriteFlow Team — MIT (tự soạn) | Khối HTML block: `<div>`, `<details><summary>`, `<table>`, `<!-- comment -->` |
| 12 | `12-html-inline-tags.md` | 2 | WriteFlow Team — MIT (tự soạn) | Thẻ inline: `<kbd>`, `<b>`, `<span>`, `<code>`, `<br>`, `<sub>`, `<sup>`, `<mark>` |
| 13 | `13-html-link-img-extended.md` | 2 | WriteFlow Team — MIT (tự soạn) | `<a>`/`<img>` có `target="_blank"`, `rel`, `width`, `height`, `style`, `loading` |
| 14 | `14-html-mixed-raw.md` | 2 | WriteFlow Team — MIT (tự soạn) | Trộn HTML block + Markdown + HTML inline, comment giữa các block |
| 15 | `15-html-frontmatter-yaml.md` | 2 | WriteFlow Team — MIT (tự soạn) | YAML Frontmatter phong phú: string, number, bool, array, nested object |
| 16 | `16-html-footnotes.md` | 2 | WriteFlow Team — MIT (tự soạn) | Footnote `[^1]` và định nghĩa `[^1]:`, footnote nhiều dòng |
| 17 | `17-html-math-blocks.md` | 2 | WriteFlow Team — MIT (tự soạn) | Math inline `$...$`, block `$$...$$`, LaTeX phức tạp |
| 18 | `18-html-reference-links.md` | 2 | WriteFlow Team — MIT (tự soạn) | Reference link `[ref]: url`, reference có title, shortcut reference |
| 19 | `19-html-frontmatter-math-mix.md` | 2 | WriteFlow Team — MIT (tự soạn) | Frontmatter + Math + Footnote + Reference link + HTML inline trong cùng file |
| 20 | `20-html-full-doc.md` | 2 | WriteFlow Team — MIT (tự soạn) | Tài liệu thực tế kiểu blog: heading, ảnh HTML, code, bảng, math, footnote |
| 21 | `21-edge-vietnamese-full.md` | 3 | WriteFlow Team — MIT (tự soạn) | Tiếng Việt đủ dấu thanh, đủ nguyên âm có dấu, tổ hợp dấu chồng, câu dài |
| 22 | `22-edge-vietnamese-nfc.md` | 3 | WriteFlow Team — MIT (tự soạn) | Tiếng Việt **chuẩn NFC** — baseline so sánh Unicode |
| 23 | `23-edge-vietnamese-nfd.md` | 3 | WriteFlow Team — MIT (tự soạn) | Tiếng Việt **chuẩn NFD** — kiểm tra bảo tồn Unicode NFD tổ hợp |
| 24 | `24-edge-bom-utf8.md` | 3 | WriteFlow Team — MIT (tự soạn) | File UTF-8 có BOM ở đầu — bảo toàn BOM khi lưu |
| 25 | `25-edge-crlf-lf-mixed.md` | 3 | WriteFlow Team — MIT (tự soạn) | File có CRLF và LF xen kẽ — phát hiện EOL và bảo toàn |
| 26 | `26-edge-hr-not-frontmatter.md` | 3 | WriteFlow Team — MIT (tự soạn) | Hai đường kẻ `---` kẹp văn bản thường ở đầu file — không phải frontmatter |
| 27 | `27-edge-syntax-as-text.md` | 3 | WriteFlow Team — MIT (tự soạn) | Ký tự cú pháp ở đầu dòng văn bản: `# text`, `1986. year`, `- text`, `\---`, `> text` |
| 28 | `28-edge-empty.md` | 3 | WriteFlow Team — MIT (tự soạn) | **File rỗng hoàn toàn (0 byte)** — ca biên cô lập |
| 29 | `29-edge-only-blank-lines.md` | 3 | WriteFlow Team — MIT (tự soạn) | **File chỉ có các dòng trống liên tiếp** — ca biên cô lập |
| 30 | `30-edge-long-line.md` | 3 | WriteFlow Team — MIT (tự soạn) | **Một dòng văn bản >10KB** — ca biên cô lập hiệu năng |

---

## 3. Bảng 22 file tài liệu thật (`tests/fixtures/markdown/corpus/real/`)

### A. Tài liệu nội bộ dự án WriteFlow (Bản chụp thật)

| Tên file | Nguồn gốc trong repo | Giấy phép | Cấu trúc kiểm thử mục tiêu |
| :--- | :--- | :--- | :--- |
| `repo-plan.md` | `docs/PLAN.md` (79 KB) | WriteFlow — MIT | Tài liệu kế hoạch đồ sộ: H1–H4, bảng ma trận lớn, task lists, code blocks, quote cảnh báo, công thức |
| `repo-readme.md` | `README.md` | WriteFlow — MIT | README dự án: Huy hiệu, tiêu đề, danh sách tính năng, lệnh npm script |
| `repo-agents.md` | `AGENTS.md` | WriteFlow — MIT | Quy tắc AI Builder: Danh sách số đậm, trích dẫn, nguyên tắc cốt lõi |
| `repo-tasks-phase-1.md` | `docs/tasks/phase-1.md` (38 KB) | WriteFlow — MIT | Kế hoạch Task Phase 1: Danh sách task, checklist, bảng phân rã, khối trích dẫn |
| `repo-tasks-phase-2.md` | `docs/tasks/phase-2.md` | WriteFlow — MIT | Danh mục Task Phase 2: Cấu trúc mô-đun, tiêu chí nghiệm thu |
| `repo-qa-manual.md` | `docs/qa/phase-1-manual.md` | WriteFlow — MIT | Quy trình kiểm thử thủ công: Bảng test case, kịch bản gõ phím, ma trận IME |
| `repo-technical-debt.md` | `docs/architecture/technical-debt.md` | WriteFlow — MIT | Sổ theo dõi nợ kỹ thuật: Bảng theo dõi nợ TD-01→TD-12, chuỗi JSON tái hiện, code block |
| `repo-markdown-normalizations.md` | `docs/architecture/markdown-normalizations.md` | WriteFlow — MIT | Danh mục chuẩn hóa cú pháp: Khối mã lồng backtick, escape ký tự, danh sách lồng |
| `repo-versions.md` | `docs/architecture/versions.md` | WriteFlow — MIT | Quy hoạch phiên bản: Bảng phụ thuộc npm, ghi chú migration |

### B. Tài liệu thật từ các dự án mã nguồn mở (Open Source Software)

| Tên file | Dự án nguồn | Giấy phép | Cấu trúc kiểm thử mục tiêu |
| :--- | :--- | :--- | :--- |
| `oss-express-readme.md` | [Express.js](https://github.com/expressjs/express) | MIT License | Badges CI Shields.io, code block JavaScript, danh sách tính năng, link ngoài |
| `oss-zustand-readme.md` | [Zustand](https://github.com/pmndrs/zustand) | MIT License | Badges SVG, khối mã TypeScript với generic type, hook recipes |
| `oss-prettier-readme.md` | [Prettier](https://github.com/prettier/prettier) | MIT License | Badges, bảng so sánh Editor/Plugin, code block định dạng |
| `oss-react-tutorial.md` | [React Documentation](https://react.dev) | MIT License | **Danh sách số lồng khối mã** (1., 2., 3. chứa indented fenced code block `bash` và `tsx`) |
| `oss-jest-guide.md` | [Jest](https://jestjs.io) | MIT License | **Danh sách số lồng khối mã** kiểm thử JavaScript & JSON configuration |
| `oss-rust-cli-guide.md` | [Rust CLI Book](https://github.com/rust-cli/book) | MIT / Apache-2.0 | **Danh sách số lồng khối mã Cargo & Rust**, bảng so sánh thư viện |
| `oss-redux-readme.md` | [Redux](https://github.com/reduxjs/redux) | MIT License | **Thẻ HTML inline** phong phú: `<kbd>`, `<sub>`, `<sup>`, `<mark>`, `<abbr>` |
| `oss-katex-readme.md` | [KaTeX](https://github.com/KaTeX/KaTeX) | MIT License | Math inline `$E=mc^2$`, block `$$...$$`, inline HTML `<sup>`, `<sub>`, badges |
| `oss-github-cheatsheet.md` | [GitHub Markdown Spec/Guide](https://github.com) | MIT License | Cú pháp GFM thực tế: `<kbd>`, `<mark>`, `<abbr>`, khối `<details><summary>`, task list |
| `oss-electron-readme.md` | [Electron](https://github.com/electron/electron) | MIT License | **Ảnh bọc link** `[![alt](img)](url)`, reference links `[text][id]`, badges coveralls |
| `oss-vite-guide.md` | [Vite](https://github.com/vitejs/vite) | MIT License | **Ảnh bọc link logo**, bảng cấu hình đa cột, badges npm |
| `oss-commonmark-spec-sample.md` | [CommonMark Spec](https://spec.commonmark.org) | CC BY-SA 4.0 | **Footnotes** `[^1]`, `[^note2]`, ảnh trong link, reference links |

### C. Ca biên hiệu năng cực hạn (Performance Stress Test)

| Tên file | Mục tiêu | Đặc tính |
| :--- | :--- | :--- |
| `edge-line-120kb.md` | Kiểm thử đệ quy và bộ nhớ khi gặp dòng siêu dài | Chứa một đoạn văn đơn dòng dài **124,256 bytes (>120 KB)** không có ngắt dòng |

---

## 4. Tài liệu người dùng thực tế từ PO (Chờ PO bàn giao)

Mục này ghi nhận danh sách tài liệu người dùng thực tế từ Product Owner (PO) sẽ được nạp bổ sung vào corpus ngay khi PO bàn giao:

- `[Chờ PO]` Tài liệu ghi chép cá nhân của PO (Obsidian / Notion export dạng Markdown).
- `[Chờ PO]` File biên bản cuộc họp & roadmap kinh doanh của WriteFlow.
- `[Chờ PO]` Bản thảo bài viết blog công nghệ kèm ảnh minh họa và công thức tài chính.