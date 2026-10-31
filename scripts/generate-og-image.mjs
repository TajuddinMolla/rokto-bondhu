import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const React = require("react");
const { ImageResponse } = require("next/og");

const PROJECT_ROOT = process.cwd();

/**
 * Extracts a TrueType Font (TTF) from a TrueType Collection (TTC).
 * Satori supports TTF/OTF but cannot directly parse TTC headers.
 */
function extractTtfFromTtc(ttcBuf, fontIndex = 0) {
  const offset = ttcBuf.readUInt32BE(12 + fontIndex * 4);
  const numTables = ttcBuf.readUInt16BE(offset + 4);
  const headerSize = 12 + 16 * numTables;
  let totalSize = headerSize;
  const tables = [];

  for (let i = 0; i < numTables; i++) {
    const recOffset = offset + 12 + i * 16;
    const tag = ttcBuf.slice(recOffset, recOffset + 4).toString("latin1");
    const checkSum = ttcBuf.readUInt32BE(recOffset + 4);
    const tableOffset = ttcBuf.readUInt32BE(recOffset + 8);
    const length = ttcBuf.readUInt32BE(recOffset + 12);
    const paddedLength = (length + 3) & ~3;
    tables.push({ tag, checkSum, tableOffset, length, paddedLength });
    totalSize += paddedLength;
  }

  const ttf = Buffer.alloc(totalSize);
  ttcBuf.copy(ttf, 0, offset, offset + 12);
  let currentOffset = headerSize;

  for (let i = 0; i < numTables; i++) {
    const t = tables[i];
    const recOffset = 12 + i * 16;
    ttf.write(t.tag, recOffset, 4, "latin1");
    ttf.writeUInt32BE(t.checkSum, recOffset + 4);
    ttf.writeUInt32BE(currentOffset, recOffset + 8);
    ttf.writeUInt32BE(t.length, recOffset + 12);
    ttcBuf.copy(ttf, currentOffset, t.tableOffset, t.tableOffset + t.length);
    currentOffset += t.paddedLength;
  }

  return ttf;
}

