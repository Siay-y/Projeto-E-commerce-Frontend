import { formatBRL } from '../format/money';
import { FREE_SHIPPING_FROM, LOWERED_SHIPPING_FROM } from '../shipping/free-shipping';

export const D20_SIDES = 20;

export type RewardTier = 'floor' | 'shipping' | 'gift' | 'critical';

export interface Reward {
  readonly tier: RewardTier;
  readonly headline: string;
  readonly detail: string;
  readonly freeShipping: boolean;
  readonly shippingFrom: number;
  readonly gift: boolean;
}

export interface Roll {
  readonly value: number;
  readonly reward: Reward;
}

export function rewardFor(value: number): Reward {
  if (value >= D20_SIDES) {
    return {
      tier: 'critical',
      headline: 'Acerto crítico',
      detail: `Frete grátis, brinde surpresa e o broche exclusivo da guilda.`,
      freeShipping: true,
      shippingFrom: 0,
      gift: true,
    };
  }

  if (value >= 18) {
    return {
      tier: 'gift',
      headline: 'Frete grátis e um brinde',
      detail: 'O frete sai por nossa conta e vai um brinde surpresa na caixa.',
      freeShipping: true,
      shippingFrom: 0,
      gift: true,
    };
  }

  if (value >= 10) {
    return {
      tier: 'shipping',
      headline: 'Frete grátis',
      detail: 'O frete deste pedido sai por nossa conta, sem valor mínimo.',
      freeShipping: true,
      shippingFrom: 0,
      gift: false,
    };
  }

  return {
    tier: 'floor',
    headline: `Frete grátis a partir de ${formatBRL(LOWERED_SHIPPING_FROM)}`,
    detail: `O piso cai de ${formatBRL(FREE_SHIPPING_FROM)} para ${formatBRL(
      LOWERED_SHIPPING_FROM,
    )} neste pedido.`,
    freeShipping: false,
    shippingFrom: LOWERED_SHIPPING_FROM,
    gift: false,
  };
}
