/*
 * @mixxtor/adonisjs-shortlink
 *
 * (c) Mixxtor
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import app from '@adonisjs/core/services/app'
import ShortlinkService from './shortlink_service.js'
import type { ShortlinkServiceContract, ShortlinkConfig, ShortlinkModel } from '../types.js'

/**
 * Create and return a shortlink service instance
 * This allows for direct usage without IoC container complexity
 */
async function createShortlinkService(): Promise<ShortlinkServiceContract> {
  // Try to get from IoC container first (if available and booted)
  if (app.isBooted) {
    try {
      return await app.container.make('shortlink')
    } catch {
      // Fallback to direct instantiation with config
      const config = app.config.get<ShortlinkConfig<ShortlinkModel>>('shortlink')
      return new ShortlinkService(config)
    }
  }

  // For non-booted apps, create with config
  const config = app.config.get<ShortlinkConfig<ShortlinkModel>>('shortlink')
  return new ShortlinkService(config)
}

// Export async factory function
export { createShortlinkService }

// For backward compatibility and direct usage, export the service class
export { default as ShortlinkService } from './shortlink_service.js'

// Default export for direct service instantiation
export default await createShortlinkService()
