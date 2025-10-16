import type { HttpContext } from '@adonisjs/core/http'
import ShortlinkService from '../services/shortlink_service.js'
import type { ShortlinkConfig } from '../types.js'

export default class ShortlinkController {
  constructor(private config: ShortlinkConfig) {}

  /**
   * Redirect to original URL based on slug
   */
  async redirect({ params, response }: HttpContext) {
    const { slug } = params

    const shortlinkService = new ShortlinkService(this.config)
    const shortlink = await shortlinkService.getBySlug(slug)

    if (!shortlink) {
      return response.status(404).send({
        error: 'Shortlink not found',
        message: `The shortlink "${slug}" does not exist`,
      })
    }

    // Increment click count in background (don't wait for it)
    if (this.config.trackClicks) {
      shortlink.incrementClicks().catch((error) => {
        console.error('Failed to increment shortlink clicks:', error)
      })
    }

    // Redirect to original URL
    return response.redirect(shortlink.original_url, true, this.config.redirectStatusCode)
  }

  /**
   * Get shortlink statistics (optional, for admin purposes)
   */
  async show({ params, response }: HttpContext) {
    const { slug } = params

    const shortlinkService = new ShortlinkService(this.config)
    const shortlink = await shortlinkService.getBySlug(slug)

    if (!shortlink) {
      return response.status(404).send({
        error: 'Shortlink not found',
        message: `The shortlink "${slug}" does not exist`,
      })
    }

    return response.json({
      slug: shortlink.slug,
      original_url: shortlink.original_url,
      clicks: shortlink.clicks,
      created_at: shortlink.created_at,
      metadata: shortlink.metadata,
    })
  }

  /**
   * Create a new shortlink (optional, for admin purposes)
   */
  async store({ request, response }: HttpContext) {
    const { original_url, custom_slug, metadata } = request.only([
      'original_url',
      'custom_slug',
      'metadata',
    ])

    if (!original_url) {
      return response.status(400).send({
        error: 'Bad Request',
        message: 'original_url is required',
      })
    }

    try {
      const shortlinkService = new ShortlinkService(this.config)
      const shortlink = await shortlinkService.create(original_url, custom_slug, metadata)
      const shortUrl = shortlinkService.getShortUrl(shortlink.slug)

      return response.status(201).json({
        id: shortlink.id,
        slug: shortlink.slug,
        original_url: shortlink.original_url,
        short_url: shortUrl,
        clicks: shortlink.clicks,
        created_at: shortlink.created_at,
        metadata: shortlink.metadata,
      })
    } catch (error) {
      return response.status(400).send({
        error: 'Bad Request',
        message: error.message,
      })
    }
  }

  /**
   * Delete a shortlink (optional, for admin purposes)
   */
  async destroy({ params, response }: HttpContext) {
    const { slug } = params

    const shortlinkService = new ShortlinkService(this.config)
    const deleted = await shortlinkService.delete(slug)

    if (!deleted) {
      return response.status(404).send({
        error: 'Shortlink not found',
        message: `The shortlink "${slug}" does not exist`,
      })
    }

    return response.status(204).send(null)
  }
}
