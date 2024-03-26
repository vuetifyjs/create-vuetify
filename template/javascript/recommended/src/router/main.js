/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'
import { ViteSSG } from 'vite-ssg'
import routes from '@/router'

// Components
import App from './App.vue'

// Composables

export const createApp = ViteSSG(
  App,
  routes,
  ({ app }) => {
    registerPlugins(app)
  }
)
