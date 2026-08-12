// Igual que /activar: la página se prerenderiza, pero el token vive en la query
// y solo lo lee el navegador. No hay `load` de servidor a propósito — este token
// permite cambiar una contraseña y no debe pasar por ningún log intermedio.
export const prerender = true;
