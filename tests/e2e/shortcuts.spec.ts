import { test, expect } from '@playwright/test';

test.describe('Task 1.14: E2E Physical Keyboard & Shortcuts (Chromium)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for editor to be ready and clear default content for clean test state
    const editor = page.locator('div[role="textbox"]');
    await expect(editor).toBeVisible();
    await editor.click();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.press('Backspace');
  });

  test('1. Gõ, bôi đen, Ctrl+B / Ctrl+I / Ctrl+Shift+X / Ctrl+E -> đúng thẻ strong, em, s, code', async ({
    page,
  }) => {
    const editor = page.locator('div[role="textbox"]');

    // Type text and select it
    await page.keyboard.type('Test formatting');
    await page.keyboard.press('ControlOrMeta+a');

    // Ctrl+B -> strong
    await page.keyboard.press('Control+b');
    await expect(editor.locator('strong')).toHaveText('Test formatting');

    // Ctrl+I -> em
    await page.keyboard.press('Control+i');
    await expect(editor.locator('em')).toHaveText('Test formatting');

    // Ctrl+Shift+X -> s
    await page.keyboard.press('Control+Shift+X');
    await expect(editor.locator('s')).toHaveText('Test formatting');

    // Toggle them off
    await page.keyboard.press('Control+b');
    await page.keyboard.press('Control+i');
    await page.keyboard.press('Control+Shift+X');

    // Ctrl+E -> code
    await page.keyboard.press('Control+e');
    await expect(editor.locator('code')).toHaveText('Test formatting');
  });

  test('2. Ctrl+Alt+1/2/3 -> h1/h2/h3; Ctrl+Alt+0 -> p', async ({ page }) => {
    const editor = page.locator('div[role="textbox"]');
    await page.keyboard.type('Heading content');

    // Ctrl+Alt+1 -> h1
    await page.keyboard.press('Control+Alt+1');
    await expect(editor.locator('h1')).toHaveText('Heading content');

    // Ctrl+Alt+2 -> h2
    await page.keyboard.press('Control+Alt+2');
    await expect(editor.locator('h2')).toHaveText('Heading content');

    // Ctrl+Alt+3 -> h3
    await page.keyboard.press('Control+Alt+3');
    await expect(editor.locator('h3')).toHaveText('Heading content');

    // Ctrl+Alt+0 -> p
    await page.keyboard.press('Control+Alt+0');
    await expect(editor.locator('p')).toHaveText('Heading content');
    await expect(editor.locator('h3')).toHaveCount(0);
  });

  test('3. Ctrl+Shift+8 / Ctrl+Shift+7 / Ctrl+Shift+B -> ul / ol / blockquote', async ({
    page,
  }) => {
    const editor = page.locator('div[role="textbox"]');
    await page.keyboard.type('List or quote item');

    // Ctrl+Shift+8 -> Bullet list (ul)
    await page.keyboard.press('Control+Shift+8');
    await expect(editor.locator('ul li p')).toHaveText('List or quote item');

    // Ctrl+Shift+7 -> Ordered list (ol)
    await page.keyboard.press('Control+Shift+7');
    await expect(editor.locator('ol li p')).toHaveText('List or quote item');

    // Reset to p then Ctrl+Shift+B -> Blockquote
    await page.keyboard.press('Control+Alt+0');
    await page.keyboard.press('Control+Shift+B');
    await expect(editor.locator('blockquote p')).toHaveText('List or quote item');
  });

  test('4. Ctrl+Shift+S không tạo gạch ngang', async ({ page }) => {
    const editor = page.locator('div[role="textbox"]');
    await page.keyboard.type('No strike on Shift S');
    await page.keyboard.press('ControlOrMeta+a');

    // Ctrl+Shift+S was removed from Tiptap default
    await page.keyboard.press('Control+Shift+S');
    await expect(editor.locator('s')).toHaveCount(0);
  });

  test('5. Ctrl+U hiện thông báo toast và không đổi nội dung', async ({ page }) => {
    const editor = page.locator('div[role="textbox"]');
    await page.keyboard.type('Underline attempt');
    await page.keyboard.press('ControlOrMeta+a');

    // Press Ctrl+U
    await page.keyboard.press('Control+u');

    // Document must not have <u> tag or underline mark
    await expect(editor.locator('u')).toHaveCount(0);
    expect(await editor.innerText()).toBe('Underline attempt');

    // Toast appears
    const toast = page.locator('[data-testid="toast-host"]');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Định dạng này không được hỗ trợ trong Markdown');
  });

  test('6. Ctrl+/ mở hộp thoại phím tắt, Esc đóng, focus về editor', async ({ page }) => {
    const editor = page.locator('div[role="textbox"]');
    await page.keyboard.type('Testing dialog shortcut');

    // Press Ctrl+/ to open ShortcutsDialog
    await page.keyboard.press('Control+/');
    const dialog = page.locator('[data-testid="shortcuts-dialog"]');
    await expect(dialog).toBeVisible();

    // Verify dialog populated with commands
    const rows = dialog.locator('.shortcuts-row');
    expect(await rows.count()).toBeGreaterThanOrEqual(14);

    // Press Esc to close
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();

    // Editor still has focus
    await expect(editor).toBeFocused();
  });

  test('7. Enter trên dòng trống trong list/quote -> thoát; Backspace đầu heading -> thành đoạn', async ({
    page,
  }) => {
    const editor = page.locator('div[role="textbox"]');

    // 1. Enter exits list
    await page.keyboard.press('Control+Shift+8');
    await page.keyboard.type('Item 1');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter'); // Enter on empty list item

    // Should now be a regular paragraph
    await page.keyboard.type('Outside list');
    await expect(editor.locator('p').last()).toHaveText('Outside list');
    expect(await editor.locator('ul li').count()).toBe(1);

    // 2. Backspace at start of heading converts to paragraph
    await page.keyboard.press('Enter');
    await page.keyboard.press('Control+Alt+1');
    await page.keyboard.type('My Heading');
    await expect(editor.locator('h1')).toHaveText('My Heading');

    // Di chuyển con trỏ về đầu khối heading bằng ArrowLeft chuẩn Playwright
    for (let i = 0; i < 'My Heading'.length; i++) {
      await page.keyboard.press('ArrowLeft', { delay: 25 });
    }

    // Backspace at offset 0 converts heading to paragraph without merging into previous block
    await page.keyboard.press('Backspace');
    await expect(editor.locator('h1')).toHaveCount(0);
    await expect(editor.locator('p').last()).toHaveText('My Heading');
  });

  test('8. Undo/Redo bằng Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z', async ({ page }) => {
    const editor = page.locator('div[role="textbox"]');
    await page.keyboard.type('Initial text');

    // Apply bold
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.press('Control+b');
    await expect(editor.locator('strong')).toHaveText('Initial text');

    // Undo with Ctrl+Z
    await page.keyboard.press('Control+z');
    await expect(editor.locator('strong')).toHaveCount(0);

    // Redo with Ctrl+Y
    await page.keyboard.press('Control+y');
    await expect(editor.locator('strong')).toHaveText('Initial text');

    // Undo again
    await page.keyboard.press('Control+z');
    await expect(editor.locator('strong')).toHaveCount(0);

    // Redo with Ctrl+Shift+Z
    await page.keyboard.press('Control+Shift+Z');
    await expect(editor.locator('strong')).toHaveText('Initial text');
  });

  test('9. Gõ "# " rồi chữ -> h1; gõ chuỗi có dấu tiếng Việt dạng dựng sẵn không bị phá', async ({
    page,
  }) => {
    const editor = page.locator('div[role="textbox"]');

    // Type "# " to trigger input rule
    await page.keyboard.type('# ');
    await expect(editor.locator('h1')).toBeVisible();

    // Type Vietnamese characters
    const vnText = 'Tiếng Việt sắc huyền hỏi ngã nặng';
    await page.keyboard.type(vnText);

    await expect(editor.locator('h1')).toHaveText(vnText);
  });
});
