import type { Platform } from '../commands/types';
import { parseShortcut } from './shortcuts';

function formatKey(key: string): string {
  if (!key) return '';
  if (key.length === 1 && /[a-z]/i.test(key)) {
    return key.toUpperCase();
  }
  // Title-case common keys like "enter" -> "Enter"
  if (key.toLowerCase() === 'enter') return 'Enter';
  if (key.toLowerCase() === 'backspace') return 'Backspace';
  if (key.toLowerCase() === 'tab') return 'Tab';
  if (key.toLowerCase() === 'escape' || key.toLowerCase() === 'esc') return 'Esc';
  return key;
}

/**
 * Converts a shortcut accelerator string (e.g. "Mod-Shift-x", "Mod-/")
 * into a human-readable display string based on the platform.
 *
 * Windows / Linux: "Ctrl+Shift+X", "Ctrl+Alt+1", "Ctrl+/"
 * macOS: "⌘⇧X", "⌘⌥1", "⌘/"
 */
export function formatShortcut(accel: string, platform: Platform): string {
  if (!accel || typeof accel !== 'string') {
    return '';
  }

  const parsed = parseShortcut(accel);
  const formattedKey = formatKey(parsed.key);

  if (platform === 'mac') {
    let result = '';
    if (parsed.mod) result += '⌘';
    if (parsed.ctrl) result += '⌃';
    if (parsed.alt) result += '⌥';
    if (parsed.shift) result += '⇧';
    result += formattedKey;
    return result || accel;
  }

  // Windows / Linux
  const parts: string[] = [];
  if (parsed.mod || parsed.ctrl) parts.push('Ctrl');
  if (parsed.alt) parts.push('Alt');
  if (parsed.shift) parts.push('Shift');
  if (formattedKey) parts.push(formattedKey);

  return parts.length > 0 ? parts.join('+') : accel;
}
