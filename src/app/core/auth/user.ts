/** O que a API devolve sobre quem esta logado. Nunca inclui senha nem token. */
export interface User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

export type AuthErrorCode =
  | 'credenciais-invalidas'
  | 'email-em-uso'
  | 'dados-invalidos'
  | 'muitas-tentativas'
  | 'conta-bloqueada'
  | 'sessao-expirada'
  | 'rede'
  | 'servidor';

export const AUTH_MESSAGES: Record<AuthErrorCode, string> = {
  'credenciais-invalidas': 'E-mail ou senha incorretos.',
  'email-em-uso': 'Este e-mail já tem conta. Entre em vez de criar outra.',
  'dados-invalidos': 'Confira os campos destacados e tente de novo.',
  'muitas-tentativas': 'Tentativas demais. Espere alguns minutos e tente de novo.',
  'conta-bloqueada': 'Esta conta está bloqueada. Fale com o suporte.',
  'sessao-expirada': 'Sua sessão expirou. Entre de novo para continuar.',
  rede: 'Não conseguimos falar com o servidor. Verifique sua conexão.',
  servidor: 'Algo quebrou do nosso lado. Tente de novo em instantes.',
};

export function messageFor(code: AuthErrorCode): string {
  return AUTH_MESSAGES[code];
}

export function codeFrom(status: number, body: unknown): AuthErrorCode {
  const raw = (body as { error?: unknown } | null)?.error;

  if (typeof raw === 'string' && raw in AUTH_MESSAGES) {
    return raw as AuthErrorCode;
  }

  if (status === 0) return 'rede';
  if (status === 401) return 'credenciais-invalidas';
  if (status === 409) return 'email-em-uso';
  if (status === 422 || status === 400) return 'dados-invalidos';
  if (status === 423) return 'conta-bloqueada';
  if (status === 429) return 'muitas-tentativas';

  return 'servidor';
}
