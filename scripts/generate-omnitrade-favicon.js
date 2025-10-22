#!/usr/bin/env node
"use strict";

/**
 * Generate OmniTrade favicon assets directly from Node without external dependencies.
 * Produces a 64x64 PNG and wraps it inside an ICO container for broad browser support.
 */

const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const OUTPUTS = {
  png: path.join(__dirname, "..", "public", "favicon.png"),
  ico: path.join(__dirname, "..", "src", "app", "favicon.ico"),
};

const size = 64;
const center = (size - 1) / 2;
const data = Buffer.alloc(size * size * 4);

const bgStart = { r: 0x0f, g: 0x1f, b: 0x38 };
const bgEnd = { r: 0x1c, g: 0x3c, b: 0x66 };
const ringInner = 16;
const ringOuter = 20;

const arrowPolygon = [
  [18, 44],
  [27, 44],
  [38, 31],
  [42, 36],
  [44, 28],
  [51, 28],
  [51, 14],
  [37, 14],
  [39, 20],
  [28, 32],
  [23, 27],
];

const arrowHead = [
  [40, 15],
  [51, 26],
  [51, 14],
];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function mixColor(start, end, t) {
  return {
    r: Math.round(lerp(start.r, end.r, t)),
    g: Math.round(lerp(start.g, end.g, t)),
    b: Math.round(lerp(start.b, end.b, t)),
  };
}

function pointInPolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersect) {
      inside = !inside;
    }
  }
  return inside;
}

for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    const idx = (y * size + x) * 4;

    const t = (x + (size - 1 - y)) / ((size - 1) * 2);
    const bg = mixColor(bgStart, bgEnd, t);

    let r = bg.r;
    let g = bg.g;
    let b = bg.b;

    const dx = x - center;
    const dy = y - center;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > ringInner && distance < ringOuter) {
      r = Math.min(255, r + 25);
      g = Math.min(255, g + 60);
      b = Math.min(255, b + 40);
    }

    if (pointInPolygon(x + 0.5, y + 0.5, arrowPolygon)) {
      const arrowT = (x - 18) / (size - 18);
      const arrowColor = mixColor(
        { r: 0x4f, g: 0xd1, b: 0xc5 },
        { r: 0x81, g: 0xe6, b: 0xd9 },
        Math.min(1, Math.max(0, arrowT))
      );

      r = arrowColor.r;
      g = arrowColor.g;
      b = arrowColor.b;
    }

    if (pointInPolygon(x + 0.5, y + 0.5, arrowHead)) {
      r = Math.min(255, r + 30);
      g = Math.min(255, g + 30);
      b = Math.min(255, b + 20);
    }

    data[idx] = r;
    data[idx + 1] = g;
    data[idx + 2] = b;
    data[idx + 3] = 255;
  }
}

function createChunk(type, payload) {
  const chunk = Buffer.alloc(8 + payload.length + 4);
  chunk.writeUInt32BE(payload.length, 0);
  chunk.write(type, 4, 4, "ascii");
  payload.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(type, payload), 8 + payload.length);
  return chunk;
}

function crc32(type, payload) {
  const table = crc32.table || (crc32.table = buildCRCTable());
  let crc = 0xffffffff;
  const typeBuf = Buffer.from(type, "ascii");
  for (const byte of typeBuf) {
    crc = (crc >>> 8) ^ table[(crc ^ byte) & 0xff];
  }
  for (const byte of payload) {
    crc = (crc >>> 8) ^ table[(crc ^ byte) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function buildCRCTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) {
        c = 0xedb88320 ^ (c >>> 1);
      } else {
        c >>>= 1;
      }
    }
    table[n] = c >>> 0;
  }
  return table;
}

function createPNG(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrPayload = Buffer.alloc(13);
  ihdrPayload.writeUInt32BE(width, 0);
  ihdrPayload.writeUInt32BE(height, 4);
  ihdrPayload[8] = 8; // bit depth
  ihdrPayload[9] = 6; // RGBA
  ihdrPayload[10] = 0;
  ihdrPayload[11] = 0;
  ihdrPayload[12] = 0;

  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0;
    rgbaBuffer.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(raw);

  const chunks = [
    createChunk("IHDR", ihdrPayload),
    createChunk("IDAT", compressed),
    createChunk("IEND", Buffer.alloc(0)),
  ];

  return Buffer.concat([signature, ...chunks]);
}

function createICO(pngBuffer, dimension) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);

  const entry = Buffer.alloc(16);
  entry[0] = dimension === 256 ? 0 : dimension;
  entry[1] = dimension === 256 ? 0 : dimension;
  entry[2] = 0;
  entry[3] = 0;
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(pngBuffer.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12);

  return Buffer.concat([header, entry, pngBuffer]);
}

const pngBuffer = createPNG(size, size, data);
const icoBuffer = createICO(pngBuffer, size);

fs.mkdirSync(path.dirname(OUTPUTS.png), { recursive: true });
fs.mkdirSync(path.dirname(OUTPUTS.ico), { recursive: true });

fs.writeFileSync(OUTPUTS.png, pngBuffer);
fs.writeFileSync(OUTPUTS.ico, icoBuffer);

console.log("Generated favicon assets:");
console.log(`- ${OUTPUTS.png}`);
console.log(`- ${OUTPUTS.ico}`);
