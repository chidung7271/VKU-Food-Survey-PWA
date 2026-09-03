const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Tạo PNG thủ công chuẩn bằng built-in zlib (không cần thêm dependency bên ngoài)
function createPng(width, height, colorR, colorG, colorB) {
  // Signature PNG: 8 bytes
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // Bit depth: 8
  ihdr.writeUInt8(6, 9); // Color type: 6 (RGBA)
  ihdr.writeUInt8(0, 10); // Compression method: 0
  ihdr.writeUInt8(0, 11); // Filter method: 0
  ihdr.writeUInt8(0, 12); // Interlace method: 0
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data with filter byte 0 at start of each scanline
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = width * 0.45;

  for (let y = 0; y < height; y++) {
    const rowStart = y * rowSize;
    rawData[rowStart] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pixelStart = rowStart + 1 + x * 4;
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Tạo hình tròn badge với viền màu cam VKU và nền xanh VKU
      if (dist <= radius) {
        if (dist >= radius - (width * 0.05)) {
          // Viền cam VKU
          rawData[pixelStart] = 234;     // R: 234
          rawData[pixelStart + 1] = 88;  // G: 88
          rawData[pixelStart + 2] = 12;  // B: 12
          rawData[pixelStart + 3] = 255; // Alpha
        } else {
          // Nền xanh đậm VKU (#1e40af)
          rawData[pixelStart] = colorR;
          rawData[pixelStart + 1] = colorG;
          rawData[pixelStart + 2] = colorB;
          rawData[pixelStart + 3] = 255;
        }
      } else {
        // Trong suốt bên ngoài
        rawData[pixelStart] = 0;
        rawData[pixelStart + 1] = 0;
        rawData[pixelStart + 2] = 0;
        rawData[pixelStart + 3] = 0;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeBuf, data]);
  const crc = crc32(crcInput);

  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc >>> 0, 0);

  return Buffer.concat([length, typeBuf, data, crcBuf]);
}

// Bảng tính CRC32 chuẩn PNG
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    let byte = buf[i];
    for (let j = 0; j < 8; j++) {
      if ((crc ^ byte) & 1) {
        crc = (crc >>> 1) ^ 0xedb88320;
      } else {
        crc = crc >>> 1;
      }
      byte = byte >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Tạo icon 192x192 và 512x512
const icon192 = createPng(192, 192, 30, 64, 175);
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), icon192);

const icon512 = createPng(512, 512, 30, 64, 175);
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), icon512);

// Favicon
const favicon = createPng(64, 64, 30, 64, 175);
fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.ico'), favicon);

console.log('✅ Đã tạo thành công bộ icon PWA hợp lệ (icon-192.png, icon-512.png, favicon.ico)!');

