import { test } from '@japa/runner'
import ShortlinkService from '../src/services/shortlink_service.js'

test.group('ShortlinkService', () => {
  test('generateSlug should create a slug of specified length', ({ assert }) => {
    const mockModel = class MockModel {
      static query() {
        return {
          where() {
            return { first: () => null }
          },
        }
      }
    }

    const service = new ShortlinkService({
      model: () => mockModel as any,
      enabled: true,
      domain: 'short.test.com',
      slugLength: 8,
      trackClicks: true,
      redirectStatusCode: 301 as const,
      tableName: 'shortlinks',
    })
    const slug = service['generateSlug']()

    assert.equal(slug.length, 8)
    assert.match(slug, /^[a-zA-Z0-9]+$/)
  })

  test('generateSlug should create unique slugs', ({ assert }) => {
    const mockModel = class MockModel {
      static query() {
        return {
          where() {
            return { first: () => null }
          },
        }
      }
    }

    const service = new ShortlinkService({
      model: () => mockModel as any,
      enabled: true,
      domain: 'short.test.com',
      slugLength: 8,
      trackClicks: true,
      redirectStatusCode: 301 as const,
      tableName: 'shortlinks',
    })
    const slug1 = service['generateSlug']()
    const slug2 = service['generateSlug']()

    assert.notEqual(slug1, slug2)
  })

  test('should set base URL correctly', ({ assert }) => {
    const mockModel = class MockModel {
      static query() {
        return {
          where() {
            return { first: () => null }
          },
        }
      }
    }

    const service = new ShortlinkService({
      model: () => mockModel as any,
      enabled: true,
      domain: 'short.test.com',
      protocol: 'https',
      path: 's',
      slugLength: 8,
      trackClicks: true,
      redirectStatusCode: 301 as const,
      tableName: 'shortlinks',
    })

    service.setBaseUrl('example.com', 'https')
    assert.equal(service['baseUrl'], 'https://example.com')

    service.setBaseUrl('https://custom.com')
    assert.equal(service['baseUrl'], 'https://custom.com')
  })

  test('should generate correct base path URL', ({ assert }) => {
    const mockModel = class MockModel {
      static query() {
        return {
          where() {
            return { first: () => null }
          },
        }
      }
    }

    const service = new ShortlinkService({
      model: () => mockModel as any,
      enabled: true,
      domain: 'short.test.com',
      protocol: 'https',
      path: 's',
      slugLength: 8,
      trackClicks: true,
      redirectStatusCode: 301 as const,
      tableName: 'shortlinks',
    })

    const basePathUrl = service.getBasePathUrl()
    assert.equal(basePathUrl, 'https://short.test.com/s/')

    const customPathUrl = service.getBasePathUrl('custom')
    assert.equal(customPathUrl, 'https://short.test.com/custom/')
  })

  test('should generate correct short URL', ({ assert }) => {
    const mockModel = class MockModel {
      static query() {
        return {
          where() {
            return { first: () => null }
          },
        }
      }
    }

    const service = new ShortlinkService({
      model: () => mockModel as any,
      enabled: true,
      domain: 'short.test.com',
      protocol: 'https',
      path: 's',
      slugLength: 8,
      trackClicks: true,
      redirectStatusCode: 301 as const,
      tableName: 'shortlinks',
    })

    const shortUrl = service.getShortUrl('test123')
    assert.equal(shortUrl, 'https://short.test.com/s/test123')
  })

  test('should extract slug from short URL', ({ assert }) => {
    const mockModel = class MockModel {
      static query() {
        return {
          where() {
            return { first: () => null }
          },
        }
      }
    }

    const service = new ShortlinkService({
      model: () => mockModel as any,
      enabled: true,
      domain: 'short.test.com',
      protocol: 'https',
      path: 's',
      slugLength: 8,
      trackClicks: true,
      redirectStatusCode: 301 as const,
      tableName: 'shortlinks',
    })

    const slug = service.getSlugFromShortUrl('https://short.test.com/s/test123')
    assert.equal(slug, 'test123')

    const invalidSlug = service.getSlugFromShortUrl('https://other.com/test123')
    assert.isUndefined(invalidSlug)
  })

  test('should handle empty slug gracefully', ({ assert }) => {
    const mockModel = class MockModel {
      static query() {
        return {
          where() {
            return { first: () => null }
          },
        }
      }
    }

    const service = new ShortlinkService({
      model: () => mockModel as any,
      enabled: true,
      domain: 'short.test.com',
      protocol: 'https',
      path: 's',
      slugLength: 8,
      trackClicks: true,
      redirectStatusCode: 301 as const,
      tableName: 'shortlinks',
    })

    const shortUrl = service.getShortUrl('')
    assert.isUndefined(shortUrl)
  })

  test('should use custom slug length', ({ assert }) => {
    const mockModel = class MockModel {
      static query() {
        return {
          where() {
            return { first: () => null }
          },
        }
      }
    }

    const service = new ShortlinkService({
      model: () => mockModel as any,
      enabled: true,
      domain: 'short.test.com',
      protocol: 'https',
      path: 's',
      slugLength: 12,
      trackClicks: true,
      redirectStatusCode: 301 as const,
      tableName: 'shortlinks',
    })

    const slug = service['generateSlug']()
    assert.equal(slug.length, 12)
  })

  test('should throw error if model not configured', async ({ assert }) => {
    const service = new ShortlinkService({
      model: undefined as any,
      enabled: true,
      domain: 'short.test.com',
      slugLength: 8,
      trackClicks: true,
      redirectStatusCode: 301 as const,
      tableName: 'shortlinks',
    })

    await assert.rejects(() => service.getModel(), 'Shortlink model not configured')
  })
})
