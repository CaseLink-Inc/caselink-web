/**
 * Pings IndexNow (Bing, Yandex, Seznam, Naver) with every URL in the live
 * sitemap, so new and changed pages are crawled in days instead of weeks.
 *
 * Run after a deploy has finished:   npm run indexnow
 *
 * The key must match public/<key>.txt, which proves ownership of the host.
 */
const HOST = "www.caselink.net";
const KEY = "68179138f4e85021dc604240ea7c71fb";

const sitemap = await fetch(`https://${HOST}/sitemap.xml`).then((r) => r.text());
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

if (urlList.length === 0) {
  console.error("No URLs found in the live sitemap. Aborting.");
  process.exit(1);
}

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList,
  }),
});

// 200 = accepted, 202 = accepted and key validation pending.
console.log(`IndexNow responded ${res.status} for ${urlList.length} URLs`);
if (res.status !== 200 && res.status !== 202) {
  console.error(await res.text());
  process.exit(1);
}
