// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://seedmask.io',
  trailingSlash: 'never',
  build: {
    format: 'directory',
  },
});
