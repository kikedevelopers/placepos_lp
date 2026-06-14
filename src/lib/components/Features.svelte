<script lang="ts">
	import Icon from './Icon.svelte';
	import { reveal } from '$lib/actions/reveal';
	import { FEATURES } from '$lib/data/site';
</script>

<section id="features" class="relative scroll-mt-24 py-20 sm:py-28">
	<div class="mx-auto max-w-7xl px-4 sm:px-6">
		<div class="mx-auto max-w-2xl text-center">
			<span
				class="reveal inline-block rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand"
				use:reveal
			>
				Un ERP completo
			</span>
			<h2 class="reveal mt-5 text-3xl font-extrabold tracking-tight sm:text-5xl" use:reveal={{ delay: 80 }}>
				<span class="text-gradient-soft">Nueve módulos. </span>
				<span class="text-gradient">Cero descuadres.</span>
			</h2>
			<p class="reveal mx-auto mt-4 max-w-xl text-fg-muted" use:reveal={{ delay: 140 }}>
				Cada función habla con las demás. Una venta mueve tu inventario, alimenta tu caja y aparece
				en tus reportes — automáticamente.
			</p>
		</div>

		<div class="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each FEATURES as f, i (f.title)}
				<article
					class="reveal group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-surface/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:bg-surface"
					use:reveal={{ delay: (i % 3) * 90 }}
				>
					<div
						class="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
						style="background:radial-gradient(circle,rgba(124,92,255,0.4),transparent 70%)"
					></div>
					<div
						class="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-brand transition-colors duration-300 group-hover:text-brand-3"
					>
						<Icon name={f.icon} size={22} />
					</div>
					<h3 class="mt-5 text-lg font-bold text-fg">{f.title}</h3>
					<p class="mt-2 text-sm leading-relaxed text-fg-muted">{f.desc}</p>
				</article>
			{/each}
		</div>
	</div>
</section>
