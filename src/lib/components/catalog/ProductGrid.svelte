<script lang="ts">
	import ProductCard from './ProductCard.svelte';
	import type { CatalogProduct } from '$lib/api/catalog';

	let {
		products,
		showCategory = true,
		onselect
	}: {
		products: CatalogProduct[];
		showCategory?: boolean;
		onselect?: (product: CatalogProduct) => void;
	} = $props();
</script>

<!--
  Cuadrícula responsiva. La virtualización es NATIVA: cada tarjeta usa
  `content-visibility: auto` (clase `.cv-card`), así el navegador se salta el
  render/layout de las que están fuera de pantalla. A diferencia de una
  virtualización por scroll a mano, esto convive sin esfuerzo con las secciones
  de altura variable y con el salto por ancla del sidebar.
-->
<div
	class="grid gap-4 sm:gap-5"
	style="grid-template-columns: repeat(auto-fill, minmax(190px, 1fr))"
>
	{#each products as product (product.id)}
		<div class="cv-card">
			<ProductCard {product} {showCategory} {onselect} />
		</div>
	{/each}
</div>

<style>
	/* La tarjeta mide 330px de alto fijo: el tamaño intrínseco reservado hace que
	   la barra de scroll no salte al entrar/salir del viewport. */
	.cv-card {
		content-visibility: auto;
		contain-intrinsic-size: auto 330px;
	}
</style>
