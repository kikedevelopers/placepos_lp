<script lang="ts">
	import Icon from './Icon.svelte';
	import { reveal } from '$lib/actions/reveal';
	import { parallax } from '$lib/actions/parallax';
	import { SITE } from '$lib/data/site';

	const platforms = [
		{
			key: 'windows',
			name: 'Windows',
			detail: 'Windows 10 y 11 · 64-bit',
			file: 'Instalador .exe',
			href: SITE.downloads.windows
		},
		{
			key: 'mac',
			name: 'macOS',
			detail: 'Apple Silicon e Intel',
			file: 'Instalador .dmg',
			href: SITE.downloads.mac
		}
	];
</script>

<section id="cta" class="relative scroll-mt-24 overflow-hidden py-20 sm:py-28">
	<div class="mx-auto max-w-7xl px-4 sm:px-6">
		<div
			class="reveal relative overflow-hidden rounded-[2rem] border border-white/[0.1] px-6 py-16 sm:px-12 sm:py-20"
			style="background:linear-gradient(135deg,#0e0e1a,#14102a 55%,#0c1622)"
			use:reveal
		>
			<div class="bg-grid pointer-events-none absolute inset-0 opacity-50"></div>
			<div
				class="orb left-1/4 top-0 h-72 w-72"
				style="background:radial-gradient(circle,#7c5cff,transparent 65%)"
				use:parallax={{ speed: 0.4 }}
			></div>
			<div
				class="orb bottom-0 right-1/4 h-72 w-72"
				style="background:radial-gradient(circle,#22d3ee,transparent 65%);opacity:0.4"
				use:parallax={{ speed: 0.55 }}
			></div>

			<div class="relative mx-auto max-w-3xl text-center">
				<h2 class="text-3xl font-extrabold tracking-tight sm:text-5xl">
					<span class="text-gradient-soft">Empieza a vender más</span><br />
					<span class="text-gradient animate-gradient">hoy mismo</span>
				</h2>
				<p class="mx-auto mt-5 max-w-lg text-fg-muted">
					Descarga PlacePos en el computador de tu negocio y empieza a vender en minutos. Elige tu
					sistema operativo:
				</p>

				<!-- Tarjetas de descarga -->
				<div class="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
					{#each platforms as p, i (p.key)}
						<a
							href={p.href}
							class="reveal group relative flex flex-col items-center overflow-hidden rounded-2xl border border-white/[0.1] bg-white/[0.03] p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:bg-white/[0.06]"
							use:reveal={{ delay: i * 110 }}
							aria-label="Descargar PlacePos para {p.name}"
						>
							<div
								class="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
								style="background:radial-gradient(circle,rgba(124,92,255,0.45),transparent 70%)"
							></div>

							<span
								class="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-fg transition-transform duration-300 group-hover:scale-105"
							>
								{#if p.key === 'windows'}
									<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
										<path
											d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"
										/>
									</svg>
								{:else}
									<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
										<path
											d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z"
										/>
									</svg>
								{/if}
							</span>

							<h3 class="mt-4 font-display text-lg font-bold text-fg">{p.name}</h3>
							<p class="mt-1 text-xs text-fg-faint">{p.detail}</p>

							<span
								class="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-transform duration-200 group-active:scale-[0.98]"
								style="background:linear-gradient(135deg,#8b5cf6,#6366f1 55%,#22d3ee)"
							>
								<Icon name="download" size={16} />
								Descargar
							</span>
							<span class="mt-2.5 text-[11px] text-fg-faint">{p.file}</span>
						</a>
					{/each}
				</div>

				<p class="mt-7 text-xs text-fg-faint">
					Versión {SITE.version} · Gratis para empezar · ¿Dudas?
					<a href="mailto:{SITE.email}" class="text-fg-muted underline-offset-2 hover:text-fg hover:underline"
						>Escríbenos</a
					>
				</p>
			</div>
		</div>
	</div>
</section>
