<script lang="ts">
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Icon from '$lib/components/Icon.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import { session } from '$lib/stores/session.svelte';

	let { children } = $props();

	// ---------------------------------------------------------------------------
	// Marco del portal: una sola barra para "Mi cuenta" y "Pagos". Vive en el
	// layout para que el indicador del tab activo se DESLICE entre páginas en
	// vez de reaparecer: la navegación se siente como cambiar de pestaña, no
	// como cargar otra web.
	// ---------------------------------------------------------------------------

	const TABS = [
		{ href: `${base}/panel`, label: 'Mi cuenta', icon: 'user' },
		{ href: `${base}/panel/pagos`, label: 'Pagos', icon: 'receipt' }
	] as const;

	/** `/panel/pago` (regreso de Wompi) también cuenta como "Pagos". */
	const active = $derived(page.url.pathname.startsWith(`${base}/panel/pago`) ? 1 : 0);

	function signOut(): void {
		session.clear();
		void goto(`${base}/ingresar`, { replaceState: true });
	}
</script>

<div class="relative min-h-screen">
	<header class="glass sticky top-0 z-40 border-b border-white/[0.06]">
		<div class="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
			<a href="{base}/" class="shrink-0 transition-opacity duration-200 hover:opacity-80">
				<Logo size={30} />
			</a>

			{#if session.isAuthenticated}
				<nav
					aria-label="Portal de tu cuenta"
					class="relative grid grid-cols-2 rounded-xl border border-white/[0.07] bg-white/[0.03] p-1"
				>
					<!-- Indicador del tab activo: se traslada, no se redibuja. -->
					<span
						aria-hidden="true"
						class="portal-tab-indicator pointer-events-none absolute top-1 bottom-1 left-1 rounded-lg border border-white/[0.09] bg-white/[0.08]"
						style="width:calc(50% - 4px);transform:translateX({active * 100}%)"
					></span>
					{#each TABS as tab, i (tab.href)}
						<a
							href={tab.href}
							aria-current={active === i ? 'page' : undefined}
							class="relative inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors duration-200 sm:px-4 {active ===
							i
								? 'text-fg'
								: 'text-fg-faint hover:text-fg-muted'}"
						>
							<Icon name={tab.icon} size={14} />
							{tab.label}
						</a>
					{/each}
				</nav>

				<button
					type="button"
					onclick={signOut}
					aria-label="Cerrar sesión"
					class="text-fg-muted hover:text-fg inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm transition-colors duration-200 hover:bg-white/5 sm:px-3"
				>
					<Icon name="logout" size={15} />
					<span class="hidden sm:inline">Cerrar sesión</span>
				</button>
			{/if}
		</div>
	</header>

	{@render children()}
</div>

<style>
	.portal-tab-indicator {
		transition: transform 260ms var(--ease-out);
	}

	@media (prefers-reduced-motion: reduce) {
		.portal-tab-indicator {
			transition: none;
		}
	}
</style>
