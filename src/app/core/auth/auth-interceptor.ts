import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { PLATFORM_ID, inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { API_BASE_URL } from '../config/api';
import { AuthStore } from './auth-store';

const CSRF_COOKIE = 'ac-csrf';
const CSRF_HEADER = 'X-CSRF-Token';

const SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);

const PROBES = ['/auth/sessao', '/auth/entrar', '/auth/cadastro'];

function readCookie(document: Document, name: string): string | null {
  for (const part of document.cookie.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }

  return null;
}

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const base = inject(API_BASE_URL);

  if (!request.url.startsWith(base)) return next(request);

  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  const document = inject(DOCUMENT);
  const auth = inject(AuthStore);

  let sending = request.clone({ withCredentials: true });

  if (isBrowser && !SAFE.has(sending.method.toUpperCase())) {
    const token = readCookie(document, CSRF_COOKIE);
    if (token) sending = sending.clone({ setHeaders: { [CSRF_HEADER]: token } });
  }

  return next(sending).pipe(
    catchError((error: unknown) => {
      const response = error as HttpErrorResponse;
      const probing = PROBES.some((path) => request.url.endsWith(path));

      if (response.status === 401 && !probing) auth.clear();

      return throwError(() => error);
    }),
  );
};
