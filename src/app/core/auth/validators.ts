export const MAX_EMAIL = 254;
export const MAX_NAME = 80;

const EMAIL = /^[^\s@]+@[^\s@.]+\.[^\s@]+$/;

export function checkEmail(value: string): string | null {
  const email = value.trim();

  if (email.length === 0) return 'Informe seu e-mail.';
  if (email.length > MAX_EMAIL) return 'Este e-mail é longo demais.';
  if (!EMAIL.test(email)) return 'Confira o e-mail: falta algo como nome@dominio.com.';

  return null;
}

export function checkName(value: string): string | null {
  const name = value.trim();

  if (name.length === 0) return 'Informe seu nome.';
  if (name.length < 2) return 'Nome curto demais.';
  if (name.length > MAX_NAME) return 'Nome longo demais.';
  if (/\d/.test(name)) return 'Nome não leva números.';

  return null;
}

/** Normaliza antes de mandar para a API: e-mail sempre em caixa baixa. */
export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}
