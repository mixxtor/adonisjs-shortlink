import { randomBytes } from 'node:crypto'
import Shortlink from '../models/shortlink.js'
import type { ShortlinkConfig, ShortlinkServiceContract } from '../types.js'

export default class ShortlinkService implements ShortlinkServiceContract {
  constructor(private config: ShortlinkConfig) {}

  /**
   * Generate a random unique slug
   */
  private generateSlug(length: number = this.config.slugLength): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const bytes = randomBytes(length)
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length]
    }
    return result
  }

  /**
   * Generate a unique slug that doesn't exist in database
   */
  private async generateUniqueSlug(maxAttempts: number = 10): Promise<string> {
    for (let i = 0; i < maxAttempts; i++) {
      const slug = this.generateSlug()
      const existing = await Shortlink.query().where('slug', slug).first()
      if (!existing) {
        return slug
      }
    }
    // If still not unique after maxAttempts, use a longer slug
    return this.generateSlug(12)
  }

  /**
   * Create a new shortlink
   */
  async create(
    originalUrl: string,
    customSlug?: string,
    metadata?: Record<string, any>
  ): Promise<Shortlink> {
    let slug = customSlug

    // If custom slug provided, check if it's already taken
    if (customSlug) {
      const existing = await Shortlink.query().where('slug', customSlug).first()
      if (existing) {
        throw new Error(`Slug "${customSlug}" is already taken`)
      }
    } else {
      // Generate a unique slug
      slug = await this.generateUniqueSlug()
    }

    const shortlink = await Shortlink.create({
      slug: slug!,
      original_url: originalUrl,
      clicks: 0,
      metadata: metadata || null,
    })

    return shortlink
  }

  /**
   * Get shortlink by slug
   */
  async getBySlug(slug: string): Promise<Shortlink | null> {
    return await Shortlink.query().where('slug', slug).first()
  }

  /**
   * Get shortlink by original URL
   */
  async getByOriginalUrl(originalUrl: string): Promise<Shortlink | null> {
    return await Shortlink.query().where('original_url', originalUrl).first()
  }

  /**
   * Get or create a shortlink for a URL
   */
  async getOrCreate(originalUrl: string, metadata?: Record<string, any>): Promise<Shortlink> {
    const existing = await this.getByOriginalUrl(originalUrl)
    if (existing) {
      return existing
    }
    return await this.create(originalUrl, undefined, metadata)
  }

  /**
   * Delete a shortlink by slug
   */
  async delete(slug: string): Promise<boolean> {
    const shortlink = await this.getBySlug(slug)
    if (!shortlink) {
      return false
    }
    await shortlink.delete()
    return true
  }

  /**
   * Get full short URL
   */
  getShortUrl(slug: string, domain?: string): string {
    const shortDomain = domain || this.config.domain
    return `https://${shortDomain}/${slug}`
  }
}
