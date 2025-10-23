/**
 * @mixxtor/adonisjs-shortlink
 *
 * Type definitions for the Shortlink package
 */

import { DateTime } from 'luxon'
import type { LucidModel } from '@adonisjs/lucid/types/model'

/**
 * Configuration options for the shortlink service
 */
export interface ShortlinkConfig<Model extends LucidModel = LucidModel> {
  /**
   * The Lucid model to use for shortlink operations
   * @example () => import('#models/shortlink')
   */
  model: (() => Promise<{ default: Model }>) | Model

  /**
   * Enable shortlink service
   * @default true
   */
  enabled: boolean

  /**
   * The domain used for generating short URLs
   * @example 'short.domain.com'
   */
  domain: string

  /**
   * Use HTTPS protocol
   * @default 'https'
   */
  protocol?: 'http' | 'https'

  /**
   * The URL prefix for shortlinks
   * @example 's'
   */
  prefix?: string

  /**
   * Length of randomly generated slugs
   * @default 8
   */
  slugLength: number

  /**
   * Enable click tracking
   * @default true
   */
  trackClicks: boolean

  /**
   * HTTP status code for redirects (301 or 302)
   * @default 301
   */
  redirectStatusCode: 301 | 302

  /**
   * Database connection to use
   * @default 'pg'
   */
  connection?: string

  /**
   * Table name for shortlinks
   * @default 'shortlinks'
   */
  tableName: string
}

/**
 * Shortlink model attributes
 */
export interface ShortlinkAttributes {
  id: number
  slug: string
  original_url: string
  clicks: number
  metadata: Record<string, any> | null
  created_at: DateTime
  updated_at: DateTime
}

export interface ShortlinkCustomMethods {
  incrementClicks?(): Promise<void>
  delete(): Promise<void>
}

export type ShortlinkModelContract<Model extends ShortlinkModel = ShortlinkModel> =
  InstanceType<Model> & ShortlinkAttributes & ShortlinkCustomMethods

/**
 * Create shortlink payload
 */
export interface CreateShortlinkPayload {
  original_url: string
  custom_slug?: string
  metadata?: Record<string, any>
}

/**
 * Base interface that any shortlink model should implement
 */
export type ShortlinkModel = LucidModel & ShortlinkAttributes & ShortlinkCustomMethods

/**
 * Shortlink service interface
 */
export interface ShortlinkServiceContract<Model extends ShortlinkModel = ShortlinkModel> {
  getConfig(): ShortlinkConfig<Model>

  // Core CRUD Methods
  create(
    originalUrl: Model['original_url'],
    data?: Partial<Pick<Model, 'slug' | 'metadata'>>
  ): Promise<ShortlinkModelContract<Model>>

  getById(id: Model['id']): Promise<ShortlinkModelContract<Model> | null>

  getBySlug(slug: Model['slug']): Promise<ShortlinkModelContract<Model> | null>

  getByOriginalUrl(
    originalUrl: Model['original_url']
  ): Promise<ShortlinkModelContract<Model> | null>

  getOrCreate(
    originalUrl: Model['original_url'],
    data?: Partial<Pick<Model, 'slug' | 'metadata'>>
  ): Promise<ShortlinkModelContract<Model>>

  // Delete Methods
  delete(id: Model['id']): Promise<boolean>
  deleteBySlug(slug: Model['slug']): Promise<boolean>

  // Update Methods
  updateOrCreate(
    idOrOriginalUrl: Model['id'] | Model['original_url'],
    data: Pick<Model, 'original_url'> & Partial<Pick<Model, 'slug' | 'metadata'>>
  ): Promise<ShortlinkModelContract<Model> | null>

  // Utility Methods
  getShortUrl(slug: Model['slug']): string | undefined
  getSlugFromShortUrl(shortUrl: string | undefined): string | undefined
  getBasePathUrl(prefix?: string): string
  setBaseUrl(domain: string, protocol?: 'http' | 'https'): void
}

declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    shortlink: ShortlinkServiceContract
  }
}
