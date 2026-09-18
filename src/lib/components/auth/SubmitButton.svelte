<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';

	interface Props {
		label: string;
		/** Texto mientras se envía. Decir qué está pasando calma la espera. */
		loadingLabel: string;
		loading?: boolean;
		disabled?: boolean;
	}

	let { label, loadingLabel, loading = false, disabled = false }: Props = $props();
</script>

<button
	type="submit"
	disabled={loading || disabled}
	class="hover:shadow-glow relative inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-none"
	style="background:linear-gradient(135deg,#8b5cf6,#6366f1 55%,#22d3ee)"
>
	{#if loading}
		<span
			class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
			aria-hidden="true"
		></span>
		{loadingLabel}
	{:else}
		{label}
		<Icon name="arrow" size={16} />
	{/if}
</button>
