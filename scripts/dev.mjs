/**
 * `npm run dev` — the site and the admin API together.
 *
 * The dashboard is useless without its API, and Vite does not serve one, so both
 * are started here. Vite proxies `/api/*` through to the API process.
 */
import { spawn } from 'node:child_process'

const children = []

function run(name, command, args) {
  const child = spawn(command, args, { stdio: 'inherit', shell: process.platform === 'win32' })
  child.on('exit', (code) => {
    if (code) console.error(`\n${name} exited with code ${code}`)
    shutdown()
  })
  children.push(child)
  return child
}

function shutdown() {
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM')
  }
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    shutdown()
    process.exit(0)
  })
}

run('admin API', 'npx', ['tsx', 'scripts/dev-api.mts'])
run('vite', 'npx', ['vite'])
