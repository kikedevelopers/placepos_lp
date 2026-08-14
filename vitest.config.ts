import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Config propia, sin el plugin de SvelteKit: lo que se prueba son los datos y la
// aritmética de la landing (`$lib/data`, `$lib/utils`), no los componentes, y
// arrancar todo el pipeline de SvelteKit para eso solo añade partes que se
// pueden romper. `$app/environment` es lo único de SvelteKit que atraviesan esos
// módulos y se resuelve con un stub.
const path = (relative: string) => fileURLToPath(new URL(relative, import.meta.url));

export default defineConfig({
    resolve: {
        alias: {
            $lib: path('./src/lib'),
            '$app/environment': path('./src/lib/__tests__/stubs/app-environment.ts')
        }
    },
    test: {
        include: ['src/**/*.test.ts']
    }
});
