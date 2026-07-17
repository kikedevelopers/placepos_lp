/**
 * Tipos del contenido de la documentación. El contenido vive como DATOS
 * (mismo patrón que FEATURES/FAQ en `site.ts`): la página solo los recorre y
 * los pinta, así que añadir un módulo es añadir un objeto, no tocar el layout.
 */

/** Una capacidad concreta: qué puedes hacer y por qué le sirve al negocio. */
export interface DocCapability {
	title: string;
	desc: string;
}

/** Un concepto del dominio. `example` se pinta como cita destacada. */
export interface DocConcept {
	term: string;
	desc: string;
	example?: string;
}

/** Relación con otro módulo: hacia dónde va (o de dónde viene) el dato. */
export interface DocRelation {
	/** id del módulo relacionado — se enlaza si existe en DOC_MODULES. */
	to: string;
	desc: string;
}

/** Un módulo documentado = una sección de la página. */
export interface DocModule {
	id: string;
	/** Clave de Icon.svelte. */
	icon: string;
	/** Área funcional, se pinta como etiqueta sobre el título. */
	kicker: string;
	title: string;
	/** Una frase: qué es y para qué sirve. */
	summary: string;
	capabilities: DocCapability[];
	concepts?: DocConcept[];
	relations?: DocRelation[];
	/** Flujo típico paso a paso. */
	flow?: string[];
}

/** Grupo del índice lateral. */
export interface DocGroup {
	title: string;
	moduleIds: string[];
}
