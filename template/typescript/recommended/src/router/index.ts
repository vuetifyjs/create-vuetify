/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */
// Composables
import { setupLayouts } from 'virtual:generated-layouts'
import { routes } from 'vue-router/auto-routes'

export default {
  routes: setupLayouts(routes),
  base: import.meta.env.BASE_URL,
}
