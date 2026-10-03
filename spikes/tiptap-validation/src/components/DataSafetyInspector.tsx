import React, { useMemo } from 'react';

export const SAMPLE_SPIKE_S2_MARKDOWN = `---
title: Thử nghiệm Spike S2
author: WriteFlow
---
# Tiêu đề kiểm tra
Đây là văn bản có **in đậm** và *in nghiêng*.

<div class="custom-widget">Thẻ HTML lạ chưa hỗ trợ</div>`;

interface DataSafetyInspectorProps {
  currentMarkdown: string;
  onLoadSample: () => void;
}

export const DataSafetyInspector: React.FC<DataSafetyInspectorProps> = ({
  currentMarkdown,
  onLoadSample,
}) => {
  // Analyze current exported markdown against the Spike S2 test criteria
  const analysis = useMemo(() => {
    // 1. Frontmatter check
    const hasOriginalFrontmatter = currentMarkdown.startsWith('---\ntitle: Thử nghiệm Spike S2\nauthor: WriteFlow\n---');
    const frontmatterCorruptedToHeading = currentMarkdown.includes('## title: Thử nghiệm Spike S2');
    const frontmatterStripped = !currentMarkdown.includes('Thử nghiệm Spike S2');

    let frontmatterStatus: 'PASS' | 'MUTATED' | 'STRIPPED' | 'NOT_TESTED' = 'NOT_TESTED';
    let frontmatterNote = '';

    if (currentMarkdown.includes('Thử nghiệm Spike S2')) {
      if (hasOriginalFrontmatter) {
        frontmatterStatus = 'PASS';
        frontmatterNote = 'Frontmatter YAML giữ nguyên cấu trúc chuẩn ---';
      } else if (frontmatterCorruptedToHeading) {
        frontmatterStatus = 'MUTATED';
        frontmatterNote = 'LỖI BIẾN ĐỔI: Frontmatter bị parse thành Thước ngang (---) + Tiêu đề cấp 2 (## title: ...)';
      } else {
        frontmatterStatus = 'MUTATED';
        frontmatterNote = 'Cấu trúc --- bị xáo trộn khi serialize';
      }
    } else if (frontmatterStripped && currentMarkdown.includes('Tiêu đề kiểm tra')) {
      frontmatterStatus = 'STRIPPED';
      frontmatterNote = 'Khối frontmatter đã bị xóa hoàn toàn khỏi output';
    }

    // 2. HTML Tag check
    let htmlStatus: 'PASS' | 'ESCAPED' | 'STRIPPED' | 'NOT_TESTED' = 'NOT_TESTED';
    let htmlNote = '';

    if (currentMarkdown.includes('<div class="custom-widget">')) {
      htmlStatus = 'PASS';
      htmlNote = 'Thẻ HTML <div> được giữ nguyên vẹn';
    } else if (currentMarkdown.includes('&lt;div class="custom-widget"&gt;')) {
      htmlStatus = 'ESCAPED';
      htmlNote = 'LỖI ESCAPE: Thẻ <div> bị mã hóa thành &lt;div&gt; thay vì giữ nguyên raw block';
    } else if (currentMarkdown.includes('Thẻ HTML lạ chưa hỗ trợ')) {
      htmlStatus = 'STRIPPED';
      htmlNote = 'Thẻ <div> bị loại bỏ, chỉ còn nội dung văn bản bên trong';
    }

    // 3. Formatting check (Bold / Italic)
    const hasBold = currentMarkdown.includes('**in đậm**');
    const hasItalic = currentMarkdown.includes('*in nghiêng*');
    const formatStatus = hasBold && hasItalic ? 'PASS' : (hasBold || hasItalic ? 'PARTIAL' : 'NOT_TESTED');

    return {
      frontmatterStatus,
      frontmatterNote,
      htmlStatus,
      htmlNote,
      formatStatus,
    };
  }, [currentMarkdown]);

  return (
    <div className="safety-panel">
      <div className="safety-header">
        <div>
          <span className="panel-badge">Spike S2</span>
          <strong>Kiểm Chứng Bảo Toàn Dữ Liệu Markdown (Round-trip)</strong>
        </div>
        <button className="test-btn" onClick={onLoadSample}>
          🧪 Nạp đoạn mẫu: Test Data Safety
        </button>
      </div>

      <div className="safety-content">
        <div className="test-criteria-grid">
          {/* Check 1: Frontmatter */}
          <div className={`criteria-card ${analysis.frontmatterStatus.toLowerCase()}`}>
            <div className="criteria-header">
              <span className="criteria-name">1. Khối Frontmatter (---)</span>
              <span className={`badge ${analysis.frontmatterStatus.toLowerCase()}`}>
                {analysis.frontmatterStatus === 'PASS' && '✓ ĐẠT (Giữ nguyên)'}
                {analysis.frontmatterStatus === 'MUTATED' && '✗ HỎNG CẤU TRÚC'}
                {analysis.frontmatterStatus === 'STRIPPED' && '✗ BỊ XÓA'}
                {analysis.frontmatterStatus === 'NOT_TESTED' && 'Chưa test'}
              </span>
            </div>
            <p className="criteria-desc">
              {analysis.frontmatterNote || 'Bấm nút "Test Data Safety" để nạp nội dung mẫu và kiểm tra.'}
            </p>
          </div>

          {/* Check 2: Raw HTML Tag */}
          <div className={`criteria-card ${analysis.htmlStatus.toLowerCase()}`}>
            <div className="criteria-header">
              <span className="criteria-name">2. Thẻ HTML lạ (&lt;div&gt;)</span>
              <span className={`badge ${analysis.htmlStatus.toLowerCase()}`}>
                {analysis.htmlStatus === 'PASS' && '✓ ĐẠT (Giữ nguyên)'}
                {analysis.htmlStatus === 'ESCAPED' && '⚠ BỊ ESCAPE KÝ TỰ (&lt;)'}
                {analysis.htmlStatus === 'STRIPPED' && '✗ BỊ XÓA THẺ'}
                {analysis.htmlStatus === 'NOT_TESTED' && 'Chưa test'}
              </span>
            </div>
            <p className="criteria-desc">
              {analysis.htmlNote || 'Kiểm tra xem thẻ <div> chưa hỗ trợ có bị Tiptap âm thầm xóa hoặc escape không.'}
            </p>
          </div>

          {/* Check 3: Standard Formatting */}
          <div className={`criteria-card ${analysis.formatStatus.toLowerCase()}`}>
            <div className="criteria-header">
              <span className="criteria-name">3. Định dạng chuẩn (Bold, Italic)</span>
              <span className={`badge ${analysis.formatStatus.toLowerCase()}`}>
                {analysis.formatStatus === 'PASS' && '✓ ĐẠT'}
                {analysis.formatStatus === 'PARTIAL' && '⚠ Một phần'}
                {analysis.formatStatus === 'NOT_TESTED' && 'Chưa test'}
              </span>
            </div>
            <p className="criteria-desc">
              `**in đậm**` và `*in nghiêng*` được bảo toàn chính xác.
            </p>
          </div>
        </div>

        <div className="safety-conclusion">
          <strong>Ý nghĩa kiến trúc (PLAN.md):</strong> Mặc định <code>@tiptap/markdown</code> không xử lý riêng Frontmatter (suy biến thành Heading 2) và mã hóa ký tự HTML lạ thành <code>&amp;lt;div&amp;gt;</code>. Điều này xác nhận lý do <strong>Phase 2 bắt buộc phải xây dựng node tùy biến <code>rawBlock</code> và <code>rawInline</code></strong> để đáp ứng <strong>Nguyên tắc 10 (Không bao giờ làm mất dữ liệu người dùng)</strong>.
        </div>
      </div>
    </div>
  );
};
