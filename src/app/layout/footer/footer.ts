import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { STORE } from '../../core/store/store-info';
import { Icon } from '../../shared/ui/icon/icon';
import { Logo } from '../../shared/ui/logo/logo';
import { SocialIcon } from '../../shared/ui/social-icon/social-icon';
import { FOOTER_SECTIONS, LEGAL_LINKS } from '../footer-links';
import { SOCIAL_LINKS } from '../social-links';

const PAYMENTS = ['Pix', 'Cartão de crédito', 'Boleto'] as const;

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Logo, Icon, SocialIcon],
  styleUrl: './footer.scss',
  templateUrl: './footer.html',
})
export class Footer {
  protected readonly store = STORE;
  protected readonly sections = FOOTER_SECTIONS;
  protected readonly legal = LEGAL_LINKS;
  protected readonly socials = SOCIAL_LINKS;
  protected readonly payments = PAYMENTS;

  protected readonly year = new Date().getFullYear();
}
