<script lang="ts">
	import Icon from './Icon.svelte';
	import DashboardMock from './DashboardMock.svelte';
	import { reveal } from '$lib/actions/reveal';
	import { parallax } from '$lib/actions/parallax';
	import { SITE } from '$lib/data/site';
</script>

<section id="top" class="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pb-28">
	<!-- Fondo -->
	<div class="bg-grid pointer-events-none absolute inset-0 -z-10"></div>
	<div
		class="orb -left-20 -top-24 h-[28rem] w-[28rem]"
		style="background:radial-gradient(circle,#7c5cff,transparent 65%)"
		use:parallax={{ speed: 0.35 }}
	></div>
	<div
		class="orb -right-24 top-10 h-[26rem] w-[26rem]"
		style="background:radial-gradient(circle,#22d3ee,transparent 65%);opacity:0.4"
		use:parallax={{ speed: 0.5 }}
	></div>
	<div
		class="orb bottom-0 left-1/3 h-[24rem] w-[24rem]"
		style="background:radial-gradient(circle,#5b8cff,transparent 65%);opacity:0.35"
		use:parallax={{ speed: 0.2 }}
	></div>

	<div class="mx-auto max-w-7xl px-4 sm:px-6">
		<div class="mx-auto max-w-3xl text-center">
			<div class="reveal flex justify-center" use:reveal>
				<span
					class="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-fg-muted"
				>
					<span class="relative flex h-2 w-2">
						<span
							class="absolute inline-flex h-full w-full rounded-full bg-mint opacity-75"
							style="animation:pulse-ring 1.8s var(--ease-out-quint) infinite"
						></span>
						<span class="relative inline-flex h-2 w-2 rounded-full bg-mint"></span>
					</span>
					Tu negocio entero, en una sola plataforma
				</span>
			</div>

			<h1
				class="reveal mt-6 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
				use:reveal={{ delay: 80 }}
			>
				<span class="text-gradient-soft">El ERP que pone tu</span><br class="hidden sm:block" />
				<span class="text-gradient animate-gradient">negocio a vender más</span>
			</h1>

			<p
				class="reveal mx-auto mt-6 max-w-xl text-pretty text-base text-fg-muted sm:text-lg"
				use:reveal={{ delay: 160 }}
			>
				Punto de venta, inventario, compras, gastos, tesorería y finanzas — todo conectado y en
				tiempo real. Deja la calculadora y los cuadernos: <span class="text-fg">PlacePos</span>
				controla tu negocio por ti.
			</p>

			<div
				class="reveal mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
				use:reveal={{ delay: 240 }}
			>
				<a
					href="#cta"
					class="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-7 py-3.5 text-sm font-semibold text-white shadow-glow transition-transform duration-200 active:scale-[0.98] sm:w-auto"
					style="background:linear-gradient(135deg,#8b5cf6,#6366f1 55%,#22d3ee)"
				>
					<span class="relative z-10">{SITE.ctaPrimary}</span>
					<Icon
						name="arrow"
						size={16}
						class="relative z-10 transition-transform duration-200 group-hover:translate-x-0.5"
					/>
				</a>
				<a
					href="#how"
					class="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.03] px-7 py-3.5 text-sm font-semibold text-fg transition-colors duration-200 hover:bg-white/[0.07] sm:w-auto"
				>
					<Icon name="phone" size={16} />
					{SITE.ctaSecondary}
				</a>
			</div>

			<p
				class="reveal mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-fg-faint"
				use:reveal={{ delay: 320 }}
			>
				<span class="inline-flex items-center gap-1.5"><Icon name="check" size={13} class="text-mint" /> Listo en minutos</span>
				<span class="inline-flex items-center gap-1.5"><Icon name="check" size={13} class="text-mint" /> Hecho para el mostrador</span>
				<span class="inline-flex items-center gap-1.5"><Icon name="check" size={13} class="text-mint" /> Tus informes, también en la web</span>
			</p>
		</div>

		<!-- Producto -->
		<div class="reveal relative mx-auto mt-14 max-w-5xl sm:mt-20" use:reveal={{ delay: 200 }}>
			<div
				class="pointer-events-none absolute -inset-x-10 -top-10 bottom-0 -z-10 rounded-[2rem] opacity-60 blur-3xl"
				style="background:radial-gradient(60% 60% at 50% 0%,rgba(124,92,255,0.5),transparent 70%)"
			></div>
			<div use:parallax={{ speed: 0.1 }}>
				<DashboardMock />
			</div>
		</div>
	</div>

	<!-- scroll cue -->
	<div class="mt-14 flex justify-center sm:mt-16">
		<a
			href="#features"
			class="flex h-9 w-6 items-start justify-center rounded-full border border-white/15 p-1.5"
			aria-label="Desplázate"
		>
			<span class="h-2 w-1 rounded-full bg-fg-muted animate-float"></span>
		</a>
	</div>
</section>
