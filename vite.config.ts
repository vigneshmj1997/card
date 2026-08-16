import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // A GitHub Pages *project* site is served from /<repo>/, not from the
  // root, and every asset URL in the build has to be prefixed to match.
  // Left as '/' for a custom domain or a <user>.github.io repo; the
  // deploy workflow overrides it when VITE_BASE is set.
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
})
