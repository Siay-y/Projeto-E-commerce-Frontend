import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointerTrack } from './pointer-track';

@Component({
  imports: [PointerTrack],
  template: `<div appPointerTrack class="alvo"></div>`,
})
class TrackHost {}

const BOX = { left: 0, top: 0, width: 200, height: 100 };

describe('PointerTrack', () => {
  const realMatchMedia = window.matchMedia;
  let fixture: ComponentFixture<TrackHost>;
  let target: HTMLElement;

  function stubMedia(reducedMotion: boolean) {
    window.matchMedia = ((query: string) =>
      ({
        media: query,
        matches: query.includes('prefers-reduced-motion')
          ? reducedMotion
          : query.includes('hover'),
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }) as unknown as MediaQueryList) as typeof window.matchMedia;
  }

  async function mount(reducedMotion = false) {
    stubMedia(reducedMotion);
    fixture = TestBed.createComponent(TrackHost);
    await fixture.whenStable();

    target = (fixture.nativeElement as HTMLElement).querySelector('.alvo')!;
    target.getBoundingClientRect = () => BOX as DOMRect;
  }

  async function point(x: number, y: number) {
    target.dispatchEvent(new MouseEvent('pointerenter'));
    target.dispatchEvent(new MouseEvent('pointermove', { clientX: x, clientY: y }));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  }

  function read() {
    const style = target.style;
    return {
      x: style.getPropertyValue('--pt-x'),
      y: style.getPropertyValue('--pt-y'),
      nx: style.getPropertyValue('--pt-nx'),
      ny: style.getPropertyValue('--pt-ny'),
    };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });

  afterEach(() => {
    window.matchMedia = realMatchMedia;
  });

  it('publica o ponto em pixels dentro do elemento', async () => {
    await mount();
    await point(140, 30);

    expect(read().x).toBe('140.0px');
    expect(read().y).toBe('30.0px');
  });

  it('zera a proporção no centro', async () => {
    await mount();
    await point(100, 50);

    expect(read().nx).toBe('0.000');
    expect(read().ny).toBe('0.000');
  });

  it('vai a -1 no canto superior esquerdo', async () => {
    await mount();
    await point(0, 0);

    expect(read().nx).toBe('-1.000');
    expect(read().ny).toBe('-1.000');
  });

  it('vai a +1 no canto inferior direito', async () => {
    await mount();
    await point(200, 100);

    expect(read().nx).toBe('1.000');
    expect(read().ny).toBe('1.000');
  });

  it('devolve o card ao plano quando o ponteiro sai', async () => {
    await mount();
    await point(0, 0);

    target.dispatchEvent(new MouseEvent('pointerleave'));

    expect(read().nx).toBe('0');
    expect(read().ny).toBe('0');
  });

  it('preserva o ponto do brilho na saída', async () => {
    await mount();
    await point(140, 30);

    target.dispatchEvent(new MouseEvent('pointerleave'));

    expect(read().x).toBe('140.0px');
    expect(read().y).toBe('30.0px');
  });

  it('não rastreia nada com movimento reduzido', async () => {
    await mount(true);
    await point(0, 0);

    expect(read().x).toBe('');
    expect(read().nx).toBe('');
  });
});
