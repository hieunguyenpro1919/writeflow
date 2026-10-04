import { describe, it, expect, vi } from 'vitest';
import { createCommandRegistry } from '../../../src/core/commands/registry';
import type { CommandContext, CommandDef } from '../../../src/core/commands/types';

describe('Task 1.1: Command Registry Core', () => {
  const mockContext = {} as CommandContext;

  it('registers a valid command successfully', () => {
    const registry = createCommandRegistry();
    const cmd: CommandDef = {
      id: 'format.bold',
      labelKey: 'cmd.format.bold',
      category: 'format',
      defaultShortcut: { win: 'Mod-b', mac: 'Mod-b' },
      run: vi.fn(() => true),
    };

    registry.register(cmd);
    expect(registry.get('format.bold')).toBe(cmd);
    expect(registry.list()).toEqual([cmd]);
  });

  it('throws an error if id does not match "category.name" pattern', () => {
    const registry = createCommandRegistry();

    expect(() => {
      registry.register({
        id: 'invalid-id',
        labelKey: 'label',
        category: 'format',
        run: () => true,
      });
    }).toThrowError(/Invalid command id/);

    expect(() => {
      registry.register({
        id: 'Format.Bold',
        labelKey: 'label',
        category: 'format',
        run: () => true,
      });
    }).toThrowError(/Invalid command id/);

    expect(() => {
      registry.register({
        id: 'singleword',
        labelKey: 'label',
        category: 'format',
        run: () => true,
      });
    }).toThrowError(/Invalid command id/);
  });

  it('throws an error if registering duplicate id', () => {
    const registry = createCommandRegistry();
    const cmd1: CommandDef = {
      id: 'format.bold',
      labelKey: 'cmd.format.bold',
      category: 'format',
      run: () => true,
    };
    const cmd2: CommandDef = {
      id: 'format.bold',
      labelKey: 'cmd.format.bold2',
      category: 'format',
      run: () => true,
    };

    registry.register(cmd1);
    expect(() => registry.register(cmd2)).toThrowError(/already registered/);
  });

  it('throws an error if labelKey is empty or whitespace', () => {
    const registry = createCommandRegistry();

    expect(() => {
      registry.register({
        id: 'format.bold',
        labelKey: '',
        category: 'format',
        run: () => true,
      });
    }).toThrowError(/non-empty labelKey/);

    expect(() => {
      registry.register({
        id: 'format.bold',
        labelKey: '   ',
        category: 'format',
        run: () => true,
      });
    }).toThrowError(/non-empty labelKey/);
  });

  it('throws an error if two commands have duplicate shortcuts on the same platform', () => {
    const registry = createCommandRegistry();

    registry.register({
      id: 'format.strike',
      labelKey: 'cmd.format.strike',
      category: 'format',
      defaultShortcut: { win: 'Mod-Shift-x', mac: 'Mod-Shift-x' },
      run: () => true,
    });

    // Collision on Windows
    expect(() => {
      registry.register({
        id: 'file.export',
        labelKey: 'cmd.file.export',
        category: 'file',
        defaultShortcut: { win: 'Mod-Shift-x' },
        run: () => true,
      });
    }).toThrowError(/Shortcut collision on platform "win"/);

    // Collision with array of shortcuts
    expect(() => {
      registry.register({
        id: 'edit.redo',
        labelKey: 'cmd.edit.redo',
        category: 'edit',
        defaultShortcut: { win: ['Mod-y', 'Mod-Shift-x'] },
        run: () => true,
      });
    }).toThrowError(/Shortcut collision on platform "win"/);
  });

  it('allows same shortcut on DIFFERENT platforms', () => {
    const registry = createCommandRegistry();

    registry.register({
      id: 'test.winOnly',
      labelKey: 'cmd.test.win',
      category: 'edit',
      defaultShortcut: { win: 'Mod-Shift-z' },
      run: () => true,
    });

    // Allowed because mac is a different platform
    expect(() => {
      registry.register({
        id: 'test.macOnly',
        labelKey: 'cmd.test.mac',
        category: 'edit',
        defaultShortcut: { mac: 'Mod-Shift-z' },
        run: () => true,
      });
    }).not.toThrow();
  });

  it('executes run() when enabled, and returns handler boolean', () => {
    const registry = createCommandRegistry();
    const runSpy = vi.fn((_ctx, args) => args === 'ok');

    registry.register({
      id: 'format.italic',
      labelKey: 'cmd.format.italic',
      category: 'format',
      run: runSpy,
    });

    const result = registry.run('format.italic', mockContext, 'ok');
    expect(result).toBe(true);
    expect(runSpy).toHaveBeenCalledWith(mockContext, 'ok');
  });

  it('does NOT execute run() and returns false when isEnabled returns false', () => {
    const registry = createCommandRegistry();
    const runSpy = vi.fn(() => true);

    registry.register({
      id: 'edit.undo',
      labelKey: 'cmd.edit.undo',
      category: 'edit',
      isEnabled: () => false,
      run: runSpy,
    });

    const result = registry.run('edit.undo', mockContext);
    expect(result).toBe(false);
    expect(runSpy).not.toHaveBeenCalled();
    expect(registry.isEnabled('edit.undo', mockContext)).toBe(false);
  });

  it('returns false and does not throw when running an unknown command', () => {
    const registry = createCommandRegistry();
    expect(registry.run('nonexistent.cmd', mockContext)).toBe(false);
  });

  it('correctly reports isActive status', () => {
    const registry = createCommandRegistry();

    registry.register({
      id: 'format.bold',
      labelKey: 'cmd.format.bold',
      category: 'format',
      isActive: () => true,
      run: () => true,
    });

    registry.register({
      id: 'format.italic',
      labelKey: 'cmd.format.italic',
      category: 'format',
      run: () => true,
    });

    expect(registry.isActive('format.bold', mockContext)).toBe(true);
    expect(registry.isActive('format.italic', mockContext)).toBe(false);
    expect(registry.isActive('nonexistent.cmd', mockContext)).toBe(false);
  });

  it('returns shortcuts as string array for specified platform', () => {
    const registry = createCommandRegistry();

    registry.register({
      id: 'edit.redo',
      labelKey: 'cmd.edit.redo',
      category: 'edit',
      defaultShortcut: {
        win: ['Mod-y', 'Mod-Shift-z'],
        mac: 'Mod-Shift-z',
      },
      run: () => true,
    });

    expect(registry.getShortcuts('edit.redo', 'win')).toEqual(['Mod-y', 'Mod-Shift-z']);
    expect(registry.getShortcuts('edit.redo', 'mac')).toEqual(['Mod-Shift-z']);
    expect(registry.getShortcuts('nonexistent.cmd', 'win')).toEqual([]);
  });

  it('filters command list correctly', () => {
    const registry = createCommandRegistry();

    registry.register({
      id: 'format.bold',
      labelKey: 'cmd.format.bold',
      category: 'format',
      run: () => true,
    });
    registry.register({
      id: 'help.shortcuts',
      labelKey: 'cmd.help.shortcuts',
      category: 'help',
      run: () => true,
    });

    expect(registry.list((c) => c.category === 'format').map((c) => c.id)).toEqual(['format.bold']);
  });
});
