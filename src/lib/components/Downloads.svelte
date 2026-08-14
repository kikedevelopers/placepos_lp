<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	import { parallax } from '$lib/actions/parallax';
	import { SITE } from '$lib/data/site';
	import { PRICING } from '$lib/data/pricing';
	import { formatCop, monthlyEquivalent } from '$lib/utils/pricing';

	// Mismo instalador que consume el auto-updater de PlacePos: el release action
	// sobrescribe `placepos-latest-setup.exe` en cada publicación, así que el
	// enlace nunca queda apuntando a una versión retirada del servidor.
	const windowsInstaller = SITE.downloads.windows;
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
				class="orb top-0 left-1/4 h-72 w-72"
				style="background:radial-gradient(circle,#7c5cff,transparent 65%)"
				use:parallax={{ speed: 0.4 }}
			></div>
			<div
				class="orb right-1/4 bottom-0 h-72 w-72"
				style="background:radial-gradient(circle,#22d3ee,transparent 65%);opacity:0.4"
				use:parallax={{ speed: 0.55 }}
			></div>

			<div class="relative mx-auto max-w-3xl text-center">
				<h2 class="text-3xl font-extrabold tracking-tight sm:text-5xl">
					<span class="text-gradient-soft">Empieza a vender más</span><br />
					<span class="text-gradient animate-gradient">hoy mismo</span>
				</h2>
				<p class="text-fg-muted mx-auto mt-5 max-w-lg">
					Descárgalo, créate la cuenta en dos minutos y úsalo {PRICING.trial_days} días gratis con tu
					negocio real. Sin tarjeta.
				</p>

				<!-- Descarga -->
				<div class="reveal mx-auto mt-10 grid max-w-sm gap-5" use:reveal={{ delay: 110 }}>
					<!-- Descarga Windows -->
					<a
						href={windowsInstaller}
						class="group hover:border-brand/40 relative flex flex-col items-center overflow-hidden rounded-2xl border border-white/[0.1] bg-white/[0.03] p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.06]"
						aria-label="Descargar PlacePos para Windows"
					>
						<div
							class="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
							style="background:radial-gradient(circle,rgba(34,211,238,0.45),transparent 70%)"
						></div>

						<span
							class="text-fg flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] transition-transform duration-300 group-hover:scale-105"
						>
							<svg
								width="28"
								height="28"
								viewBox="0 0 24 24"
								fill="currentColor"
								aria-hidden="true"
							>
								<path
									d="M3 5.4 10.05 4.4v6.9H3V5.4zm0 13.2 7.05 1v-6.8H3v5.8zM11.1 19.75 21 21V12.3h-9.9v7.45zm0-15.5v7.05H21V3l-9.9 1.25z"
								/>
							</svg>
						</span>

						<h3 class="font-display text-fg mt-4 text-lg font-bold">Descarga para Windows</h3>
						<p class="text-fg-faint mt-1 text-xs">Windows 10/11 · 64-bit</p>

						<span
							class="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-semibold text-white transition-transform duration-200 group-active:scale-[0.98]"
							style="background:linear-gradient(135deg,#8b5cf6,#6366f1 55%,#22d3ee)"
						>
							Descargar gratis
						</span>
					</a>
				</div>

				<p class="reveal text-fg-faint mt-6 text-sm" use:reveal={{ delay: 170 }}>
					Después de la prueba, desde {formatCop(monthlyEquivalent())} al mes ·
					<a href="#precios" class="text-brand font-medium hover:underline">Ver planes</a>
				</p>
			</div>
		</div>
	</div>
</section>
