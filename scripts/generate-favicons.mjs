import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const React = require("react");
const { ImageResponse } = require("next/og");

const PROJECT_ROOT = process.cwd();

const SVG_FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="rb-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f43f5e" />
      <stop offset="45%" stop-color="#e11d48" />
      <stop offset="100%" stop-color="#9f1239" />
    </linearGradient>
    <linearGradient id="rb-drop" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#ffe4e6" />
    </linearGradient>
    <filter id="rb-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#4c0519" flood-opacity="0.38" />
    </filter>
  </defs>

  <!-- Squircle Base -->
  <rect width="512" height="512" rx="112" fill="url(#rb-bg)" />

  <!-- Inner Stroke Highlight -->
  <rect x="8" y="8" width="496" height="496" rx="104" fill="none" stroke="#ffffff" stroke-width="8" stroke-opacity="0.2" />

  <!-- Lucide Droplet Motif Centered -->
  <g transform="translate(64, 76) scale(16)" filter="url(#rb-shadow)">
    <path
      d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"
      fill="url(#rb-drop)"
      stroke="#ffffff"
      stroke-width="0.3"
    />
  </g>

  <!-- Live Emergency Active Indicator (Beacon) -->
  <circle cx="414" cy="98" r="44" fill="#10b981" stroke="#ffffff" stroke-width="12" />
</svg>`;

function renderIconJSX(size) {
  const dropletSize = Math.round(size * 0.58);
  const beaconSize = Math.max(Math.round(size * 0.22), 4);
  const beaconBorder = Math.max(Math.round(beaconSize * 0.22), 1);
  const beaconOffset = Math.max(Math.round(size * 0.05), 1);
  const borderRadius = Math.round(size * 0.22);

  return React.createElement(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f43f5e 0%, #e11d48 45%, #9f1239 100%)",
        borderRadius: `${borderRadius}px`,
        position: "relative",
      },
    },
    React.createElement(
      "svg",
      {
        width: dropletSize,
        height: dropletSize,
        viewBox: "0 0 24 24",
        fill: "white",
        stroke: "white",
        strokeWidth: size <= 32 ? "0.8" : "0.5",
      },
      React.createElement("path", {
        d: "M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z",
      })
    ),
    React.createElement("div", {
      style: {
        position: "absolute",
        top: `${beaconOffset}px`,
        right: `${beaconOffset}px`,
        width: `${beaconSize}px`,
        height: `${beaconSize}px`,
        borderRadius: "50%",
        backgroundColor: "#10b981",
        border: `${beaconBorder}px solid white`,
      },
    })
  );
}

function buildIcoBuffer(pngEntries) {
  const numImages = pngEntries.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type 1 = ICO
  header.writeUInt16LE(numImages, 4); // Number of images

  let offset = 6 + 16 * numImages;
  const dirEntries = [];
  for (const item of pngEntries) {
    const dir = Buffer.alloc(16);
    dir.writeUInt8(item.size === 256 ? 0 : item.size, 0); // Width
    dir.writeUInt8(item.size === 256 ? 0 : item.size, 1); // Height
    dir.writeUInt8(0, 2); // Color palette
    dir.writeUInt8(0, 3); // Reserved
    dir.writeUInt16LE(1, 4); // Color planes
    dir.writeUInt16LE(32, 6); // Bits per pixel
    dir.writeUInt32LE(item.buffer.length, 8); // Image size in bytes
    dir.writeUInt32LE(offset, 12); // Image offset in file
    dirEntries.push(dir);
    offset += item.buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngEntries.map((p) => p.buffer)]);
}

async function main() {
  console.log("🎨 Generating RoktoBondhu Favicons & App Icons...");

  // 1. Write SVG icons
  const appIconSvgPath = path.join(PROJECT_ROOT, "app", "icon.svg");
  const publicIconSvgPath = path.join(PROJECT_ROOT, "public", "icon.svg");
  fs.writeFileSync(appIconSvgPath, SVG_FAVICON, "utf8");
  fs.writeFileSync(publicIconSvgPath, SVG_FAVICON, "utf8");
  console.log("  ✓ Created app/icon.svg and public/icon.svg");

  // 2. Generate PNG rasters
  const targetSizes = [16, 32, 48, 180, 192, 512];
  const rendered = {};
  for (const s of targetSizes) {
    const res = new ImageResponse(renderIconJSX(s), { width: s, height: s });
    const buf = Buffer.from(await res.arrayBuffer());
    rendered[s] = buf;
    console.log(`  ✓ Rendered ${s}x${s} PNG (${buf.length} bytes)`);
  }

  // 3. Write individual PNG icons
  fs.writeFileSync(path.join(PROJECT_ROOT, "public", "favicon-16x16.png"), rendered[16]);
  fs.writeFileSync(path.join(PROJECT_ROOT, "public", "favicon-32x32.png"), rendered[32]);
  fs.writeFileSync(path.join(PROJECT_ROOT, "public", "apple-icon.png"), rendered[180]);
  fs.writeFileSync(path.join(PROJECT_ROOT, "app", "apple-icon.png"), rendered[180]);
  fs.writeFileSync(path.join(PROJECT_ROOT, "public", "icon-192.png"), rendered[192]);
  fs.writeFileSync(path.join(PROJECT_ROOT, "public", "icon-512.png"), rendered[512]);
  console.log("  ✓ Written standard PNG assets to public/ and app/");

  // 4. Assemble multi-resolution ICO (16x16, 32x32, 48x48)
  const icoEntries = [
    { size: 16, buffer: rendered[16] },
    { size: 32, buffer: rendered[32] },
    { size: 48, buffer: rendered[48] },
  ];
  const icoBuffer = buildIcoBuffer(icoEntries);
  fs.writeFileSync(path.join(PROJECT_ROOT, "app", "favicon.ico"), icoBuffer);
  fs.writeFileSync(path.join(PROJECT_ROOT, "public", "favicon.ico"), icoBuffer);
  console.log(`  ✓ Built standard multi-resolution favicon.ico (${icoBuffer.length} bytes)`);

  console.log("\n✅ All RoktoBondhu favicons and icons successfully generated!\n");
}

main().catch((err) => {
  console.error("Error generating icons:", err);
  process.exit(1);
});
