import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // @ts-ignore
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Polyfill process.env for the browser
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Define process to avoid ReferenceError in some environments that might check process.env.*
      'process.env': {},
    },
  };
});