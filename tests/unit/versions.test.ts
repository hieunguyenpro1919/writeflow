import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Version Pinning Enforcement (Phase 0.1)', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const packageJsonPath = path.join(rootDir, 'package.json');
  const versionsDocPath = path.join(rootDir, 'docs/architecture/versions.md');

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const versionsDocContent = fs.readFileSync(versionsDocPath, 'utf8');

  const allDependencies: Record<string, string> = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  it('(a) no dependency should have prefix ^, ~, or "latest"', () => {
    const invalidEntries: string[] = [];

    for (const [name, version] of Object.entries(allDependencies)) {
      if (
        version.startsWith('^') ||
        version.startsWith('~') ||
        version.includes('latest') ||
        version.includes('*') ||
        version.includes('>') ||
        version.includes('<')
      ) {
        invalidEntries.push(`${name}: "${version}"`);
      }
    }

    expect(
      invalidEntries,
      `Detected unpinned or range-based dependencies in package.json: ${invalidEntries.join(', ')}`,
    ).toEqual([]);
  });

  it('(b) every package in package.json must be documented in versions.md with exact version', () => {
    const missingOrMismatched: string[] = [];

    for (const [name, version] of Object.entries(allDependencies)) {
      // Must find both package name and exact version in versions.md
      // Expected markdown row format: | `name` | `version` | ...
      const exactPattern = new RegExp(`\\|\\s*\`${escapeRegExp(name)}\`\\s*\\|\\s*\`${escapeRegExp(version)}\`\\s*\\|`);

      if (!exactPattern.test(versionsDocContent)) {
        missingOrMismatched.push(`${name}@${version}`);
      }
    }

    expect(
      missingOrMismatched,
      `Packages missing or version mismatched in docs/architecture/versions.md: ${missingOrMismatched.join(', ')}`,
    ).toEqual([]);
  });
});

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
