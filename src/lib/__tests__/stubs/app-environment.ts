/**
 * Stub de `$app/environment` para los tests.
 *
 * `site.ts` lo usa para decidir a qué API apunta la landing. En tests da igual
 * el valor: lo que se comprueba son los textos y los precios, no el entorno.
 */
export const dev = true;
export const browser = false;
export const building = false;
export const version = 'test';
