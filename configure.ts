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
   * Publish migration file
   */
  await codemods.makeUsingStub(stubsRoot, 'migration.stub', {
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
    SHORT_DOMAIN: 'short.domain.com',
    SHORT_SLUG_LENGTH: '8',
    SHORT_TRACK_CLICKS: 'true',
    SHORT_REDIRECT_STATUS: '301',
  })

  /**
   * Add environment validation
   */
  await codemods.defineEnvValidations({
    leadingComment: 'Shortlink configuration',
    variables: {
      SHORT_DOMAIN: `Env.schema.string()`,
      SHORT_SLUG_LENGTH: `Env.schema.number.optional()`,
      SHORT_TRACK_CLICKS: `Env.schema.boolean.optional()`,
      SHORT_REDIRECT_STATUS: `Env.schema.enum.optional(['301', '302'] as const)`,
    },
  })
}
