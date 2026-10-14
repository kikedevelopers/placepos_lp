<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import type { CatalogCategoryGroup } from '$lib/api/catalog';

	// `active` es el ancla de la categoría visible (scrollspy) o '' para "Todos".
	// `onselect('')` sube al inicio; `onselect(anchor)` salta a esa categoría.
	let {
		groups,
		total,
		active,
		variant = 'sidebar',
		onselect
	}: {
		groups: CatalogCategoryGroup[];
		total: number;
		active: string;
		variant?: 'sidebar' | 'chips';
		onselect: (anchor: string) => void;
	} = $props();
</script>

{#if variant === 'sidebar'}
	<div
		class="rounded-2xl border border-zinc-200/70 bg-white p-2 shadow-[0_1px_2px_rgba(24,24,40,0.04),0_18px_40px_-28px_rgba(24,24,40,0.18)]"
	>
		<p class="px-3 pb-2 pt-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
			Categorías
		</p>
		<nav aria-label="Categorías" class="space-y-0.5">
			<button
				type="button"
				onclick={() => onselect('')}
				aria-current={active === '' ? 'true' : undefined}
				class="group flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]"
				class:active={active === ''}
			>
				<Icon
					name="layers"
					size={15}
					class={active === '' ? 'text-white' : 'text-zinc-400 group-hover:text-brand'}
				/>
				<span class="flex-1 truncate">Todos</span>
				<span class="count" class:count-on={active === ''}>{total}</span>
			</button>
			{#each groups as group (group.anchor)}
				<button
					type="button"
					onclick={() => onselect(group.anchor)}
					aria-current={active === group.anchor ? 'true' : undefined}
					class="group flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]"
					class:active={active === group.anchor}
				>
					<Icon
						name="tag"
						size={15}
						class={active === group.anchor ? 'text-white' : 'text-zinc-400 group-hover:text-brand'}
					/>
					<span class="flex-1 truncate">{group.category}</span>
					<span class="count" class:count-on={active === group.anchor}
						>{group.products.length}</span
					>
				</button>
			{/each}
		</nav>
	</div>
{:else}
	<!-- Chips horizontales (móvil): scroll lateral sin barra visible. -->
	<nav
		aria-label="Categorías"
		class="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 py-0.5 sm:-mx-8 sm:px-8"
	>
		<button
			type="button"
			onclick={() => onselect('')}
			class="chip"
			class:chip-on={active === ''}
		>
			Todos <span class="chip-count">{total}</span>
		</button>
		{#each groups as group (group.anchor)}
			<button
				type="button"
				onclick={() => onselect(group.anchor)}
				class="chip"
				class:chip-on={active === group.anchor}
			>
				{group.category} <span class="chip-count">{group.products.length}</span>
			</button>
		{/each}
	</nav>
{/if}

<style>
	/* ---- Sidebar ---- */
	.count {
		flex-shrink: 0;
		min-width: 1.5rem;
		border-radius: 9999px;
		background: #f4f4f5; /* zinc-100 */
		padding: 0.05rem 0.45rem;
		text-align: center;
		font-size: 0.6875rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		color: #a1a1aa; /* zinc-400 */
		transition: background-color 0.2s var(--ease-out);
	}
	.group:hover .count {
		background: #e4e4e7; /* zinc-200 */
		color: #71717a; /* zinc-500 */
	}
	.count-on,
	.group:hover .count-on {
		background: rgba(255, 255, 255, 0.2);
		color: #fff;
	}

	.active {
		background: linear-gradient(100deg, var(--color-brand), var(--color-brand-2));
		color: #fff;
		font-weight: 600;
		box-shadow: 0 10px 22px -10px rgba(124, 92, 255, 0.65);
	}
	button:not(.active):hover {
		background: #fafafa; /* zinc-50 */
		transform: translateX(2px);
	}

	/* ---- Chips (móvil) ---- */
	.chip {
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		gap: 0.4rem;
		cursor: pointer;
		border-radius: 9999px;
		border: 1px solid #e4e4e7; /* zinc-200 */
		background: #fff;
		padding: 0.35rem 0.85rem;
		font-size: 0.75rem;
		font-weight: 500;
		color: #52525b; /* zinc-600 */
		transition:
			color 0.15s var(--ease-out),
			background-color 0.15s var(--ease-out),
			border-color 0.15s var(--ease-out);
	}
	.chip-count {
		font-size: 0.625rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		opacity: 0.6;
	}
	.chip-on {
		border-color: transparent;
		background: linear-gradient(100deg, var(--color-brand), var(--color-brand-2));
		color: #fff;
		box-shadow: 0 8px 18px -10px rgba(124, 92, 255, 0.7);
	}

	.no-scrollbar {
		scrollbar-width: none;
	}
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}

	@media (prefers-reduced-motion: reduce) {
		button:not(.active):hover {
			transform: none;
		}
	}
</style>
