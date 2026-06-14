<script lang="ts">
	import Icon from './Icon.svelte';

	// Réplica fiel del dashboard de PlacePos (app de escritorio, tema oscuro).
	const nav = [
		{ icon: 'home', label: 'Inicio', active: true },
		{ icon: 'layers', label: 'Catálogos' },
		{ icon: 'piggy', label: 'Tesorería' },
		{ icon: 'users', label: 'Terceros' },
		{ icon: 'truck', label: 'Proveedores' },
		{ icon: 'chart', label: 'Informes' },
		{ icon: 'receipt', label: 'Gastos' }
	];

	const totals = [
		{ label: 'Recaudo', value: '$ 2.480.500', color: '#66b3ff' },
		{ label: 'Ganancia', value: '$ 612.300', color: '#2ebf97' },
		{ label: 'Créditos', value: '$ 180.000', color: '#ffc107' },
		{ label: 'Gastos', value: '$ 96.000', color: '#ff6b7a' }
	];

	const top = [
		{ name: 'Arroz Diana 500g', qty: 142, sale: '$ 426.000', margin: '32%', w: 100 },
		{ name: 'Aceite Premier 1L', qty: 98, sale: '$ 294.000', margin: '28%', w: 70 },
		{ name: 'Gaseosa 1.5L', qty: 76, sale: '$ 190.000', margin: '24%', w: 54 }
	];
</script>

<div
	class="relative flex w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0e27] shadow-2xl"
	role="img"
	aria-label="Vista del dashboard de PlacePos"
