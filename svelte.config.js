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
			// En local (pnpm dev) se sirve en la raíz; en GitHub Pages se sirve
			// bajo el nombre del repo: kikedevelopers.github.io/placepos_lp
			base: process.env.ENVIRONMENT === 'development' ? '' : '/placepos_lp'
		}
	}
};

export default config;
