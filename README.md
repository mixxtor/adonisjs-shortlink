![@mixxtor/adonisjs-shortlink](https://socialify.git.ci/mixxtor/adonisjs-shortlink/image?description=1&descriptionEditable=URL%20shortener%20service%20for%20AdonisJS%20v6.&font=Jost&forks=1&issues=1&logo=https%3A%2F%2Fraw.githubusercontent.com%2Fmixxtor%2Fshortlink%2Flogo.svg&name=1&owner=1&pattern=Charlie%20Brown&pulls=1&stargazers=1&theme=Auto)

A standalone URL shortener service for AdonisJS v6 applications.

[![npm version](https://badge.fury.io/js/@mixxtor%2Fadonisjs-shortlink.svg)](https://www.npmjs.com/package/@mixxtor/adonisjs-shortlink)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- ✅ **Standalone Operation** - Run independently on its own domain
- ✅ **Click Tracking** - Monitor shortlink usage statistics
- ✅ **Customizable Slugs** - Use custom or auto-generated slugs
- ✅ **TypeScript Support** - Fully typed for better DX
- ✅ **Easy Integration** - Simple setup with AdonisJS v6
- ✅ **Database Agnostic** - Works with any Lucid-supported database

## Installation

```bash
npm install @mixxtor/adonisjs-shortlink
```

## Setup

### 1. Configure Provider

Add the provider to your `adonisrc.ts`:

```typescript
{
  providers: [
    // ... other providers
    () => import('@mixxtor/adonisjs-shortlink/shortlink_provider'),
  ]
}
```

### 2. Create Configuration File

Create `config/shortlink.ts`:

```typescript
import env from '#start/env'
import { defineConfig } from '@mixxtor/adonisjs-shortlink'

const shortlinkConfig = defineConfig({
  domain: env.get('SHORT_DOMAIN'),
  slugLength: 8,
  trackClicks: true,
  redirectStatusCode: 301,
})

export default shortlinkConfig
```

### 3. Add Environment Variables

Add to your `.env` file:

```env
SHORT_DOMAIN=short.yourdomain.com
```

### 4. Create Migration

Create a new migration file `database/migrations/TIMESTAMP_create_shortlinks_table.ts`:

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

### 5. Run Migration

```bash
node ace migration:run
```

## Usage

### Basic Usage

```typescript
import shortlinkService from '@mixxtor/adonisjs-shortlink/services/main'
import shortlinkConfig from '#config/shortlink'

// Create a shortlink
const shortlink = await shortlinkService.create('https://example.com/very/long/url')
console.log(shortlinkService.getShortUrl(shortlink.slug))
// Output: https://short.yourdomain.com/aBcD1234
```

### With Custom Slug

```typescript
const shortlink = await shortlinkService.create(
  'https://example.com/sale',
  'summer-sale' // Custom slug
)
// Output: https://short.yourdomain.com/summer-sale
```

### Get or Create (Avoid Duplicates)

```typescript
// Returns existing shortlink if URL already exists
const shortlink = await shortlinkService.getOrCreate('https://example.com/url')
```

### With Metadata

```typescript
const shortlink = await shortlinkService.create('https://example.com/product', undefined, {
  campaign: 'Black Friday',
  source: 'email',
})
```

### Controller Usage

Create a controller `app/controllers/shortlink_controller.ts`:

```typescript
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { ShortlinkController as BaseController } from '@mixxtor/adonisjs-shortlink'
import shortlinkConfig from '#config/shortlink'

@inject()
export default class ShortlinkController extends BaseController {
  constructor() {
    super(shortlinkConfig)
  }
}
```

### Routes

Add routes in `start/routes.ts`:

```typescript
import router from '@adonisjs/core/services/router'

const ShortlinkController = () => import('#controllers/shortlink_controller')

// Main redirect route
router.get('/:slug', [ShortlinkController, 'redirect']).as('shortlink.redirect')

// API routes (optional)
router
  .group(() => {
    router.post('/shortlinks', [ShortlinkController, 'store']).as('shortlink.store')
    router.get('/shortlinks/:slug/stats', [ShortlinkController, 'show']).as('shortlink.show')
    router.delete('/shortlinks/:slug', [ShortlinkController, 'destroy']).as('shortlink.destroy')
  })
  .prefix('/api')
```

## API Reference

### ShortlinkService

#### `create(originalUrl, customSlug?, metadata?)`

Create a new shortlink.

```typescript
const shortlink = await shortlinkService.create(
  'https://example.com/url',
  'custom-slug', // Optional
  { key: 'value' } // Optional
)
```

#### `getBySlug(slug)`

Get shortlink by slug.

```typescript
const shortlink = await shortlinkService.getBySlug('aBcD1234')
```

#### `getByOriginalUrl(url)`

Get shortlink by original URL.

```typescript
const shortlink = await shortlinkService.getByOriginalUrl('https://example.com/url')
```

#### `getOrCreate(originalUrl, metadata?)`

Get existing or create new shortlink.

```typescript
const shortlink = await shortlinkService.getOrCreate('https://example.com/url')
```

#### `delete(slug)`

Delete a shortlink.

```typescript
const deleted = await shortlinkService.delete('aBcD1234')
```

#### `getShortUrl(slug, domain?)`

Build full short URL.

```typescript
const url = shortlinkService.getShortUrl('aBcD1234')
// Returns: https://short.yourdomain.com/aBcD1234
```

## Configuration Options

| Option               | Type         | Default        | Description               |
| -------------------- | ------------ | -------------- | ------------------------- |
| `domain`             | `string`     | **required**   | Short URL domain          |
| `slugLength`         | `number`     | `8`            | Length of generated slugs |
| `trackClicks`        | `boolean`    | `true`         | Enable click tracking     |
| `redirectStatusCode` | `301 \| 302` | `301`          | HTTP redirect status      |
| `connection`         | `string`     | `'pg'`         | Database connection       |
| `tableName`          | `string`     | `'shortlinks'` | Database table name       |

## Integrating with Models

You can integrate shortlinks with your models using hooks:

```typescript
import { beforeSave, BaseModel } from '@adonisjs/lucid/orm'
import shortlinkService from '@mixxtor/adonisjs-shortlink/services/main'
import shortlinkConfig from '#config/shortlink'

export default class Product extends BaseModel {
  @column()
  declare url: string

  @column()
  declare shortUrl: string | null

  @beforeSave()
  static async generateShortlink(product: Product) {
    if (product.$isDirty('url') && product.url) {
      const shortlink = await shortlinkService.getOrCreate(product.url)
      product.shortUrl = service.getShortUrl(shortlink.slug)
    }
  }
}
```

## Production Setup

For production deployment with a dedicated short domain:

### 1. DNS Configuration

Create a DNS record:

```
Type: A or CNAME
Name: short
Value: your-server-ip or main-domain.com
```

### 2. Web Server Configuration

**Nginx Example:**

```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name short.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3333;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3. SSL Certificate

```bash
sudo certbot --nginx -d short.yourdomain.com
```

## TypeScript Support

The package includes full TypeScript definitions:

```typescript
import type {
  ShortlinkConfig,
  ShortlinkAttributes,
  CreateShortlinkPayload,
  ShortlinkServiceContract,
} from '@mixxtor/adonisjs-shortlink/types'
```

## Testing

```bash
npm test
```

## License

MIT License - see LICENSE file for details

## Author

**Mixxtor**

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and feature requests, please use the [GitHub issues page](https://github.com/mixxtor/adonisjs-shortlink/issues).
