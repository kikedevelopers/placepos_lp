<script lang="ts">
	import Icon from './Icon.svelte';
	import { reveal } from '$lib/actions/reveal';
	import { FAQ } from '$lib/data/site';

	let openIndex = $state<number | null>(0);
	const toggle = (i: number) => (openIndex = openIndex === i ? null : i);
</script>

<section id="faq" class="relative scroll-mt-24 py-20 sm:py-28">
	<div class="mx-auto max-w-3xl px-4 sm:px-6">
		<div class="text-center">
			<span
				class="reveal inline-block rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand"
				use:reveal
			>
				Preguntas frecuentes
			</span>
			<h2 class="reveal mt-5 text-3xl font-extrabold tracking-tight sm:text-5xl" use:reveal={{ delay: 80 }}>
				<span class="text-gradient-soft">¿Te queda</span> <span class="text-gradient">una duda?</span>
			</h2>
		</div>

		<div class="mt-12 flex flex-col gap-3">
			{#each FAQ as item, i (item.q)}
				<div
					class="reveal overflow-hidden rounded-2xl border border-white/[0.08] bg-surface/60"
					use:reveal={{ delay: i * 70 }}
				>
					<button
						class="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
						onclick={() => toggle(i)}
						aria-expanded={openIndex === i}
					>
						<span class="text-[15px] font-semibold text-fg">{item.q}</span>
						<span
							class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 text-brand transition-transform duration-300"
							style="transform:rotate({openIndex === i ? 0 : 45}deg)"
						>
							<Icon name="x" size={14} stroke={2.2} />
						</span>
					</button>
					<div
						class="grid transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
						style="grid-template-rows:{openIndex === i ? '1fr' : '0fr'}"
					>
						<div class="overflow-hidden">
							<p class="px-5 pb-5 text-sm leading-relaxed text-fg-muted">{item.a}</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
