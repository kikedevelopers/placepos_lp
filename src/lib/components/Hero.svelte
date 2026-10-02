<script lang="ts">
	import Icon from './Icon.svelte';
	import DashboardMock from './DashboardMock.svelte';
	import { reveal } from '$lib/actions/reveal';
	import { parallax } from '$lib/actions/parallax';
	import { tilt } from '$lib/actions/tilt';
	import { magnetic } from '$lib/actions/magnetic';
	import { pointerGlow } from '$lib/actions/pointerGlow';
	import { SITE } from '$lib/data/site';
</script>

<section
	id="top"
	class="pointer-glow grain relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pb-28"
	use:pointerGlow
>
	<!-- Fondo -->
	<div class="bg-grid pointer-events-none absolute inset-0 -z-10"></div>

	<!-- Orbes: el wrapper hace parallax de scroll (JS) y el orbe deriva tras el
	     cursor con `--px/--py` — dos capas de transform que no se pisan. -->
	<div class="pointer-events-none absolute inset-0 -z-10">
		<div class="absolute -top-24 -left-20" use:parallax={{ speed: 0.35 }}>
			<div
				class="orb h-[28rem] w-[28rem]"
				style="background:radial-gradient(circle,#7c5cff,transparent 65%);transform:translate3d(calc(var(--px,0)*26px),calc(var(--py,0)*26px),0)"
			></div>
		</div>
		<div class="absolute top-10 -right-24" use:parallax={{ speed: 0.5 }}>
			<div
				class="orb h-[26rem] w-[26rem]"
				style="background:radial-gradient(circle,#22d3ee,transparent 65%);opacity:0.4;transform:translate3d(calc(var(--px,0)*-34px),calc(var(--py,0)*-20px),0)"
			></div>
		</div>
		<div class="absolute bottom-0 left-1/3" use:parallax={{ speed: 0.2 }}>
			<div
				class="orb h-[24rem] w-[24rem]"
				style="background:radial-gradient(circle,#5b8cff,transparent 65%);opacity:0.35;transform:translate3d(calc(var(--px,0)*18px),calc(var(--py,0)*-16px),0)"
			></div>
		</div>
	</div>

	<div class="relative mx-auto max-w-7xl px-4 sm:px-6">
		<div class="mx-auto max-w-3xl text-center">
			<div class="reveal flex justify-center" use:reveal>
				<span
					class="glass text-fg-muted inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium"
				>
					<span class="relative flex h-2 w-2">
						<span
							class="bg-mint absolute inline-flex h-full w-full rounded-full opacity-75"
							style="animation:pulse-ring 1.8s var(--ease-out-quint) infinite"
						></span>
						<span class="bg-mint relative inline-flex h-2 w-2 rounded-full"></span>
					</span>
					Tu negocio entero, en una sola plataforma
				</span>
			</div>

			<h1
				class="reveal display-xl mt-6 text-4xl font-extrabold tracking-tight text-balance sm:text-6xl lg:text-7xl"
				use:reveal={{ delay: 80 }}
			>
				<span class="text-gradient-soft">El ERP que pone tu</span><br class="hidden sm:block" />
				<span class="text-gradient animate-gradient">negocio a vender más</span>
			</h1>

			<p
				class="reveal text-fg-muted mx-auto mt-6 max-w-xl text-base text-pretty sm:text-lg"
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
					use:magnetic
					class="group sheen shadow-glow relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-7 py-3.5 text-sm font-semibold text-white active:scale-[0.98] sm:w-auto"
					style="background:linear-gradient(135deg,#8b5cf6,#6366f1 55%,#22d3ee)"
				>
					<span class="relative z-10">{SITE.ctaPrimary}</span>
					<Icon
						name="arrow"
						size={16}
						class="relative z-10 transition-transform duration-200 ease-[var(--ease-out)] group-hover:translate-x-1"
					/>
				</a>
			</div>

			<p
				class="reveal text-fg-faint mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs"
				use:reveal={{ delay: 320 }}
			>
				<span class="inline-flex items-center gap-1.5"
					><Icon name="check" size={13} class="text-mint" /> Listo en minutos</span
				>
				<span class="inline-flex items-center gap-1.5"
					><Icon name="check" size={13} class="text-mint" /> Hecho para el mostrador</span
				>
				<span class="inline-flex items-center gap-1.5"
					><Icon name="check" size={13} class="text-mint" /> Tus informes, también en la web</span
				>
			</p>
		</div>

		<!-- Producto: parallax de scroll + tilt 3D con el cursor. -->
		<div class="reveal relative mx-auto mt-14 max-w-5xl sm:mt-20" use:reveal={{ delay: 200 }}>
			<div
				class="pointer-events-none absolute -inset-x-10 -top-10 bottom-0 -z-10 rounded-[2rem] opacity-60 blur-3xl"
				style="background:radial-gradient(60% 60% at 50% 0%,rgba(124,92,255,0.5),transparent 70%)"
			></div>
			<div use:parallax={{ speed: 0.1 }}>
				<div class="[transform-style:preserve-3d]" use:tilt={{ max: 4, scale: 1.006, glow: false }}>
					<DashboardMock />
				</div>
			</div>
		</div>
	</div>

	<!-- scroll cue -->
	<div class="mt-14 flex justify-center sm:mt-16">
		<a
			href="#features"
			class="flex h-9 w-6 items-start justify-center rounded-full border border-white/15 p-1.5 transition-colors duration-200 hover:border-white/40"
			aria-label="Desplázate"
		>
			<span class="bg-fg-muted animate-float h-2 w-1 rounded-full"></span>
		</a>
	</div>
</section>
