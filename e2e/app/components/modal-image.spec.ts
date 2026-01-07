import { test, expect } from '@playwright/test';

test.describe('Modal Image', () => {
  test('inserts image markdown and closes modal', async ({ page }) => {
    await page.goto('http://localhost:4200/');

    await page.getByTestId('open-modal-image').click();

    const modal = page.getByTestId('modal-surface');
    await expect(modal).toBeVisible();

    const titleInput = page.getByTestId('input-title-image');
    await titleInput.click();
    await titleInput.fill('Sample Image');

    const urlInput = page.getByTestId('input-url-image');
    await urlInput.click();
    await urlInput.fill('http://example.com/image.png');

    // save
    await page.getByTestId('img-save').click();

    await expect(page.getByTestId('modal-surface')).toHaveCount(0);

    // editor contains image markdown
    const editor = page.getByTestId('editor-textarea');
    await expect(editor).toHaveValue(/!\[Sample Image\]\(http:\/\/example\.com\/image\.png\)/);
  });

  test('show and close modal', async ({ page }) => {
    await page.goto('http://localhost:4200/');

    await page.getByTestId('open-modal-image').click();

    const modal = page.getByTestId('modal-surface');
    await expect(modal).toBeVisible();

    await page.getByTestId('img-cancel').click();

    await expect(page.getByTestId('modal-surface')).toHaveCount(0);
  });
});
