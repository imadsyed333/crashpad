import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CrashPad",
    short_name: "CrashPad",
    description: "Document a collision on this device. No account. No server.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f8faff",
    theme_color: "#196ec8",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
