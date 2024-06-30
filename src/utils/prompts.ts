// Node
import { resolve, join } from 'path'
import { existsSync, readdirSync } from 'fs'

// Types
import type { Options as PromptOptions, PromptObject } from 'prompts'

// Utils
import { presets } from './presets'
import { red } from 'kolorist'
import prompts from 'prompts'
import validate from 'validate-npm-package-name'

type ContextState = {
  cwd: string,
  projectName?: string,
  canOverwrite?: boolean,
  useTypeScript?: boolean,
  usePackageManager?: 'npm' | 'pnpm' | 'yarn' | 'bun',
  installDependencies?: boolean,
  usePreset?: 'base' | 'default' | 'essentials'
}

// Array of prompt question objects
const promptQuestions = (context: ContextState): PromptObject<string>[] => [
  {
    name: 'projectName',
    type: 'text',
    message: 'Project name:',
    initial: 'vuetify-project',
    validate: (v: string) => {
      const { errors } = validate(String(v).trim())

      return !(errors && errors.length) || `Package ${errors[0]}`
    },
  },
  {
    name: 'canOverwrite',
    active: 'Yes',
    inactive: 'No',
    initial: false,
    type: (_: any, { projectName }) => {
      const projectPath = join(context.cwd, projectName)

      return (
        !existsSync(projectPath) ||
        readdirSync(projectPath).length === 0
      ) ? null : 'toggle'
    },
    message: (prev: string) => `The project path: ${resolve(context.cwd, prev)} already exists, would you like to overwrite this directory?`,
  },
  {
    name: 'usePreset',
    type: context.usePreset ? null : 'select',
    message: 'Which preset would you like to install?',
    initial: 0,
    choices: [
      { title: 'Default (Vuetify)', value: 'default' },
      { title: 'Base (Default, Routing)', value: 'base' },
      { title: 'Essentials (Base, Layouts, Pinia)', value: 'essentials' },
      { title: 'Recommended (Base, Essentials, SSG)', value: 'recommended' },
    ],
  },
  {
    name: 'useTypeScript',
    type: context.useTypeScript ? null : 'toggle',
    message: 'Use TypeScript?',
    active: 'Yes',
    inactive: 'No',
    initial: false,
  },
  {
    name: 'usePackageManager',
    type: 'select',
    message: 'Would you like to install dependencies with yarn, npm, pnpm, or bun?',
    initial: 0,
    choices: [
      { title: 'yarn', value: 'yarn' },
      { title: 'npm', value: 'npm' },
      { title: 'pnpm', value: 'pnpm' },
      { title: 'bun', value: 'bun' },
      { title: 'none', value: null },
    ],
  },
  {
    name: 'installDependencies',
    type: context.installDependencies ? null : 'toggle',
    message: 'Install Dependencies?',
    active: 'Yes',
    inactive: 'No',
    initial: 'Yes',
  },
]

const promptOptions: PromptOptions = {
  onCancel: () => {
    throw new Error(red('✖') + ' Operation cancelled')
  },
}

type DefinedContextState = { [P in keyof ContextState]-?: ContextState[P] }

const initPrompts = async (context: ContextState) => {
  if (context.usePreset) {
    context = {
      ...context,
      ...presets[context.usePreset],
    }
  }

  const answers = await prompts(promptQuestions(context), promptOptions)

  return {
    ...context,
    ...answers,
  } as DefinedContextState
}

export { initPrompts }
export type { ContextState }
