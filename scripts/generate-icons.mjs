import { mkdirSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const ICON_SIZES = [16, 32, 48, 128];
const SUPERSAMPLE_SCALE = 4;
const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

mkdirSync("icons", { recursive: true });

for (const size of ICON_SIZES) {
  const pixels = renderIcon(size);
  writeFileSync(`icons/icon-${size}.png`, encodePng(size, size, pixels));
}

function renderIcon(size) {
  const highSize = size * SUPERSAMPLE_SCALE;
  const highPixels = new Uint8ClampedArray(highSize * highSize * 4);

  for (let y = 0; y < highSize; y += 1) {
    for (let x = 0; x < highSize; x += 1) {
      const color = sampleIcon((x + 0.5) / highSize, (y + 0.5) / highSize);
      setPixel(highPixels, highSize, x, y, color);
    }
  }

  return downsample(highPixels, highSize, size);
}

function sampleIcon(x, y) {
  const shadow = chainCoverage(x - 0.018, y - 0.024, 0.112, 0.012);
  const outline = chainCoverage(x, y, 0.112, 0.01);
  const stroke = chainCoverage(x, y, 0.074, 0.01);
  const highlight = chainCoverage(x + 0.012, y + 0.016, 0.028, 0.01);

  let color = [0, 0, 0, 0];
  color = blend(color, [0, 0, 0, shadow * 0.28]);
  color = blend(color, [43, 48, 59, outline * 0.98]);
  color = blend(color, [246, 248, 250, stroke * 0.96]);
  color = blend(color, [255, 255, 255, highlight * 0.3]);

  return color;
}

function chainCoverage(x, y, strokeWidth, antialias) {
  const angle = -Math.PI / 4;
  const first = strokeCoverage(
    roundedRectDistance(x, y, 0.38, 0.59, 0.5, 0.22, 0.11, angle),
    strokeWidth,
    antialias,
  );
  const second = strokeCoverage(
    roundedRectDistance(x, y, 0.62, 0.41, 0.5, 0.22, 0.11, angle),
    strokeWidth,
    antialias,
  );

  return Math.max(first, second);
}

function roundedRectDistance(
  x,
  y,
  centerX,
  centerY,
  width,
  height,
  radius,
  angle,
) {
  const cos = Math.cos(-angle);
  const sin = Math.sin(-angle);
  const relativeX = x - centerX;
  const relativeY = y - centerY;
  const localX = relativeX * cos - relativeY * sin;
  const localY = relativeX * sin + relativeY * cos;
  const qx = Math.abs(localX) - width / 2 + radius;
  const qy = Math.abs(localY) - height / 2 + radius;
  const outsideX = Math.max(qx, 0);
  const outsideY = Math.max(qy, 0);
  const outside = Math.hypot(outsideX, outsideY);
  const inside = Math.min(Math.max(qx, qy), 0);

  return outside + inside - radius;
}

function strokeCoverage(distance, strokeWidth, antialias) {
  return (
    1 -
    smoothstep(
      strokeWidth / 2 - antialias,
      strokeWidth / 2 + antialias,
      Math.abs(distance),
    )
  );
}

function smoothstep(edge0, edge1, value) {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);

  return t * t * (3 - 2 * t);
}

function blend(background, foreground) {
  const foregroundAlpha = foreground[3];
  const backgroundAlpha = background[3];
  const alpha = foregroundAlpha + backgroundAlpha * (1 - foregroundAlpha);

  if (alpha === 0) {
    return [0, 0, 0, 0];
  }

  return [
    (foreground[0] * foregroundAlpha +
      background[0] * backgroundAlpha * (1 - foregroundAlpha)) /
      alpha,
    (foreground[1] * foregroundAlpha +
      background[1] * backgroundAlpha * (1 - foregroundAlpha)) /
      alpha,
    (foreground[2] * foregroundAlpha +
      background[2] * backgroundAlpha * (1 - foregroundAlpha)) /
      alpha,
    alpha,
  ];
}

function setPixel(pixels, width, x, y, color) {
  const index = (y * width + x) * 4;
  pixels[index] = Math.round(color[0]);
  pixels[index + 1] = Math.round(color[1]);
  pixels[index + 2] = Math.round(color[2]);
  pixels[index + 3] = Math.round(clamp(color[3], 0, 1) * 255);
}

function downsample(highPixels, highSize, size) {
  const pixels = new Uint8ClampedArray(size * size * 4);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const color = averageBlock(highPixels, highSize, x, y);
      setPixel(pixels, size, x, y, color);
    }
  }

  return pixels;
}

function averageBlock(highPixels, highSize, x, y) {
  let red = 0;
  let green = 0;
  let blue = 0;
  let alpha = 0;

  for (let blockY = 0; blockY < SUPERSAMPLE_SCALE; blockY += 1) {
    for (let blockX = 0; blockX < SUPERSAMPLE_SCALE; blockX += 1) {
      const sourceX = x * SUPERSAMPLE_SCALE + blockX;
      const sourceY = y * SUPERSAMPLE_SCALE + blockY;
      const index = (sourceY * highSize + sourceX) * 4;
      const pixelAlpha = highPixels[index + 3] / 255;

      red += highPixels[index] * pixelAlpha;
      green += highPixels[index + 1] * pixelAlpha;
      blue += highPixels[index + 2] * pixelAlpha;
      alpha += pixelAlpha;
    }
  }

  const sampleCount = SUPERSAMPLE_SCALE * SUPERSAMPLE_SCALE;

  if (alpha === 0) {
    return [0, 0, 0, 0];
  }

  return [red / alpha, green / alpha, blue / alpha, alpha / sampleCount];
}

function encodePng(width, height, pixels) {
  const scanlineLength = width * 4 + 1;
  const raw = Buffer.alloc(scanlineLength * height);

  for (let y = 0; y < height; y += 1) {
    const rawOffset = y * scanlineLength;
    const pixelOffset = y * width * 4;

    raw[rawOffset] = 0;
    Buffer.from(pixels.buffer, pixelOffset, width * 4).copy(raw, rawOffset + 1);
  }

  return Buffer.concat([
    PNG_SIGNATURE,
    createChunk("IHDR", createHeader(width, height)),
    createChunk("IDAT", deflateSync(raw)),
    createChunk("IEND", Buffer.alloc(0)),
  ]);
}

function createHeader(width, height) {
  const header = Buffer.alloc(13);

  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  return header;
}

function createChunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  const crc = Buffer.alloc(4);

  length.writeUInt32BE(data.length, 0);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);

  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc ^= byte;

    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
