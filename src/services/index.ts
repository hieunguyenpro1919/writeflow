/**
 * Service interfaces (PLAN.md Section 5.2)
 * FileService, SettingsService, ThemeService, RecoveryService
 * Sẽ được cài đặt ở Phase 3 và Phase 5.
 */

export interface IFileService {
  openFile?(): Promise<string | null>;
  saveFile?(content: string, path?: string): Promise<boolean>;
}
