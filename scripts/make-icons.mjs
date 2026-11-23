// Basit garaj kapısı ikonu: koyu zemin, sarı kapı çizgileri. Bağımlılıksız PNG yazar.
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';

const BG = [14, 17, 22], ACC = [245, 183, 0], DIM = [31, 37, 48];

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (const b of buf) { c = (crc ^ b) & 0xff; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crc = (crc >>> 8) ^ c; }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size) {
  const px = (x, y) => {
    const u = x / size, v = y / size;
    // çatı üçgeni
    const roofTop = 0.2, roofBase = 0.4;
    const inRoof = v >= roofTop && v <= roofBase && Math.abs(u - 0.5) <= ((v - roofTop) / (roofBase - roofTop)) * 0.34;
    const roofEdge = inRoof && Math.abs(u - 0.5) >= ((v - roofTop) / (roofBase - roofTop)) * 0.34 - 0.045;
    // kapı gövdesi
    const inBody = u >= 0.2 && u <= 0.8 && v >= 0.4 && v <= 0.8;
    const slat = inBody && u >= 0.28 && u <= 0.72 && v >= 0.48 && Math.floor((v - 0.48) / 0.08) % 2 === 0;
    const frame = inBody && (u < 0.25 || u > 0.75 || v > 0.76);
    if (roofEdge || frame || slat) return ACC;
    if (inBody || inRoof) return DIM;
    return BG;
  };
  const raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    for (let x = 0; x < size; x++) { const c = px(x, y); raw.set(c, y * (size * 3 + 1) + 1 + x * 3); }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
for (const [name, size] of [['icon-192.png', 192], ['icon-512.png', 512], ['apple-touch-icon.png', 180]]) writeFileSync(`public/${name}`, png(size));
