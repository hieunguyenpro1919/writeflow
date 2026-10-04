import type { CommandDef } from '../types';
import { formatCommands } from './format';
import { blockCommands } from './block';
import { editCommands } from './edit';

export * from './format';
export * from './block';
export * from './edit';

export const coreCommands: CommandDef[] = [...formatCommands, ...blockCommands, ...editCommands];
