import { RuntimeException } from '@adonisjs/core/exceptions'
import type { ShortlinkConfig } from './types.js'

/**
 * Define shortlink configuration with validation
 */
export function defineConfig(config: ShortlinkConfig): ShortlinkConfig {
  if (!config.model) {
    throw new RuntimeException('Shortlink model is required. Please provide a model configuration.')
  }

  if (!config.domain) {
    throw new RuntimeException(
      'Shortlink domain is required. Please set SHORTLINK_DOMAIN in your environment.'
    )
  }

  return {
    model: config.model,
    enabled: config.enabled ?? true,
    protocol: config.protocol ?? 'https',
    domain: config.domain,
    path: config.path,
    slugLength: config.slugLength ?? 8,
    trackClicks: config.trackClicks ?? true,
    redirectStatusCode: config.redirectStatusCode ?? 301,
    connection: config.connection ?? 'pg',
    tableName: config.tableName ?? 'shortlinks',
  }
}
