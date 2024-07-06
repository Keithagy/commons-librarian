import puppeteer from "puppeteer";
import DOMPurify from "isomorphic-dompurify";
import * as JSDOMALL from "jsdom";
import { Readability } from "@mozilla/readability";
import { sleep } from "openai/core";

const { JSDOM } = JSDOMALL;

export async function crawlURL(url: string) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Navigate the page to a URL.
  await page.goto(url);

  // Set screen size.
  await page.setViewport({ width: 1080, height: 1024 });

  await page.evaluate(() => {
    // delete header,footer
    document.querySelectorAll("header").forEach((e) => e.remove());
    document.querySelectorAll("footer").forEach((e) => e.remove());
  });

  // get the jsdom data
  const html = await page.evaluate(() => document.body.innerHTML);

  const clean = DOMPurify.sanitize(html, {});

  const doc = new JSDOM(clean, {
    url,
  });
  const reader = new Readability(doc.window.document);
  const article = reader.parse();

  if (article) {
    page.setJavaScriptEnabled(false);
    page.setContent(article.content);
    await sleep(2 * 5000);
  }

  browser.close();

  return article;
}
