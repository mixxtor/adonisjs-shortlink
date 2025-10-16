import type { ApplicationService } from '@adonisjs/core/types'
import ShortlinkService from '../src/services/shortlink_service.js'
import type { ShortlinkConfig } from '../src/types.js'

/**
 * Shortlink provider to register the service with the IoC container
 */
export default class ShortlinkProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register bindings to the container
   */
  register() {
    this.app.container.singleton('shortlink', async () => {
      const configProvider = this.app.config.get<ShortlinkConfig>('shortlink')
      return new ShortlinkService(configProvider)
    })
  }

  /**
   * The container bindings have booted
   */
  async boot() {}

  /**
   * The application has been booted
   */
  async start() {}

  /**
   * The process has been started
   */
  async ready() {}

  /**
   * Preparing to shutdown the app
   */
  async shutdown() {}
}
