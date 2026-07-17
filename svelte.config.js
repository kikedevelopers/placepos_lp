import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: null,
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
