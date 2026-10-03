# BẢNG GHIM PHIÊN BẢN PHỤ THUỘC (DEPENDENCY VERSIONS)

**Nguồn sự thật:** `package-lock.json`  
**Giai đoạn chốt:** Phase 0 — Bootstrap Project  
**Chính sách:** Ghim phiên bản chính xác cho mọi phụ thuộc. Nâng cấp phụ thuộc là một task riêng có chạy lại toàn bộ test suite và round-trip corpus.

---

## 1. Phụ Thuộc Cốt Lõi (Core Dependencies)

| Package | Phiên bản ghim | Giấy phép | Mục đích |
| :--- | :--- | :--- | :--- |
| `react` | `19.2.8` | MIT | Thư viện UI |
| `react-dom` | `19.2.8` | MIT | DOM renderer cho React |
| `@tiptap/core` | `3.31.4` | MIT | Engine soạn thảo văn bản cốt lõi |
| `@tiptap/react` | `3.31.4` | MIT | React wrapper cho Tiptap |
| `@tiptap/pm` | `3.31.4` | MIT | Gói ProseMirror hợp nhất của Tiptap v3 |
| `@tiptap/starter-kit` | `3.31.4` | MIT | Bộ extension cơ bản cho rich-text |
| `i18next` | `24.2.2` | MIT | Framework quốc tế hóa đa ngôn ngữ (i18n) |
| `react-i18next` | `15.7.4` | MIT | Binding i18next cho React |

---

## 2. Công Cụ Phát Triển & Kiểm Thử (Dev Dependencies)

| Package | Phiên bản ghim | Giấy phép | Mục đích |
| :--- | :--- | :--- | :--- |
| `typescript` | `5.7.3` | Apache-2.0 | Trình biên dịch TypeScript (strict mode) |
| `vite` | `8.3.2` | MIT | Build tool & Dev server |
| `@vitejs/plugin-react` | `6.1.1` | MIT | Plugin React cho Vite |
| `vitest` | `3.0.6` | MIT | Khung kiểm thử đơn vị & tích hợp |
| `jsdom` | `26.0.0` | MIT | Môi trường DOM ảo cho Vitest |
| `@testing-library/react`| `16.2.0` | MIT | Kiểm thử component React |
| `@testing-library/jest-dom`| `6.6.3` | MIT | Matcher bổ trợ cho DOM testing |
| `eslint` | `9.21.0` | MIT | Linter tĩnh cho JavaScript / TypeScript |
| `typescript-eslint` | `8.25.0` | BSD-2-Clause | Hỗ trợ TypeScript cho ESLint |
| `eslint-plugin-react-hooks` | `5.1.0` | MIT | Kiểm tra quy tắc React Hooks |
| `eslint-plugin-react-refresh` | `0.4.19` | MIT | Hỗ trợ Fast Refresh khi dev |
| `prettier` | `3.5.2` | MIT | Định dạng mã nguồn nhất quán |
