// El catálogo es una ruta DINÁMICA por slug: no se puede prerenderizar (los
// slugs no se conocen en build) y se renderiza solo en el cliente, que pide el
// catálogo al API. El adapter sirve el fallback SPA para esta ruta.
export const prerender = false;
export const ssr = false;
