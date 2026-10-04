export type DialogListener = () => void;

export class ShortcutsDialogManager {
  private isOpen = false;
  private listeners: Set<DialogListener> = new Set();

  getIsOpen(): boolean {
    return this.isOpen;
  }

  open(): void {
    if (!this.isOpen) {
      this.isOpen = true;
      this.emit();
    }
  }

  close(): void {
    if (this.isOpen) {
      this.isOpen = false;
      this.emit();
    }
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
    this.emit();
  }

  subscribe(listener: DialogListener): () => void {
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

export const shortcutsDialogManager = new ShortcutsDialogManager();
