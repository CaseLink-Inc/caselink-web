import type { MetadataRoute } from "next";

const SITE = "https://www.caselink.net";

/**
 * Strategy:
 * - Allow Googlebot, Bingbot, DuckDuckBot (classic search) by default
 * - Explicitly allow the major LLM crawlers used by ChatGPT, Claude, Perplexity,
 *   Google's AI Overviews, Cohere, Apple, and Common Crawl. CaseLink is
 *   early-stage and benefits from being discoverable by AI answer engines.
 * - Block /dashboard, /login, /signup from indexing — those routes are demo
 *   shells, not real product pages, and shouldn't appear in search.
 */
export default function robots(): MetadataRoute.Robots {
  const aiBots = [
    "GPTBot", // OpenAI / ChatGPT browsing
    "OAI-SearchBot", // OpenAI search
    "ChatGPT-User", // ChatGPT on-demand fetching
    "ClaudeBot", // Anthropic Claude
    "anthropic-ai", // Older Anthropic identifier
    "Claude-Web", // Claude.ai web tool
    "PerplexityBot", // Perplexity
    "Perplexity-User", // Perplexity user-triggered fetch
    "Google-Extended", // Google's opt-in flag for Gemini / Bard training
    "Applebot-Extended", // Apple Intelligence / Siri
    "CCBot", // Common Crawl (feeds many LLMs)
    "cohere-ai", // Cohere
    "DiffbotAI", // Diffbot
    "YouBot", // You.com
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/login", "/signup"],
      },
      ...aiBots.map((bot) => ({
        userAgent: bot,
        allow: "/",
        disallow: ["/dashboard", "/login", "/signup"],
      })),
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
