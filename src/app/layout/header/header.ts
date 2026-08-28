import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  Injector,
  PLATFORM_ID,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';

import { AuthStore } from '../../core/auth/auth-store';
import { CartStore } from '../../core/cart/cart-store';
import { PATHS } from '../../core/routing/paths';
import { Icon } from '../../shared/ui/icon/icon';
import { IconButton } from '../../shared/ui/icon-button/icon-button';
import { Logo } from '../../shared/ui/logo/logo';
import { ThemeToggle } from '../../shared/ui/theme-toggle/theme-toggle';
import { NAV_LINKS } from '../nav-links';
import { NavSheet } from '../nav-sheet/nav-sheet';
import { SiteSearch } from '../site-search/site-search';

interface Rule {
  readonly x: number;
  readonly w: number;
  readonly on: boolean;
}

const HIDDEN_RULE: Rule = { x: 0, w: 0, on: false };

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Logo, Icon, IconButton, ThemeToggle, NavSheet, SiteSearch],
  styleUrl: './header.scss',
  templateUrl: './header.html',
  host: {
    '[class.is-lifted]': 'lifted()',
    '[class.is-compact]': 'compact()',
    '(document:keydown.escape)': 'menuOpen.set(false)',
  },
})
export class Header {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly navRoot = viewChild<ElementRef<HTMLElement>>('navRoot');
  private readonly navLinks = viewChildren<ElementRef<HTMLElement>>('navLink');

  protected readonly PATHS = PATHS;
  protected readonly cart = inject(CartStore);
  protected readonly auth = inject(AuthStore);
  protected readonly links = NAV_LINKS;

  protected readonly account = computed(() => {
    if (this.auth.status() === 'desconhecido') return null;

    return this.auth.isLoggedIn()
      ? { top: `Olá, ${this.auth.shortName()}`, main: 'Sua conta', path: PATHS.account }
      : { top: 'Olá, visitante', main: 'Entrar', path: PATHS.login };
  });

  protected readonly lifted = signal(false);
  protected readonly compact = signal(false);
  protected readonly menuOpen = signal(false);
  protected readonly rule = signal<Rule>(HIDDEN_RULE);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly activePath = computed(() => {
    const path = this.url().split(/[?#]/)[0];
    const match = this.links.find(
      (link) => path === link.path || path.startsWith(`${link.path}/`),
    );
    return match?.path ?? null;
  });

  protected readonly menuLabel = computed(() =>
    this.menuOpen() ? 'Fechar menu' : 'Abrir menu',
  );

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.menuOpen.set(false);
        this.scheduleSettle();
      });

    effect(() => {
      const open = this.menuOpen();
      if (this.isBrowser) {
        this.document.body.style.overflow = open ? 'hidden' : '';
      }
    });

    afterNextRender(() => {
      const onScroll = () => this.readScroll();
      const onResize = () => {
        this.readScroll();
        this.settle();
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize, { passive: true });
      this.destroyRef.onDestroy(() => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onResize);
      });

      this.readScroll();
      this.settle();

      this.document.fonts?.ready.then(() => this.settle()).catch(() => undefined);
    });
  }

  protected highlight(index: number): void {
    this.moveRuleTo(this.navLinks()[index]?.nativeElement ?? null);
  }

  protected settle(): void {
    const index = this.links.findIndex((link) => link.path === this.activePath());
    this.moveRuleTo(index < 0 ? null : (this.navLinks()[index]?.nativeElement ?? null));
  }

  private moveRuleTo(target: HTMLElement | null): void {
    const root = this.navRoot()?.nativeElement;
    if (!root || !target) {
      this.rule.update((current) => ({ ...current, on: false }));
      return;
    }

    const box = target.getBoundingClientRect();
    const origin = root.getBoundingClientRect();

    if (box.width === 0) {
      this.rule.set(HIDDEN_RULE);
      return;
    }

    this.rule.set({ x: box.left - origin.left, w: box.width, on: true });
  }

  private readScroll(): void {
    const y = window.scrollY;

    this.lifted.update((on) => (on ? y > 8 : y > 24));
    this.compact.update((on) => (on ? y > 96 : y > 148));
  }

  private scheduleSettle(): void {
    afterNextRender(() => this.settle(), { injector: this.injector });
  }
}
