<script lang="ts">
	import Icon from './Icon.svelte';
	import { reveal } from '$lib/actions/reveal';
	import { parallax } from '$lib/actions/parallax';
	import { tilt } from '$lib/actions/tilt';
	import { STEPS } from '$lib/data/site';

	const visuals = [
		{
			big: '$ 86.400',
			label: 'Venta registrada en 2.4s',
			chips: ['Efectivo', 'Inventario −3', 'Ticket #1042']
		},
		{
			big: 'Todo cuadra',
			label: 'Caja, stock y reportes sincronizados',
			chips: ['Caja ✓', 'Bancos ✓', 'Inventario ✓']
		},
		{
			big: '+18%',
			label: 'Margen vs. mes anterior',
			chips: ['Punto de equilibrio', 'Recaudo real', 'Utilidad']
		}
	];
</script>

<section id="how" class="relative scroll-mt-24 overflow-hidden py-20 sm:py-28">
	<div class="pointer-events-none absolute inset-0 -z-10">
		<div class="absolute top-1/4 left-1/2 -ml-[15rem]" use:parallax={{ speed: 0.35 }}>
			<div
				class="orb animate-drift h-[30rem] w-[30rem]"
				style="background:radial-gradient(circle,#6366f1,transparent 65%);opacity:0.25"
			></div>
		</div>
	</div>

	<div class="mx-auto max-w-7xl px-4 sm:px-6">
		<div class="mx-auto max-w-2xl text-center">
			<span
				class="reveal border-brand/30 bg-brand/10 text-brand inline-block rounded-full border px-3 py-1 text-xs font-semibold tracking-wider uppercase"
				use:reveal
			>
				Cómo funciona
			</span>
			<h2
				class="reveal mt-5 text-3xl font-extrabold tracking-tight sm:text-5xl"
				use:reveal={{ delay: 80 }}
			>
				<span class="text-gradient-soft">De vender</span>
				<span class="text-gradient">a crecer</span>
			</h2>
			<p class="reveal text-fg-muted mx-auto mt-4 max-w-xl" use:reveal={{ delay: 140 }}>
				No es solo cobrar. Es tener el control total de tu negocio y la claridad para hacerlo crecer.
			</p>
		</div>

		<div class="mt-16 flex flex-col gap-16 sm:gap-24">
			{#each STEPS as step, i (step.title)}
				<div class="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
					<!-- texto -->
					<div
						class="reveal {i % 2 === 0 ? 'reveal-left' : 'reveal-right lg:order-2'}"
						use:reveal
					>
						<div class="flex items-center gap-3">
							<span
								class="shadow-glow flex h-11 w-11 items-center justify-center rounded-xl text-white"
								style="background:linear-gradient(135deg,#8b5cf6,#6366f1 60%,#22d3ee)"
							>
								<Icon name={step.icon} size={20} />
							</span>
							<span class="text-brand text-sm font-semibold tracking-[0.18em] uppercase">
								0{i + 1} · {step.kicker}
							</span>
						</div>
						<h3 class="text-fg mt-5 text-2xl font-bold tracking-tight sm:text-3xl">{step.title}</h3>
						<p class="text-fg-muted mt-3 max-w-md">{step.desc}</p>
					</div>

					<!-- visual con parallax + tilt -->
					<div
						class="reveal {i % 2 === 0 ? 'reveal-right' : 'reveal-left lg:order-1'}"
						use:reveal={{ delay: 120 }}
					>
						<div use:parallax={{ speed: 0.16 }}>
							<div
								class="tilt-spot bg-surface/70 relative overflow-hidden rounded-2xl border border-white/[0.08] p-6 backdrop-blur-xl sm:p-8"
								use:tilt={{ max: 5, scale: 1.015 }}
							>
								<div
									class="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full blur-2xl"
									style="background:radial-gradient(circle,rgba(34,211,238,0.35),transparent 70%)"
								></div>
								<div
									class="font-display text-fg text-4xl font-extrabold tracking-tight sm:text-5xl"
								>
									{visuals[i].big}
								</div>
								<p class="text-fg-muted mt-2 text-sm">{visuals[i].label}</p>
								<div class="mt-6 flex flex-wrap gap-2">
									{#each visuals[i].chips as chip (chip)}
										<span
											class="text-fg-muted inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs"
										>
											<span class="bg-mint h-1.5 w-1.5 rounded-full"></span>
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
