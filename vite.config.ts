import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'
import { defineConfig, type Plugin } from 'vite'

// Every build gets an ID: the short git commit plus when it was built. It's baked into the
// app (__BUILD_ID__ etc.) and also written to dist/version.json. A running tablet checks
// that file now and then; when the live ID differs from its own, a new version has been
// deployed and the app reloads itself (src/hooks/useAutoReload.ts).
function gitCommit(): string {
  // Vercel says which commit it's building; locally, ask git
  const fromVercel = process.env.VERCEL_GIT_COMMIT_SHA
  if (fromVercel) return fromVercel.slice(0, 7)
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    return 'unknown'
  }
}

const commit = gitCommit()
const builtAt = new Date().toISOString()
const buildId = `${commit}-${builtAt}`

function versionFile(): Plugin {
  return {
    name: 'version-file',
    apply: 'build',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ buildId, commit, builtAt }) })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), versionFile()],
  define: {
    __BUILD_ID__: JSON.stringify(buildId),
    __BUILD_COMMIT__: JSON.stringify(commit),
    __BUILD_TIME__: JSON.stringify(builtAt),
  },
})
