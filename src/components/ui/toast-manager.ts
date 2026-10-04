import type { UiBridge } from '../../core/commands/types';
import { shortcutsDialogManager } from '../shortcuts/shortcuts-dialog-manager';

export interface ToastItem {
  id: string;
  messageKey: string;
  opts?: Record<string, unknown>;
  createdAt: number;
}

export type ToastListener = () => void;

export class ToastManager {
  private toasts: ToastItem[] = [];
  private listeners: Set<ToastListener> = new Set();
  private timers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  getToasts(): ToastItem[] {
    return this.toasts;
  }

  notify(messageKey: string, opts?: Record<string, unknown>): void {
    const id = Math.random().toString(36).substring(2, 9);
    const item: ToastItem = {
      id,
      messageKey,
      opts,
      createdAt: Date.now(),
    };

    this.toasts = [...this.toasts, item];
    this.emit();

    // Auto dismiss after 3500ms (≈3.5s)
    const timer = setTimeout(() => {
      this.dismiss(id);
    }, 3500);

    this.timers.set(id, timer);
  }

  dismiss(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.emit();
  }

  clear(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.toasts = [];
    this.emit();
  }

  subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

export const toastManager = new ToastManager();

export function createUiBridge(overrides?: Partial<UiBridge>): UiBridge {
  return {
    openShortcutsDialog: overrides?.openShortcutsDialog ?? (() => shortcutsDialogManager.toggle()),
    notify: overrides?.notify ?? ((key, opts) => toastManager.notify(key, opts)),
  };
}

export const defaultUiBridge: UiBridge = createUiBridge();
