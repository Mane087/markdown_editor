import { test, expect } from '@playwright/test';

test.describe('URL Modal', () => {
  test('normal URL: emits <url> and closes modal', async ({ page }) => {
    await page.goto('http://localhost:4200/');

    // open modal
    await page.getByTestId('open-modal-url').click();

    const modal = page.getByTestId('modal-surface');
    await expect(modal).toBeVisible();

    // select normal URL
    await page.getByTestId('url-type').selectOption('normal');

    // fill URL
    await page.getByTestId('url-content').fill('https://google.com');

    // save
    await page.getByTestId('url-save').click();

    // modal closed
    await expect(modal).toBeHidden();

    // editor got inserted content (adjust if your app appends newline)
    const editor = page.getByTestId('editor-textarea');
    await expect(editor).toHaveValue(/<https:\/\/google\.com>/);
  });

  test('custom URL: emits [title](url) and closes modal', async ({ page }) => {
    await page.goto('http://localhost:4200/');

    await page.getByTestId('open-modal-url').click();

    const modal = page.getByTestId('modal-surface');
    await expect(modal).toBeVisible();

    await page.getByTestId('url-type').selectOption('custom');

    // custom fields appear
    await expect(page.getByTestId('custom-fields')).toBeVisible();

    await page.getByTestId('url-title').fill('Google');
    await page.getByTestId('url-content').fill('https://google.com');

    await page.getByTestId('url-save').click();

    await expect(modal).toBeHidden();

    const editor = page.getByTestId('editor-textarea');
    await expect(editor).toHaveValue(/\[Google\]\(https:\/\/google\.com\)/);
  });

  test('cancel closes modal and does not insert content', async ({ page }) => {
    await page.goto('http://localhost:4200/');

    const editor = page.getByTestId('editor-textarea');
    await editor.fill('initial');

    await page.getByTestId('open-modal-url').click();
    const modal = page.getByTestId('modal-surface');
    await expect(modal).toBeVisible();

    await page.getByTestId('url-content').fill('https://google.com');
    await page.getByTestId('url-cancel').click();

    await expect(modal).toBeHidden();

    await expect(editor).toHaveValue('initial'); // no changes
  });
});
