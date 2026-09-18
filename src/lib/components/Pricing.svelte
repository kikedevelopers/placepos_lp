<script lang="ts">
	import { base } from '$app/paths';
	import Icon from './Icon.svelte';
	import { reveal } from '$lib/actions/reveal';
	import { parallax } from '$lib/actions/parallax';
	import { PRICING, type PlanId } from '$lib/data/pricing';
	import { session } from '$lib/stores/session.svelte';
	import { buildPlans, dailyCost, formatCop } from '$lib/utils/pricing';

	const plans = buildPlans();

	/**
	 * A dónde lleva el botón de un plan.
	 *
	 * Para contratar hay que tener cuenta, así que quien no ha entrado va al
	 * login (que ofrece registrarse) y quien ya entró va directo a su panel. El
	 * plan elegido viaja en la URL para que, después de dar el rodeo, llegue al
	 * plan que había escogido y no a una pantalla en blanco.
	 */
	const planHref = (id: PlanId): string =>
		session.ready && session.isAuthenticated
			? `${base}/panel?plan=${id}`
			: `${base}/ingresar?plan=${id}`;
</script>

<section id="precios" class="relative scroll-mt-24 overflow-hidden py-20 sm:py-28">
	<div
		class="orb top-1/4 left-1/2 h-96 w-96 -translate-x-1/2"
		style="background:radial-gradient(circle,#7c5cff,transparent 65%);opacity:0.25"
		use:parallax={{ speed: 0.3 }}
	></div>

	<div class="relative mx-auto max-w-7xl px-4 sm:px-6">
		<div class="mx-auto max-w-2xl text-center">
			<span
				class="reveal border-brand/30 bg-brand/10 text-brand inline-block rounded-full border px-3 py-1 text-xs font-semibold tracking-wider uppercase"
				use:reveal
			>
				Precios sin letra menuda
			</span>
			<h2
				class="reveal mt-5 text-3xl font-extrabold tracking-tight sm:text-5xl"
				use:reveal={{ delay: 80 }}
			>
				<span class="text-gradient-soft">Tu negocio completo</span><br />
				<span class="text-gradient animate-gradient">desde {formatCop(dailyCost())} al día</span>
			</h2>
			<p class="reveal text-fg-muted mx-auto mt-4 max-w-xl" use:reveal={{ delay: 140 }}>
				Los dos planes traen exactamente lo mismo: todos los módulos, todas las actualizaciones,
				todo tu equipo. La única diferencia es cuánto terminas pagando por lo mismo.
			</p>
		</div>

		<!-- `items-stretch`: las dos tarjetas miden lo mismo aunque una tenga un
		     beneficio más, así los dos botones caen a la misma altura y la
		     comparación no se lee como "a esta le falta algo". -->
		<div class="mx-auto mt-14 grid max-w-4xl items-stretch gap-6 md:grid-cols-2">
			{#each plans as plan, i (plan.id)}
				<article
					class="reveal relative flex flex-col rounded-3xl p-7 transition-all duration-300 sm:p-8 {plan.highlighted
						? 'border-brand/40 bg-surface shadow-glow border md:-mt-4 md:pb-10'
						: 'card-hairline bg-surface/40 hover:border-line/80'}"
					use:reveal={{ delay: i * 110 }}
				>
					{#if plan.highlighted}
						<!-- Resplandor propio: la tarjeta que queremos que gane también se ve
						     como la que gana. -->
						<div
							class="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full blur-3xl"
							style="background:radial-gradient(circle,rgba(124,92,255,0.5),transparent 70%)"
						></div>
					{/if}

					{#if plan.badge}
						<div class="absolute -top-3.5 left-1/2 -translate-x-1/2">
							<span
								class="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap text-white shadow-lg"
								style="background:linear-gradient(135deg,#8b5cf6,#6366f1 55%,#22d3ee)"
							>
								<Icon name="sparkles" size={13} />
								{plan.badge}
							</span>
						</div>
					{/if}

					<div class="relative">
						<h3 class="font-display text-fg text-xl font-bold {plan.badge ? 'mt-3' : ''}">
							{plan.name}
						</h3>
						<p class="text-fg-faint mt-1 text-sm">{plan.kicker}</p>

						<div class="mt-6 flex items-end gap-2">
							<span
								class="font-display text-4xl font-extrabold tracking-tight sm:text-5xl {plan.highlighted
									? 'text-gradient'
									: 'text-fg-muted'}"
							>
								{plan.price}
							</span>
							<span class="text-fg-faint pb-1.5 text-sm">{plan.period}</span>
						</div>

						{#if plan.strikethrough}
							<!-- El precio que el cliente NO va a pagar, junto al que sí. Es la
							     comparación completa en una sola línea. -->
							<p class="text-fg-faint mt-2 text-sm">
								en vez de <s class="decoration-amber/70 decoration-2">{plan.strikethrough}</s> al mes
							</p>
						{/if}

						<p
							class="mt-2 text-sm font-medium {plan.highlighted
								? 'text-mint'
								: 'text-fg-faint'}"
						>
							{plan.billing_note}
						</p>
					</div>

					<ul class="relative mt-7 flex flex-1 flex-col gap-3.5">
						{#each plan.features as feature (feature.text)}
							<li class="flex items-start gap-3">
								<span
									class="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full {feature.icon ===
									'alert'
										? 'bg-amber/15 text-amber'
										: plan.highlighted
											? 'bg-mint/15 text-mint'
											: 'bg-white/[0.06] text-fg-faint'}"
								>
									<Icon name={feature.icon} size={12} />
								</span>
								<span
									class="text-sm leading-relaxed {feature.icon === 'alert'
										? 'text-amber/90 font-medium'
										: 'text-fg-muted'}"
								>
									{feature.text}
								</span>
							</li>
						{/each}
					</ul>

					<a
						href={planHref(plan.id)}
						class="relative mt-8 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-base font-semibold transition-all duration-200 active:scale-[0.98] {plan.highlighted
							? 'hover:shadow-glow text-white'
							: 'text-fg border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08]'}"
						style={plan.highlighted
							? 'background:linear-gradient(135deg,#8b5cf6,#6366f1 55%,#22d3ee)'
							: ''}
					>
						{plan.cta}
						{#if plan.highlighted}
							<Icon name="arrow" size={16} />
						{/if}
					</a>
				</article>
			{/each}
		</div>

		<!-- El riesgo, invertido: lo último que se lee antes de decidir es que
		     decidir no cuesta nada. -->
		<div class="reveal mx-auto mt-10 max-w-2xl text-center" use:reveal={{ delay: 220 }}>
			<p class="text-fg-muted text-sm">
				<span class="text-fg font-semibold"
					>Los dos empiezan con {PRICING.trial_days} días gratis.</span
				>
				Sin tarjeta y sin datos de pago: instalas, lo usas con tu negocio real y decides después.
			</p>
			<p class="text-fg-faint mt-3 text-xs">
				Precios en pesos colombianos, por negocio. ¿Tienes más de una sede? Cada sucursal adicional
				se cotiza aparte.
			</p>
		</div>
	</div>
</section>
