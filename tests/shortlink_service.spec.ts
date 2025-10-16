import { test } from '@japa/runner'
import ShortlinkService from '../src/services/shortlink_service.js'

test.group('ShortlinkService', () => {
  test('generateSlug should create a slug of specified length', ({ assert }) => {
    const service = new ShortlinkService({
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
    const service = new ShortlinkService({
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
