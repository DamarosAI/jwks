import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { inflateSync } from 'node:zlib'
import { readSource } from './source-text.js'

const html = await readSource(new URL('../index.html', import.meta.url))
const llms = await readSource(new URL('../public/llms.txt', import.meta.url))

const meta = (property) => {
  const match = html.match(new RegExp(`<meta (?:property|name)="${property}" content="([^"]*)"`))
  return match?.[1] ?? null
}

const CARD = meta('og:image')
const SITE = 'https://www.damaros.ai'

/**
 * Enough of a PNG reader to look at the card.
 *
 * A link preview is the one image most people see before they ever see the
 * site, it is cached by every scraper that touches it, and nothing else in the
 * build looks at it - so asserting the file exists is not enough. This decodes
 * it far enough to say what colour it actually is.
 */
function readPng(path) {
  const file = readFileSync(path)
  assert.equal(file.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${path} is not a PNG`)

  let at = 8
  let head = null
  const idat = []
  while (at < file.length) {
    const length = file.readUInt32BE(at)
    const kind = file.subarray(at + 4, at + 8).toString('ascii')
    const body = file.subarray(at + 8, at + 8 + length)
    if (kind === 'IHDR') {
      head = { width: body.readUInt32BE(0), height: body.readUInt32BE(4), depth: body[8], colour: body[9], interlace: body[12] }
    } else if (kind === 'IDAT') {
      idat.push(body)
    }
    at += length + 12
  }

  assert.ok(head, 'no IHDR')
  assert.equal(head.depth, 8, 'expected an 8-bit card')
  assert.equal(head.colour, 2, 'expected a truecolour card with no alpha')
  assert.equal(head.interlace, 0, 'expected a non-interlaced card')

  // Un-filter the scanlines. Every PNG row carries its own filter byte, so the
  // raw inflate is not pixels until this has run.
  const raw = inflateSync(Buffer.concat(idat))
  const step = 3
  const stride = head.width * step
  const out = Buffer.alloc(stride * head.height)
  for (let row = 0; row < head.height; row += 1) {
    const filter = raw[row * (stride + 1)]
    const line = raw.subarray(row * (stride + 1) + 1, (row + 1) * (stride + 1))
    for (let i = 0; i < stride; i += 1) {
      const left = i >= step ? out[row * stride + i - step] : 0
      const up = row > 0 ? out[(row - 1) * stride + i] : 0
      const upLeft = row > 0 && i >= step ? out[(row - 1) * stride + i - step] : 0
      let value = line[i]
      if (filter === 1) value += left
      else if (filter === 2) value += up
      else if (filter === 3) value += (left + up) >> 1
      else if (filter === 4) {
        const p = left + up - upLeft
        const dl = Math.abs(p - left)
        const du = Math.abs(p - up)
        const dul = Math.abs(p - upLeft)
        value += dl <= du && dl <= dul ? left : du <= dul ? up : upLeft
      }
      out[row * stride + i] = value & 0xff
    }
  }

  return {
    ...head,
    at: (x, y) => [out[y * stride + x * step], out[y * stride + x * step + 1], out[y * stride + x * step + 2]],
  }
}

describe('social card', () => {
  it('points every preview at one image that is actually there', () => {
    assert.ok(CARD, 'no og:image')
    assert.match(CARD, new RegExp(`^${SITE}/assets/og-card\\.png$`))
    // Twitter, the JSON-LD and the machine-readable index all name the same
    // file. A card that only some scrapers can find is worse than none.
    assert.equal(meta('twitter:image'), CARD)
    assert.ok(html.includes(`"url":"${CARD}"`), 'the JSON-LD names a different image')
    assert.ok(llms.includes(CARD), 'llms.txt names a different image')
    assert.equal(meta('og:image:type'), 'image/png')
    // The old card is gone rather than left behind to be picked up again.
    assert.doesNotMatch(html, /og-card\.jpg/)
    assert.doesNotMatch(llms, /og-card\.jpg/)
  })

  it('is the size it says it is', () => {
    const card = readPng(new URL('../public/assets/og-card.png', import.meta.url))
    assert.equal(String(card.width), meta('og:image:width'))
    assert.equal(String(card.height), meta('og:image:height'))
    // The ratio every preview surface crops against.
    assert.equal(card.width, 1200)
    assert.equal(card.height, 630)
  })

  it('is the light dotted field with the mark in blue, not a black plate', () => {
    const card = readPng(new URL('../public/assets/og-card.png', import.meta.url))
    // The ground. Sampled at the corners, well clear of the mark, and it has to
    // be light on every channel - the card this replaced was solid black, which
    // is the specific thing being guarded against.
    for (const [x, y] of [[12, 12], [1187, 12], [12, 617], [1187, 617]]) {
      const [r, g, b] = card.at(x, y)
      assert.ok(r > 215 && g > 220 && b > 225, `corner ${x},${y} is not the page ground: rgb(${r},${g},${b})`)
    }
    // The mark. The monogram's upper bar crosses the middle of the card, so a
    // vertical cut down the centre has to run into the accent: blue-dominant,
    // and dark enough to be the stroke rather than a lattice dot.
    let hit = null
    for (let y = 200; y < 430 && !hit; y += 1) {
      const [r, g, b] = card.at(600, y)
      if (b > r + 40 && b > g + 20 && r < 120) hit = [y, r, g, b]
    }
    assert.ok(hit, 'no blue monogram stroke down the centre of the card')
    // Close enough to --accent #2f6193 that a repaint in another colour fails.
    const [, r, g, b] = hit
    assert.ok(Math.abs(r - 0x2f) < 26 && Math.abs(g - 0x61) < 26 && Math.abs(b - 0x93) < 26, `mark is rgb(${r},${g},${b}), not the accent`)
  })

  it('stays small enough to be fetched by a phone on a message thread', () => {
    const bytes = readFileSync(new URL('../public/assets/og-card.png', import.meta.url)).length
    assert.ok(bytes < 900 * 1024, `card is ${Math.round(bytes / 1024)}KB`)
  })
})
