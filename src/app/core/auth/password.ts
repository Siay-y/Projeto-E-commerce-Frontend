/**
 * Regras de senha seguindo a NIST 800-63B.
 */
export const MIN_PASSWORD = 8;

export const MAX_PASSWORD = 128;

/**
 * Lista curta das senhas que realmente aparecem em vazamento brasileiro. 
 */
const COMMON = new Set([
  '12345678',
  '123456789',
  '1234567890',
  'senha123',
  'password',
  'password1',
  'qwerty123',
  'abc12345',
  'brasil123',
  'flamengo',
  'corinthians',
  'teste123',
  'admin123',
  'iloveyou',
  '11223344',
  'naruto123',
  'anime123',
]);

export type PasswordVerdict =
  | { readonly ok: false; readonly reason: string }
  | { readonly ok: true };

export interface PasswordStrength {
  readonly score: number;
  readonly label: string;
}

export interface PasswordContext {
  readonly name?: string;
  readonly email?: string;
}

function pieces(context: PasswordContext): string[] {
  const out: string[] = [];

  for (const part of (context.name ?? '').split(/\s+/)) {
    if (part.length >= 4) out.push(part.toLowerCase());
  }

  const local = (context.email ?? '').split('@')[0] ?? '';
  if (local.length >= 4) out.push(local.toLowerCase());

  return out;
}

export function checkPassword(
  password: string,
  context: PasswordContext = {},
): PasswordVerdict {
  if (password.length < MIN_PASSWORD) {
    return { ok: false, reason: `Use pelo menos ${MIN_PASSWORD} caracteres.` };
  }

  if (password.length > MAX_PASSWORD) {
    return { ok: false, reason: `Use no máximo ${MAX_PASSWORD} caracteres.` };
  }

  const lower = password.toLowerCase();

  if (COMMON.has(lower)) {
    return { ok: false, reason: 'Esta senha aparece em vazamentos conhecidos.' };
  }

  if (/^(.)\1+$/.test(password)) {
    return { ok: false, reason: 'Repetir o mesmo caractere não protege nada.' };
  }

  for (const part of pieces(context)) {
    if (lower.includes(part)) {
      return { ok: false, reason: 'A senha não pode conter seu nome nem seu e-mail.' };
    }
  }

  return { ok: true };
}

const LABELS = ['Muito fraca', 'Fraca', 'Razoável', 'Boa', 'Forte'];

/**
 * Medidor visual. Serve de incentivo, nunca de porteiro: quem decide se a senha
 * passa e checkPassword, e depois a API.
 */
export function strengthOf(
  password: string,
  context: PasswordContext = {},
): PasswordStrength {
  if (password.length === 0) return { score: 0, label: '' };

  if (!checkPassword(password, context).ok) {
    return { score: 0, label: LABELS[0] };
  }

  let score = 1;

  if (password.length >= 12) score++;
  if (password.length >= 16) score++;

  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^\w\s]/].filter((re) =>
    re.test(password),
  ).length;

  if (variety >= 3) score++;

  score = Math.min(4, score);

  return { score, label: LABELS[score] };
}
