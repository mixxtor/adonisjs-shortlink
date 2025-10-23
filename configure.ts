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
  await codemods.makeUsingStub(stubsRoot, 'config/shortlink.stub', {
    fileName: 'shortlink.ts',
  })

  /**
   * Publish model file
   */
  await codemods.makeUsingStub(stubsRoot, 'models/shortlink.stub', {
    fileName: 'shortlink.ts',
  })

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
    SHORTLINK_PREFIX: 's',
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
      SHORTLINK_DOMAIN: `Env.schema.string()`,
      SHORTLINK_PROTOCOL: `Env.schema.enum.optional(['http', 'https'] as const)`,
      SHORTLINK_PREFIX: `Env.schema.string.optional()`,
      SHORTLINK_SLUG_LENGTH: `Env.schema.number.optional()`,
      SHORTLINK_TRACK_CLICKS: `Env.schema.boolean.optional()`,
      SHORTLINK_REDIRECT_STATUS_CODE: `Env.schema.enum.optional([301, 302] as const)`,
      SHORTLINK_DB_CONNECTION: `Env.schema.string.optional()`,
      SHORTLINK_TABLE_NAME: `Env.schema.string.optional()`,
    },
  })

  /**
   * Setup routes
   */
  const setupRoutes = await command.prompt.confirm('Do you want to generate shortlink routes?', {
    default: true,
  })

  if (setupRoutes) {
    // Create custom controller
    await codemods.makeUsingStub(stubsRoot, 'controllers/shortlink_controller.stub', {
      fileName: 'shortlink_controller.ts',
    })
    
    // Create routes with custom controller
    await codemods.makeUsingStub(stubsRoot, 'routes/shortlink.stub', {
      fileName: 'shortlinks.ts',
    })

    // Show setup instructions
    command.logger.info('')
    command.logger.success('✅ Routes generated successfully!')
    command.logger.info('')
    command.logger.info('📋 Next steps:')
    command.logger.info('1. Run "node ace migration:run" to create the shortlinks table')
    command.logger.info('2. Update your .env file with the SHORTLINK_DOMAIN')
    command.logger.info('3. Include the routes in your main routes file:')
    command.logger.info('')
    command.logger.info('   In start/routes.ts add:')
    command.logger.info('   import "./shortlinks.js"')
    command.logger.info('')
    command.logger.info('4. Your shortlinks will be available at: GET /{config.shortlink.path}/:slug')
    command.logger.info('5. Customize the generated controller as needed')
    command.logger.info('')
    command.logger.info('🔗 Example usage:')
    command.logger.info('   const shortlinkService = await app.container.make("shortlink")')
    command.logger.info('   const link = await shortlinkService.create("https://example.com")')
    command.logger.info('   console.log(shortlinkService.getShortUrl(link.slug))')
  }
}
