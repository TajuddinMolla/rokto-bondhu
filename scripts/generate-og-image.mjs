import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const PROJECT_ROOT = process.cwd();

/**
 * Builds the official 1200x630 RoktoBondhu Open Graph SVG Banner.
 * Utilizes HarfBuzz & Pango font rendering via librsvg / sharp for 100% accurate
 * Bengali conjunct ligatures (e.g. রক্ত, বাঁচান, নিবন্ধন, প্রয়োজন).
 */
function buildOgBannerSvg() {
  return `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradients -->
    <radialGradient id="bg-glow1" cx="85%" cy="15%" r="60%">
      <stop offset="0%" stop-color="#e11d48" stop-opacity="0.32" />
      <stop offset="100%" stop-color="#070b14" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="bg-glow2" cx="15%" cy="85%" r="60%">
      <stop offset="0%" stop-color="#9f1239" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#070b14" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f43f5e" />
      <stop offset="45%" stop-color="#e11d48" />
      <stop offset="100%" stop-color="#9f1239" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#e11d48" flood-opacity="0.4" />
    </filter>
  </defs>

  <!-- Base Dark Canvas -->
  <rect width="1200" height="630" fill="#070b14" />
  <rect width="1200" height="630" fill="url(#bg-glow1)" />
  <rect width="1200" height="630" fill="url(#bg-glow2)" />
  <rect x="20" y="20" width="1160" height="590" rx="28" fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="2" />

  <!-- Top Status Bar -->
  <g transform="translate(60, 52)">
    <!-- Active Emergency Badge -->
    <rect width="420" height="42" rx="21" fill="#10b981" fill-opacity="0.14" stroke="#10b981" stroke-opacity="0.4" stroke-width="1.5" />
    <circle cx="24" cy="21" r="6" fill="#10b981" />
    <text x="42" y="27" fill="#34d399" font-size="18" font-weight="bold" font-family="Kohinoor Bangla, Bangla Sangam MN, Bangla MN, sans-serif">
      জরুরি রক্তদান ও রক্তদাতা সমন্বয় প্ল্যাটফর্ম
    </text>

    <!-- Domain Pill -->
    <g transform="translate(860, 0)">
      <rect width="220" height="42" rx="21" fill="#ffffff" fill-opacity="0.06" stroke="#ffffff" stroke-opacity="0.12" stroke-width="1" />
      <text x="110" y="26" text-anchor="middle" fill="#94a3b8" font-size="17" font-weight="600" font-family="Arial, Helvetica, sans-serif">
        roktobondhubd.vercel.app
      </text>
    </g>
  </g>

  <!-- Main Hero Brand Container -->
  <g transform="translate(60, 150)">
    <!-- Official Squircle Logo Icon -->
    <g filter="url(#shadow)">
      <rect width="150" height="150" rx="36" fill="url(#logo-bg)" stroke="#ffffff" stroke-opacity="0.25" stroke-width="2" />
      <!-- Lucide Droplet Motif Centered -->
      <g transform="translate(32, 28) scale(3.6)">
        <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" fill="#ffffff" stroke="#ffffff" stroke-width="0.3" />
      </g>
      <!-- Live Emerald Beacon -->
      <circle cx="122" cy="28" r="16" fill="#10b981" stroke="#ffffff" stroke-width="3.5" />
    </g>

    <!-- Brand Typography & Official Motto -->
    <g transform="translate(180, 48)">
      <text x="0" y="24" fill="#ffffff" font-size="68" font-weight="900" font-family="Arial, Helvetica, sans-serif" letter-spacing="-1.5">
        RoktoBondhu
      </text>
      <!-- Official Motto: রক্ত দিন, জীবন বাঁচান -->
      <text x="440" y="22" fill="#fb7185" font-size="36" font-weight="bold" font-family="Kohinoor Bangla, Bangla Sangam MN, Bangla MN, sans-serif">
        রক্ত দিন, জীবন বাঁচান
      </text>
      <!-- Subtitle Description -->
      <text x="0" y="80" fill="#cbd5e1" font-size="22" font-family="Kohinoor Bangla, Bangla Sangam MN, Bangla MN, sans-serif">
        রক্তদাতা খুঁজুন, রক্তদাতা হিসেবে নিবন্ধন করুন এবং জরুরি রক্তের প্রয়োজনে মানুষের পাশে দাঁড়ান।
      </text>
    </g>
  </g>

  <!-- Bottom Feature Dock (4 Cards) -->
  <g transform="translate(60, 460)">
    <!-- Card 1 -->
    <g transform="translate(0, 0)">
      <rect width="255" height="76" rx="18" fill="#ffffff" fill-opacity="0.04" stroke="#ffffff" stroke-opacity="0.1" stroke-width="1.2" />
      <!-- Droplet Icon -->
      <g transform="translate(18, 24) scale(1.2)">
        <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" fill="#f43f5e" />
      </g>
      <text x="56" y="44" fill="#e2e8f0" font-size="16" font-weight="bold" font-family="Kohinoor Bangla, Bangla Sangam MN, Bangla MN, sans-serif">
        ৮টি রক্তের গ্রুপ
      </text>
      <text x="56" y="62" fill="#94a3b8" font-size="12" font-family="Arial, sans-serif">
        (A+, B+, AB+, O+...)
      </text>
    </g>

    <!-- Card 2 -->
    <g transform="translate(275, 0)">
      <rect width="255" height="76" rx="18" fill="#ffffff" fill-opacity="0.04" stroke="#ffffff" stroke-opacity="0.1" stroke-width="1.2" />
      <!-- Map Pin -->
      <g transform="translate(18, 22) scale(1.3)" stroke="#38bdf8" stroke-width="2" fill="none">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </g>
      <text x="56" y="44" fill="#e2e8f0" font-size="16" font-weight="bold" font-family="Kohinoor Bangla, Bangla Sangam MN, Bangla MN, sans-serif">
        ৬৪ জেলায় সেবা
      </text>
      <text x="56" y="62" fill="#94a3b8" font-size="12" font-family="Kohinoor Bangla, Bangla Sangam MN, sans-serif">
        সারাদেশব্যাপী নেটওয়ার্ক
      </text>
    </g>

    <!-- Card 3 -->
    <g transform="translate(550, 0)">
      <rect width="255" height="76" rx="18" fill="#ffffff" fill-opacity="0.04" stroke="#ffffff" stroke-opacity="0.1" stroke-width="1.2" />
      <!-- Bolt -->
      <g transform="translate(18, 22) scale(1.3)" fill="#fbbf24">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </g>
      <text x="56" y="44" fill="#e2e8f0" font-size="16" font-weight="bold" font-family="Kohinoor Bangla, Bangla Sangam MN, Bangla MN, sans-serif">
        সরাসরি যোগাযোগ
      </text>
      <text x="56" y="62" fill="#94a3b8" font-size="12" font-family="Kohinoor Bangla, Bangla Sangam MN, sans-serif">
        জরুরি রক্তদাতার সাথে
      </text>
    </g>

    <!-- Card 4 -->
    <g transform="translate(825, 0)">
      <rect width="255" height="76" rx="18" fill="#ffffff" fill-opacity="0.04" stroke="#ffffff" stroke-opacity="0.1" stroke-width="1.2" />
      <!-- Heart -->
      <g transform="translate(18, 22) scale(1.3)" fill="#ec4899">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </g>
      <text x="56" y="44" fill="#e2e8f0" font-size="16" font-weight="bold" font-family="Kohinoor Bangla, Bangla Sangam MN, Bangla MN, sans-serif">
        ১০০% স্বেচ্ছাসেবী
      </text>
      <text x="56" y="62" fill="#94a3b8" font-size="12" font-family="Kohinoor Bangla, Bangla Sangam MN, sans-serif">
        সম্পূর্ণ অলাভজনক ও ফ্রি
      </text>
    </g>
  </g>
</svg>
`;
}

async function main() {
  console.log("🎨 Generating RoktoBondhu 1200x630 Branded Open Graph Image with HarfBuzz...");

  const svgContent = buildOgBannerSvg();
  const buffer = await sharp(Buffer.from(svgContent))
    .png({ compressionLevel: 9 })
    .toBuffer();

  const outPathPublic = path.join(PROJECT_ROOT, "public", "og-image.png");
  const outPathAppOg = path.join(PROJECT_ROOT, "app", "opengraph-image.png");
  const outPathAppTwitter = path.join(PROJECT_ROOT, "app", "twitter-image.png");

  fs.writeFileSync(outPathPublic, buffer);
  fs.writeFileSync(outPathAppOg, buffer);
  fs.writeFileSync(outPathAppTwitter, buffer);

  console.log(`  ✓ Generated ${outPathPublic} (${buffer.length} bytes, 1200x630)`);
  console.log(`  ✓ Generated ${outPathAppOg}`);
  console.log(`  ✓ Generated ${outPathAppTwitter}`);

  console.log("\n✅ Open Graph image successfully generated with HarfBuzz complex shaping!\n");
}

main().catch((err) => {
  console.error("Error generating OG image:", err);
  process.exit(1);
});
