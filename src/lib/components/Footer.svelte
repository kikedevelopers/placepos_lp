<script lang="ts">
	import Logo from './Logo.svelte';
	import { SITE } from '$lib/data/site';

	const groups = [
		{
			title: 'Producto',
			links: [
				{ label: 'Funciones', href: '#features' },
				{ label: 'Cómo funciona', href: '#how' },
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
			title: 'Contacto',
			links: [
				{ label: SITE.email, href: `mailto:${SITE.email}` },
				{ label: 'Contáctanos', href: '#cta' }
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
				<p class="mt-4 max-w-xs text-sm text-fg-muted">
					El ERP todo-en-uno para hacer crecer tu negocio: vende, controla y decide con datos en
					tiempo real.
				</p>
			</div>
			{#each groups as group (group.title)}
				<div>
					<h3 class="font-display text-sm font-semibold text-fg">{group.title}</h3>
					<ul class="mt-4 flex flex-col gap-2.5">
						{#each group.links as link (link.label)}
							<li>
								<a
									href={link.href}
									class="text-sm text-fg-muted transition-colors hover:text-fg"
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
			<p class="text-xs text-fg-faint">© {year} {SITE.name}. Todos los derechos reservados.</p>
			<div class="flex items-center gap-5 text-xs text-fg-faint">
				<a href="#top" class="transition-colors hover:text-fg">Privacidad</a>
				<a href="#top" class="transition-colors hover:text-fg">Términos</a>
				<a href="#top" class="transition-colors hover:text-fg">Volver arriba ↑</a>
			</div>
		</div>
	</div>
</footer>
