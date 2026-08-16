import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite requires a base with a slash at both ends, and the value handed to
 * us may have neither: GitHub reports a project path as "/repo", and an
 * empty string for a root site. Normalising here means the workflow can
 * pass its output through untouched.
 */
function normalizeBase(value?: string): string {
  if (!value || value === '/') return '/'
  const withLeading = value.startsWith('/') ? value : `/${value}`
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`
}

// https://vite.dev/config/
export default defineConfig({
  // A GitHub Pages *project* site is served from /<repo>/, not from the
  // root, and every asset URL in the build has to be prefixed to match.
  // The deploy workflow passes that prefix in as VITE_BASE; '/' is right
  // for local dev, a <user>.github.io repo, or a custom domain.
  base: normalizeBase(process.env.VITE_BASE),
  plugins: [react()],
})
