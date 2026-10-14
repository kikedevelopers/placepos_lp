import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			// SPA fallback para las rutas DINÁMICAS que no se pueden prerenderizar
			// (el catálogo público `/catalog/[slug]`: los slugs no se conocen en
			// build). El resto del sitio se sigue prerenderizando; GitHub Pages
			// sirve `404.html` para cualquier ruta sin archivo y la app hidrata y
			// enruta en el cliente. Las páginas estáticas no se ven afectadas.
			fallback: '404.html',
			precompress: false,
			strict: true
		}),
		paths: {
			// El sitio se sirve en la RAÍZ del dominio propio placepos.kikedevs.com
			// (custom domain de GitHub Pages, ver static/CNAME), no bajo el nombre
			// del repo. Por eso el base va vacío: con `/placepos_lp` las rutas daban
			// 404. SvelteKit genera paths relativos, así que también funciona si se
			// abre por la URL github.io/placepos_lp.
			base: ''
		}
	}
};

export default config;
