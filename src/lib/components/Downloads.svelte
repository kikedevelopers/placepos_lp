<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	import { parallax } from '$lib/actions/parallax';

	// Número de contacto (formato internacional para WhatsApp / tel)
	const contactWhatsapp = '573117323107';
	const contactDisplay = '+57 311 732 3107';
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
					Escríbenos o llámanos y te ayudamos a poner tu negocio a vender más. Estamos listos para
					atenderte:
				</p>

				<!-- Contacto -->
				<div class="reveal mx-auto mt-10 max-w-md" use:reveal={{ delay: 110 }}>
					<a
						href="https://wa.me/{contactWhatsapp}"
						target="_blank"
						rel="noopener noreferrer"
						class="group relative flex flex-col items-center overflow-hidden rounded-2xl border border-white/[0.1] bg-white/[0.03] p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:bg-white/[0.06]"
						aria-label="Contáctanos por WhatsApp"
					>
						<div
							class="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
							style="background:radial-gradient(circle,rgba(124,92,255,0.45),transparent 70%)"
						></div>

						<span
							class="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-fg transition-transform duration-300 group-hover:scale-105"
						>
							<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
								<path
									d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"
								/>
							</svg>
						</span>

						<h3 class="mt-4 font-display text-lg font-bold text-fg">Contáctanos</h3>
						<p class="mt-1 text-xs text-fg-faint">WhatsApp · Llamada</p>

						<span
							class="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-semibold text-white transition-transform duration-200 group-active:scale-[0.98]"
							style="background:linear-gradient(135deg,#8b5cf6,#6366f1 55%,#22d3ee)"
						>
							{contactDisplay}
						</span>
					</a>
				</div>
			</div>
		</div>
	</div>
</section>
