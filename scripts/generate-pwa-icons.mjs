import { mkdirSync, writeFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

const OUT = new URL('../public/', import.meta.url)
mkdirSync(OUT, { recursive: true })

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k += 1) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
  return c >>> 0
})

function crc32(buffer) {
  let c = 0xffffffff
  for (const byte of buffer) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const name = Buffer.from(type)
  const body = Buffer.concat([name, data])
  const head = Buffer.alloc(4)
  const tail = Buffer.alloc(4)
  head.writeUInt32BE(data.length)
  tail.writeUInt32BE(crc32(body))
  return Buffer.concat([head, body, tail])
}

function isHeart(x, y) {
  const a = x * x + y * y - 0.32
  return (a * a * a - x * x * y * y * y) <= 0
}

function makePng(size, maskable) {
  const stride = 1 + size * 4
  const raw = Buffer.alloc(stride * size)
  const bg = maskable ? [184, 92, 122, 255] : [255, 249, 251, 255]
  const fg = maskable ? [255, 255, 255, 255] : [184, 92, 122, 255]
  for (let y = 0; y < size; y += 1) {
    const row = y * stride
    raw[row] = 0
    for (let x = 0; x < size; x += 1) {
      const nx = ((x + 0.5) / size - 0.5) * 2.2
      const ny = -(((y + 0.5) / size - 0.53) * 2.2)
      const useFg = isHeart(nx, ny)
      const rgba = useFg ? fg : bg
      const offset = row + 1 + x * 4
      raw[offset] = rgba[0]
      raw[offset + 1] = rgba[1]
      raw[offset + 2] = rgba[2]
      raw[offset + 3] = rgba[3]
    }
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  const png = Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
  return png
}

for (const [name, size, maskable] of [
  ['icon-192.png', 192, false],
  ['icon-512.png', 512, false],
  ['icon-maskable-512.png', 512, true],
]) {
  writeFileSync(new URL(name, OUT), makePng(size, maskable))
}
