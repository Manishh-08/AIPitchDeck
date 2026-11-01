import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PitchCraft AI — Intelligent Slide Generation",
    short_name: "PitchCraft",
    description:
      "Generate polished, investor-ready pitch decks with tailored narratives and AI-synthesized slide visuals in seconds.",
    start_url: "/",
    display: "standalone",
    background_color: "#090D16",
    theme_color: "#0284C7",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
