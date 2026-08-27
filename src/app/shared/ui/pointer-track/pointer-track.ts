import { Directive, DestroyRef, ElementRef, afterNextRender, inject } from '@angular/core';

/**
 * Publica a posicao do ponteiro como variaveis CSS: `--pt-x`/`--pt-y` em pixels
 * e `--pt-nx`/`--pt-ny` em proporcao de -1 a +1. A aparencia mora em
 * `styles/_pointer-track.scss`.
 *
 * Nao escrever `transform` inline aqui: e o que permite uma regra de componente
 * como `:host(.is-out):hover { transform: none }` desligar o efeito.
 *
 * Ouvintes nativos, fora do sistema de templates: num app zoneless, mover o
 * mouse assim nao dispara deteccao de mudanca.
 */
@Directive({
  selector: '[appPointerTrack]',
  host: { class: 'pointer-track' },
})
export class PointerTrack {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly destroyRef = inject(DestroyRef);

  private frame = 0;
  private pending: PointerEvent | null = null;

  private box: DOMRect | null = null;

  constructor() {
    afterNextRender(() => {
      const pointer = matchMedia('(hover: hover) and (pointer: fine)');
      const still = matchMedia('(prefers-reduced-motion: reduce)');
      if (!pointer.matches || still.matches) return;

      const element = this.element;
      const enter = () => (this.box = element.getBoundingClientRect());
      const move = (event: PointerEvent) => this.schedule(event);
      const leave = () => this.settle();

      element.addEventListener('pointerenter', enter);
      element.addEventListener('pointermove', move);
      element.addEventListener('pointerleave', leave);

      this.destroyRef.onDestroy(() => {
        element.removeEventListener('pointerenter', enter);
        element.removeEventListener('pointermove', move);
        element.removeEventListener('pointerleave', leave);
        cancelAnimationFrame(this.frame);
      });
    });
  }

  private schedule(event: PointerEvent): void {
    this.pending = event;
    if (this.frame) return;

    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.publish();
    });
  }

  private publish(): void {
    const event = this.pending;
    const box = this.box;
    if (!event || !box || box.width === 0 || box.height === 0) return;

    const x = event.clientX - box.left;
    const y = event.clientY - box.top;

    const style = this.element.style;
    style.setProperty('--pt-x', `${x.toFixed(1)}px`);
    style.setProperty('--pt-y', `${y.toFixed(1)}px`);
    style.setProperty('--pt-nx', ((x / box.width) * 2 - 1).toFixed(3));
    style.setProperty('--pt-ny', ((y / box.height) * 2 - 1).toFixed(3));
  }

  private settle(): void {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.pending = null;
    this.box = null;

    const style = this.element.style;
    style.setProperty('--pt-nx', '0');
    style.setProperty('--pt-ny', '0');
  }
}
