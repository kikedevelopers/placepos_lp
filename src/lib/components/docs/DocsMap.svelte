<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	import Icon from '../Icon.svelte';

	/**
	 * El recorrido real del dato: cada etapa deja algo que la siguiente consume.
	 * Es el resumen visual de las relaciones que cada módulo detalla más abajo.
	 */
	const STAGES = [
		{
			id: 'compras',
			icon: 'truck',
			title: 'Compras',
			desc: 'Le compras a un proveedor. Entra mercancía y se calcula lo que de verdad te costó.',
			leaves: 'Deja: stock + costo real'
		},
		{
			id: 'inventario',
			icon: 'boxes',
			title: 'Inventario',
			desc: 'El catálogo guarda qué tienes, cuánto te costó y a qué precio lo vendes.',
			leaves: 'Deja: qué se puede vender'
		},
		{
			id: 'pos',
			icon: 'cart',
			title: 'Punto de venta',
			desc: 'Vendes. El stock baja solo y nace un ticket con su ganancia.',
			leaves: 'Deja: venta + ganancia'
		},
		{
			id: 'tesoreria',
			icon: 'wallet',
			title: 'Tesorería',
			desc: 'La plata cae en una caja, billetera o banco. Si fue a crédito, queda por cobrar.',
			leaves: 'Deja: dinero real'
		},
		{
			id: 'informes',
			icon: 'chart',
			title: 'Informes',
			desc: 'Todo lo anterior se convierte en respuestas: cuánto vendiste y cuánto ganaste.',
			leaves: 'Deja: decisiones'
		}
	];
</script>

<section id="mapa" class="scroll-mt-24 py-10">
	<div class="reveal" use:reveal={{ threshold: 0.05 }}>
		<p class="text-fg-faint text-[11px] font-semibold tracking-widest uppercase">Primero esto</p>
		<h2 class="font-display text-fg mt-2 text-2xl font-bold sm:text-3xl">Cómo encaja todo</h2>
		<p class="text-fg-muted mt-4 max-w-2xl text-[15px] leading-relaxed">
			Ningún módulo vive solo. Un producto entra por compras, se guarda en inventario, sale por el
			punto de venta, se convierte en plata en tesorería y termina explicado en los informes. Cada
			paso deja algo que el siguiente necesita — por eso, si registras bien al principio, los
			números del final cuadran solos.
		</p>
	</div>

	<ol class="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
		{#each STAGES as stage, i (stage.id)}
			<li class="reveal relative" use:reveal={{ threshold: 0.05, delay: Math.min(i * 60, 240) }}>
				<a
					href="#{stage.id}"
					class="group border-line bg-surface/40 hover:border-brand/40 hover:bg-surface flex h-full flex-col rounded-xl border p-4 transition-colors duration-200"
				>
					<div class="flex items-center gap-2">
						<span
							class="text-brand flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]"
						>
							<Icon name={stage.icon} size={15} />
						</span>
						<span class="font-display text-fg text-sm font-bold">{stage.title}</span>
					</div>
					<p class="text-fg-muted mt-3 flex-1 text-[13px] leading-relaxed">{stage.desc}</p>
					<p class="text-brand-3 mt-3 text-[11px] font-medium">{stage.leaves}</p>
				</a>

				<!-- Conector: solo entre etapas, en la fila de 5 columnas -->
				{#if i < STAGES.length - 1}
					<span
						class="text-fg-faint pointer-events-none absolute top-1/2 -right-3 hidden -translate-y-1/2 lg:block"
						aria-hidden="true"
					>
						<Icon name="arrow" size={14} />
					</span>
				{/if}
			</li>
		{/each}
	</ol>

	<div class="reveal mt-4 grid gap-3 sm:grid-cols-2" use:reveal={{ threshold: 0.05 }}>
		<p
			class="border-line bg-surface/40 text-fg-muted rounded-xl border p-4 text-[13px] leading-relaxed"
		>
			<span class="text-fg font-semibold">Los gastos</span> entran por un lado y bajan el saldo de tu
			tesorería, aunque no pasen por el inventario.
		</p>
		<p
			class="border-line bg-surface/40 text-fg-muted rounded-xl border p-4 text-[13px] leading-relaxed"
		>
			<span class="text-fg font-semibold">Empleados y permisos</span> son transversales: deciden quién
			puede ver o hacer cada cosa en todo el recorrido.
		</p>
	</div>
</section>
