import { readFile } from "node:fs/promises";
import path from "node:path";

// Loads an article's markdown body from content/resources/<slug>.md.
// Runs at build time during static generation of the article routes.
export async function getResourceBody(slug: string): Promise<string> {
  const file = path.join(process.cwd(), "content", "resources", `${slug}.md`);
  return readFile(file, "utf8");
}
