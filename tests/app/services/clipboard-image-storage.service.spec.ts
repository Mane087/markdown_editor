import { ClipboardImageStorageService } from '../../../src/app/services/clipboard-image-storage.service';

describe('ClipboardImageStorageService', () => {
  let service: ClipboardImageStorageService;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    service = new ClipboardImageStorageService();
  });

  it('should reject images larger than 1 MB', async () => {
    const oversizedFile = new File([new Uint8Array(1024 * 1024 + 1)], 'large.png', {
      type: 'image/png',
    });

    await expect(service.saveImage(oversizedFile, oversizedFile.name)).rejects.toThrow(
      'The image is too large. Maximum size: 1 MB.',
    );
  });

  it('should reject imported images when local storage would exceed 2 MB', async () => {
    const dataUrl = `data:image/png;base64,${'a'.repeat(1024 * 1024)}`;

    await service.normalizeMarkdownContent(`![first](${dataUrl})`);

    await expect(service.normalizeMarkdownContent(`![second](${dataUrl})`)).rejects.toThrow(
      'Local image storage is full. Maximum total size: 2 MB.',
    );
  });

  it('should remove local images that are no longer referenced in markdown history', async () => {
    const firstMarkdown = await service.normalizeMarkdownContent(
      '![first](data:image/png;base64,aaaa)',
    );
    const secondMarkdown = await service.normalizeMarkdownContent(
      '![second](data:image/png;base64,bbbb)',
    );

    service.syncImagesWithMarkdownHistory([secondMarkdown]);

    expect(service.serializeMarkdownContent(firstMarkdown)).toContain('local-image://');
    expect(service.serializeMarkdownContent(secondMarkdown)).toContain(
      'data:image/png;base64,bbbb',
    );
  });

  it('should keep local images referenced by undo history', async () => {
    const firstMarkdown = await service.normalizeMarkdownContent(
      '![first](data:image/png;base64,aaaa)',
    );

    service.syncImagesWithMarkdownHistory(['', firstMarkdown]);

    expect(service.serializeMarkdownContent(firstMarkdown)).toContain('data:image/png;base64,aaaa');
  });
});
