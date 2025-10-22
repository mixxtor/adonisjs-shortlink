![@mixxtor/adonisjs-shortlink](https://socialify.git.ci/mixxtor/adonisjs-shortlink/image?description=1&descriptionEditable=URL%20shortener%20service%20for%20AdonisJS%20v6.&font=Jost&forks=1&issues=1&logo=https://raw.githubusercontent.com/mixxtor/adonisjs-shortlink/1277869dc1a89bac3ef9764d42637b5b81103daf/logo.svg&name=1&owner=1&pattern=Charlie%20Brown&pulls=1&stargazers=1&theme=Auto)

# @mixxtor/adonisjs-shortlink

[![npm version](https://badge.fury.io/js/@mixxtor%2Fadonisjs-shortlink.svg)](https://www.npmjs.com/package/@mixxtor/adonisjs-shortlink)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.6.0-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![AdonisJS](https://img.shields.io/badge/AdonisJS-6.x-purple)

A powerful, type-safe URL shortener service for AdonisJS v6 with configurable models, advanced click tracking, and production-ready features.

## ✨ Features

- 🎯 **Configurable Models** - Use your own custom models or extend the provided base model
- 🔒 **Full Type Safety** - Complete TypeScript support with proper contracts and interfaces  
- 📊 **Advanced Click Tracking** - Monitor usage with detailed analytics support
- 🎛️ **Flexible Configuration** - Customize domains, paths, protocols, and behavior
- 🚀 **Production Ready** - Built for scale with proper caching and optimization
- 🔧 **Auto Setup** - One command installation with automated stub generation
- 🔗 **Custom Slugs** - Support for both auto-generated and custom slugs
- 🗄️ **Database Agnostic** - Works with any Lucid-supported database
- 📱 **Framework Integration** - Deep AdonisJS integration with IoC container support

## 📦 Installation

Install the package via npm:

```bash
npm install @mixxtor/adonisjs-shortlink
```

### 🚀 Quick Setup (Recommended)

The package includes an automated setup command that handles everything for you:

```bash
node ace configure @mixxtor/adonisjs-shortlink
```

This command will automatically:
- ✅ Create the configuration file at `config/shortlink.ts`
- ✅ Generate the `Shortlink` model with proper typing
- ✅ Create and run the database migration
- ✅ Register the service provider in `adonisrc.ts`
- ✅ Setup environment variables template

### 🔧 Manual Setup (Advanced)

If you prefer manual setup or need custom configuration:

#### 1. Add Provider

Add the provider to your `adonisrc.ts`:

```typescript
{
  providers: [
    // ... other providers
    () => import('@mixxtor/adonisjs-shortlink/providers/shortlink_provider')
  ]
}
```

#### 2. Create Configuration

Create `config/shortlink.ts` with configurable model support:

```typescript
import env from '#start/env'
import { defineConfig } from '@mixxtor/adonisjs-shortlink'
import Shortlink from '#models/shortlink'

const shortlinkConfig = defineConfig({
  model: () => Shortlink, // 🎯 Configurable model
  domain: env.get('SHORTLINK_DOMAIN'),
  protocol: 'https',
  slugLength: 8,
  trackClicks: true,
  redirectStatusCode: 301,
})

export default shortlinkConfig
```

#### 3. Environment Setup

Add to your `.env` file:

```env
SHORTLINK_DOMAIN=short.yourdomain.com
SHORT_PROTOCOL=https
SHORT_SLUG_LENGTH=8
SHORT_TRACK_CLICKS=true
SHORT_REDIRECT_STATUS=301
```

#### 4. Create Model

Create `app/models/shortlink.ts` that implements the model contract:

```typescript
import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import type { ShortlinkModelContract } from '@mixxtor/adonisjs-shortlink/types'

export default class Shortlink extends BaseModel implements ShortlinkModelContract {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare slug: string

  @column()
  declare originalUrl: string

  @column()
  declare clicks: number

  @column()
  declare metadata: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
```

#### 5. Create Migration

Create migration `database/migrations/TIMESTAMP_create_shortlinks_table.ts`:
```bash
node ace make:migration create_shortlinks_table
```

Migration content:
```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'shortlinks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('slug', 255).notNullable().unique().index()
      table.text('original_url').notNullable()
      table.integer('clicks').defaultTo(0).notNullable()
      table.jsonb('metadata').nullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

#### 6. Run Migration

```bash
node ace migration:run
```

## 📖 Usage

### Type-Safe Service Injection

The service is automatically injected into the IoC container with full type safety:

```typescript
import type { ShortlinkService } from '@mixxtor/adonisjs-shortlink/types'
import shortlinkService from '@mixxtor/adonisjs-shortlink/services/main'

export default class SomeController {
  async someMethod({ app }: HttpContext) {    
    // Now you have full type safety and intellisense
    const shortlink = await shortlinkService.create(
      'https://example.com/very-long-url',
      {
        slug: 'custom-slug' // Optional
      }
    )
  }
}
```

### 🔗 Creating Shortlinks

```typescript
// Basic shortlink creation
const shortlink = await shortlinkService.create('https://example.com/very/long/url')
console.log(shortlinkService.getShortUrl(shortlink.slug))
// Output: https://short.yourdomain.com/aBcD1234

// With custom slug
const customShortlink = await shortlinkService.create(
  'https://example.com/sale',
  { slug: 'summer-sale' }
)
// Output: https://short.yourdomain.com/summer-sale

// Avoid duplicates - returns existing if URL already shortened
const existing = await shortlinkService.getOrCreate('https://example.com/url')
```

### 🚀 Controller Integration

Create a dedicated controller `app/controllers/shortlinks_controller.ts`:

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import shortlinkService from '@mixxtor/adonisjs-shortlink/services/main'

export default class ShortlinksController {
  /**
   * Create a new shortlink
   */
  async create({ request, response, app }: HttpContext) {
    const { url, slug, metadata } = request.only(['url', 'slug', 'metadata'])
    
    try {
      const shortlink = await shortlinkService.create(url, { slug, metadata })
      
      return response.created({
        success: true,
        data: {
          slug: shortlink.slug,
          shortUrl: shortlinkService.getShortUrl(shortlink.slug),
          originalUrl: shortlink.originalUrl,
          clicks: shortlink.clicks,
          createdAt: shortlink.createdAt
        }
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        message: error.message
      })
    }
  }

  /**
   * Redirect to original URL and track click
   */
  async redirect({ params, response, app }: HttpContext) {
    const { slug } = params
    
    const shortlink = await shortlinkService.getBySlug(slug)
    
    if (!shortlink) {
      return response.notFound('Shortlink not found')
    }

    // Increment click count
    await shortlink.incrementClicks(slug)
    
    return response.redirect(shortlink.originalUrl, true, 301)
  }
}
```

### 🛣️ Routes Setup

Add routes to your `start/routes.ts`:

```typescript
import router from '@adonisjs/core/services/router'
const ShortlinkController = () => import('#controllers/shortlinks_controller')

// API routes for creating shortlinks
router.group(() => {
  router.post('/shortlinks', [ShortlinkController, 'create'])
  router.get('/shortlinks/:slug/stats', [ShortlinkController, 'stats']) // Optional analytics endpoint
}).prefix('/api')

// Redirect routes (should be on your short domain)
router.get('/:slug', [ShortlinkController, 'redirect'])
```

For production, you'll typically want the redirect route on a separate short domain:

**Short Domain Routes** (`short.yourdomain.com`):
```typescript
// Only redirect functionality
router.get('/:slug', [ShortlinkController, 'redirect']).domain('short.yourdomain.com')
```

**Main Application Routes**:
```typescript
// API and management routes
router.group(() => {
  router.post('/shortlinks', [ShortlinkController, 'create'])
  router.get('/shortlinks/:slug/analytics', [ShortlinkController, 'analytics']) // implement by yourself
}).prefix('/api').middleware('auth') // Add authentication as needed
```

## ⚙️ Configuration

### Full Configuration Options

The configuration supports flexible model injection and extensive customization:

```typescript
import { defineConfig } from '@mixxtor/adonisjs-shortlink'
import Shortlink from '#models/shortlink'

const shortlinkConfig = defineConfig({
  /**
   * 🎯 Model Configuration (New!)
   * Specify which model to use - allows for complete customization
   */
  model: () => Shortlink, // or () => import('#models/shortlink')

  /**
   * 🌐 Domain Settings
   */
  domain: env.get('SHORTLINK_DOMAIN', 'short.yourdomain.com'),
  protocol: 'https', // 'http' | 'https'

  /**
   * 🔗 Slug Generation
   */
  slugLength: 8, // Length for auto-generated slugs
  slugCharacters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',

  /**
   * 📊 Analytics & Tracking
   */
  trackClicks: true, // Enable/disable click tracking
  
  /**
   * 🚀 Redirect Behavior
   */
  redirectStatusCode: 301, // 301 (permanent) | 302 (temporary)
})

export default shortlinkConfig
```

### 🔧 Custom Model Implementation

You can use your own model by implementing the `ShortlinkModelContract`:

```typescript
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import type { ShortlinkModelContract } from '@mixxtor/adonisjs-shortlink/types'
import User from './user.js'

export default class CustomShortlink extends BaseModel implements ShortlinkModelContract {
  // Required fields from ShortlinkModelContract
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare slug: string

  @column()
  declare originalUrl: string

  @column()
  declare clicks: number

  @column()
  declare metadata: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // 🎯 Add your own custom fields!
  @column()
  declare userId: number | null

  @column()
  declare title: string | null

  @column()
  declare description: string | null

  @column()
  declare expiresAt: DateTime | null

  @column()
  declare isActive: boolean

  // Custom relationships
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  // Custom methods
  get isExpired() {
    return this.expiresAt && this.expiresAt < DateTime.now()
  }
}
```

### 🌍 Environment Variables

```env
# Required
SHORTLINK_DOMAIN=short.yourdomain.com

# Optional - with defaults
SHORTLINK_PROTOCOL=https
SHORTLINK_SLUG_LENGTH=8
SHORTLINK_TRACK_CLICKS=true
SHORTLINK_REDIRECT_STATUS=301
```

## 📚 API Reference

### ShortlinkService Methods

The service provides a clean, type-safe API:

```typescript
interface ShortlinkService {
  // Core Methods
  create(originalUrl: string, slug?: string, metadata?: Record<string, any>): Promise<ShortlinkModelContract>
  getBySlug(slug: string): Promise<ShortlinkModelContract | null>
  getOrCreate(originalUrl: string, slug?: string, metadata?: Record<string, any>): Promise<ShortlinkModelContract>

  // Utilities
  getShortUrl(slug: string): string

  // URL Generation
  generateSlug(length?: number): string
}
```

### Configuration Interface

```typescript
interface ShortlinkConfig<Model extends LucidModel = LucidModel> {
  model: () => Model & ShortlinkModelContract
  domain: string
  protocol?: 'http' | 'https'
  slugLength?: number
  slugCharacters?: string
  trackClicks?: boolean
  redirectStatusCode?: 301 | 302
}
```

### Model Contract

```typescript
interface ShortlinkModelContract {
  id: number
  slug: string
  originalUrl: string
  clicks: number
  metadata: Record<string, any> | null
  createdAt: DateTime
  updatedAt: DateTime
}
```

## 🧪 Testing

The package includes comprehensive tests. Run them with:

```bash
npm test
```

### Testing Your Implementation

```typescript
import { test } from '@japa/runner'
import shortlinkService from '@mixxtor/adonisjs-shortlink/services/main'

test.group('Shortlink Service', () => {
  test('creates shortlink successfully', async ({ assert, app }) => {    
    const shortlink = await shortlinkService.create('https://example.com')
    
    assert.exists(shortlink.slug)
    assert.equal(shortlink.originalUrl, 'https://example.com')
    assert.equal(shortlink.clicks, 0)
  })

  test('prevents duplicate slugs', async ({ assert, app }) => {    
    await shortlinkService.create('https://example.com', { slug: 'test' })
    
    await assert.rejects(
      () => shortlinkService.create('https://other.com', { slug: 'test' }),
      'Slug already exists'
    )
  })
})
```

## 🚀 Production Deployment

### Domain Configuration

For production, set up your short domain:

1. **DNS Configuration**: Point your short domain to your application
2. **SSL Certificate**: Ensure HTTPS is configured
3. **Environment Variables**: Set `SHORTLINK_DOMAIN` and `SHORTLINK_PROTOCOL`

### Multi-Domain Setup

**Option 1: Same Application**
```typescript
// In your main application, handle both domains

// Only serve redirect routes
router.group(() => {
  router.get('/:slug', '#controllers/shortlinks_controller.redirect')
}).domain('short.yourdomain.com')

// Serve full API and management routes
router.group(() => {
  router.post('/shortlinks', '#controllers/shortlinks_controller.create')
  // ... other routes
}).prefix('/api')

```

**Option 2: Separate Applications**
- Main app handles shortlink creation API
- Separate minimal app on short domain handles redirects only

### Performance Optimization

1. **Database Indexing**:
```sql
CREATE INDEX CONCURRENTLY idx_shortlinks_slug ON shortlinks(slug);
CREATE INDEX CONCURRENTLY idx_shortlinks_original_url ON shortlinks(original_url);
```

2. **Caching**: Use `@adonisjs/cache` (installed by yourself) to store shortlinks:
```typescript
import cache from '@adonisjs/cache/services/main'
import shortlinkService from '@mixxtor/adonisjs-shortlink/services/main'

// In your main app
const shortlink = shortlinkService.create(...)
await cache.set<typeof shortlink>({ key: `shortlink:${shortlink.slug}`, value })

// In your shortlink redirect route
const cachedShortlink = await cache.getOrSet<typeof shortlink>({
  key: `shortlink:${slug}`,
  factory: () => shortlinkService.getBySlug(slug),
})
```

3. **Database Connection Pooling**: Configure your database for high concurrent reads

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

- 📚 [Documentation](https://github.com/mixxtor/adonisjs-shortlink)
- 🐛 [Issues](https://github.com/mixxtor/adonisjs-shortlink/issues)
<!-- - 💬 [Discussions](https://github.com/mixxtor/adonisjs-shortlink/discussions) -->

---

Built with ❤️ for the AdonisJS community