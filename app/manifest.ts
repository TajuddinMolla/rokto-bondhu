import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "রক্তবন্ধু - জরুরী রক্তদান প্ল্যাটফর্ম",
    short_name: "রক্তবন্ধু",
    description:
      "জরুরী রক্তের প্রয়োজনে দ্রুত রক্তদাতা খুঁজে পাওয়ার নির্ভরযোগ্য স্বেচ্ছাসেবী প্ল্যাটফর্ম।",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#e11d48",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
