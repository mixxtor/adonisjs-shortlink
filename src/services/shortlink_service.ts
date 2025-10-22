import { randomBytes } from 'node:crypto'
import type { ShortlinkConfig, ShortlinkServiceContract, ShortlinkModelContract, ShortlinkModelRow } from '../types.js'

export default class ShortlinkService<Model extends ShortlinkModelContract = ShortlinkModelContract> implements ShortlinkServiceContract<Model> {
  private model: Model | undefined
  private configModel: ShortlinkConfig<Model>['model']
  private baseUrl: string

  constructor(private config: ShortlinkConfig<Model>) {
    const { domain, protocol = 'https' } = this.config
    this.setBaseUrl(domain, protocol)
    this.configModel = config.model
    this.baseUrl = domain.startsWith('http') ? domain : `${protocol}://${domain}`
  }

  setBaseUrl(domain: string, protocol: typeof this.config.protocol = 'https'): void {
    const url = domain.startsWith('http') ? domain : `${protocol}://${domain}`
    const urls = new URL(url)
    this.baseUrl = `${urls.protocol}//${urls.host}`
  }

  /**
   * Imports the model from the provider, returns and caches it
   * for further operations.
   */
  async getModel(): Promise<Model> {
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
   * Returns the base URL with the path (if provided) for shortlinks.
   * The base URL is constructed by appending '/l/' to the short domain.
   * @returns {string} The base URL with the path (if provided) for shortlinks.
   */
  getBasePathUrl(path = this.config.path): string {
    return `${this.baseUrl}/${path?.endsWith('/') ? path : `${path}/`}`
  }

  /**
   * Generate a random unique slug
   * @param {number} length - The length of the slug.
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
   * @param {number} maxAttempts - The maximum number of attempts to generate a unique slug.
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
      console.error(error)
    }

    // If still not unique after maxAttempts, use a longer slug
    return this.generateSlug(12)
  }

  /**
   * Create a new shortlink
   * @param {string} originalUrl - The original URL to be shortened.
   * @param {Object} data - The data to create the shortlink with.
   */
  async create(originalUrl: Model['original_url'], data?: Partial<Pick<Model, 'slug' | 'metadata'>>): Promise<ShortlinkModelRow<Model>> {
    const model = await this.getModel()
    let { slug, metadata } = data || {}

    // If custom slug provided, check if it's already taken
    if (slug) {
      const existing = await model.query().where('slug', slug).first()
      if (existing) {
        throw new Error(`Slug "${slug}" is already taken`)
      }
    } else {
      // Generate a unique slug
      slug = await this.generateUniqueSlug()
    }

    const shortlink = await new model().merge({
      slug: slug,
      original_url: originalUrl,
      clicks: 0,
      metadata: metadata || null,
    }).save()

    return shortlink as ShortlinkModelRow<Model>
  }

  /**
   * Get shortlink by ID
   * @param {number} id - The ID of the shortlink.
   */
  async getById(id: Model['id']): Promise<ShortlinkModelRow<Model> | null> {
    const model = await this.getModel()
    return await model.find(id) as ShortlinkModelRow<Model>
  }

  /**
   * Get shortlink by slug
   * @param {string} slug - The slug of the shortlink.
   */
  async getBySlug(slug: Model['slug']): Promise<ShortlinkModelRow<Model> | null> {
    const model = await this.getModel()
    return await model.query().where('slug', slug).first() as ShortlinkModelRow<Model>
  }

  /**
   * Get shortlink by original URL
   * @param {string} originalUrl - The original URL of the shortlink.
   */
  async getByOriginalUrl(originalUrl: Model['original_url']): Promise<ShortlinkModelRow<Model> | null> {
    const Model = await this.getModel()
    return await Model.query().where('original_url', originalUrl).first() as ShortlinkModelRow<Model>
  }

  /**
   * Get or create a shortlink for a URL
   */
  async getOrCreate(
    originalUrl: string,
    data?: Partial<Pick<Model, 'slug' | 'metadata'>>
  ): Promise<ShortlinkModelRow<Model>> {
    const existing = await this.getByOriginalUrl(originalUrl)
    const { slug, metadata = existing?.metadata } = data || {}

    if (existing) {
      return existing
    }

    return await this.create(originalUrl, { slug, metadata })
  }

  /**
   * Delete a shortlink by ID
   * @param {number} id - The ID of the shortlink to delete.
   */
  async delete(id: Model['id']): Promise<boolean> {
    const shortlink = await this.getById(id)
    if (!shortlink) {
      return false
    }

    await shortlink.delete()
    return true
  }

  /**
   * Delete a shortlink by slug
   * @param {string} slug - The slug of the shortlink to delete.
   */
  async deleteBySlug(slug: Model['slug']): Promise<boolean> {
    const shortlink = await this.getBySlug(slug)
    if (!shortlink) {
      return false
    }

    await shortlink.delete()
    return true
  }

  /**
   * Get full short URL
   * @param {string} slug - The slug of the shortlink.
   * @returns {string} The full short URL.
   */
  getShortUrl(slug: Model['slug']): string | undefined {
    return slug ? `${this.getBasePathUrl()}${slug}` : undefined
  }

  /**
   * Extracts the slug from a given short URL.
   * The slug is extracted by removing the base URL from the short URL.
   * If the short URL does not start with the base URL, the function returns undefined.
   * @param {string | undefined} shortUrl - The short URL to extract the slug from.
   * @returns {string | undefined} The extracted slug or undefined if the short URL does not start with the base URL.
   */
  getSlugFromShortUrl(shortUrl: string | undefined): string | undefined {
    const baseUrl = this.getBasePathUrl()
    if (shortUrl?.startsWith(baseUrl)) {
      return shortUrl.replace(baseUrl, '')
    }
  }

  /**
   * Update or create a shortlink for a URL
   * - Find shortlink by id or original URL
   *   + If shortlink exists, update it
   *   + If shortlink doesn't exist, create it
   * @param {string | number} idOrOriginalUrl - The ID or original URL of the shortlink to update or create.
   * @param {Object} data - The data to update or create the shortlink with.
   * @param {string} data.original_url - The original URL of the shortlink.
   * @param {string} data.slug - The slug of the shortlink.
   * @param {Object} data.metadata - The metadata of the shortlink.
   * @returns {Promise<ShortlinkModelRow<Model> | null>} The updated or created shortlink.
   */
  async updateOrCreate(
    idOrOriginalUrl: Model['id'] | Model['original_url'],
    data: Pick<Model, 'original_url'> & Partial<Pick<Model, 'slug' | 'metadata'>>
  ): Promise<ShortlinkModelRow<Model> | null> {
    const existing = typeof idOrOriginalUrl === 'string'
      ? (await this.getByOriginalUrl(idOrOriginalUrl))
      : (await this.getById(idOrOriginalUrl))
    const { original_url: originalUrl, slug, metadata = existing?.metadata } = data

    if (existing) {
      existing.original_url = originalUrl || existing.original_url
      existing.slug = slug || existing.slug
      data.metadata !== existing.metadata && (existing.metadata = metadata || existing.metadata)
      existing.$isDirty && await existing.save()

      return existing
    }

    return await this.create(originalUrl, { slug, metadata })
  }
}
