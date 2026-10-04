import { defaultCommandRegistry } from './registry';
import { coreCommands } from './definitions';

export * from './types';
export * from './registry';
export * from './definitions';

/**
 * Registers all core Phase 1 commands into the given registry.
 * Safely skips already registered commands.
 */
export function registerCoreCommands(reg = defaultCommandRegistry): void {
  for (const cmd of coreCommands) {
    if (!reg.get(cmd.id)) {
      reg.register(cmd);
    }
  }
}

// Auto-register all core commands into the defaultCommandRegistry
registerCoreCommands(defaultCommandRegistry);
