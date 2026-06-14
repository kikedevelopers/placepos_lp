<script lang="ts">
	const items = [
		'Punto de venta',
		'Inventario',
		'Compras',
		'Gastos',
		'Tesorería',
		'Créditos',
		'Reportes',
		'Multi-sucursal',
		'Notificaciones en vivo'
	];
	const loop = [...items, ...items];
</script>

<section class="relative border-y border-white/[0.06] py-6" aria-label="Todo lo que incluye PlacePos">
	<p class="mb-4 text-center text-xs font-medium uppercase tracking-[0.2em] text-fg-faint">
		Todo lo que tu negocio necesita, en un solo lugar
	</p>
	<div
		class="group relative flex overflow-hidden"
		style="mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)"
	>
		<div class="animate-marquee flex shrink-0 items-center gap-3 pr-3">
			{#each loop as item, i (i)}
				<span
					class="card-hairline inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm text-fg-muted"
				>
					<span class="h-1.5 w-1.5 rounded-full bg-brand"></span>
					{item}
				</span>
			{/each}
		</div>
	</div>
</section>
