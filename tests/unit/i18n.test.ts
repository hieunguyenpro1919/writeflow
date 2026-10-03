import { describe, it, expect } from 'vitest';
import i18n from '../../src/i18n';

describe('i18n Internationalization', () => {
  it('should initialize with default language as Vietnamese (vi)', () => {
    expect(i18n.language).toBe('vi');
  });

  it('should translate app name and tagline correctly in Vietnamese', () => {
    expect(i18n.t('app.name')).toBe('WriteFlow');
    expect(i18n.t('app.tagline')).toBe('Trình soạn thảo Markdown WYSIWYG');
  });

  it('should switch to English and translate accurately', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.language).toBe('en');
    expect(i18n.t('app.tagline')).toBe('WYSIWYG Markdown Editor');

    // Switch back to default
    await i18n.changeLanguage('vi');
    expect(i18n.language).toBe('vi');
  });
});
