<script lang="ts">
	import Icon from './Icon.svelte';
	import { reveal } from '$lib/actions/reveal';
	import { tilt } from '$lib/actions/tilt';
	import { TESTIMONIALS } from '$lib/data/site';
</script>

<section id="testimonios" class="relative scroll-mt-24 py-20 sm:py-28">
	<div class="mx-auto max-w-7xl px-4 sm:px-6">
		<div class="mx-auto max-w-2xl text-center">
			<span
				class="reveal inline-block rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand"
				use:reveal
			>
				Negocios que ya venden mejor
			</span>
			<h2 class="reveal mt-5 text-3xl font-extrabold tracking-tight sm:text-5xl" use:reveal={{ delay: 80 }}>
				<span class="text-gradient-soft">Lo dicen quienes</span>
				<span class="text-gradient">lo usan a diario</span>
			</h2>
		</div>

		<div class="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
			{#each TESTIMONIALS as t, i (t.name)}
				<figure
					class="reveal tilt-spot bg-surface/60 hover:border-brand/25 hover:bg-surface flex h-full flex-col rounded-2xl border border-white/[0.07] p-6 transition-[background-color,border-color] duration-300"
					use:reveal={{ delay: i * 110 }}
					use:tilt={{ max: 4.5, scale: 1.015 }}
				>
					<Icon name="quote" size={26} class="text-brand/50" />
					<blockquote class="mt-4 flex-1 text-[15px] leading-relaxed text-fg">
						{t.quote}
					</blockquote>
					<figcaption class="mt-6 flex items-center gap-3">
						<span
							class="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
							style="background:linear-gradient(135deg,#8b5cf6,#22d3ee)"
						>
							{t.initials}
						</span>
						<span>
							<span class="block text-sm font-semibold text-fg">{t.name}</span>
							<span class="block text-xs text-fg-faint">{t.role}</span>
						</span>
					</figcaption>
				</figure>
			{/each}
		</div>
	</div>
</section>
