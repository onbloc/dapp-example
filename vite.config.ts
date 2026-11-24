import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

// GitHub Pages serves 404.html for unknown paths, so deep routes like /mobile resolve to the SPA.
const spaFallback = (): Plugin => ({
  name: 'spa-fallback',
  apply: 'build',
  closeBundle() {
    copyFileSync(resolve('dist/index.html'), resolve('dist/404.html'));
  },
});

export default defineConfig(({ command, mode, isPreview }) => ({
  base: command === 'build' || isPreview ? '/dapp-example/' : '/',
  // The mobile wallet only calls back to https URLs, so `npm run dev:https` serves over TLS for device testing.
  plugins: [react(), spaFallback(), ...(mode === 'https' ? [basicSsl()] : [])],
  resolve: { alias: { '@': resolve('src') } },
  server: { host: mode === 'https' ? true : undefined },
  // cosmjs is a lazily loaded chunk of ~1.3 MB, used only by the Cosmos examples.
  build: { chunkSizeWarningLimit: 1400 },
  test: { environment: 'node', setupFiles: ['src/test/setup.ts'] },
}));
