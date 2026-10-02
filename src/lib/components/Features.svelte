<script lang="ts">
	import Icon from './Icon.svelte';
	import { reveal } from '$lib/actions/reveal';
	import { tilt } from '$lib/actions/tilt';
	import { FEATURES } from '$lib/data/site';
</script>

<section id="features" class="relative scroll-mt-24 py-20 sm:py-28">
	<div class="mx-auto max-w-7xl px-4 sm:px-6">
		<div class="mx-auto max-w-2xl text-center">
			<span
				class="reveal border-brand/30 bg-brand/10 text-brand inline-block rounded-full border px-3 py-1 text-xs font-semibold tracking-wider uppercase"
				use:reveal
			>
				Un ERP completo
			</span>
			<h2
				class="reveal mt-5 text-3xl font-extrabold tracking-tight sm:text-5xl"
				use:reveal={{ delay: 80 }}
			>
				<span class="text-gradient-soft">Diez módulos. </span>
				<span class="text-gradient">Cero descuadres.</span>
			</h2>
			<p class="reveal text-fg-muted mx-auto mt-4 max-w-xl" use:reveal={{ delay: 140 }}>
				Cada función habla con las demás. Una venta mueve tu inventario, alimenta tu caja y aparece
				en tus reportes — automáticamente.
			</p>
		</div>

		<div class="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each FEATURES as f, i (f.title)}
				<article
					class="reveal tilt-spot group bg-surface/60 hover:border-brand/30 hover:bg-surface relative overflow-hidden rounded-2xl border border-white/[0.07] p-6 transition-[background-color,border-color] duration-300 {f.wide
						? 'sm:col-span-2 sm:flex sm:items-center sm:gap-6 sm:p-7 lg:col-span-3'
						: ''}"
					use:reveal={{ delay: (i % 3) * 90 }}
					use:tilt={{ max: f.wide ? 2.5 : 5, scale: 1.015 }}
				>
					<div
						class="text-brand group-hover:text-brand-3 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] transition-colors duration-300"
					>
						<Icon name={f.icon} size={22} />
					</div>
					<div class={f.wide ? 'min-w-0 sm:flex-1' : ''}>
						<div class="mt-5 flex flex-wrap items-center gap-2 {f.wide ? 'sm:mt-0' : ''}">
							<h3 class="text-fg text-lg font-bold">{f.title}</h3>
							{#if f.badge}
								<span
									class="border-brand/30 bg-brand/10 text-brand rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase"
								>
									{f.badge}
								</span>
							{/if}
						</div>
						<p class="text-fg-muted mt-2 text-sm leading-relaxed {f.wide ? 'sm:max-w-2xl' : ''}">
							{f.desc}
						</p>
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>
