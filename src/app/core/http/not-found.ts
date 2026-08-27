import { RESPONSE_INIT } from '@angular/core';

export function markNotFound(init: ResponseInit | null): void {
  if (init) init.status = 404;
}

export { RESPONSE_INIT };
