import { test } from '@japa/runner'
import { defineConfig } from '../src/define_config.js'

test.group('Integration Tests', () => {
  test('should define config with required fields', ({ assert }) => {
    const mockModel = class MockModel {}

    const config = defineConfig({
      model: () => mockModel as any,
      enabled: true,
      domain: 'short.test.com',
      slugLength: 8,
      trackClicks: true,
      redirectStatusCode: 301,
    })

    assert.equal(config.domain, 'short.test.com')
    assert.equal(config.enabled, true)
    assert.equal(config.protocol, 'https')
    assert.equal(config.path, 's')
    assert.equal(config.slugLength, 8)
    assert.equal(config.trackClicks, true)
    assert.equal(config.redirectStatusCode, 301)
    assert.equal(config.connection, 'pg')
    assert.equal(config.tableName, 'shortlinks')
  })

  test('should throw error for missing model', ({ assert }) => {
    assert.throws(
      () =>
        defineConfig({
          model: undefined as any,
          enabled: true,
          domain: 'short.test.com',
          slugLength: 8,
          trackClicks: true,
          redirectStatusCode: 301,
        }),
      'Shortlink model is required. Please provide a model configuration.'
    )
  })

  test('should throw error for missing domain', ({ assert }) => {
    const mockModel = class MockModel {}

    assert.throws(
      () =>
        defineConfig({
          model: () => mockModel as any,
          enabled: true,
          domain: '',
          slugLength: 8,
          trackClicks: true,
          redirectStatusCode: 301,
        }),
      'Shortlink domain is required. Please set SHORTLINK_DOMAIN in your environment.'
    )
  })

  test('should use default values for optional config', ({ assert }) => {
    const mockModel = class MockModel {}

    const config = defineConfig({
      model: () => mockModel as any,
      domain: 'short.test.com',
      slugLength: 8,
      trackClicks: true,
      redirectStatusCode: 301,
    } as any)

    assert.equal(config.enabled, true)
    assert.equal(config.protocol, 'https')
    assert.equal(config.path, 's')
    assert.equal(config.connection, 'pg')
    assert.equal(config.tableName, 'shortlinks')
  })

  test('should override defaults with provided values', ({ assert }) => {
    const mockModel = class MockModel {}

    const config = defineConfig({
      model: () => mockModel as any,
      enabled: false,
      domain: 'short.test.com',
      protocol: 'http',
      path: 'l',
      slugLength: 12,
      trackClicks: false,
      redirectStatusCode: 302,
      connection: 'mysql',
      tableName: 'custom_shortlinks',
    })

    assert.equal(config.enabled, false)
    assert.equal(config.protocol, 'http')
    assert.equal(config.path, 'l')
    assert.equal(config.slugLength, 12)
    assert.equal(config.trackClicks, false)
    assert.equal(config.redirectStatusCode, 302)
    assert.equal(config.connection, 'mysql')
    assert.equal(config.tableName, 'custom_shortlinks')
  })
})
