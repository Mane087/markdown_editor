import { TestBed } from '@angular/core/testing';

import { ThemeCookieService } from '../../../src/app/services/theme-cookie.service';

describe('ThemeCookieService (Jest)', () => {
  let service: ThemeCookieService;
  let cookieStore = '';
  let cookieWrites: string[] = [];
  let originalCookieDescriptor: PropertyDescriptor | undefined;

  const installCookieMock = () => {
    originalCookieDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');

    Object.defineProperty(document, 'cookie', {
      configurable: true,
      get: () => cookieStore,
      set: (value: string) => {
        cookieWrites.push(value);

        const item = value.split(';')[0]?.trim() ?? '';
        const separatorIndex = item.indexOf('=');

        if (separatorIndex <= 0) {
          return;
        }

        const key = item.slice(0, separatorIndex).trim();
        const itemValue = item.slice(separatorIndex + 1).trim();
        const entries = cookieStore
          ? cookieStore
              .split(';')
              .map((entry) => entry.trim())
              .filter((entry) => entry.length > 0)
          : [];
        const nextEntries = entries.filter((entry) => !entry.startsWith(`${key}=`));

        if (itemValue) {
          nextEntries.push(`${key}=${itemValue}`);
        }

        cookieStore = nextEntries.join('; ');
      },
    });
  };

  const restoreCookieMock = () => {
    if (originalCookieDescriptor) {
      Object.defineProperty(Document.prototype, 'cookie', originalCookieDescriptor);
    }

    delete (document as { cookie?: string }).cookie;
  };

  const setBaseHref = (href: string) => {
    let baseElement = document.querySelector('base');

    if (!baseElement) {
      baseElement = document.createElement('base');
      document.head.appendChild(baseElement);
    }

    baseElement.setAttribute('href', href);
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeCookieService);
    cookieStore = '';
    cookieWrites = [];
    installCookieMock();
    setBaseHref('/');
  });

  afterEach(() => {
    restoreCookieMock();
    jest.restoreAllMocks();
  });

  it('should return null when cookie is absent', () => {
    expect(service.getTheme()).toBeNull();
  });

  it('should return null when cookie has invalid value', () => {
    cookieStore = 'theme=blue';

    expect(service.getTheme()).toBeNull();
  });

  it('should read dark theme from cookie', () => {
    cookieStore = 'theme=dark';

    expect(service.getTheme()).toBe('dark');
  });

  it('should read the last matching theme cookie', () => {
    cookieStore = 'theme=dark; other=1; theme=light';

    expect(service.getTheme()).toBe('light');
  });

  it('should write light theme cookie with required attributes', () => {
    jest.spyOn(service as never, 'getLocationProtocol').mockReturnValue('http:');

    service.setTheme('light');

    const lastWrite = cookieWrites[cookieWrites.length - 1] ?? '';
    expect(lastWrite).toContain('theme=light');
    expect(lastWrite).toContain('Max-Age=31536000');
    expect(lastWrite).toContain('SameSite=Lax');
    expect(lastWrite).toContain('Path=/');
    expect(lastWrite).not.toContain('Secure');
  });

  it('should add Secure attribute when protocol is https', () => {
    jest.spyOn(service as never, 'getLocationProtocol').mockReturnValue('https:');

    service.setTheme('dark');

    const lastWrite = cookieWrites[cookieWrites.length - 1] ?? '';
    expect(lastWrite).toContain('Secure');
  });

  it('should compute cookie path from base href directory when base href includes file', () => {
    setBaseHref('/sub/index.html');
    jest.spyOn(service as never, 'getLocationProtocol').mockReturnValue('http:');

    service.setTheme('dark');

    const lastWrite = cookieWrites[cookieWrites.length - 1] ?? '';
    expect(lastWrite).toContain('Path=/sub');
  });

  it('should clear alternate cookie paths before writing', () => {
    setBaseHref('/sub/');
    jest.spyOn(service as never, 'getLocationProtocol').mockReturnValue('http:');

    service.setTheme('dark');

    const cleanupWrites = cookieWrites.slice(0, -1);
    expect(cleanupWrites.some((write) => write.includes('Path=/'))).toBe(true);
    expect(cleanupWrites.some((write) => write.includes('Path=/sub'))).toBe(true);
    expect(cleanupWrites.some((write) => write.includes('Path=/sub/'))).toBe(true);
  });
});
