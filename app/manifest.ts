import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aman Group of Companies",
    short_name: "Aman Group",
    description: "Building quality homes and communities for Bicolano families since 1989.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#65932D",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  }
}
