<script lang="ts">
	import { base } from '$app/paths';

	interface Props {
		size?: number;
		withText?: boolean;
	}
	let { size = 32, withText = true }: Props = $props();
</script>

<a href="#top" class="group flex items-center gap-2.5" aria-label="PlacePos — inicio">
	<span
		class="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[10px] shadow-[0_8px_24px_-8px_rgba(124,92,255,0.55)] ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-105"
		style="width:{size}px;height:{size}px"
	>
		<img
			src="{base}/logo-mark.png"
			alt="PlacePos"
			width={size}
			height={size}
			class="h-full w-full object-cover"
			loading="eager"
			decoding="async"
		/>
	</span>
	{#if withText}
		<span class="font-display text-[1.05rem] font-bold tracking-tight text-fg">
			Place<span class="text-brand">Pos</span>
		</span>
	{/if}
</a>
