import type { CommandDef } from '../types';

export const helpShortcutsCommand: CommandDef = {
  id: 'help.shortcuts',
  labelKey: 'cmd.help.shortcuts',
  category: 'help',
  defaultShortcut: {
    win: 'Mod-/',
    mac: 'Mod-/',
  },
  run(ctx) {
    ctx.ui.openShortcutsDialog();
    return true;
  },
};

export const helpCommands: CommandDef[] = [helpShortcutsCommand];
