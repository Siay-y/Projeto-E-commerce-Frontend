import { isPlatformBrowser } from '@angular/common';
import {
  DOCUMENT,
  Injectable,
  PLATFORM_ID,
  REQUEST,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';

export type Theme = 'light' | 'dark';

const COOKIE_NAME = 'ac-theme';
const ONE_YEAR = 60 * 60 * 24 * 365;

function readCookie(jar: string, name: string): string | null {
  for (const part of jar.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() === name) {
      return decodeURIComponent(part.slice(eq + 1).trim());
    }
  }
  return null;
}

@Injectable({ providedIn: 'root' })
export class ThemeStore {
  private readonly document = inject(DOCUMENT);
  private readonly request = inject(REQUEST, { optional: true });
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly current = signal<Theme>(this.restore());

  readonly theme = this.current.asReadonly();
  readonly isDark = computed(() => this.current() === 'dark');

  constructor() {
    this.paint(this.current());

    effect(() => {
      const theme = this.current();
      this.paint(theme);
      if (this.isBrowser) {
        this.remember(theme);
      }
    });
  }

  toggle(): void {
    this.current.update((theme) => (theme === 'dark' ? 'light' : 'dark'));
  }

  use(theme: Theme): void {
    this.current.set(theme);
  }

  private restore(): Theme {
    const jar = this.isBrowser
      ? this.document.cookie
      : (this.request?.headers.get('cookie') ?? '');

    return readCookie(jar, COOKIE_NAME) === 'dark' ? 'dark' : 'light';
  }

  private paint(theme: Theme): void {
    this.document.documentElement.setAttribute('data-theme', theme);

    this.document
      .querySelector('link[rel="icon"][type="image/svg+xml"]')
      ?.setAttribute('href', `brand/d20-${theme}.svg`);
  }

  private remember(theme: Theme): void {
    const secure = this.document.location.protocol === 'https:' ? '; Secure' : '';
    this.document.cookie = `${COOKIE_NAME}=${theme}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax${secure}`;
  }
}
