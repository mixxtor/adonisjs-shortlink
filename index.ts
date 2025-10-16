/**
 * @mixxtor/adonisjs-shortlink
 *
 * A standalone URL shortener service for AdonisJS v6
 */

export { default as Shortlink } from './src/models/shortlink.js'
export { default as ShortlinkService } from './src/services/shortlink_service.js'
export { default as ShortlinkController } from './src/controllers/shortlink_controller.js'
export { default as ShortlinkProvider } from './providers/shortlink_provider.js'
export { defineConfig } from './src/define_config.js'
export { stubsRoot } from './stubs/main.js'
export { configure } from './configure.js'
export * from './src/types.js'
