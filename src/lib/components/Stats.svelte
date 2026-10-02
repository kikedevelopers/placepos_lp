<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	import { countUp } from '$lib/actions/countUp';
	import { tilt } from '$lib/actions/tilt';
	import { STATS } from '$lib/data/site';
</script>

<section class="relative py-16 sm:py-20">
	<div class="mx-auto max-w-7xl px-4 sm:px-6">
		<div
			class="reveal tilt-spot grain relative overflow-hidden rounded-3xl border border-white/[0.08] p-8 sm:p-12"
			style="background:linear-gradient(135deg,rgba(124,92,255,0.14),rgba(34,211,238,0.08))"
			use:reveal
			use:tilt={{ max: 2.5, scale: 1.006 }}
		>
			<div class="bg-dots pointer-events-none absolute inset-0 opacity-40"></div>
			<div class="relative grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
				{#each STATS as stat, i (stat.label)}
					<div class="reveal" use:reveal={{ delay: i * 90 }}>
						<div class="font-display text-fg text-4xl font-extrabold tracking-tight sm:text-5xl">
							<span
								class="tabular-nums"
								use:countUp={{
									to: stat.value,
									prefix: stat.prefix,
									suffix: stat.suffix,
									decimals: stat.decimals
								}}>0</span
							>
						</div>
						<p class="text-fg-muted mt-2 text-sm">{stat.label}</p>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
