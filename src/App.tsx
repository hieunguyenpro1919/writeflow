import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TiptapEditor } from './components/editor/TiptapEditor';
import './styles/globals.css';
import './styles/editor.css';

export function App() {
  const { t } = useTranslation();
  const [contentLength, setContentLength] = useState<number>(0);

  const handleUpdate = (text: string) => {
    setContentLength(text.trim().length);
  };

  const initialContent = `<h1>${t('phase0.welcomeTitle')}</h1><p>${t('phase0.welcomeSubtitle')}</p>`;

  return (
    <div className="editor-container">
      <header
        style={{
          padding: '12px 24px',
          borderBottom: '1px solid var(--editor-border-color)',
          backgroundColor: 'var(--editor-bg-toolbar)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <strong style={{ fontSize: '16px', color: 'var(--editor-text-primary)' }}>
            {t('app.name')}
          </strong>
          <span style={{ fontSize: '13px', color: 'var(--editor-text-muted)' }}>—</span>
          <span style={{ fontSize: '13px', color: 'var(--editor-text-secondary)' }}>
            {t('app.tagline')}
          </span>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--editor-text-muted)' }}>
          {t('status.chars', { count: contentLength })}
        </div>
      </header>

      <main style={{ flex: 1, overflowY: 'auto' }}>
        <TiptapEditor initialContent={initialContent} onUpdate={handleUpdate} />
      </main>
    </div>
  );
}

export default App;
