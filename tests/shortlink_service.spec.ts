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
    })
    const slug1 = service['generateSlug']()
    const slug2 = service['generateSlug']()

    assert.notEqual(slug1, slug2)
  })
})
