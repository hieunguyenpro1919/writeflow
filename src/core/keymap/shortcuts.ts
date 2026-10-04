/**
 * Utility functions for parsing and normalizing keyboard shortcut strings.
 * Standard format uses hyphens: "Mod-Shift-x", "Mod-b", etc.
 */

export interface ParsedShortcut {
  mod: boolean;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  key: string;
}

export function parseShortcut(accel: string): ParsedShortcut {
  if (!accel || typeof accel !== 'string') {
    return { mod: false, ctrl: false, alt: false, shift: false, key: '' };
  }

  const parts = accel.split('-');
  const key = parts[parts.length - 1];

  let mod = false;
  let ctrl = false;
  let alt = false;
  let shift = false;

  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i].toLowerCase();
    if (p === 'mod' || p === 'cmd' || p === 'command') {
      mod = true;
    } else if (p === 'ctrl' || p === 'control') {
      ctrl = true;
    } else if (p === 'alt' || p === 'opt' || p === 'option') {
      alt = true;
    } else if (p === 'shift') {
      shift = true;
    }
  }

  return { mod, ctrl, alt, shift, key };
}

export function normalizeShortcut(accel: string): string {
  const parsed = parseShortcut(accel);
  const parts: string[] = [];

  if (parsed.mod) parts.push('Mod');
  if (parsed.ctrl) parts.push('Ctrl');
  if (parsed.alt) parts.push('Alt');
  if (parsed.shift) parts.push('Shift');
  if (parsed.key) parts.push(parsed.key);

  return parts.join('-');
}

export const TIPTAP_BLOCKQUOTE_DEFAULT_KEY = 'Mod-Shift-b';
export const TIPTAP_HARDBREAK_DEFAULT_KEY = 'Mod-Enter';
