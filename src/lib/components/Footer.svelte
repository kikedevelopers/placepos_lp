<script lang="ts">
	import { base } from '$app/paths';
	import Logo from './Logo.svelte';
	import { SITE } from '$lib/data/site';

	const groups = [
		{
			title: 'Producto',
			links: [
				{ label: 'Funciones', href: '#features' },
				{ label: 'Cómo funciona', href: '#how' },
				{ label: 'Precios', href: '#precios' },
				{ label: 'Clientes', href: '#testimonios' },
				{ label: 'Preguntas', href: '#faq' }
			]
		},
		{
			title: 'Negocio',
			links: [
				{ label: 'Punto de venta', href: '#features' },
				{ label: 'Inventario', href: '#features' },
				{ label: 'Finanzas', href: '#features' },
				{ label: 'Multi-sucursal', href: '#features' }
			]
		},
		{
			// El teléfono salió de la landing y las redes entran después; por ahora
			// el correo es el único canal, y "Contáctanos" ya no puede apuntar a la
			// sección de descarga porque allí no hay a quién escribirle.
			title: 'Contacto',
			links: [
				{ label: SITE.email, href: `mailto:${SITE.email}` },
				{ label: 'Descargar PlacePos', href: '#cta' }
			]
		}
	];
	const year = 2026;
</script>

<footer class="relative border-t border-white/[0.07] pt-16 pb-10">
	<div class="mx-auto max-w-7xl px-4 sm:px-6">
		<div class="grid grid-cols-2 gap-10 md:grid-cols-4">
			<div class="col-span-2 md:col-span-1">
				<Logo />
				<p class="text-fg-muted mt-4 max-w-xs text-sm">
					El ERP todo-en-uno para hacer crecer tu negocio: vende, controla y decide con datos en
					tiempo real.
				</p>
			</div>
			{#each groups as group (group.title)}
				<div>
					<h3 class="font-display text-fg text-sm font-semibold">{group.title}</h3>
					<ul class="mt-4 flex flex-col gap-2.5">
						{#each group.links as link (link.label)}
							<li>
								<a
									href={link.href}
									class="text-fg-muted hover:text-fg inline-block text-sm transition-[color,transform] duration-200 ease-[var(--ease-out)] hover:translate-x-0.5"
								>
									{link.label}
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>

		<div
			class="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-6 sm:flex-row"
		>
			<p class="text-fg-faint text-xs">© {year} {SITE.name}. Todos los derechos reservados.</p>
			<div class="text-fg-faint flex items-center gap-5 text-xs">
				<a href="{base}/privacidad" class="hover:text-fg transition-colors">Privacidad</a>
				<a href="{base}/terminos" class="hover:text-fg transition-colors">Términos</a>
				<a href="{base}/eliminacion-datos" class="hover:text-fg transition-colors">
					Eliminación de datos
				</a>
				<a href="#top" class="hover:text-fg transition-colors">Volver arriba ↑</a>
			</div>
		</div>
	</div>
</footer>
