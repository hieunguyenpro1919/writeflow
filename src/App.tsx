import { useTranslation } from 'react-i18next';
import './core/commands';
import { useAppEditor } from './core/editor/use-app-editor';
import { TiptapEditor } from './components/editor/TiptapEditor';
import { ToastHost } from './components/ui/ToastHost';
import { StatusBar } from './components/status/StatusBar';
import { ShortcutsDialog } from './components/shortcuts/ShortcutsDialog';
import './styles/globals.css';
import './styles/editor.css';

export function App() {
  const { t } = useTranslation();
  const editor = useAppEditor();

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
      </header>

      <main style={{ flex: 1, overflowY: 'auto' }}>
        <TiptapEditor editor={editor} />
      </main>

      <StatusBar editor={editor} />
      <ToastHost />
      <ShortcutsDialog editor={editor} />
    </div>
  );
}

export default App;
