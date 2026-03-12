import { defineConfig } from 'vitest/config';

export default defineConfig({
  // resolve should be a sibling to test, not a child
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    environment: 'node',
  },
});