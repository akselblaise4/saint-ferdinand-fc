import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 430, height: 932 } });

// Enable accessibility
await page.goto("https://copafacil.com/-5qp1c@5jvbh", { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(15000);

// Check semantics placeholder content
const semanticTree = await page.evaluate(() => {
  const placeholder = document.querySelector("flt-semantics-placeholder");
  if (!placeholder) return "NO SEMANTICS PLACEHOLDER";

  // Check shadow root
  const shadow = placeholder.shadowRoot;
  if (!shadow) return "NO SHADOW ROOT";

  // Recursively extract semantics tree
  function extract(el, depth) {
    if (!el || depth > 8) return null;
    const children = [];
    // Check for flt-semantics nodes
    for (const child of el.children) {
      const info = extract(child, depth + 1);
      if (info) children.push(info);
    }
    // Also check text nodes
    const texts = [];
    for (const node of el.childNodes) {
      if (node.nodeType === 3 && node.textContent.trim()) {
        texts.push(node.textContent.trim().substring(0, 30));
      }
    }
    if (children.length === 0 && texts.length === 0) return null;
    return {
      tag: el.tagName,
      id: el.id || null,
      cls: el.className || null,
      rect: {
        x: el.offsetLeft, y: el.offsetTop,
        w: el.offsetWidth, h: el.offsetHeight,
      },
      texts: texts.length > 0 ? texts : undefined,
      children: children.length > 0 ? children : undefined,
    };
  }
  return extract(shadow, 0);
});

console.log("=== Semantics Tree ===");
console.log(JSON.stringify(semanticTree, null, 2).substring(0, 3000));

// Also try to read the accessibility snapshot
const a11ySnapshot = await page.accessibility.snapshot();
console.log("\n=== Accessibility Snapshot ===");
console.log(JSON.stringify(a11ySnapshot, null, 2).substring(0, 3000));

await browser.close();
