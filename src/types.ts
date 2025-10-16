/**
 * @mixxtor/adonisjs-shortlink
 *
 * Type definitions for the Shortlink package
 */

import { DateTime } from 'luxon'
import { LucidModel } from '@adonisjs/lucid/types/model'

/**
 * Configuration options for the shortlink service
 */
export interface ShortlinkConfig {
  /**
   * The Lucid model to use for shortlink operations
   * @example () => import('#models/shortlink')
   */
  model: () => Promise<{ default: LucidModel }> | LucidModel

  /**
   * The domain used for generating short URLs
   * @example 'short.domain.com'
   */
  domain: string

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
  tableName?: string
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
export interface ShortlinkModelContract extends ShortlinkAttributes {
  incrementClicks?(): Promise<void>
  delete(): Promise<void>
}

/**
 * Shortlink service interface
 */
export interface ShortlinkServiceContract {
  create(
    originalUrl: string,
    customSlug?: string,
    metadata?: Record<string, any>
  ): Promise<ShortlinkModelContract>
  getBySlug(slug: string): Promise<ShortlinkModelContract | null>
  getByOriginalUrl(originalUrl: string): Promise<ShortlinkModelContract | null>
  getOrCreate(originalUrl: string, metadata?: Record<string, any>): Promise<ShortlinkModelContract>
  delete(slug: string): Promise<boolean>
  getShortUrl(slug: string, domain?: string): string
}

declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    shortlink: ShortlinkServiceContract
  }
}
