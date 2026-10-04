import React, { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import type { Editor } from '@tiptap/core';
import type {
  CommandDef,
  CommandRegistry,
  Platform,
  CommandCategory,
} from '../../core/commands/types';
import { defaultCommandRegistry } from '../../core/commands/registry';
import { detectPlatform } from '../../core/keymap/platform';
import { formatShortcut } from '../../core/keymap/format';
import { shortcutsDialogManager } from './shortcuts-dialog-manager';
import './shortcuts-dialog.css';

export interface ShortcutsDialogProps {
  editor: Editor | null;
  registry?: CommandRegistry;
  platform?: Platform;
  isOpen?: boolean;
  onClose?: () => void;
}

const CATEGORY_ORDER: CommandCategory[] = [
  'format',
  'block',
  'edit',
  'help',
  'insert',
  'file',
  'view',
];

export function ShortcutsDialog({
  editor,
  registry,
  platform,
  isOpen: isOpenProp,
  onClose,
}: ShortcutsDialogProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const managerIsOpen = useSyncExternalStore(
    (cb) => shortcutsDialogManager.subscribe(cb),
    () => shortcutsDialogManager.getIsOpen(),
  );

  const isOpen = isOpenProp !== undefined ? isOpenProp : managerIsOpen;
  const reg = registry ?? defaultCommandRegistry;
  const currentPlatform = platform ?? detectPlatform();

  const handleClose = React.useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      shortcutsDialogManager.close();
    }
    // Return focus to the editor after closing
    editor?.commands.focus();
  }, [onClose, editor]);

  // Focus search input when dialog opens & reset search
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Focus trap & keyboard navigation (Esc, Ctrl+/)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleClose();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        e.stopPropagation();
        handleClose();
        return;
      }

      if (e.key === 'Tab') {
        const container = dialogRef.current;
        if (!container) return;

        const focusable = container.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const focusableElements = Array.from(focusable).filter(
          (el) => !el.hasAttribute('disabled'),
        );

        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !container.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !container.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, handleClose]);

  if (!isOpen) {
    return null;
  }

  // Get dynamic commands list from registry
  const allCommands = reg.list();
  const trimmedQuery = searchQuery.trim().toLowerCase();

  const matchingCommands = allCommands.filter((cmd) => {
    if (!trimmedQuery) return true;

    const label = t(cmd.labelKey, { defaultValue: cmd.id }).toLowerCase();
    const id = cmd.id.toLowerCase();
    const shortcuts = reg.getShortcuts(cmd.id, currentPlatform);
    const formattedShortcuts = shortcuts
      .map((sc) => formatShortcut(sc, currentPlatform).toLowerCase())
      .join(' ');

    return (
      label.includes(trimmedQuery) ||
      id.includes(trimmedQuery) ||
      formattedShortcuts.includes(trimmedQuery)
    );
  });

  const grouped = matchingCommands.reduce<Record<string, CommandDef[]>>((acc, cmd) => {
    const cat = cmd.category || 'help';
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(cmd);
    return acc;
  }, {});

  const presentCategories = Object.keys(grouped).sort((a, b) => {
    const idxA = CATEGORY_ORDER.indexOf(a as CommandCategory);
    const idxB = CATEGORY_ORDER.indexOf(b as CommandCategory);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  return (
    <div
      className="shortcuts-backdrop"
      ref={backdropRef}
      data-testid="shortcuts-backdrop"
      onClick={(e) => {
        if (e.target === backdropRef.current) {
          handleClose();
        }
      }}
    >
      <div
        className="shortcuts-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-dialog-title"
        data-testid="shortcuts-dialog"
      >
        <header className="shortcuts-header">
          <h2
            id="shortcuts-dialog-title"
            className="shortcuts-title"
            data-testid="shortcuts-dialog-title"
          >
            {t('shortcuts.title')}
          </h2>
          <button
            type="button"
            className="shortcuts-close-btn"
            aria-label={t('shortcuts.close')}
            data-testid="shortcuts-close-btn"
            onClick={handleClose}
          >
            &times;
          </button>
        </header>

        <div className="shortcuts-search-container">
          <input
            ref={searchInputRef}
            type="search"
            className="shortcuts-search-input"
            placeholder={t('shortcuts.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label={t('shortcuts.search')}
            data-testid="shortcuts-search-input"
          />
        </div>

        <div className="shortcuts-body" tabIndex={-1}>
          {presentCategories.length === 0 ? (
            <div className="shortcuts-empty" data-testid="shortcuts-empty">
              {t('shortcuts.noResult')}
            </div>
          ) : (
            presentCategories.map((category) => (
              <section
                key={category}
                className="shortcuts-group"
                data-testid={`shortcuts-group-${category}`}
              >
                <h3 className="shortcuts-category-title">
                  {t(`category.${category}`, { defaultValue: category })}
                </h3>
                <div className="shortcuts-list" role="list">
                  {grouped[category].map((cmd) => {
                    const shortcuts = reg.getShortcuts(cmd.id, currentPlatform);
                    return (
                      <div
                        key={cmd.id}
                        className="shortcuts-row"
                        role="listitem"
                        data-testid={`shortcut-row-${cmd.id}`}
                      >
                        <span className="shortcuts-label">
                          {t(cmd.labelKey, { defaultValue: cmd.id })}
                        </span>
                        <div className="shortcuts-keys">
                          {shortcuts.map((sc, idx) => (
                            <kbd key={idx} className="shortcuts-kbd">
                              {formatShortcut(sc, currentPlatform)}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
