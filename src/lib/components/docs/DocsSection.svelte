<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	import Icon from '../Icon.svelte';
	import type { DocModule } from '$lib/data/docs.types';

	interface Props {
		mod: DocModule;
		/** Para resolver el título de los módulos relacionados. */
		modules: DocModule[];
	}

	let { mod, modules }: Props = $props();

	const titleOf = (id: string) => modules.find((m) => m.id === id)?.title ?? id;
	const existsId = (id: string) => modules.some((m) => m.id === id);
</script>

<!-- scroll-mt: compensa el header fijo al saltar por anclas -->
<section id={mod.id} class="border-line/60 scroll-mt-24 border-t py-14 first:border-t-0 sm:py-16">
	<header class="reveal" use:reveal={{ threshold: 0.05 }}>
		<div class="flex items-center gap-3">
			<span
				class="text-brand flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]"
			>
				<Icon name={mod.icon} size={20} />
			</span>
			<div>
				<p class="text-fg-faint text-[11px] font-semibold tracking-widest uppercase">
					{mod.kicker}
				</p>
				<h2 class="font-display text-fg text-2xl font-bold sm:text-3xl">{mod.title}</h2>
			</div>
		</div>
		<p class="text-fg-muted mt-5 max-w-2xl text-[15px] leading-relaxed">{mod.summary}</p>
	</header>

	<!-- Qué puedes hacer -->
	<h3 class="reveal text-fg mt-10 text-sm font-semibold" use:reveal={{ threshold: 0.05 }}>
		Qué puedes hacer
	</h3>
	<ul class="mt-4 grid gap-3 sm:grid-cols-2">
		{#each mod.capabilities as cap, i (cap.title)}
			<li
				class="reveal card-hairline rounded-xl p-4"
				use:reveal={{ threshold: 0.05, delay: Math.min(i * 40, 200) }}
			>
				<p class="text-fg flex items-start gap-2 text-sm font-medium">
					<span class="text-mint mt-0.5 shrink-0"><Icon name="check" size={14} /></span>
					{cap.title}
				</p>
				<p class="text-fg-muted mt-1.5 pl-6 text-[13px] leading-relaxed">{cap.desc}</p>
			</li>
		{/each}
	</ul>

	<!-- Conceptos clave -->
	{#if mod.concepts?.length}
		<h3 class="reveal text-fg mt-10 text-sm font-semibold" use:reveal={{ threshold: 0.05 }}>
			Conceptos que conviene entender
		</h3>
		<div class="mt-4 space-y-3">
			{#each mod.concepts as concept (concept.term)}
				<div class="reveal card-hairline rounded-xl p-5" use:reveal={{ threshold: 0.05 }}>
					<p class="font-display text-fg text-[15px] font-bold">{concept.term}</p>
					<p class="text-fg-muted mt-2 text-[14px] leading-relaxed">{concept.desc}</p>
					{#if concept.example}
						<p
							class="border-brand/60 text-fg-muted mt-3 whitespace-pre-line rounded-lg border-l-2 bg-white/[0.03] px-4 py-3 font-mono text-[12.5px] leading-relaxed"
						>
							{concept.example}
						</p>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	<!-- Relaciones -->
	{#if mod.relations?.length}
		<h3 class="reveal text-fg mt-10 text-sm font-semibold" use:reveal={{ threshold: 0.05 }}>
			Cómo se conecta con lo demás
		</h3>
		<ul class="reveal mt-4 space-y-2.5" use:reveal={{ threshold: 0.05 }}>
			{#each mod.relations as rel (rel.to + rel.desc)}
				<li class="text-fg-muted flex items-start gap-3 text-[14px] leading-relaxed">
					<span class="text-brand-3 mt-1 shrink-0"><Icon name="arrow" size={13} /></span>
					<span>
						{#if existsId(rel.to)}
							<a
								href="#{rel.to}"
								class="text-fg decoration-brand/40 hover:decoration-brand font-medium underline underline-offset-4 transition-colors duration-200"
							>
								{titleOf(rel.to)}
							</a>
						{:else}
							<span class="text-fg font-medium">{titleOf(rel.to)}</span>
						{/if}
						<span> — {rel.desc}</span>
					</span>
				</li>
			{/each}
		</ul>
	{/if}

	<!-- Flujo típico -->
	{#if mod.flow?.length}
		<h3 class="reveal text-fg mt-10 text-sm font-semibold" use:reveal={{ threshold: 0.05 }}>
			Flujo típico
		</h3>
		<ol class="mt-4 space-y-3">
			{#each mod.flow as step, i (step)}
				<li
					class="reveal flex items-start gap-3"
					use:reveal={{ threshold: 0.05, delay: Math.min(i * 40, 200) }}
				>
					<span
						class="border-brand/30 bg-brand/10 text-brand mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold"
					>
						{i + 1}
					</span>
					<p class="text-fg-muted text-[14px] leading-relaxed">{step}</p>
				</li>
			{/each}
		</ol>
	{/if}
</section>
