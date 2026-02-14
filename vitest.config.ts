import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    setupFiles: ['./src/test/setupRenderer.ts'],
    environmentMatchGlobs: [
      ['src/renderer/**/*.test.ts', 'jsdom']
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**'],
      exclude: [
        'coverage/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.config.*',
        'src/domain/types/**',
        'src/main/main.ts',
        'src/renderer/main.ts',
        'src/preload/**',
        'src/renderer/assets/**',
        'src/**/index.ts', // Index files explicitly if they are just exports
        'src/shared/types.ts',
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
    },
  },
});