>
	<!-- Sidebar (app de escritorio) -->
	<aside
		class="hidden w-[150px] shrink-0 flex-col border-r border-slate-700/40 bg-gradient-to-b from-slate-900 via-slate-800/90 to-slate-900 p-3 md:flex"
	>
		<div class="flex items-center gap-2 px-1 pb-4">
			<span
				class="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-[11px] font-bold text-white"
				>E&G</span
			>
			<span class="truncate text-xs font-bold text-white">Esencia & Granos</span>
		</div>
		<nav class="flex flex-1 flex-col gap-0.5">
			{#each nav as item (item.label)}
				<span
					class="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] font-medium {item.active
						? 'border border-blue-500/30 bg-blue-500/15 text-white'
						: 'text-slate-400'}"
				>
					<Icon name={item.icon} size={15} />
					{item.label}
				</span>
			{/each}
		</nav>
	</aside>

	<!-- Contenido -->
	<div class="min-w-0 flex-1">
		<!-- barra de ventana de escritorio (sin URL) -->
		<div class="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
			<span class="h-3 w-3 rounded-full bg-[#ff5f57]"></span>
			<span class="h-3 w-3 rounded-full bg-[#febc2e]"></span>
			<span class="h-3 w-3 rounded-full bg-[#28c840]"></span>
			<span class="ml-2 text-xs font-medium text-slate-400">PlacePos · Dashboard</span>
			<span class="ml-auto inline-flex items-center gap-1.5 text-[10px] text-[#2ebf97]">
				<span class="h-1.5 w-1.5 rounded-full bg-[#2ebf97]"></span> en vivo
			</span>
		</div>

		<div class="space-y-3 p-3 sm:p-4">
			<div>
				<h3 class="font-display text-base font-bold text-white sm:text-lg">Dashboard</h3>
				<p class="text-[11px] text-[#a4b0c4]">Resumen en tiempo real de tu negocio</p>
			</div>

			<!-- Fila 1: Meta del mes (2) + Gastos fijos (1) -->
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
				<!-- Meta del mes -->
				<div class="rounded-xl border border-[#2a3550] bg-[#131830] p-4 sm:col-span-2">
					<div class="flex items-center gap-2.5">
						<span
							class="flex h-8 w-8 items-center justify-center rounded-lg border border-[#66b3ff]/30 bg-[#66b3ff]/15 text-[#66b3ff]"
						>
							<Icon name="target" size={16} />
						</span>
						<div>
							<div class="text-[12px] font-semibold text-white">Meta del mes</div>
							<div class="text-[10px] text-[#a4b0c4]">1 jun – 30 jun 2026</div>
						</div>
					</div>
					<div class="mt-4 flex items-end justify-between">
						<div>
							<span class="font-display text-xl font-bold text-white sm:text-2xl">$ 38.4M</span>
							<span class="text-[10px] text-[#a4b0c4]"> de $ 52M</span>
						</div>
						<span class="text-sm font-bold text-[#2ebf97]">74%</span>
					</div>
					<div class="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[#1f263b]">
						<div
							class="h-full rounded-full"
							style="width:74%;background:linear-gradient(90deg,#66b3ff,#2ebf97)"
						></div>
					</div>
					<div class="mt-4 grid grid-cols-3 gap-2 border-t border-[#2a3550] pt-3">
						<div>
							<div class="text-[9px] uppercase tracking-wide text-[#a4b0c4]">Cuota diaria</div>
							<div class="text-[13px] font-bold text-white">$ 1.73M</div>
						</div>
						<div>
							<div class="text-[9px] uppercase tracking-wide text-[#a4b0c4]">Ganancia hoy</div>
							<div class="text-[13px] font-bold text-white">$ 612K</div>
						</div>
						<div class="rounded-lg border border-[#2ebf97]/30 bg-[#2ebf97]/10 px-2 py-1">
							<div class="text-[9px] uppercase tracking-wide text-[#2ebf97]">Meta lograda</div>
							<div class="text-[12px] font-bold text-[#2ebf97]">+$ 84K</div>
						</div>
					</div>
				</div>

				<!-- Gastos fijos -->
				<div class="rounded-xl border border-[#2a3550] bg-[#131830] p-4">
					<div class="flex items-center gap-2.5">
						<span
							class="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/15 text-violet-300"
						>
							<Icon name="wallet" size={16} />
						</span>
						<div>
							<div class="text-[12px] font-semibold text-white">Gastos fijos</div>
							<div class="text-[10px] text-[#a4b0c4]">Acumulado en vivo</div>
						</div>
					</div>
					<div class="mt-4 space-y-2">
						<div class="flex items-center justify-between text-[11px]">
							<span class="text-[#a4b0c4]">Arriendo</span>
							<span class="font-semibold text-white">$ 1.0M</span>
						</div>
						<div class="flex items-center justify-between text-[11px]">
							<span class="text-[#a4b0c4]">Servicios</span>
							<span class="font-semibold text-white">$ 420K</span>
						</div>
						<div class="flex items-center justify-between text-[11px]">
							<span class="text-[#a4b0c4]">Nómina</span>
							<span class="font-semibold text-white">$ 2.4M</span>
						</div>
					</div>
					<div class="mt-3 flex items-center justify-between border-t border-[#2a3550] pt-2">
						<span class="text-[9px] uppercase tracking-wide text-[#a4b0c4]">Total</span>
						<span class="text-[13px] font-bold text-white">$ 3.82M</span>
					</div>
				</div>
			</div>

			<!-- Fila 2: Rendimiento (2) + Top productos (1) -->
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
				<!-- Rendimiento -->
				<div class="rounded-xl border border-[#2a3550] bg-[#131830] p-4 sm:col-span-2">
					<div class="flex items-center justify-between">
						<div class="text-[12px] font-semibold text-white">Rendimiento</div>
						<span class="rounded-md border border-[#66b3ff]/40 bg-[#66b3ff]/15 px-2 py-0.5 text-[10px] text-white">7 días</span>
					</div>
					<div class="mt-3 grid grid-cols-4 gap-1.5">
						{#each totals as t (t.label)}
							<div class="rounded-lg border border-[#2a3550] bg-[#1f263b]/50 px-2 py-1.5">
								<div class="text-[8px] uppercase tracking-wide text-[#a4b0c4]">{t.label}</div>
								<div class="text-[11px] font-bold tabular-nums" style="color:{t.color}">{t.value}</div>
							</div>
						{/each}
					</div>
					<!-- mini area chart -->
					<div class="mt-3">
						<svg viewBox="0 0 320 90" class="h-20 w-full" preserveAspectRatio="none">
							<defs>
								<linearGradient id="ppArea" x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stop-color="#66b3ff" stop-opacity="0.35" />
									<stop offset="100%" stop-color="#66b3ff" stop-opacity="0" />
								</linearGradient>
							</defs>
							<path
								d="M0,70 C30,55 50,60 80,42 C110,26 130,48 160,38 C190,28 210,18 240,24 C270,29 295,14 320,18 L320,90 L0,90 Z"
								fill="url(#ppArea)"
							/>
							<path
								d="M0,70 C30,55 50,60 80,42 C110,26 130,48 160,38 C190,28 210,18 240,24 C270,29 295,14 320,18"
								fill="none"
								stroke="#66b3ff"
								stroke-width="2"
							/>
							<path
								d="M0,80 C30,74 50,76 80,68 C110,60 130,66 160,62 C190,58 210,52 240,55 C270,57 295,50 320,52"
								fill="none"
								stroke="#2ebf97"
								stroke-width="1.6"
								stroke-opacity="0.8"
							/>
						</svg>
						<div class="mt-1 flex justify-between text-[8px] text-[#a4b0c4]">
							<span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span
								>Sáb</span
							><span>Dom</span>
						</div>
					</div>
				</div>

				<!-- Productos más vendidos -->
				<div class="rounded-xl border border-[#2a3550] bg-[#131830] p-4">
					<div class="flex items-center gap-2.5">
						<span
							class="flex h-8 w-8 items-center justify-center rounded-lg border border-[#66b3ff]/30 bg-[#66b3ff]/15 text-[#66b3ff]"
						>
							<Icon name="trending" size={15} />
						</span>
						<div class="text-[12px] font-semibold text-white">Más vendidos</div>
					</div>
					<ul class="mt-3 space-y-2.5">
						{#each top as p, i (p.name)}
							<li class="flex items-center gap-2.5">
								<span
									class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[11px] font-bold tabular-nums {i ===
									0
										? 'border-[#ffc107]/40 bg-[#ffc107]/10 text-[#ffc107]'
										: 'border-[#2a3550] bg-[#1f263b] text-[#a4b0c4]'}"
								>
									{#if i === 0}<Icon name="trophy" size={13} />{:else}{i + 1}{/if}
								</span>
								<div class="min-w-0 flex-1">
									<div class="flex items-baseline justify-between gap-2">
										<span class="truncate text-[11px] font-semibold text-white">{p.name}</span>
										<span class="shrink-0 text-[11px] font-bold text-white">{p.qty}</span>
									</div>
									<div class="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#1f263b]">
										<div
											class="h-full rounded-full"
											style="width:{p.w}%;background:{i === 0 ? '#ffc107' : '#66b3ff'}"
										></div>
									</div>
									<div class="mt-1 flex items-center gap-2 text-[9px] text-[#a4b0c4]">
										<span>Venta {p.sale}</span>
										<span class="text-[#2ebf97]">{p.margin}</span>
									</div>
								</div>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	</div>
</div>
