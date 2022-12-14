import { build } from 'esbuild'

async function bundleMain () {
  await build({
    bundle: true,
    entryPoints: ['src/index.ts'],
    outfile: 'dist/output.cjs',
    format: 'cjs',
    platform: 'node',
    target: 'node14',
    external: ['validate-npm-package-name', 'kolorist', 'minimist', 'prompts'],
  })
}

async function bundle () {
  await bundleMain()
}

bundle()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
