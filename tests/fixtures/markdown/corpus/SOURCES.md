# WriteFlow — Corpus Test Suite (Task 2.5b-fix2)

Bộ file Markdown dùng làm **Golden Master** cho kiểm thử round-trip của Phase 2 (Markdown Engine).
Mục tiêu: Đánh giá tính toàn vẹn và phát hiện mọi trường hợp mất hoặc biến dạng dữ liệu khi `parse → serialize`.

**Tôn chỉ cốt lõi:** Lossless Data (Nguyên tắc số 10) — không nuốt dữ liệu, không biến dạng dữ liệu thô.

---

## 1. Cấu trúc thư mục

- `tests/fixtures/markdown/corpus/oss/`: **22 file upstream OSS thật nguyên bản**, tải trực tiếp từ upstream GitHub ngày 10/10/2026, khóa toàn vẹn bằng SHA-256.
- `tests/fixtures/markdown/corpus/real/`: **9 file tài liệu thật nội bộ** lấy trực tiếp từ dự án WriteFlow.
- `tests/fixtures/markdown/corpus/synthetic/`: **31 file tự soạn hợp lệ** (30 file mẫu tổng hợp & ca biên kỹ thuật + 1 ca biên hiệu năng cực hạn 124 KB).
- `SOURCES.md`: Hồ sơ nguồn gốc, giấy phép, URL upstream và bảng mã băm SHA-256.

Tổng cộng: **62 file** (trong đó **31 file tài liệu thật**: 22 file upstream OSS + 9 file dự án nội bộ).

---

## 2. Bảng 22 file OSS tải nguyên văn từ upstream GitHub (`tests/fixtures/markdown/corpus/oss/`)

Toàn bộ 22 file dưới đây được tải nguyên bản từng byte từ upstream GitHub vào ngày 10/10/2026, tuyệt đối không chỉnh sửa nội dung, được bảo vệ bằng kiểm tra mã băm SHA-256 tự động trong test suite.

