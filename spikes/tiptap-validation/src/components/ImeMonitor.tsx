import { useState } from 'react';
import type { ImeLogEntry } from './TiptapEditor';

interface ImeMonitorProps {
  isComposing: boolean;
  logs: ImeLogEntry[];
  onClearLogs: () => void;
}

export const ImeMonitor: React.FC<ImeMonitorProps> = ({
  isComposing,
  logs,
  onClearLogs,
}) => {
  const [checkedTests, setCheckedTests] = useState<Record<string, boolean>>({});

  const toggleTest = (key: string) => {
    setCheckedTests((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const checklistItems = [
    { id: 'accents', label: 'Gõ đoạn văn có đủ ă â ê ô ơ ư đ và 5 dấu thanh (sắc, huyền, hỏi, ngã, nặng)' },
    { id: 'heading', label: 'Gõ `# ` đầu dòng rồi gõ ngay chữ có dấu (ví dụ: `# Tiêu đề`)' },
    { id: 'list', label: 'Gõ `- ` hoặc `* ` đầu dòng rồi gõ chữ có dấu' },
    { id: 'midword', label: 'Sửa dấu giữa từ (đặt con trỏ giữa từ rồi gõ phím dấu sửa lại)' },
    { id: 'backspace', label: 'Xóa phím Backspace khi đang gõ chuỗi tổ hợp' },
    { id: 'bold', label: 'Chọn chữ có dấu, nhấn Ctrl+B (in đậm) rồi gõ tiếp' },
  ];

  return (
    <div className="ime-panel">
      <div className="panel-header">
        <div className="panel-title">
          <span>Spike S1: Bảng Giám Sát Bộ Gõ IME & Input Rules</span>
          <span className={`status-pill ${isComposing ? 'composing' : 'idle'}`}>
            <span className="dot" />
            {isComposing ? 'ĐANG SOẠN THẢO (isComposing = true)' : 'CHỜ (Idle)'}
          </span>
        </div>
        <div className="panel-actions">
          <button className="clear-btn" onClick={onClearLogs}>
            Xóa nhật ký ({logs.length})
          </button>
        </div>
      </div>

      <div className="panel-body">
        {/* Test Scenarios Checklist */}
        <div className="ime-checklist-box">
          <div className="section-title">Kịch bản kiểm tra thủ công (Theo PLAN.md mục 18.3):</div>
          <div className="checklist-grid">
            {checklistItems.map((item) => (
              <label key={item.id} className="checklist-label">
                <input
                  type="checkbox"
                  checked={!!checkedTests[item.id]}
                  onChange={() => toggleTest(item.id)}
                />
                <span className={checkedTests[item.id] ? 'checked-text' : ''}>
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Live Event Stream */}
        <div className="ime-stream-box">
          <div className="section-title">Nhật ký sự kiện thời gian thực (DOM Composition & Input Rules):</div>
          <div className="stream-table-wrapper">
            {logs.length === 0 ? (
              <div className="empty-stream">
                Chưa có sự kiện gõ phím/composition nào. Hãy thử gõ tiếng Việt bằng Unikey/EVKey vào editor.
              </div>
            ) : (
              <table className="stream-table">
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Loại sự kiện</th>
                    <th>Dữ liệu / Phím</th>
                    <th>isComposing</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.slice(-15).reverse().map((entry) => (
                    <tr key={entry.id}>
                      <td className="mono">{entry.time}</td>
                      <td>
                        <span className={`event-tag ${entry.type}`}>
                          {entry.type}
                        </span>
                      </td>
                      <td className="mono">{entry.data || entry.key || '-'}</td>
                      <td>
                        <span className={`state-tag ${entry.isComposing ? 'true' : 'false'}`}>
                          {entry.isComposing ? 'TRUE' : 'FALSE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
