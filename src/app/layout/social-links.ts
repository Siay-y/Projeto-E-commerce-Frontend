import { SocialNetwork } from '../shared/ui/social-icon/social-icon';

export interface SocialLink {
  readonly network: SocialNetwork;
  readonly label: string;
  readonly href: string;
}

export const SOCIAL_LINKS: readonly SocialLink[] = [
  {
    network: 'instagram',
    label: 'Instagram da Acerto Crítico',
    href: 'https://instagram.com/acertocritico',
  },
  {
    network: 'whatsapp',
    label: 'Atendimento por WhatsApp',
    href: 'https://wa.me/5500000000000',
  },
  {
    network: 'x',
    label: 'Perfil da Acerto Crítico no X',
    href: 'https://x.com/acertocritico',
  },
  {
    network: 'tiktok',
    label: 'TikTok da Acerto Crítico',
    href: 'https://tiktok.com/@acertocritico',
  },
  {
    network: 'youtube',
    label: 'Canal da Acerto Crítico no YouTube',
    href: 'https://youtube.com/@acertocritico',
  },
];
