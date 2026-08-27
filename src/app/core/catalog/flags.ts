import { discountPercent } from '../format/money';
import { Product, cardAvailability, displayPrice, isSoldOut } from './product';

export type FlagKind = 'crit' | 'off' | 'print' | 'out';

export interface Flag {
  readonly kind: FlagKind;
  readonly text: string;
}

export function flagsFor(product: Product, limit = Infinity): readonly Flag[] {
  if (isSoldOut(cardAvailability(product))) return [{ kind: 'out', text: 'Esgotado' }];

  const flags: Flag[] = [];

  if (product.critical) flags.push({ kind: 'crit', text: 'Tiragem limitada' });

  const off = discountPercent(displayPrice(product), product.compareAt);
  if (off > 0) flags.push({ kind: 'off', text: `${off}% OFF` });

  if (product.printed) flags.push({ kind: 'print', text: 'Impresso em 3D' });

  return limit === Infinity ? flags : flags.slice(0, limit);
}
