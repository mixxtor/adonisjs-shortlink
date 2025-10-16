import { randomBytes } from 'node:crypto'
import logger from '@adonisjs/core/services/logger'
import type { LucidModel } from '@adonisjs/lucid/types/model'
import type { ShortlinkConfig, ShortlinkServiceContract, ShortlinkModelContract } from '../types.js'

export default class ShortlinkService implements ShortlinkServiceContract {
  private model: LucidModel | undefined
  private configModel: ShortlinkConfig['model']

  constructor(private config: ShortlinkConfig) {
    this.configModel = config.model
  }

  /**
   * Imports the model from the provider, returns and caches it
   * for further operations.
   */
  async getModel(): Promise<LucidModel> {
    if (!this.configModel) {
      throw new Error('Shortlink model not configured')
    }

    if (this.model && !('hot' in import.meta)) {
      return this.model
    }

    const importedModel = await this.configModel()
    this.model = 'default' in importedModel ? importedModel.default : importedModel
    return this.model
  }

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
  private async generateUniqueSlug(maxAttempts: number = 3): Promise<string> {
    try {
      const Model = await this.getModel()
      
      for (let i = 0; i < maxAttempts; i++) {
        const slug = this.generateSlug()
        const existing = await Model.query().where('slug', slug).first()
        if (!existing) {
          return slug
        }
      }
    } catch (error) {
      logger.error(error)
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
  ): Promise<ShortlinkModelContract> {
    const Model = await this.getModel()
    let slug = customSlug

    // If custom slug provided, check if it's already taken
    if (customSlug) {
      const existing = await Model.query().where('slug', customSlug).first()
      if (existing) {
        throw new Error(`Slug "${customSlug}" is already taken`)
      }
    } else {
      // Generate a unique slug
      slug = await this.generateUniqueSlug()
    }

    const shortlink = await Model.create({
      slug: slug!,
      original_url: originalUrl,
      clicks: 0,
      metadata: metadata || null,
    })

    return shortlink as unknown as ShortlinkModelContract
  }

  /**
   * Get shortlink by slug
   */
  async getBySlug(slug: string): Promise<ShortlinkModelContract | null> {
    const Model = await this.getModel()
    return await Model.query().where('slug', slug).first() as unknown as ShortlinkModelContract | null
  }

  /**
   * Get shortlink by original URL
   */
  async getByOriginalUrl(originalUrl: string): Promise<ShortlinkModelContract | null> {
    const Model = await this.getModel()
    return await Model.query().where('original_url', originalUrl).first() as unknown as ShortlinkModelContract | null
  }

  /**
   * Get or create a shortlink for a URL
   */
  async getOrCreate(originalUrl: string, metadata?: Record<string, any>): Promise<ShortlinkModelContract> {
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
