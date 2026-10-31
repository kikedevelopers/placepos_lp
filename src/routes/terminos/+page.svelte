<script lang="ts">
	import LegalPage from '$lib/components/legal/LegalPage.svelte';
	import { legalDocBySlug } from '$lib/data/legal';

	const doc = legalDocBySlug('terminos')!;
</script>

<LegalPage {doc} />
