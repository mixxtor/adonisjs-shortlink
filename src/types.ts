/**
 * @mixxtor/adonisjs-shortlink
 *
 * Type definitions for the Shortlink package
 */

import { DateTime } from 'luxon'

/**
 * Configuration options for the shortlink service
 */
export interface ShortlinkConfig {
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
 * Shortlink service interface
 */
export interface ShortlinkServiceContract {
  create(
    originalUrl: string,
    customSlug?: string,
    metadata?: Record<string, any>
  ): Promise<ShortlinkAttributes>
  getBySlug(slug: string): Promise<ShortlinkAttributes | null>
  getByOriginalUrl(originalUrl: string): Promise<ShortlinkAttributes | null>
  getOrCreate(originalUrl: string, metadata?: Record<string, any>): Promise<ShortlinkAttributes>
  delete(slug: string): Promise<boolean>
  getShortUrl(slug: string, domain?: string): string
}

declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    shortlink: ShortlinkServiceContract
  }
}
