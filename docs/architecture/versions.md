# BẢNG GHIM PHIÊN BẢN PHỤ THUỘC (DEPENDENCY VERSIONS)

**Nguồn sự thật:** `package.json` và `package-lock.json`  
**Giai đoạn chốt:** Phase 0.1 — Hoàn tất Phase 0  
**Chính sách:** Toàn bộ dependencies và devDependencies được ghim phiên bản chính xác (không dùng tiền tố `^`, `~` hay `latest`). Giấy phép được trích xuất trực tiếp từ trường `license` trong `package.json` của từng package trong `node_modules`.

---

## 1. Phụ Thuộc Cốt Lõi (Dependencies)

| Package | Phiên bản ghim | Giấy phép | Mục đích |
| :--- | :--- | :--- | :--- |
| `@tiptap/core` | `3.31.4` | MIT | Engine soạn thảo văn bản cốt lõi |
| `@tiptap/extension-link` | `3.31.4` | MIT | Extension hỗ trợ liên kết URL (link mark) |
| `@tiptap/extension-task-item` | `3.31.4` | MIT | Extension hỗ trợ từng mục trong danh sách công việc |
| `@tiptap/extension-task-list` | `3.31.4` | MIT | Extension hỗ trợ danh sách công việc (Task List) |
| `@tiptap/markdown` | `3.31.4` | MIT | Parser và Serializer Markdown tích hợp của Tiptap v3 |
| `@tiptap/pm` | `3.31.4` | MIT | Gói ProseMirror tích hợp của Tiptap v3 |
| `@tiptap/react` | `3.31.4` | MIT | React wrapper cho Tiptap |
| `@tiptap/starter-kit` | `3.31.4` | MIT | Bộ extension cơ bản cho rich-text |
| `i18next` | `24.2.3` | MIT | Framework quốc tế hóa đa ngôn ngữ (i18n) |
| `react` | `19.3.0` | MIT | Thư viện UI |
| `react-dom` | `19.3.0` | MIT | DOM renderer cho React |
| `react-i18next` | `15.7.4` | MIT | Binding i18next cho React |

---

## 2. Công Cụ Phát Triển & Kiểm Thử (Dev Dependencies)

| Package | Phiên bản ghim | Giấy phép | Mục đích |
| :--- | :--- | :--- | :--- |
| `@eslint/js` | `9.39.5` | MIT | Cấu hình ESLint JavaScript chuẩn |
| `@playwright/test` | `1.63.0` | Apache-2.0 | Khung kiểm thử tự động End-to-End (E2E) |
| `@testing-library/dom` | `10.4.2` | MIT | Tiện ích DOM testing |
| `@testing-library/jest-dom` | `6.9.1` | MIT | Matcher bổ trợ cho DOM testing |
| `@testing-library/react` | `16.3.3` | MIT | Tiện ích kiểm thử component React |
| `@types/node` | `24.19.1` | MIT | Type definitions cho Node.js |
| `@types/react` | `19.3.0` | MIT | Type definitions cho React |
| `@types/react-dom` | `19.3.0` | MIT | Type definitions cho React DOM |
| `@vitejs/plugin-react` | `6.1.1` | MIT | Plugin React chính thức cho Vite |
| `eslint` | `9.39.5` | MIT | Linter tĩnh cho JavaScript / TypeScript |
| `eslint-plugin-react-hooks` | `5.2.0` | MIT | Kiểm tra các quy tắc React Hooks |
| `eslint-plugin-react-refresh` | `0.4.26` | MIT | Hỗ trợ Fast Refresh trong quá trình dev |
| `globals` | `15.15.0` | MIT | Danh sách biến toàn cục cho linter |
| `jsdom` | `26.1.0` | MIT | Môi trường DOM ảo cho Vitest |
| `prettier` | `3.9.9` | MIT | Công cụ định dạng mã nguồn tự động |
| `typescript` | `5.9.3` | Apache-2.0 | Trình biên dịch TypeScript (strict mode) |
| `typescript-eslint` | `8.71.0` | MIT | Bộ công cụ ESLint cho TypeScript |
| `vite` | `8.3.2` | MIT | Công cụ build và dev server |
| `vitest` | `3.2.7` | MIT | Khung kiểm thử đơn vị và tích hợp |
