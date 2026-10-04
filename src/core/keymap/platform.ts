import type { Platform } from '../commands/types';

export interface NavigatorPlatformInfo {
  userAgentData?: { platform?: string };
  platform?: string;
  userAgent?: string;
}

/**
 * Detect the current operating system platform.
 * Returns 'mac' for macOS, 'win' for Windows and Linux (per PLAN.md / task spec).
 * Allows injecting navigator info for deterministic unit testing.
 */
export function detectPlatform(customNav?: NavigatorPlatformInfo): Platform {
  const nav: NavigatorPlatformInfo | undefined =
    customNav !== undefined ? customNav : typeof navigator !== 'undefined' ? navigator : undefined;

  if (!nav) {
    return 'win';
  }

  // 1. Check UserAgentData platform (modern standard)
  const uadPlatform = nav.userAgentData?.platform?.toLowerCase();
  if (uadPlatform) {
    if (
      uadPlatform.includes('mac') ||
      uadPlatform.includes('ios') ||
      uadPlatform.includes('darwin')
    ) {
      return 'mac';
    }
    return 'win';
  }

  // 2. Fallback to navigator.platform
  const navPlatform = nav.platform?.toLowerCase();
  if (navPlatform) {
    if (
      navPlatform.includes('mac') ||
      navPlatform.includes('darwin') ||
      navPlatform.includes('iphone') ||
      navPlatform.includes('ipad')
    ) {
      return 'mac';
    }
    return 'win';
  }

  // 3. Fallback to navigator.userAgent
  const ua = nav.userAgent?.toLowerCase();
  if (ua && (ua.includes('macintosh') || ua.includes('mac os'))) {
    return 'mac';
  }

  return 'win';
}
