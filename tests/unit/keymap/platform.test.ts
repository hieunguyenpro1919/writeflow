import { describe, it, expect } from 'vitest';
import { detectPlatform } from '../../../src/core/keymap/platform';

describe('Task 1.2: Platform Detection', () => {
  it('detects macOS when userAgentData contains Mac', () => {
    expect(detectPlatform({ userAgentData: { platform: 'macOS' } })).toBe('mac');
    expect(detectPlatform({ userAgentData: { platform: 'MacIntel' } })).toBe('mac');
  });

  it('detects Windows when userAgentData contains Windows', () => {
    expect(detectPlatform({ userAgentData: { platform: 'Windows' } })).toBe('win');
  });

  it('detects Linux as "win" per PLAN.md/task spec', () => {
    expect(detectPlatform({ userAgentData: { platform: 'Linux' } })).toBe('win');
  });

  it('falls back to navigator.platform when userAgentData is missing', () => {
    expect(detectPlatform({ platform: 'MacIntel' })).toBe('mac');
    expect(detectPlatform({ platform: 'Win32' })).toBe('win');
    expect(detectPlatform({ platform: 'Linux x86_64' })).toBe('win');
  });

  it('falls back to navigator.userAgent when both are missing or generic', () => {
    expect(detectPlatform({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' })).toBe('mac');
    expect(detectPlatform({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' })).toBe('win');
  });

  it('defaults to "win" when navigator info is completely undefined', () => {
    expect(detectPlatform({})).toBe('win');
  });
});
