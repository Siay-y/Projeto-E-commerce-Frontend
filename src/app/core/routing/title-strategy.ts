import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

const STORE = 'Acerto Crítico';

@Injectable({ providedIn: 'root' })
export class StoreTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const page = this.buildTitle(snapshot);

    this.title.setTitle(page ? `${page} | ${STORE}` : STORE);
  }
}
