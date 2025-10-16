/*
 * @mixxtor/adonisjs-shortlink
 *
 * (c) Mixxtor
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import app from '@adonisjs/core/services/app'
import { ShortlinkServiceContract } from '../types.js'

let shortlink: ShortlinkServiceContract

await app.booted(async () => {
  shortlink = await app.container.make('shortlink')
})

export { shortlink as default }
