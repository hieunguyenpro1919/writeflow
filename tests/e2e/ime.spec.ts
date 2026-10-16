import { test, expect } from '@playwright/test';

test.describe('Task 2.6d: E2E Vietnamese IME Composition & CDP Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const editor = page.locator('div[role="textbox"]');
    await expect(editor).toBeVisible();
    await editor.click();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.press('Backspace');
  });

  test('1. Gõ chuỗi ký tự IME tiếng Việt (v -> vi -> viê -> việ -> việt + nam) qua CDP hiển thị chính xác "việt nam"', async ({
    page,
  }) => {
    const editor = page.locator('div[role="textbox"]');
    const client = await page.context().newCDPSession(page);

    // Simulate Telex IME composition steps for 'việt':
    // v -> vi -> viê -> việ -> việt
    await client.send('Input.imeSetComposition', { text: 'v', selectionStart: 1, selectionEnd: 1 });
    await client.send('Input.imeSetComposition', {
      text: 'vi',
      selectionStart: 2,
      selectionEnd: 2,
    });
    await client.send('Input.imeSetComposition', {
      text: 'viê',
      selectionStart: 3,
      selectionEnd: 3,
    });
    await client.send('Input.imeSetComposition', {
      text: 'việ',
      selectionStart: 3,
      selectionEnd: 3,
    });
    await client.send('Input.imeSetComposition', {
      text: 'việt',
      selectionStart: 4,
      selectionEnd: 4,
    });

    // Commit 'việt'
    await client.send('Input.insertText', { text: 'việt' });

    // Insert space
    await client.send('Input.insertText', { text: ' ' });

    // Simulate Telex IME composition steps for 'nam':
    // n -> na -> nam
    await client.send('Input.imeSetComposition', { text: 'n', selectionStart: 1, selectionEnd: 1 });
    await client.send('Input.imeSetComposition', {
      text: 'na',
      selectionStart: 2,
      selectionEnd: 2,
    });
    await client.send('Input.imeSetComposition', {
      text: 'nam',
      selectionStart: 3,
      selectionEnd: 3,
    });

    // Commit 'nam'
    await client.send('Input.insertText', { text: 'nam' });

    // Assert editor contains exact text 'việt nam'
    await expect(editor).toContainText('việt nam');
    expect(await editor.innerText()).toBe('việt nam');
  });

  test('2. Soạn "# " hoặc "*" bằng IME khi đang composing không tự động kích hoạt input rule', async ({
    page,
  }) => {
    const editor = page.locator('div[role="textbox"]');
    const client = await page.context().newCDPSession(page);

    // 2.1. Compose '# ' at beginning of line
    await client.send('Input.imeSetComposition', {
      text: '# ',
      selectionStart: 2,
      selectionEnd: 2,
    });

    // Assert h1 is NOT created during composition
    await expect(editor.locator('h1')).toHaveCount(0);
    await expect(editor.locator('p')).toHaveCount(1);

    // Cancel composition
    await client.send('Input.imeSetComposition', { text: '', selectionStart: 0, selectionEnd: 0 });

    // 2.2. Compose '*' and '*chữ*' inside editor
    await client.send('Input.imeSetComposition', { text: '*', selectionStart: 1, selectionEnd: 1 });
    await expect(editor.locator('em')).toHaveCount(0);
    await expect(editor.locator('i')).toHaveCount(0);

    await client.send('Input.imeSetComposition', {
      text: '*chữ*',
      selectionStart: 5,
      selectionEnd: 5,
    });

    // Assert em / italic mark is NOT created during composition
    await expect(editor.locator('em')).toHaveCount(0);
    await expect(editor.locator('i')).toHaveCount(0);

    // Cancel composition
    await client.send('Input.imeSetComposition', { text: '', selectionStart: 0, selectionEnd: 0 });
  });
});
