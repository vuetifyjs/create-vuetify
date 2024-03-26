// Node
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'
import { mkdirSync, rmSync, writeFileSync } from 'fs'

// Types
import type { ContextState } from './utils/prompts'

// Utils
import { initPrompts } from './utils/prompts'
import { red } from 'kolorist'
import minimist from 'minimist'
import { installDependencies, renderTemplate } from './utils'

const validPresets = ['base', 'custom', 'default', 'essentials', 'recommended']

async function run () {
  const argv = minimist(process.argv.slice(2), {
    alias: {
      'typescript': ['ts'],
    },
  })

  if (argv.preset && !validPresets.includes(argv.preset)) {
    throw new Error(`'${argv.preset}' is not a valid preset. Valid presets are: ${validPresets.join(', ')}.`)
  }

  const banner = '[38;2;22;151;246mV[39m[38;2;22;147;242mu[39m[38;2;22;144;238me[39m[38;2;22;140;234mt[39m[38;2;23;136;229mi[39m[38;2;23;133;225mf[39m[38;2;23;129;221my[39m[38;2;23;125;217m.[39m[38;2;23;121;213mj[39m[38;2;23;118;209ms[39m [38;2;24;114;204m-[39m [38;2;24;110;200mM[39m[38;2;24;107;196ma[39m[38;2;24;103;192mt[39m[38;2;32;110;197me[39m[38;2;39;118;202mr[39m[38;2;47;125;207mi[39m[38;2;54;132;211ma[39m[38;2;62;140;216ml[39m [38;2;70;147;221mC[39m[38;2;77;154;226mo[39m[38;2;85;161;231mm[39m[38;2;93;169;236mp[39m[38;2;100;176;240mo[39m[38;2;108;183;245mn[39m[38;2;115;191;250me[39m[38;2;123;198;255mn[39m[38;2;126;199;255mt[39m [38;2;129;201;255mF[39m[38;2;133;202;255mr[39m[38;2;136;204;255ma[39m[38;2;139;205;255mm[39m[38;2;142;207;255me[39m[38;2;145;208;255mw[39m[38;2;149;210;255mo[39m[38;2;152;211;255mr[39m[38;2;155;212;255mk[39m [38;2;158;214;255mf[39m[38;2;161;215;255mo[39m[38;2;164;217;255mr[39m [38;2;168;218;255mV[39m[38;2;171;220;255mu[39m[38;2;174;221;255me[39m'

  console.log(`\n${banner}\n`)

  const context: ContextState = {
    canOverwrite: false,
    cwd: process.cwd(),
    projectName: 'vuetify-project',
    useRouter: false,
    useTypeScript: argv.typescript,
    usePreset: argv.preset,
    useStore: undefined,
    usePackageManager: undefined,
  }

  const {
    canOverwrite,
    cwd,
    projectName,
    useTypeScript,
    usePackageManager,
    installDependencies: installDeps,
    usePreset,
  } = await initPrompts(context)

  const projectRoot = join(cwd, projectName)

  if (canOverwrite) {
    // Clean dir
    rmSync(projectRoot, { recursive: true })
  }

  // Create project directory
  mkdirSync(projectRoot)

  // Create base package.json
  writeFileSync(resolve(projectRoot, 'package.json'), JSON.stringify({ name: projectName }, null, 2))

  const jsOrTs = useTypeScript ? 'typescript' : 'javascript'
  let templatePath = resolve(dirname(fileURLToPath(import.meta.url)), '../template', jsOrTs)

  console.log('\n◌ Generating scaffold...')

  renderTemplate(resolve(templatePath, 'default'), projectRoot)

  if (['base', 'essentials', 'recommended'].includes(usePreset)) {
    renderTemplate(resolve(templatePath, 'base'), projectRoot)
  }

  if (['essentials', 'recommended'].includes(usePreset)) {
    renderTemplate(resolve(templatePath, 'essentials'), projectRoot)
  }

  if (['recommended'].includes(usePreset)) {
    renderTemplate(resolve(templatePath, 'recommended'), projectRoot)
  }

  if (usePackageManager && installDeps) {
    console.log(`◌ Installing dependencies with ${usePackageManager}...\n`)
    installDependencies(projectRoot, usePackageManager)
  }

  console.log(`\n${projectName} has been generated at ${projectRoot}\n`)
}

run()
  .then(() => {
    console.log('Discord community: https://community.vuetifyjs.com')
    console.log('Github: https://github.com/vuetifyjs/vuetify')
    console.log('Support Vuetify: https://github.com/sponsors/johnleider')
  })
  .catch((err) => {
    console.error(`\n${red('✖')} ${err}\n`)
    process.exit(1)
  })
