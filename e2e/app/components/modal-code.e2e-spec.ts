import { test, expect } from '@playwright/test';

test.describe('Code Modal', () => {
  test('inserts code markdown and closes modal', async ({ page }) => {
    await page.goto('http://localhost:4200/');

    await page.getByTestId('open-modal-code').click();

    const modal = page.getByTestId('modal-surface');
    await expect(modal).toBeVisible();

    const languageSelect = page.getByTestId('select-language');
    await languageSelect.selectOption('javascript');

    const codeTextarea = page.getByTestId('textarea-code');
    await codeTextarea.click();
    await codeTextarea.fill('console.log("Hello, World!");');

    // save
    await page.getByTestId('code-save').click();

    await expect(page.getByTestId('modal-surface')).toHaveCount(0);

    // editor contains code markdown
    const editor = page.getByTestId('editor-textarea');
    await expect(editor).toHaveValue(/```js\nconsole\.log\("Hello, World!"\);\n```/);
  });

  test('inserts custom code markdown and closes modal', async ({ page }) => {
    await page.goto('http://localhost:4200/');

    await page.getByTestId('open-modal-code').click();

    const modal = page.getByTestId('modal-surface');
    await expect(modal).toBeVisible();

    const languageSelect = page.getByTestId('select-language');
    await languageSelect.selectOption('custom');

    const customLanguage = page.getByTestId('input-custom-language');
    await customLanguage.click();
    await customLanguage.fill('yaml');

    const codeTextarea = page.getByTestId('textarea-code');
    await codeTextarea.click();
    await codeTextarea.fill('console.log("Hello, World!");');

    // save
    await page.getByTestId('code-save').click();

    await expect(page.getByTestId('modal-surface')).toHaveCount(0);

    // editor contains code markdown
    const editor = page.getByTestId('editor-textarea');
    await expect(editor).toHaveValue(/```yaml\nconsole\.log\("Hello, World!"\);\n```/);
  });

  test('show and close modal', async ({ page }) => {
    await page.goto('http://localhost:4200/');

    await page.getByTestId('open-modal-code').click();

    const modal = page.getByTestId('modal-surface');
    await expect(modal).toBeVisible();

    await page.getByTestId('code-cancel').click();

    await expect(page.getByTestId('modal-surface')).toHaveCount(0);
  });
});
