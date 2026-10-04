# WriteFlow

[![CI](https://github.com/hieunguyenpro1919/writeflow/actions/workflows/ci.yml/badge.svg)](https://github.com/hieunguyenpro1919/writeflow/actions/workflows/ci.yml)

Trình soạn thảo tài liệu Markdown WYSIWYG mã nguồn mở, tối giản và an toàn dữ liệu.

> **Tuyên ngôn sản phẩm:** Soạn tài liệu dễ trước. Markdown đúng phía sau.  
> **Nguyên tắc cốt lõi:** Người dùng không bao giờ bị bắt nhớ cú pháp. Không bao giờ làm mất dữ liệu người dùng.

---

## 1. Trạng Thái Dự Án

- **Phase hiện tại:** **Phase 1 — Core Editor + Command System + Phím tắt (Đã hoàn thành)**
  - Đã triển khai hoàn chỉnh 5 nhóm task (Nhóm A, B, C, D, E) trên nhánh `phase-1`.
  - Toàn bộ 14 command lõi, phím tắt vật lý (có bảo vệ IME), thoát khối thông minh, thanh trạng thái thời gian thực và hộp thoại phím tắt sinh động từ registry.
  - Hệ thống kiểm thử tự động phòng thủ (Guard Tests) quét sạch mã rác, hard-code màu và phím tắt.
- **Kịch bản kiểm thử thủ công:** Tham khảo [docs/qa/phase-1-manual.md](docs/qa/phase-1-manual.md) để tự kiểm tra bằng bàn phím và bộ gõ tiếng Việt.
- **Phase tiếp theo:** Phase 2 — Markdown In/Out & Xử lý mất dữ liệu
- **Nguồn sự thật:** Đọc [docs/PLAN.md](docs/PLAN.md) và [AGENTS.md](AGENTS.md).

---

## 2. Bắt Đầu Nhanh (Quick Start)

Yêu cầu môi trường: **Node.js >= 20** và **npm >= 10**.

```bash
# 1. Cài đặt các gói phụ thuộc (theo lockfile)
npm ci

# 2. Khởi động môi trường phát triển (Dev server)
npm run dev

# 3. Quy trình kiểm tra chất lượng mã nguồn (tương đương CI pipeline)
npm run typecheck    # Kiểm tra kiểu TypeScript (strict mode)
npm run lint         # Linter tĩnh ESLint (0 warnings, 0 errors)
npm run format       # Kiểm tra định dạng mã nguồn (Prettier)
npm run test         # Chạy bộ test tự động (Vitest)
npm run build        # Đóng gói sản phẩm (Vite production build)
```

---

## 3. Kiến Trúc Dự Án

Cấu trúc mã nguồn tuân thủ nghiêm ngặt Mục 19 của `docs/PLAN.md`:

- `docs/PLAN.md`: Kế hoạch và đặc tả sản phẩm hợp nhất (nguồn sự thật).
- `docs/architecture/`: Báo cáo Gate S (`spike-report.md`) và bảng ghim phiên bản (`versions.md`).
- `spikes/`: Mã nguồn thử nghiệm kỹ thuật (Spike S1/S2).
- `src/`: Mã nguồn chính của ứng dụng (React + TypeScript strict + Tiptap v3).
- `src/styles/`: Hệ thống Design Tokens CSS Variables (Phụ lục C.1 của PLAN.md).
- `src/i18n/`: Hạ tầng đa ngôn ngữ (Tiếng Việt và Tiếng Anh).
- `tests/`: Bộ kiểm thử đơn vị và tích hợp (Vitest + Testing Library).