| STT | Tên file | Repo / Dự án nguồn | URL Upstream | Giấy phép | Kích thước | Mã băm SHA-256 (Tải ngày 10/10/2026) |
| :---: | :--- | :--- | :--- | :---: | :---: | :--- |
| 01 | `express-readme.md` | expressjs/express | `https://raw.githubusercontent.com/expressjs/express/master/Readme.md` | MIT | 10,371 B | `600f9f3a8fe35c9657e3bb61d2afbfee9bfe788a764892596bef49ede3c9ef0e` |
| 02 | `express-history.md` | expressjs/express | `https://raw.githubusercontent.com/expressjs/express/master/History.md` | MIT | 121,595 B | `1319b0362c47f3b05d7919050f5a2ee9226544a5db023ddf37fa95214cc6e180` |
| 03 | `redux-readme.md` | reduxjs/redux | `https://raw.githubusercontent.com/reduxjs/redux/master/README.md` | MIT | 8,029 B | `67a4fe18c6a53e9ca5d20348a7f906dd9f7f50b8e9b8f625375a59a03f428430` |
| 04 | `prettier-readme.md` | prettier/prettier | `https://raw.githubusercontent.com/prettier/prettier/main/README.md` | MIT | 3,396 B | `f1f5a86cd0fd0f6a288882527830a9bbbd5851e3238c4d7426b7bbb496165cd1` |
| 05 | `vite-readme.md` | vitejs/vite | `https://raw.githubusercontent.com/vitejs/vite/main/README.md` | MIT | 3,416 B | `588718673f32a3691b8e75b93fb4c2f8e8bc9a6dc0bf61794ba7b6c006594111` |
| 06 | `zustand-readme.md` | pmndrs/zustand | `https://raw.githubusercontent.com/pmndrs/zustand/main/README.md` | MIT | 17,827 B | `3a53f23dae9f33f7b951cfc6eac1dbdb7def9c722d8f32a70d85190f47d11d5b` |
| 07 | `electron-readme.md` | electron/electron | `https://raw.githubusercontent.com/electron/electron/main/README.md` | MIT | 4,450 B | `cb788749d3f0d3991e9c17b0cbcd9fd15a8c9bd73e45874d0a936fdbd9d3745b` |
| 08 | `katex-readme.md` | KaTeX/KaTeX | `https://raw.githubusercontent.com/KaTeX/KaTeX/main/README.md` | MIT | 6,503 B | `ca4488ad71cfdc407baa7dc5086c9b40ead43f9a716bf52c7e89a20dfaab4d90` |
| 09 | `jest-readme.md` | jestjs/jest | `https://raw.githubusercontent.com/jestjs/jest/main/README.md` | MIT | 12,794 B | `d47e8d263e376362ade90221309c66071e58b4a2c87fbfd1899eb9a5d9913291` |
| 10 | `react-readme.md` | facebook/react | `https://raw.githubusercontent.com/facebook/react/main/README.md` | MIT | 5,317 B | `4d20edc8d043718c1459dd5d5e25777a282cc09092ecab0f9cc7559f0eac9842` |
| 11 | `marked-readme.md` | markedjs/marked | `https://raw.githubusercontent.com/markedjs/marked/master/README.md` | MIT | 3,505 B | `b2f958f05b55e66a736a99745c3bb2629793867b39c05f1bb8532722dddabd54` |
| 12 | `markdown-it-readme.md` | markdown-it/markdown-it | `https://raw.githubusercontent.com/markdown-it/markdown-it/master/README.md` | MIT | 1,565 B | `4be181f1920ecce286589cdf3863fac8dedd0aa674a54fb8a7d299978b9701fa` |
| 13 | `vscode-readme.md` | microsoft/vscode | `https://raw.githubusercontent.com/microsoft/vscode/main/README.md` | MIT | 6,728 B | `45a411a3b8d49556fbaa73601befc458ab10ad873fca9088136888c89abb8935` |
| 14 | `axios-readme.md` | axios/axios | `https://raw.githubusercontent.com/axios/axios/v1.x/README.md` | MIT | 109,419 B | `a3f20983025240b0dc3383c0b6958459956bcd908221ec9c1fab864eb8f651d7` |
| 15 | `awesome-readme.md` | sindresorhus/awesome | `https://raw.githubusercontent.com/sindresorhus/awesome/main/readme.md` | CC0-1.0 | 78,330 B | `465cd781335e44587d238f666800104b63d4fc8ba2395d6422974dcba421c616` |
| 16 | `keep-a-changelog.md` | olivierlacan/keep-a-changelog | `https://raw.githubusercontent.com/olivierlacan/keep-a-changelog/main/CHANGELOG.md` | MIT | 11,708 B | `663c710db14ea1168045f260b2bd4f9f8944f19fe6ece78bc52e1a46ef3243d9` |
| 17 | `mermaid-readme.md` | mermaid-js/mermaid | `https://raw.githubusercontent.com/mermaid-js/mermaid/develop/README.md` | MIT | 24,999 B | `eae450a8a65100cb0f5a4b29b8ebfe9a1b7c57e771887e1471d6726c02cc3dd5` |
| 18 | `tailwindcss-readme.md` | tailwindlabs/tailwindcss | `https://raw.githubusercontent.com/tailwindlabs/tailwindcss/main/README.md` | MIT | 1,838 B | `a7db79d5cd483c6f6d1a51f4042e32598ec39e2391a5dd5be62a71d59299cda8` |
| 19 | `tiptap-readme.md` | ueberdosis/tiptap | `https://raw.githubusercontent.com/ueberdosis/tiptap/main/README.md` | MIT | 8,013 B | `8cd77367d0107be7325a3915847fda194416805b268bb1d1b993a8332b8a7448` |
| 20 | `ripgrep-readme.md` | BurntSushi/ripgrep | `https://raw.githubusercontent.com/BurntSushi/ripgrep/master/README.md` | MIT / UNLICENSE | 21,599 B | `945622d974f65e4e141ef9726c948c2640eebd222c5b101afb6445728283921e` |
| 21 | `node-contributing.md` | nodejs/node | `https://raw.githubusercontent.com/nodejs/node/main/CONTRIBUTING.md` | MIT | 4,654 B | `cef2cec1646de81f622e3916a6edb518d72aea1481ae59cb7f3ce4842ff3fa8c` |
| 22 | `lodash-readme.md` | lodash/lodash | `https://raw.githubusercontent.com/lodash/lodash/main/README.md` | MIT | 3,623 B | `882ff84de79568af63234100cfc6497f091195c358cb27b91dc2c4b27692be03` |

---

## 3. Bảng 9 file tài liệu thật nội bộ (`tests/fixtures/markdown/corpus/real/`)

Các file tài liệu thật được trích xuất trực tiếp từ mã nguồn và tài liệu nội bộ của dự án WriteFlow.

