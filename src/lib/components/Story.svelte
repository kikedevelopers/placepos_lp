<script lang="ts">
	import Icon from './Icon.svelte';
	import { reveal } from '$lib/actions/reveal';
	import { parallax } from '$lib/actions/parallax';
	import { STEPS } from '$lib/data/site';

	const visuals = [
		{ big: '$ 86.400', label: 'Venta registrada en 2.4s', chips: ['Efectivo', 'Inventario −3', 'Ticket #1042'] },
		{ big: 'Todo cuadra', label: 'Caja, stock y reportes sincronizados', chips: ['Caja ✓', 'Bancos ✓', 'Inventario ✓'] },
		{ big: '+18%', label: 'Margen vs. mes anterior', chips: ['Punto de equilibrio', 'Recaudo real', 'Utilidad'] }
	];
</script>

<section id="how" class="relative scroll-mt-24 overflow-hidden py-20 sm:py-28">
	<div
		class="orb left-1/2 top-1/4 h-[30rem] w-[30rem] -translate-x-1/2"
		style="background:radial-gradient(circle,#6366f1,transparent 65%);opacity:0.25"
		use:parallax={{ speed: 0.35 }}
	></div>

	<div class="mx-auto max-w-7xl px-4 sm:px-6">
		<div class="mx-auto max-w-2xl text-center">
			<span
				class="reveal inline-block rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand"
				use:reveal
			>
				Cómo funciona
			</span>
			<h2 class="reveal mt-5 text-3xl font-extrabold tracking-tight sm:text-5xl" use:reveal={{ delay: 80 }}>
				<span class="text-gradient-soft">De vender</span>
				<span class="text-gradient">a crecer</span>
			</h2>
			<p class="reveal mx-auto mt-4 max-w-xl text-fg-muted" use:reveal={{ delay: 140 }}>
				No es solo cobrar. Es tener el control total de tu negocio y la claridad para hacerlo crecer.
			</p>
		</div>

		<div class="mt-16 flex flex-col gap-16 sm:gap-24">
			{#each STEPS as step, i (step.title)}
				<div class="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
					<!-- texto -->
					<div class="reveal {i % 2 === 1 ? 'lg:order-2' : ''}" use:reveal>
						<div class="flex items-center gap-3">
							<span
								class="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-glow"
								style="background:linear-gradient(135deg,#8b5cf6,#6366f1 60%,#22d3ee)"
							>
								<Icon name={step.icon} size={20} />
							</span>
							<span class="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
								0{i + 1} · {step.kicker}
							</span>
						</div>
						<h3 class="mt-5 text-2xl font-bold tracking-tight text-fg sm:text-3xl">{step.title}</h3>
						<p class="mt-3 max-w-md text-fg-muted">{step.desc}</p>
					</div>

					<!-- visual con parallax -->
					<div class="reveal {i % 2 === 1 ? 'lg:order-1' : ''}" use:reveal={{ delay: 120 }}>
						<div use:parallax={{ speed: 0.16 }}>
							<div
								class="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-surface/70 p-6 backdrop-blur-xl sm:p-8"
							>
								<div
									class="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-2xl"
									style="background:radial-gradient(circle,rgba(34,211,238,0.35),transparent 70%)"
								></div>
								<div class="font-display text-4xl font-extrabold tracking-tight text-fg sm:text-5xl">
									{visuals[i].big}
								</div>
								<p class="mt-2 text-sm text-fg-muted">{visuals[i].label}</p>
								<div class="mt-6 flex flex-wrap gap-2">
									{#each visuals[i].chips as chip (chip)}
										<span
											class="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-fg-muted"
										>
											<span class="h-1.5 w-1.5 rounded-full bg-mint"></span>
											{chip}
										</span>
									{/each}
								</div>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
