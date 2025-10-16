/**
 * Test runner
 *
 * This file is used to run tests for the package
 */

import { assert } from '@japa/assert'
import { configure, processCLIArgs, run } from '@japa/runner'

/**
 * Configure test runner
 */
processCLIArgs(process.argv.splice(2))
configure({
  files: ['tests/**/*.spec.ts'],
  plugins: [assert()],
})

run()
