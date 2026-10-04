import { describe, it, expect } from 'vitest';
import { formatShortcut } from '../../../src/core/keymap/format';

describe('Task 1.2: Shortcut Formatting (Appendix A Table)', () => {
  const appendixATestCases = [
    { accel: 'Mod-b', win: 'Ctrl+B', mac: '⌘B', desc: 'format.bold' },
    { accel: 'Mod-i', win: 'Ctrl+I', mac: '⌘I', desc: 'format.italic' },
    { accel: 'Mod-Shift-x', win: 'Ctrl+Shift+X', mac: '⌘⇧X', desc: 'format.strike' },
    { accel: 'Mod-e', win: 'Ctrl+E', mac: '⌘E', desc: 'format.code' },
    { accel: 'Mod-Alt-0', win: 'Ctrl+Alt+0', mac: '⌘⌥0', desc: 'block.paragraph' },
    { accel: 'Mod-Alt-1', win: 'Ctrl+Alt+1', mac: '⌘⌥1', desc: 'block.heading1' },
    { accel: 'Mod-Alt-2', win: 'Ctrl+Alt+2', mac: '⌘⌥2', desc: 'block.heading2' },
    { accel: 'Mod-Alt-3', win: 'Ctrl+Alt+3', mac: '⌘⌥3', desc: 'block.heading3' },
    { accel: 'Mod-Shift-8', win: 'Ctrl+Shift+8', mac: '⌘⇧8', desc: 'block.bulletList' },
    { accel: 'Mod-Shift-7', win: 'Ctrl+Shift+7', mac: '⌘⇧7', desc: 'block.orderedList' },
    { accel: 'Mod-Shift-b', win: 'Ctrl+Shift+B', mac: '⌘⇧B', desc: 'block.blockquote' },
    { accel: 'Mod-z', win: 'Ctrl+Z', mac: '⌘Z', desc: 'edit.undo' },
    { accel: 'Mod-y', win: 'Ctrl+Y', mac: '⌘Y', desc: 'edit.redo (win primary)' },
    { accel: 'Mod-Shift-z', win: 'Ctrl+Shift+Z', mac: '⌘⇧Z', desc: 'edit.redo (secondary/mac)' },
    { accel: 'Mod-/', win: 'Ctrl+/', mac: '⌘/', desc: 'help.shortcuts' },
    { accel: 'Shift-Enter', win: 'Shift+Enter', mac: '⇧Enter', desc: 'hardBreak' },
  ];

  for (const { accel, win, mac, desc } of appendixATestCases) {
    it(`formats "${accel}" correctly for Windows (${desc})`, () => {
      expect(formatShortcut(accel, 'win')).toBe(win);
    });

    it(`formats "${accel}" correctly for macOS (${desc})`, () => {
      expect(formatShortcut(accel, 'mac')).toBe(mac);
    });
  }

  it('safely handles empty or unknown inputs without crashing', () => {
    expect(formatShortcut('', 'win')).toBe('');
    expect(formatShortcut('', 'mac')).toBe('');
    expect(formatShortcut('F11', 'win')).toBe('F11');
    expect(formatShortcut('F11', 'mac')).toBe('F11');
  });
});
