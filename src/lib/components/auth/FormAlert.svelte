<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';

	interface Props {
		/** `error` para lo que salió mal; `info` para avisos neutros. */
		tone?: 'error' | 'info';
		message: string;
	}

	let { tone = 'error', message }: Props = $props();
</script>

<!-- `aria-live`: el mensaje aparece sin recargar, y quien usa lector de
     pantalla tiene que enterarse de que el envío falló. -->
<div
	role="alert"
	aria-live="polite"
	class="flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-xs leading-relaxed {tone ===
	'error'
		? 'border-amber/30 bg-amber/10 text-amber'
		: 'border-brand/30 bg-brand/10 text-brand'}"
>
	<span class="mt-px shrink-0">
		<Icon name={tone === 'error' ? 'alert' : 'sparkles'} size={15} />
	</span>
	<span>{message}</span>
</div>
