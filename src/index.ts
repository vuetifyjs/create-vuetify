#!/usr/bin/env node

import validate from 'validate-npm-package-name'

import { red } from 'kolorist'
import minimist from 'minimist'
import prompts from 'prompts'

import { resolve, join } from 'path'
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'fs'
import { installDependencies, renderTemplate } from './utils'

// Types
import type { Answers } from 'prompts'

async function run () {
  const cwd = process.cwd()

  const argv = minimist(process.argv.slice(2), {
    alias: {
      'typescript': ['ts'],
    },
  })

  type PromptQuestions = 'projectName' | 'canOverwrite' | 'useTypeScript' | 'useYarnOrNpm'

  let context: Answers<PromptQuestions> = {
    projectName: undefined,
    canOverwrite: undefined,
    useTypeScript: argv.typescript,
    useYarnOrNpm: false,
  }

  try {
    context = await prompts<PromptQuestions>([
        {
          name: 'projectName',
          type: 'text',
          message: 'Project name:',
          initial: 'vuetify-project',
          validate: v => {
            const { errors } = validate(String(v).trim())

            return errors && errors.length ?
              `Package ${errors[0]}` :
              true
          },
        },
        {
          name: 'canOverwrite',
          active: 'Yes',
          inactive: 'No',
          initial: false,
          type: (_, { projectName }) => {
            const projectPath = join(cwd, projectName)

            return (
              !existsSync(projectPath) ||
              readdirSync(projectPath).length === 0
            ) ? null : 'toggle'
          },
          message: prev => `The project path: ${resolve(cwd, prev)} already exists, would you like to overwrite this directory?`,
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
          name: 'useYarnOrNpm',
          type: 'multiselect',
          message: 'Would you like to install dependencies with yarn or npm?',
          max: 1,
          min: 1,
          initial: 1,
          choices: [
            { title: 'npm', value: 'npm' },
            { title: 'yarn', value: 'yarn' },
            { title: 'none', value: null },
          ],
        },
      ],
      {
        onCancel: () => {
          throw new Error(red('✖') + ' Operation cancelled')
        },
      },
    )
  } catch (err) {
    console.error(err)
    process.exit()
  }

  const {
    canOverwrite,
    projectName,
    useTypeScript,
    useYarnOrNpm,
  } = context

  const projectRoot = join(cwd, projectName)

  if (canOverwrite) {
    // Clean dir
    rmSync(projectRoot, { recursive: true })
  }

  mkdirSync(projectRoot)

  const rootPkg = { name: projectName }

  writeFileSync(resolve(projectRoot, 'package.json'), JSON.stringify(rootPkg, null, 2))

  const rootTemplatePath = resolve(cwd, 'template')
  const jsOrTs = useTypeScript || argv.typescript ? 'typescript' : 'javascript'
  const preset = !!argv.preset ? argv.preset : 'default'

  console.log('◌ Generating scaffold...')
  renderTemplate(resolve(rootTemplatePath, jsOrTs, preset), projectRoot)

  console.log('USE YARn OR NPM: ', useYarnOrNpm)

  if (useYarnOrNpm[0]) {      
    console.log(`Installing dependencies with ${useYarnOrNpm}.`)
    installDependencies(projectRoot, useYarnOrNpm)
  }

  console.log(`${projectName} has been generated at ${projectRoot}`)
}

run()
  .then((v) => {
    console.log('Discord community: https://community.vuetifyjs.com')
    console.log('Github: https://github.com/vuetifyjs/vuetify')
    console.log('Support Vuetify: https://github.com/sponsors/johnleider')
  })
  .catch((err) => {
    console.error(err)
    process.exit()
  })