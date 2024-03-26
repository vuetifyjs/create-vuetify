/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import vuetify from './vuetify'
import pinia from '../stores'

export function registerPlugins (app) {
  app
    .use(vuetify)
    .use(pinia)
}
