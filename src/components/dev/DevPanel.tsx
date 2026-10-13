import React, { useCallback, useEffect, useState } from 'react';
import type { Editor } from '@tiptap/core';
import { useTranslation } from 'react-i18next';
import { parse, serialize, type FrontmatterData } from '../../core/markdown';

const CSS = `
.wf-dev{border-top:2px solid var(--editor-border-color);background:var(--editor-bg-toolbar);padding:12px 16px;display:flex;flex-direction:column;gap:8px;max-height:340px}
.wf-dev-row{display:flex;justify-content:space-between;align-items:center}
.wf-dev-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;height:240px}
.wf-dev-box{display:flex;flex-direction:column;gap:4px}
.wf-dev-lbl{font-size:12px;font-weight:600;color:var(--editor-text-secondary)}
.wf-dev-pane{flex:1;margin:0;padding:8px;overflow:auto;font-family:var(--editor-font-mono,monospace);font-size:12px;background:var(--editor-bg-code);color:var(--editor-text-primary);border:1px solid var(--editor-border-color);border-radius:4px;white-space:pre-wrap;word-break:break-all}
.wf-dev-btn{padding:4px 12px;font-size:13px;cursor:pointer;background:var(--editor-bg-code);color:var(--editor-text-primary);border:1px solid var(--editor-border-color);border-radius:4px}
.wf-dev-badge{font-size:12px;padding:2px 8px;border-radius:4px;font-weight:600}
`;

export const DevPanel: React.FC<{ editor: Editor | null }> = ({ editor }) => {
  const { t } = useTranslation();
  const [inputMd, setInputMd] = useState('');
  const [docJson, setDocJson] = useState('{}');
  const [outputMd, setOutputMd] = useState('');
  const [fm, setFm] = useState<FrontmatterData | undefined>(undefined);

  const sync = useCallback(
    (overrideFm?: FrontmatterData) => {
      if (!editor) return;
      try {
        const json = editor.getJSON();
        setDocJson(JSON.stringify(json, null, 2));
        setOutputMd(serialize(json, overrideFm !== undefined ? overrideFm : fm));
      } catch (e) {
        setOutputMd(String(e));
      }
    },
    [editor, fm],
  );

  useEffect(() => {
    if (!editor) return;
    sync();
    const handleTx = () => sync();
    editor.on?.('transaction', handleTx);
    return () => {
      editor.off?.('transaction', handleTx);
    };
  }, [editor, sync]);

  const handleLoad = () => {
    if (!editor) return;
    try {
      const parsed = parse(inputMd);
      setFm(parsed.frontmatter);
      editor.commands.setContent(parsed.doc);
      sync(parsed.frontmatter);
    } catch (e) {
      console.error(e);
    }
  };

  const isMatch = inputMd.trim().length > 0 && inputMd.trim() === outputMd.trim();

  return (
    <aside data-testid="dev-panel" className="wf-dev">
      <style>{CSS}</style>
      <div className="wf-dev-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <strong style={{ fontSize: '14px', color: 'var(--editor-text-primary)' }}>
            {t('dev.title', 'Dev Debugger (AST & Markdown)')}
          </strong>
          <span
            data-testid="dev-diff-badge"
            className="wf-dev-badge"
            style={{
              backgroundColor: isMatch
                ? 'var(--editor-badge-success-bg, #dcfce7)'
                : 'var(--editor-badge-warn-bg, #fef3c7)',
              color: isMatch
                ? 'var(--editor-badge-success-text, #166534)'
                : 'var(--editor-badge-warn-text, #92400e)',
            }}
          >
            {isMatch
              ? t('dev.diff.match', 'Khớp (Idempotent)')
              : t('dev.diff.changed', 'Có khác biệt (Normalized/Changed)')}
          </span>
        </div>
        <button
          type="button"
          data-testid="dev-load-btn"
          className="wf-dev-btn"
          onClick={handleLoad}
        >
          {t('dev.load', 'Nạp vào Editor')}
        </button>
      </div>

      <div className="wf-dev-grid">
        <div className="wf-dev-box">
          <label htmlFor="dev-input-md" className="wf-dev-lbl">
            {t('dev.pane.input', '1. Markdown Đầu vào')}
          </label>
          <textarea
            id="dev-input-md"
            data-testid="dev-input-md"
            className="wf-dev-pane"
            style={{ resize: 'none' }}
            value={inputMd}
            onChange={(e) => setInputMd(e.target.value)}
            placeholder={t('dev.placeholder.input', 'Dán Markdown vào đây...')}
          />
        </div>
        <div className="wf-dev-box">
          <label htmlFor="dev-ast-json" className="wf-dev-lbl">
            {t('dev.pane.ast', '2. ProseMirror JSON AST')}
          </label>
          <pre id="dev-ast-json" data-testid="dev-ast-json" className="wf-dev-pane">
            {docJson}
          </pre>
        </div>
        <div className="wf-dev-box">
          <label htmlFor="dev-output-md" className="wf-dev-lbl">
            {t('dev.pane.output', '3. Markdown Đầu ra')}
          </label>
          <pre id="dev-output-md" data-testid="dev-output-md" className="wf-dev-pane">
            {outputMd}
          </pre>
        </div>
      </div>
    </aside>
  );
};
