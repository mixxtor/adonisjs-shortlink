/**
 * Configure hook
 *
 * This file is used to configure the package when installed via `node ace add`
 */

import type Configure from '@adonisjs/core/commands/configure'
import { stubsRoot } from './stubs/main.js'

/**
 * Configures the package
 */
export async function configure(command: Configure) {
  const codemods = await command.createCodemods()

  /**
   * Publish config file
   */
  await codemods.makeUsingStub(stubsRoot, 'config/shortlink.stub', {})

  /**
   * Publish model file
   */
  await codemods.makeUsingStub(stubsRoot, 'models/shortlink.stub', {})

  /**
   * Publish migration file
   */
  await codemods.makeUsingStub(stubsRoot, 'migrations/shortlink.stub', {
    migration: {
      folder: 'database/migrations',
      fileName: `${new Date().getTime()}_create_shortlinks_table.ts`,
    },
  })

  /**
   * Register provider
   */
  await codemods.updateRcFile((rcFile: any) => {
    rcFile.addProvider('@mixxtor/adonisjs-shortlink/shortlink_provider')
  })

  /**
   * Add environment variables
   */
  await codemods.defineEnvVariables({
    SHORTLINK_ENABLED: true,
    SHORTLINK_DOMAIN: 'short.domain.com',
    SHORTLINK_PROTOCOL: 'https',
    SHORTLINK_PATH: 's',
    SHORTLINK_SLUG_LENGTH: '8',
    SHORTLINK_TRACK_CLICKS: true,
    SHORTLINK_REDIRECT_STATUS_CODE: 301,
    SHORTLINK_DB_CONNECTION: 'pg',
    SHORTLINK_TABLE_NAME: 'shortlinks',
  })

  /**
   * Add environment validation
   */
  await codemods.defineEnvValidations({
    leadingComment: 'Shortlink configuration',
    variables: {
      SHORTLINK_ENABLED: `Env.schema.boolean.optional()`,
      SHORTLINK_DOMAIN: `Env.schema.string({ format: 'host' })`,
      SHORTLINK_PROTOCOL: `Env.schema.enum.optional(['http', 'https'] as const)`,
      SHORTLINK_PATH: `Env.schema.string.optional()`,
      SHORTLINK_SLUG_LENGTH: `Env.schema.number.optional()`,
      SHORTLINK_TRACK_CLICKS: `Env.schema.boolean.optional()`,
      SHORTLINK_REDIRECT_STATUS_CODE: `Env.schema.enum.optional([301, 302] as const)`,
      SHORTLINK_DB_CONNECTION: `Env.schema.string.optional()`,
      SHORTLINK_TABLE_NAME: `Env.schema.string.optional()`,
    },
  })
}
