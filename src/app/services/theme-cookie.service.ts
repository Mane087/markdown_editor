import { Injectable } from '@angular/core';

export type ThemeMode = 'dark' | 'light';

const THEME_COOKIE_NAME = 'theme';
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

@Injectable({
  providedIn: 'root',
})
export class ThemeCookieService {
  getTheme(): ThemeMode | null {
    if (typeof document === 'undefined') {
      return null;
    }

    const value = this.readCookie(THEME_COOKIE_NAME);

    if (value === 'dark' || value === 'light') {
      return value;
    }

    return null;
  }

  setTheme(theme: ThemeMode): void {
    if (typeof document === 'undefined' || typeof location === 'undefined') {
      return;
    }

    const cookiePath = this.resolveCookiePath();

    for (const path of this.getCleanupPaths(cookiePath)) {
      document.cookie = `${THEME_COOKIE_NAME}=; Max-Age=0; Path=${path}; SameSite=Lax`;
    }

    const parts = [
      `${THEME_COOKIE_NAME}=${encodeURIComponent(theme)}`,
      `Max-Age=${ONE_YEAR_IN_SECONDS}`,
      `Path=${cookiePath}`,
      'SameSite=Lax',
    ];

    if (this.getLocationProtocol() === 'https:') {
      parts.push('Secure');
    }

    document.cookie = parts.join('; ');
  }

  private readCookie(name: string): string | null {
    const rawCookie = document.cookie;

    if (!rawCookie) {
      return null;
    }

    const entries = rawCookie.split(';');

    let matchedValue: string | null = null;

    for (const entry of entries) {
      const trimmed = entry.trim();
      const separatorIndex = trimmed.indexOf('=');

      if (separatorIndex <= 0) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();

      if (key !== name) {
        continue;
      }

      const value = trimmed.slice(separatorIndex + 1).trim();
      matchedValue = this.safeDecodeURIComponent(value);
    }

    return matchedValue;
  }

  private resolveCookiePath(): string {
    const baseHref = document.querySelector('base')?.getAttribute('href')?.trim();

    if (!baseHref) {
      return '/';
    }

    try {
      const pathname = new URL(baseHref, location.origin).pathname;
      return this.normalizePath(pathname);
    } catch {
      return this.normalizePath(baseHref);
    }
  }

  private normalizePath(path: string): string {
    if (!path || path === '.') {
      return '/';
    }

    const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
    const withoutQuery = withLeadingSlash.split('#')[0]?.split('?')[0] ?? '/';
    const normalized = withoutQuery.replace(/\/{2,}/g, '/');

    if (normalized === '/' || normalized === '') {
      return '/';
    }

    const isDirectory = normalized.endsWith('/');
    const segments = normalized.split('/').filter((segment) => segment.length > 0);
    const lastSegment = segments[segments.length - 1] ?? '';
    const looksLikeFile = !isDirectory && lastSegment.includes('.');
    const directoryPath = looksLikeFile
      ? normalized.slice(0, normalized.lastIndexOf('/'))
      : normalized;
    const cleanedDirectory = directoryPath === '' ? '/' : directoryPath;

    if (cleanedDirectory === '/') {
      return '/';
    }

    return cleanedDirectory.endsWith('/') ? cleanedDirectory.slice(0, -1) : cleanedDirectory;
  }

  private getCleanupPaths(path: string): string[] {
    const paths = new Set<string>(['/']);
    paths.add(path);

    if (path !== '/') {
      const withTrailingSlash = path.endsWith('/') ? path : `${path}/`;
      const withoutTrailingSlash = path.endsWith('/') ? path.slice(0, -1) : path;

      if (withTrailingSlash) {
        paths.add(withTrailingSlash);
      }

      if (withoutTrailingSlash) {
        paths.add(withoutTrailingSlash);
      }
    }

    return [...paths];
  }

  private getLocationProtocol(): string {
    return location.protocol;
  }

  private safeDecodeURIComponent(value: string): string {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }
}
