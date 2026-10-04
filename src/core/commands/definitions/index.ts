import type { CommandDef } from '../types';
import { formatCommands } from './format';
import { blockCommands } from './block';
import { editCommands } from './edit';
import { helpCommands } from './help';

export * from './format';
export * from './block';
export * from './edit';
export * from './help';

export const coreCommands: CommandDef[] = [
  ...formatCommands,
  ...blockCommands,
  ...editCommands,
  ...helpCommands,
];
