import type { MetadataRoute } from "next";

// Gives browsers and answer engines a square brand icon to show next to
// CaseLink (the wide lockup crops badly in square tiles).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CaseLink",
    short_name: "CaseLink",
    description:
      "HIPAA-compliant dental referral management platform for general dentists and specialists.",
    start_url: "/",
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/logo-square-192.png", sizes: "192x192", type: "image/png" },
      { src: "/logo-square-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
