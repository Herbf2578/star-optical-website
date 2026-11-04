import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
export default defineConfig([...nextVitals, ...nextTs, globalIgnores(['.next/**', 'out/**', 'test-results/**', 'playwright-report/**', 'docs/test-results/**', 'docs/playwright-report*/**', 'docs/test-runs*/**', 'next-env.d.ts'])]);