| STT | Tên file | Nguồn gốc trong repo WriteFlow | Giấy phép | Cấu trúc kiểm thử mục tiêu |
| :---: | :--- | :--- | :---: | :--- |
| 01 | `repo-plan.md` | `docs/PLAN.md` (79 KB) | WriteFlow — MIT | Kế hoạch dự án đồ sộ: H1–H4, ma trận bảng lớn, task list, code block, quote, công thức |
| 02 | `repo-readme.md` | `README.md` | WriteFlow — MIT | README dự án: Huy hiệu Shields.io, tiêu đề, danh sách tính năng, npm scripts |
| 03 | `repo-agents.md` | `AGENTS.md` | WriteFlow — MIT | Hợp đồng quy tắc AI Builder: Danh sách có số in đậm, trích dẫn, nguyên tắc cốt lõi |
| 04 | `repo-tasks-phase-1.md` | `docs/tasks/phase-1.md` (38 KB) | WriteFlow — MIT | Kế hoạch Task Phase 1: Danh sách task, checklist, bảng phân rã, khối trích dẫn |
| 05 | `repo-tasks-phase-2.md` | `docs/tasks/phase-2.md` | WriteFlow — MIT | Danh mục Task Phase 2: Cấu trúc mô-đun, tiêu chí nghiệm thu |
| 06 | `repo-qa-manual.md` | `docs/qa/phase-1-manual.md` | WriteFlow — MIT | Quy trình kiểm thử thủ công: Bảng test case, kịch bản gõ phím, ma trận IME |
| 07 | `repo-technical-debt.md` | `docs/architecture/technical-debt.md` | WriteFlow — MIT | Sổ theo dõi nợ kỹ thuật: Bảng theo dõi nợ TD-01→TD-13, JSON tái hiện, code block |
| 08 | `repo-markdown-normalizations.md` | `docs/architecture/markdown-normalizations.md` | WriteFlow — MIT | Chuẩn hóa cú pháp: Khối mã lồng backtick, escape ký tự, danh sách lồng |
| 09 | `repo-versions.md` | `docs/architecture/versions.md` | WriteFlow — MIT | Quy hoạch phiên bản: Bảng phụ thuộc npm, ghi chú migration |

---

## 4. Bảng 31 file tự soạn hợp lệ (`tests/fixtures/markdown/corpus/synthetic/`)

Các file do WriteFlow Team tự soạn phục vụ kiểm thử đơn vị, kiểm tra bao phủ cú pháp và kiểm thử biên:

