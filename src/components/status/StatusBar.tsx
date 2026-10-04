import React, { useEffect, useState } from 'react';
import type { Editor } from '@tiptap/core';
import { useTranslation } from 'react-i18next';
import { countDocStats, type DocumentStats } from './word-count';
import { defaultUiBridge } from '../ui/toast-manager';
import './status-bar.css';

export interface StatusBarProps {
  editor: Editor | null;
  onOpenShortcuts?: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({ editor, onOpenShortcuts }) => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DocumentStats>(() => {
    if (!editor?.state?.doc) return { words: 0, chars: 0 };
    return countDocStats(editor.state.doc);
  });

  useEffect(() => {
    if (!editor?.state?.doc) return;

    const updateStats = () => {
      if (editor?.state?.doc) {
        setStats(countDocStats(editor.state.doc));
      }
    };

    updateStats();

    editor.on?.('transaction', updateStats);
    return () => {
      editor.off?.('transaction', updateStats);
    };
  }, [editor]);

  const handleOpenShortcuts = () => {
    if (onOpenShortcuts) {
      onOpenShortcuts();
    } else {
      defaultUiBridge.openShortcutsDialog();
    }
  };

  return (
    <footer
      className="status-bar-container"
      role="status"
      aria-label={t('editor.ariaLabel')}
      data-testid="status-bar"
    >
      <div className="status-bar-info">
        <span className="status-bar-item" data-testid="status-words">
          {t('status.words', { count: stats.words })}
        </span>
        <span className="status-bar-divider" aria-hidden="true">
          •
        </span>
        <span className="status-bar-item" data-testid="status-chars">
          {t('status.chars', { count: stats.chars })}
        </span>
      </div>

      <div className="status-bar-actions">
        <button
          type="button"
          className="status-bar-button"
          onClick={handleOpenShortcuts}
          data-testid="status-shortcuts-btn"
          aria-label={t('shortcuts.open')}
        >
          <span aria-hidden="true">⌨️</span>
          <span>{t('shortcuts.open')}</span>
        </button>
      </div>
    </footer>
  );
};
