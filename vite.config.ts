import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // @ts-ignore
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Replaces process.env.API_KEY with the string value during build
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Polyfill process.env to prevent crashes if other libs access it
      'process.env': {},
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});