| STT | Tên file | Nhóm | Nguồn gốc | Cấu trúc kiểm thử mục tiêu |
| :---: | :--- | :---: | :---: | :--- |
| 01 | `01-tech-readme-standard.md` | 1 | Tự soạn | README chuẩn: H1–H3, list, code block bash, inline code, link ngoài, horizontal rule |
| 02 | `02-tech-heading-all-levels.md` | 1 | Tự soạn | Heading ATX đủ H1→H6, chuyển cấp không tuần tự, heading có inline code/emphasis |
| 03 | `03-tech-nested-lists.md` | 1 | Tự soạn | Bullet/ordered lồng 4–5 cấp, đánh số bắt đầu khác 1, list chứa đoạn văn nhiều dòng |
| 04 | `04-tech-task-lists.md` | 1 | Tự soạn | Task list `[ ]`/`[x]` lồng nhiều cấp, task có inline formatting |
| 05 | `05-tech-gfm-tables.md` | 1 | Tự soạn | Bảng GFM căn lề trái/giữa/phải, ô chứa code/bold/link, cột rỗng, escape `\|` |
| 06 | `06-tech-code-blocks-multi-lang.md` | 1 | Tự soạn | Fenced code block có language tag: typescript, python, bash, json, sql, rust |
| 07 | `07-tech-code-block-nested-fence.md` | 1 | Tự soạn | Code block chứa chuỗi ``` bên trong, rào 4 dấu huyền |
| 08 | `08-tech-blockquote-mixed.md` | 1 | Tự soạn | Blockquote 1–3 tầng, quote chứa list, code block, heading; quote chứa quote |
| 09 | `09-tech-api-doc.md` | 1 | Tự soạn | Tài liệu API thực tế: heading đa cấp, bảng tham số, code ví dụ, inline code |
| 10 | `10-tech-changelog.md` | 1 | Tự soạn | CHANGELOG chuẩn Keep a Changelog: heading version, list phân loại, link |
| 11 | `11-html-block-basic.md` | 2 | Tự soạn | Khối HTML block: `<div>`, `<details><summary>`, `<table>`, `<!-- comment -->` |
| 12 | `12-html-inline-tags.md` | 2 | Tự soạn | Thẻ inline: `<kbd>`, `<b>`, `<span>`, `<code>`, `<br>`, `<sub>`, `<sup>`, `<mark>` |
| 13 | `13-html-link-img-extended.md` | 2 | Tự soạn | `<a>`/`<img>` có `target="_blank"`, `rel`, `width`, `height`, `style`, `loading` |
| 14 | `14-html-mixed-raw.md` | 2 | Tự soạn | Trộn HTML block + Markdown + HTML inline, comment giữa các block |
| 15 | `15-html-frontmatter-yaml.md` | 2 | Tự soạn | YAML Frontmatter phong phú: string, number, bool, array, nested object |
| 16 | `16-html-footnotes.md` | 2 | Tự soạn | Footnote `[^1]` và định nghĩa `[^1]:`, footnote nhiều dòng |
| 17 | `17-html-math-blocks.md` | 2 | Tự soạn | Math inline `$...$`, block `$$...$$`, LaTeX phức tạp |
| 18 | `18-html-reference-links.md` | 2 | Tự soạn | Reference link `[ref]: url`, reference có title, shortcut reference |
| 19 | `19-html-frontmatter-math-mix.md` | 2 | Tự soạn | Frontmatter + Math + Footnote + Reference link + HTML inline trong cùng file |
| 20 | `20-html-full-doc.md` | 2 | Tự soạn | Tài liệu thực tế kiểu blog: heading, ảnh HTML, code, bảng, math, footnote |
| 21 | `21-edge-vietnamese-full.md` | 3 | Tự soạn | Tiếng Việt đủ dấu thanh, đủ nguyên âm có dấu, tổ hợp dấu chồng, câu dài |
| 22 | `22-edge-vietnamese-nfc.md` | 3 | Tự soạn | Tiếng Việt **chuẩn NFC** — baseline so sánh Unicode |
| 23 | `23-edge-vietnamese-nfd.md` | 3 | Tự soạn | Tiếng Việt **chuẩn NFD** — kiểm tra bảo tồn Unicode NFD tổ hợp |
| 24 | `24-edge-bom-utf8.md` | 3 | Tự soạn | File UTF-8 có BOM ở đầu — bảo toàn BOM khi lưu |
| 25 | `25-edge-crlf-lf-mixed.md` | 3 | Tự soạn | File có CRLF và LF xen kẽ — phát hiện EOL và bảo toàn |
| 26 | `26-edge-hr-not-frontmatter.md` | 3 | Tự soạn | Hai đường kẻ `---` kẹp văn bản thường ở đầu file — không phải frontmatter |
| 27 | `27-edge-syntax-as-text.md` | 3 | Tự soạn | Ký tự cú pháp ở đầu dòng văn bản: `# text`, `1986. year`, `- text`, `\---`, `> text` |
| 28 | `28-edge-empty.md` | 3 | Tự soạn | **File rỗng hoàn toàn (0 byte)** — ca biên cô lập |
| 29 | `29-edge-only-blank-lines.md` | 3 | Tự soạn | **File chỉ có các dòng trống liên tiếp** — ca biên cô lập |
| 30 | `30-edge-long-line.md` | 3 | Tự soạn | **Một dòng văn bản >10KB** — ca biên cô lập hiệu năng |
| 31 | `edge-line-120kb.md` | 3 | Tự soạn | **Một dòng văn bản 124,256 bytes (>120 KB)** — ca biên kiểm thử đệ quy/bộ nhớ |

---

## 5. Tài liệu người dùng thực tế từ PO (Chờ PO bàn giao)

Mục này ghi nhận danh sách tài liệu người dùng thực tế từ Product Owner (PO) sẽ được nạp bổ sung vào corpus ngay khi PO bàn giao:

- `[Chờ PO]` Tài liệu ghi chép cá nhân của PO (Obsidian / Notion export dạng Markdown).
- `[Chờ PO]` File biên bản cuộc họp & roadmap kinh doanh của WriteFlow.
- `[Chờ PO]` Bản thảo bài viết blog công nghệ kèm ảnh minh họa và công thức tài chính.