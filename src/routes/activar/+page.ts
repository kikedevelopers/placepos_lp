// La página se prerenderiza (sitio estático), pero el token vive en la query y
// el canje ocurre en el navegador: por eso no hay `load` de servidor. El token
// NUNCA debe viajar a un servidor de la landing ni quedar en sus logs.
export const prerender = true;
