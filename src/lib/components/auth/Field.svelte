<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';

	interface Props {
		id: string;
		label: string;
		type?: 'text' | 'email' | 'password';
		value: string;
		placeholder?: string;
		error?: string;
		autocomplete?: HTMLInputElement['autocomplete'];
		disabled?: boolean;
		/** Muestra el ojo para revelar la contraseña. */
		reveal?: boolean;
		oninput?: () => void;
	}

	let {
		id,
		label,
		type = 'text',
		value = $bindable(),
		placeholder = '',
		error = '',
		autocomplete,
		disabled = false,
		reveal = false,
		oninput
	}: Props = $props();

	let shown = $state(false);
	// El `type` del input cambia al revelar, así que el binding no puede ser
	// `bind:value` con `type` dinámico (Svelte lo prohíbe): se maneja a mano.
	const inputType = $derived(reveal && shown ? 'text' : type);
</script>

<div class="space-y-1.5">
	<label for={id} class="text-fg-muted block text-xs font-medium">{label}</label>

	<div class="relative">
		<input
			{id}
			name={id}
			type={inputType}
			{placeholder}
			{autocomplete}
			{disabled}
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={error ? `${id}-error` : undefined}
			{value}
			oninput={(event) => {
				value = event.currentTarget.value;
				oninput?.();
			}}
			class="bg-ink-soft/80 text-fg placeholder:text-fg-faint/70 focus:border-brand/60 focus:ring-brand/20 w-full rounded-xl border px-3.5 py-2.5 text-sm transition-colors duration-200 outline-none focus:ring-2 disabled:opacity-60 {error
				? 'border-amber/60'
				: 'border-line hover:border-line/80'} {reveal ? 'pr-11' : ''}"
		/>

		{#if reveal}
			<button
				type="button"
				onclick={() => (shown = !shown)}
				aria-label={shown ? 'Ocultar contraseña' : 'Mostrar contraseña'}
				class="text-fg-faint hover:text-fg-muted absolute top-1/2 right-3 -translate-y-1/2 transition-colors duration-200"
			>
				<Icon name={shown ? 'eye-off' : 'eye'} size={17} />
			</button>
		{/if}
	</div>

	{#if error}
		<p id="{id}-error" class="text-amber flex items-center gap-1.5 text-xs">
			<span class="bg-amber inline-block h-1 w-1 rounded-full"></span>
			{error}
		</p>
	{/if}
</div>
