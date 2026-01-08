import { test, expect } from '@playwright/test';

test.describe('Table Modal', () => {
  test('inserts table markdown and closes modal', async ({ page }) => {
    await page.goto('http://localhost:4200/');

    await page.getByTestId('open-modal-table').click();

    const modal = page.getByTestId('modal-surface');
    await expect(modal).toBeVisible();

    const columnInput = page.getByTestId('table-column');
    await columnInput.click();
    await columnInput.fill('3');

    // fill rows
    const rowInput = page.getByTestId('table-row');
    await rowInput.click();
    await rowInput.fill('2');

    // save
    await page.getByTestId('table-save').click();

    await expect(page.getByTestId('modal-surface')).toHaveCount(0);

    // editor contains table with 3 columns
    const editor = page.getByTestId('editor-textarea');
    await expect(editor).toHaveValue(/Header \| Header \| Header/);
    await expect(editor).toHaveValue(/Data \| Data \| Data/);
  });

  test('show and close modal', async ({ page }) => {
    await page.goto('http://localhost:4200/');

    await page.getByTestId('open-modal-table').click();

    const modal = page.getByTestId('modal-surface');
    await expect(modal).toBeVisible();

    await page.getByTestId('table-cancel').click();

    await expect(page.getByTestId('modal-surface')).toHaveCount(0);
  });
});
