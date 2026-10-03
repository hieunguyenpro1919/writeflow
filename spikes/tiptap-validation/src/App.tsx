import { useState, useRef, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { TiptapEditor, type ImeLogEntry } from './components/TiptapEditor';
import { MarkdownViewer } from './components/MarkdownViewer';
import { ImeMonitor } from './components/ImeMonitor';
import { DataSafetyInspector, SAMPLE_SPIKE_S2_MARKDOWN } from './components/DataSafetyInspector';
import './styles/variables.css';
import './styles/editor.css';
import './App.css';

const SAMPLE_VIETNAMESE_TEXT = `# Thử nghiệm tiếng Việt với Unikey/EVKey

Việt Nam là một quốc gia nằm ở cực đông nam bán đảo Đông Dương. Đất nước có bờ biển dài, tài nguyên phong phú và lịch sử hào hùng.

- Kiểm tra dấu thanh: sắc (á), huyền (à), hỏi (ả), ngã (ã), nặng (ạ).
- Kiểm tra nguyên âm đặc trưng: ă, â, ê, ô, ơ, ư, và phụ âm đ.
- Ký tự kết hợp: **nghiêng**, *đậm đà*, \`mã nguồn\`.`;

export function App() {
  const [markdown, setMarkdown] = useState<string>('');
  const [isComposing, setIsComposing] = useState<boolean>(false);
  const [imeLogs, setImeLogs] = useState<ImeLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 's1' | 's2'>('all');

  const editorRef = useRef<Editor | null>(null);

  const handleImeLog = useCallback((entry: ImeLogEntry) => {
    setImeLogs((prev) => [...prev.slice(-49), entry]);
  }, []);

  const handleClearLogs = useCallback(() => {
    setImeLogs([]);
  }, []);

  const handleLoadSampleS2 = useCallback(() => {
    if (!editorRef.current) return;
    const ed = editorRef.current;
    if (ed.commands.setContent) {
      ed.commands.setContent(SAMPLE_SPIKE_S2_MARKDOWN, { contentType: 'markdown' });
    }
  }, []);

  const handleLoadVietnamese = useCallback(() => {
    if (!editorRef.current) return;
    const ed = editorRef.current;
    if (ed.commands.setContent) {
      ed.commands.setContent(SAMPLE_VIETNAMESE_TEXT, { contentType: 'markdown' });
    }
  }, []);

  const handleReset = useCallback(() => {
    if (!editorRef.current) return;
    const ed = editorRef.current;
    const defaultText = `# Chào mừng đến với Spike Tiptap Validation

Hãy thử nghiệm:
1. **Spike S1:** Gõ tiếng Việt Telex/VNI bằng Unikey/EVKey bên dưới.
2. Kiểm tra xem gõ các ký tự tổ hợp như \`ă, â, ê, ô, ơ, ư, đ\` hoặc gõ \`# \`, \`- \`, \`* \` có bị vỡ chữ hay không.
3. **Spike S2:** Bấm nút **"Test Data Safety"** ở thanh công cụ phía trên để nạp Markdown kiểm tra.`;
    if (ed.commands.setContent) {
      ed.commands.setContent(defaultText, { contentType: 'markdown' });
    }
  }, []);

  return (
    <div className="app-shell">
      {/* Top Header */}
      <header className="app-header">
        <div className="header-brand">
          <span className="phase-tag">Phase S — Spike</span>
          <h1>WriteFlow · Tiptap Validation Suite</h1>
        </div>
        <div className="header-meta">
          <span>Spike S1: Vietnamese IME</span>
          <span className="divider">·</span>
          <span>Spike S2: Markdown Round-trip</span>
        </div>
      </header>

      {/* Toolbar / Actions */}
      <section className="app-toolbar">
        <div className="toolbar-group">
          <button className="btn btn-primary" onClick={handleLoadSampleS2}>
            🧪 Test Data Safety (Spike S2)
          </button>
          <button className="btn btn-secondary" onClick={handleLoadVietnamese}>
            🇻🇳 Nạp văn bản mẫu tiếng Việt (S1)
          </button>
          <button className="btn btn-outline" onClick={handleReset}>
            ↺ Đặt lại
          </button>
        </div>

        <div className="tab-group">
          <button
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Tất cả
          </button>
          <button
            className={`tab-btn ${activeTab === 's1' ? 'active' : ''}`}
            onClick={() => setActiveTab('s1')}
          >
            Chỉ xem Spike S1 (IME)
          </button>
          <button
            className={`tab-btn ${activeTab === 's2' ? 'active' : ''}`}
            onClick={() => setActiveTab('s2')}
          >
            Chỉ xem Spike S2 (Data Safety)
          </button>
        </div>
      </section>

      {/* Main Two-Pane Section */}
      <main className="main-panes">
        <div className="pane-wrapper left-pane">
          <TiptapEditor
            onMarkdownChange={setMarkdown}
            onImeStatusChange={setIsComposing}
            onImeLog={handleImeLog}
            editorRef={editorRef}
          />
        </div>

        <div className="pane-wrapper right-pane">
          <MarkdownViewer markdown={markdown} />
        </div>
      </main>

      {/* Bottom Testing Panels */}
      <section className="bottom-panels">
        {(activeTab === 'all' || activeTab === 's2') && (
          <DataSafetyInspector
            currentMarkdown={markdown}
            onLoadSample={handleLoadSampleS2}
          />
        )}

        {(activeTab === 'all' || activeTab === 's1') && (
          <ImeMonitor
            isComposing={isComposing}
            logs={imeLogs}
            onClearLogs={handleClearLogs}
          />
        )}
      </section>
    </div>
  );
}

export default App;
