export function isDevMode(search?: string): boolean {
  if (typeof window === 'undefined') return false;
  const dev = new URLSearchParams(search ?? window.location.search).get('dev');
  return dev === '1' || dev === 'true';
}
