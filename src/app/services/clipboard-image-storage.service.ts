import { Injectable } from '@angular/core';

import type { ClipboardImage } from '../utils/types/clipboard-image';

@Injectable({ providedIn: 'root' })
export class ClipboardImageStorageService {
  private readonly storageKey = 'md-editor-clipboard-images';
  private readonly referencePrefix = 'local-image://';
  private readonly maxImages = 25;
  private readonly maxImageBytes = 1024 * 1024;
  private readonly maxStorageBytes = 2 * 1024 * 1024;

  private get storage(): Storage {
    return sessionStorage;
  }

  async normalizeMarkdownContent(markdown: string): Promise<string> {
    const imageDataUrlPattern = /!\[([^\]]*)\]\((data:image\/[^)\s]+)\)/g;
    const matches = Array.from(markdown.matchAll(imageDataUrlPattern));

    if (matches.length === 0) {
      return markdown;
    }

    let normalizedMarkdown = markdown;

    for (const match of matches) {
      const fullMatch = match[0];
      const imageTitle = match[1];
      const dataUrl = match[2];
      const image = this.saveDataUrlImage(dataUrl, imageTitle);
      const imageReference = this.createStorageReference(image.id);

      normalizedMarkdown = normalizedMarkdown.replace(
        fullMatch,
        `![${image.name}](${imageReference})`,
      );
    }

    return normalizedMarkdown;
  }

  extractImageFileFromClipboard(clipboardData: DataTransfer | null): File | null {
    if (!clipboardData) {
      return null;
    }

    for (const item of Array.from(clipboardData.items)) {
      if (item.kind !== 'file' || !item.type.startsWith('image/')) {
        continue;
      }

      const file = item.getAsFile();
      if (file) {
        return file;
      }
    }

    return null;
  }

  async saveImage(file: Blob, preferredName?: string): Promise<ClipboardImage> {
    this.ensureImageSizeWithinLimit(file.size);

    const dataUrl = await this.readAsDataUrl(file);

    return this.saveStoredImage(dataUrl, preferredName);
  }

  createStorageReference(imageId: string): string {
    return `${this.referencePrefix}${imageId}`;
  }

  serializeMarkdownContent(markdown: string): string {
    return markdown.replace(/local-image:\/\/([^\s)]+)/g, (_match, imageId: string) => {
      const image = this.getImages().find((storedImage) => storedImage.id === imageId);
      return image?.dataUrl ?? this.createStorageReference(imageId);
    });
  }

  resolveImageSource(source: string): string {
    if (!source.startsWith(this.referencePrefix)) {
      return source;
    }

    const imageId = source.slice(this.referencePrefix.length);
    const image = this.getImages().find((storedImage) => storedImage.id === imageId);

    return image?.dataUrl ?? source;
  }

  clearImages(): void {
    this.storage.removeItem(this.storageKey);
  }

  syncImagesWithMarkdownHistory(markdowns: readonly string[]): void {
    const referencedImageIds = new Set(
      markdowns.flatMap((markdown) => this.extractReferencedImageIds(markdown)),
    );
    const currentImages = this.getImages();

    const remainingImages = currentImages.filter((image) => referencedImageIds.has(image.id));

    if (remainingImages.length === currentImages.length) {
      return;
    }

    if (remainingImages.length === 0) {
      this.clearImages();
      return;
    }

    this.storage.setItem(this.storageKey, JSON.stringify(remainingImages));
  }

  private getImages(): ClipboardImage[] {
    const savedImages = this.storage.getItem(this.storageKey);

    if (!savedImages) {
      return [];
    }

    try {
      const images = JSON.parse(savedImages) as ClipboardImage[];
      return Array.isArray(images) ? images : [];
    } catch {
      return [];
    }
  }

  private createImageId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    return `image-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  private normalizeImageName(preferredName?: string): string {
    const normalizedName = preferredName?.trim();
    return normalizedName && normalizedName.length > 0 ? normalizedName : 'Pasted image';
  }

  private saveDataUrlImage(dataUrl: string, preferredName?: string): ClipboardImage {
    this.ensureImageSizeWithinLimit(this.getDataUrlByteSize(dataUrl));

    return this.saveStoredImage(dataUrl, preferredName);
  }

  private saveStoredImage(dataUrl: string, preferredName?: string): ClipboardImage {
    const images = this.getImages();
    const image: ClipboardImage = {
      id: this.createImageId(),
      name: this.normalizeImageName(preferredName),
      dataUrl,
      createdAt: Date.now(),
    };

    const nextImages = [image, ...images].slice(0, this.maxImages);

    this.ensureStorageWithinLimit(nextImages);
    this.storage.setItem(this.storageKey, JSON.stringify(nextImages));

    return image;
  }

  private ensureImageSizeWithinLimit(sizeInBytes: number): void {
    if (sizeInBytes <= this.maxImageBytes) {
      return;
    }

    throw new Error('The image is too large. Maximum size: 1 MB.');
  }

  private ensureStorageWithinLimit(images: ClipboardImage[]): void {
    const serializedImages = JSON.stringify(images);
    const storageBytes = new Blob([serializedImages]).size;

    if (storageBytes <= this.maxStorageBytes) {
      return;
    }

    throw new Error('Local image storage is full. Maximum total size: 2 MB.');
  }

  private getDataUrlByteSize(dataUrl: string): number {
    const base64Marker = ';base64,';
    const base64Index = dataUrl.indexOf(base64Marker);

    if (base64Index === -1) {
      return new Blob([dataUrl]).size;
    }

    const base64Content = dataUrl.slice(base64Index + base64Marker.length);
    const padding = base64Content.endsWith('==') ? 2 : base64Content.endsWith('=') ? 1 : 0;

    return Math.floor((base64Content.length * 3) / 4) - padding;
  }

  private extractReferencedImageIds(markdown: string): string[] {
    return Array.from(markdown.matchAll(/local-image:\/\/([^\s)]+)/g), (match) => match[1]);
  }

  private readAsDataUrl(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;

        if (typeof result === 'string') {
          resolve(result);
          return;
        }

        reject(new Error('Could not read clipboard image as data URL.'));
      };
      reader.onerror = () => reject(reader.error ?? new Error('Could not read clipboard image.'));
      reader.readAsDataURL(file);
    });
  }
}
