<script lang="ts">
	import { base } from '$app/paths';
	import Icon from '../Icon.svelte';
	import type { DocGroup, DocModule } from '$lib/data/docs.types';

	interface Props {
		groups: DocGroup[];
		modules: DocModule[];
		activeId: string;
		/** En móvil el índice va dentro de un panel desplegable. */
		onNavigate?: () => void;
	}

	let { groups, modules, activeId, onNavigate }: Props = $props();

	const byId = (id: string) => modules.find((m) => m.id === id);
</script>

<nav aria-label="Índice de la documentación" class="text-sm">
	<a
		href="{base}/"
		class="text-fg-faint hover:text-fg mb-6 inline-flex items-center gap-2 text-xs transition-colors duration-200"
	>
		<span class="rotate-180"><Icon name="arrow" size={14} /></span>
		Volver al inicio
	</a>

	<!-- El mapa no es un módulo: es la entrada recomendada para quien llega nuevo. -->
	<a
		href="#mapa"
		onclick={onNavigate}
		aria-current={activeId === 'mapa' ? 'true' : undefined}
		class="mb-6 flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors duration-200
			{activeId === 'mapa'
			? 'text-fg bg-white/[0.06]'
			: 'text-fg-muted hover:text-fg hover:bg-white/[0.03]'}"
	>
		<span class={activeId === 'mapa' ? 'text-brand' : 'text-fg-faint'}>
			<Icon name="layers" size={15} />
		</span>
		Cómo encaja todo
	</a>

	{#each groups as group (group.title)}
		<div class="mb-6">
			<p class="text-fg-faint mb-2 px-3 text-[11px] font-semibold tracking-widest uppercase">
				{group.title}
			</p>
			<ul class="space-y-0.5">
				{#each group.moduleIds as id (id)}
					{@const mod = byId(id)}
					{#if mod}
						<li>
							<a
								href="#{mod.id}"
								onclick={onNavigate}
								aria-current={activeId === mod.id ? 'true' : undefined}
								class="group flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors duration-200
									{activeId === mod.id
									? 'text-fg bg-white/[0.06]'
									: 'text-fg-muted hover:text-fg hover:bg-white/[0.03]'}"
							>
								<span
									class="transition-colors duration-200 {activeId === mod.id
										? 'text-brand'
										: 'text-fg-faint group-hover:text-fg-muted'}"
								>
									<Icon name={mod.icon} size={15} />
								</span>
								{mod.title}
							</a>
						</li>
					{/if}
				{/each}
			</ul>
		</div>
	{/each}
</nav>
