/**
 * Génère les visuels du README avec Cover Studio lui-même :
 *   docs/assets/cover.png  cover 1280×640 (aussi utilisable comme image de partage du dépôt)
 *   docs/assets/demo.gif   parcours import → personnalisation → export
 *
 * Usage : pnpm build && pnpm readme:visuals
 * Sert `out/` sur un port local, pilote l'app avec Playwright et assemble le GIF avec sharp
 * (embarqué avec Next.js, donc pas de dépendance en plus).
 */
import { spawn } from "node:child_process"
import { mkdir } from "node:fs/promises"
import { createRequire } from "node:module"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { chromium } from "@playwright/test"

const PORT = 3110
const BASE = `http://localhost:${PORT}`
const OUT_DIR = "docs/assets"
const VIEWPORT = { width: 1280, height: 720 }
const GIF_WIDTH = 960
const COVER = {
  badge: "OPEN SOURCE",
  name: "Cover Studio",
  description: "Turn your app screenshots into a cover for your README, Product Hunt or LinkedIn.",
  chips: ["Free", "No account", "100% client-side"],
  footer: "github.com/roosveltkn/cover-studio",
  browserUrl: "coverstudio.portf.app",
  // Le format GitHub (1280×640) réduit le template à ~43 % : sans agrandissement,
  // la description tombe à ~13 px et devient illisible dans les aperçus de partage.
  textScale: { badge: 1.4, description: 1.6, chips: 1.3, footer: 1.3 },
}
const MOBILE_VIEWPORT = { width: 390, height: 844 }

const sharp = createRequire(createRequire(import.meta.url).resolve("next/package.json"))("sharp")

const frames = []

async function snap(page, delay = 900) {
  await page.waitForTimeout(250)
  frames.push({ png: await page.screenshot(), delay })
}

async function rail(page, name) {
  await page.getByRole("navigation", { name: "Editor sections" }).getByRole("button", { name }).click()
}

async function fill(page, id, value) {
  await page.locator(`#${id}`).fill(value)
}

async function setChips(page, chips) {
  for (const label of await page
    .getByRole("button", { name: /^Remove / })
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("aria-label")))) {
    await page.getByRole("button", { name: label, exact: true }).first().click()
  }
  for (const chip of chips) {
    await page.locator("#field-content-chips").fill(chip)
    await page.locator("#field-content-chips").press("Enter")
  }
}

async function openEditor(page, files) {
  await page.goto(`${BASE}/en`)
  await page.locator("#landing-image").setInputFiles(files)
  await page.getByRole("button", { name: "Create my cover" }).click()
  await page.waitForURL(/\/en\/editor/)
  await page.getByRole("region", { name: "Cover preview" }).waitFor()
}

const server = spawn("pnpm", ["exec", "serve", "out", "-l", String(PORT)], {
  stdio: "ignore",
  shell: true,
})

try {
  await mkdir(OUT_DIR, { recursive: true })
  for (let i = 0; i < 60; i++) {
    if (await fetch(`${BASE}/en`).then((r) => r.ok, () => false)) break
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: VIEWPORT, locale: "en-US", acceptDownloads: true })
  const page = await context.newPage()

  // 1. Une capture de l'app elle-même : l'éditeur rempli avec un exemple.
  const landing = join(tmpdir(), "cs-landing.png")
  await page.goto(`${BASE}/en`)
  await page.waitForTimeout(1500)
  await page.screenshot({ path: landing })
  await openEditor(page, landing)
  await rail(page, "Templates")
  await page.waitForTimeout(800)
  const source = join(tmpdir(), "cs-source.png")
  await page.screenshot({ path: source })

  // Une capture mobile remplit le cadre téléphone du template, sinon le bas de la cover reste vide.
  const mobile = join(tmpdir(), "cs-mobile.png")
  const mobileContext = await browser.newContext({
    viewport: MOBILE_VIEWPORT,
    deviceScaleFactor: 2,
    isMobile: true,
    locale: "en-US",
  })
  const mobilePage = await mobileContext.newPage()
  await mobilePage.goto(`${BASE}/en`)
  await mobilePage.waitForTimeout(1500)
  await mobilePage.screenshot({ path: mobile })
  await mobileContext.close()

  // 2. La cover du dépôt, générée par l'app.
  await openEditor(page, [source, mobile])
  await rail(page, "Text")
  await fill(page, "field-content-badge", COVER.badge)
  await fill(page, "field-content-name", COVER.name)
  await fill(page, "field-content-description", COVER.description)
  await setChips(page, COVER.chips)
  await fill(page, "field-content-footer", COVER.footer)
  await fill(page, "field-content-browserUrl", COVER.browserUrl)
  await rail(page, "Font")
  for (const [element, scale] of Object.entries(COVER.textScale)) {
    await fill(page, `field-style-textScale-${element}`, String(scale))
  }
  await rail(page, "Export")
  await page.getByRole("button", { name: /GitHub/ }).filter({ hasText: "1280" }).click()
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download PNG" }).click(),
  ])
  await download.saveAs(join(OUT_DIR, "cover.png"))
  console.log("cover.png écrit")

  // 3. Le GIF : import, texte, couleur, templates, export.
  await page.goto(`${BASE}/en`)
  await page.waitForTimeout(1500)
  await snap(page, 1200)
  await page.locator("#landing-image").setInputFiles(source)
  await snap(page, 900)
  await page.getByRole("button", { name: "Create my cover" }).click()
  await page.waitForURL(/\/en\/editor/)
  await page.getByRole("region", { name: "Cover preview" }).waitFor()
  await snap(page, 1200)
  await rail(page, "Text")
  await fill(page, "field-content-name", COVER.name)
  await fill(page, "field-content-description", COVER.description)
  await setChips(page, COVER.chips)
  await snap(page, 1400)
  await rail(page, "Colors")
  for (const color of ["#2563eb", "#16a34a", "#db2777"]) {
    await page.getByRole("button", { name: `Color ${color}` }).click()
    await snap(page, 900)
  }
  await rail(page, "Templates")
  const templates = page.getByRole("list", { name: "Available templates" }).locator("button[aria-pressed]")
  for (const index of [1, 6, 10]) {
    await templates.nth(index).click()
    await snap(page, 1100)
  }
  await rail(page, "Export")
  await snap(page, 1400)

  await browser.close()

  const height = Math.round((GIF_WIDTH * VIEWPORT.height) / VIEWPORT.width)
  const raw = await Promise.all(
    frames.map(({ png }) =>
      sharp(png).resize(GIF_WIDTH, height).ensureAlpha().raw().toBuffer()
    )
  )
  await sharp(Buffer.concat(raw), {
    raw: { width: GIF_WIDTH, height: height * frames.length, channels: 4, pageHeight: height },
  })
    .gif({ delay: frames.map((f) => f.delay), loop: 0, effort: 7, colours: 128 })
    .toFile(join(OUT_DIR, "demo.gif"))
  console.log(`demo.gif écrit (${frames.length} images)`)
} finally {
  server.kill()
}