function renderSvgIcon(type) {
  if (type === "droplet") {
    return React.createElement(
      "svg",
      { width: "20", height: "20", viewBox: "0 0 24 24", fill: "#f43f5e", stroke: "#f43f5e", strokeWidth: "0.5" },
      React.createElement("path", { d: "M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" })
    );
  }
  if (type === "mapPin") {
    return React.createElement(
      "svg",
      { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "#38bdf8", strokeWidth: "2" },
      React.createElement("path", { d: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" }),
      React.createElement("circle", { cx: "12", cy: "10", r: "3" })
    );
  }
  if (type === "bolt") {
    return React.createElement(
      "svg",
      { width: "20", height: "20", viewBox: "0 0 24 24", fill: "#fbbf24", stroke: "#fbbf24", strokeWidth: "0.5" },
      React.createElement("polygon", { points: "13 2 3 14 12 14 11 22 21 10 12 10 13 2" })
    );
  }
  // heart / voluntary
  return React.createElement(
    "svg",
    { width: "20", height: "20", viewBox: "0 0 24 24", fill: "#ec4899", stroke: "#ec4899", strokeWidth: "0.5" },
    React.createElement("path", { d: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" })
  );
}

function renderOgCardJSX() {
  return React.createElement(
    "div",
    {
      style: {
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#070b14",
        backgroundImage:
          "radial-gradient(circle at 86% 16%, rgba(225, 29, 72, 0.28) 0%, transparent 55%), radial-gradient(circle at 14% 84%, rgba(159, 18, 57, 0.22) 0%, transparent 55%)",
        padding: "54px 64px",
        boxSizing: "border-box",
        position: "relative",
      },
    },
    // Top Live Status Bar
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        },
      },
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            backgroundColor: "rgba(16, 185, 129, 0.12)",
            border: "1.5px solid rgba(16, 185, 129, 0.35)",
            borderRadius: "9999px",
            padding: "8px 20px",
          },
        },
        React.createElement("div", {
          style: {
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: "#10b981",
            marginRight: "12px",
          },
        }),
        React.createElement(
          "span",
          {
            style: {
              fontFamily: "BanglaFont",
              fontSize: "20px",
              color: "#34d399",
              fontWeight: "bold",
            },
          },
          "জরুরি রক্তদান ও রক্তদাতা সমন্বয় প্ল্যাটফর্ম"
        )
      ),
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "9999px",
            padding: "8px 20px",
            color: "#94a3b8",
            fontSize: "18px",
            fontFamily: "ArialBold",
            letterSpacing: "0.5px",
          },
        },
        "roktobondhu.org"
      )
    ),

    // Middle Brand Hero Container
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: "40px",
          marginTop: "12px",
          marginBottom: "12px",
        },
      },
      // Logo Squircle with Droplet and Emerald Beacon
      React.createElement(
        "div",
        {
          style: {
            width: "160px",
            height: "160px",
            minWidth: "160px",
            borderRadius: "36px",
            background: "linear-gradient(135deg, #f43f5e 0%, #e11d48 45%, #9f1239 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            boxShadow: "0 20px 40px -10px rgba(225, 29, 72, 0.45)",
            border: "2px solid rgba(255, 255, 255, 0.25)",
          },
        },
        React.createElement(
          "svg",
          {
            width: "92",
            height: "92",
            viewBox: "0 0 24 24",
            fill: "#ffffff",
            stroke: "#ffffff",
            strokeWidth: "0.5",
          },
          React.createElement("path", {
            d: "M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z",
          })
        ),
        React.createElement("div", {
          style: {
            position: "absolute",
            top: "8px",
            right: "8px",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "#10b981",
            border: "4px solid #ffffff",
          },
        })
      ),

      // Brand Title + Bangla Tagline + Description
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          },
        },
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "baseline",
              gap: "20px",
            },
          },
          React.createElement(
            "span",
            {
              style: {
                fontFamily: "ArialBold",
                fontSize: "76px",
                fontWeight: "900",
                color: "#ffffff",
                letterSpacing: "-2px",
                lineHeight: "1",
              },
            },
            "RoktoBondhu"
          ),
          React.createElement(
            "span",
            {
              style: {
                fontFamily: "BanglaFont",
                fontSize: "36px",
                color: "#fb7185",
                fontWeight: "bold",
                lineHeight: "1",
              },
            },
            "রক্ত খুঁজুন, জীবন বাঁচান"
          )
        ),
        React.createElement(
          "div",
          {
            style: {
              fontFamily: "BanglaFont",
              fontSize: "23px",
              color: "#cbd5e1",
              lineHeight: "1.45",
              marginTop: "16px",
              maxWidth: "860px",
            },
          },
          "রক্তদাতা খুঁজুন, রক্তদাতা হিসেবে নিবন্ধন করুন এবং জরুরি রক্তের প্রয়োজনে মানুষের পাশে দাঁড়ান।"
        )
      )
    ),

    // Bottom Feature Dock
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: "16px",
          width: "100%",
        },
      },
      [
        { iconType: "droplet", label: "৮টি রক্তের গ্রুপ (A, B, AB, O)" },
        { iconType: "mapPin", label: "সারাদেশের ৬৪ জেলায় সেবা" },
        { iconType: "bolt", label: "জরুরি রক্তদাতার সাথে সরাসরি যোগাযোগ" },
        { iconType: "heart", label: "১০০% স্বেচ্ছাসেবী ও অলাভজনক" },
      ].map((item, idx) =>
        React.createElement(
          "div",
          {
            key: idx,
            style: {
              flex: "1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.09)",
              borderRadius: "18px",
              padding: "16px 12px",
            },
          },
          renderSvgIcon(item.iconType),
          React.createElement(
            "span",
            {
              style: {
                fontFamily: "BanglaFont",
                fontSize: "16px",
                color: "#e2e8f0",
                fontWeight: "600",
                whiteSpace: "nowrap",
              },
            },
            item.label
          )
        )
      )
    )
  );
}

async function main() {
  console.log("🎨 Generating RoktoBondhu 1200x630 Branded Open Graph Image...");

  const arialBoldPath = "/System/Library/Fonts/Supplemental/Arial Bold.ttf";
  const banglaTtcPath = "/System/Library/Fonts/Supplemental/Bangla MN.ttc";

  if (!fs.existsSync(arialBoldPath) || !fs.existsSync(banglaTtcPath)) {
    throw new Error("System fonts not found at expected paths.");
  }

  const arialBoldBuf = fs.readFileSync(arialBoldPath);
  const banglaTtcBuf = fs.readFileSync(banglaTtcPath);
  const banglaTtfBuf = extractTtfFromTtc(banglaTtcBuf, 0);

  const res = new ImageResponse(renderOgCardJSX(), {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "ArialBold",
        data: arialBoldBuf,
        style: "normal",
        weight: 700,
      },
      {
        name: "BanglaFont",
        data: banglaTtfBuf,
        style: "normal",
        weight: 400,
      },
    ],
  });

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const outPathPublic = path.join(PROJECT_ROOT, "public", "og-image.png");
  fs.writeFileSync(outPathPublic, buffer);
  console.log(`  ✓ Generated ${outPathPublic} (${buffer.length} bytes, 1200x630)`);

  console.log("\n✅ Open Graph image successfully generated!\n");
}

main().catch((err) => {
  console.error("Error generating OG image:", err);
  process.exit(1);
});
