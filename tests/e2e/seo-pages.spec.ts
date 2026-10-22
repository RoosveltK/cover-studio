import { expect, test, type Page } from "@playwright/test"

import { EXPORT_SIZES } from "../../lib/export-sizes"
import { contentFor } from "../../content/pages"
import { LOCALE_NAMES } from "../../i18n/routing"
import { PAGES, alternateLanguages, pagePath, pagesOf } from "../../lib/pages"
import { openPanel } from "./helpers/editor"
import { en, text } from "./helpers/messages"
import { DESKTOP_SCREENSHOT } from "./helpers/png"

/**
 * Pages indexables du registre (lib/pages.ts) : parcourues depuis le registre, une
 * nouvelle page est couverte sans toucher à ce fichier.
 */

const contentPages = PAGES.filter(
  (page) => page.kind === "use-case" || page.kind === "feature"
)

/** Remet la source sur « Fichiers » si la page s'ouvre sur la capture d'URL (service configuré). */
async function useFiles(page: Page, locale: "fr" | "en" | "es") {
  const files = page.getByRole("button", {
    name: text(locale, "urlImport", "modeFiles"),
    exact: true,
  })
  if (await files.count()) await files.click()
}

for (const entry of contentPages) {
  const path = pagePath(entry)

  test.describe(path, () => {
    test("s'affiche avec son H1, son canonical et ses données structurées", async ({
      page,
    }) => {
      await page.goto(path)
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
      // Un seul H1 dans le DOM : les aperçus de modèles ne doivent pas en ajouter.
      await expect(page.locator("h1")).toHaveCount(1)
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        new RegExp(`${path}$`)
      )

      const types = await page
        .locator('script[type="application/ld+json"]')
        .evaluateAll((nodes) =>
          nodes.flatMap((node) =>
            (JSON.parse(node.textContent ?? "{}")["@graph"] ?? []).map(
              (item: { "@type": string }) => item["@type"]
            )
          )
        )
      expect(types).toEqual(
        expect.arrayContaining(["WebPage", "BreadcrumbList"])
      )

      const languages = alternateLanguages(entry)
      const hreflang = page.locator('link[rel="alternate"][hreflang]')
      if (languages) {
        for (const lang of Object.keys(languages)) {
          await expect(
            page.locator(`link[rel="alternate"][hreflang="${lang}"]`)
          ).toHaveCount(1)
        }
      } else {
        await expect(hreflang).toHaveCount(0)
      }
    })

    test("ouvre l'éditeur depuis son bloc de démarrage", async ({ page }) => {
      await page.goto(path)
      if (entry.startSource === "url") {
        const placeholder = page.getByPlaceholder(
          text(entry.locale, "urlImport", "urlPlaceholder")
        )
        const configured =
          (await page
            .getByRole("button", {
              name: text(entry.locale, "urlImport", "modeUrl"),
            })
            .count()) > 0
        if (configured) await expect(placeholder).toBeVisible()
      }
      await useFiles(page, entry.locale)
      await page.locator("#landing-image").setInputFiles(DESKTOP_SCREENSHOT())
      await page
        .getByRole("button", {
          name: text(entry.locale, "landing", "createButton"),
        })
        .click()
      await expect(page).toHaveURL(new RegExp(`/${entry.locale}/editor`))

      if (entry.exportSize && entry.locale === "en") {
        const size = EXPORT_SIZES.find(({ id }) => id === entry.exportSize)!
        await openPanel(page, "railExport")
        await expect(
          page
            .getByRole("button", {
              name: new RegExp(en("exportSizes", size.labelKey)),
            })
            .filter({ hasText: String(size.width) })
        ).toHaveAttribute("aria-pressed", "true")
      }
    })
  })
}

for (const locale of ["en", "fr", "es"] as const) {
  test(`la Landing ${locale} lie exactement ses pages d'usage`, async ({
    page,
  }) => {
    await page.goto(`/${locale}`)
    await expect(page.locator("h1")).toHaveCount(1)
    const expected = pagesOf(locale, ["use-case", "feature"])
    const section = page.getByRole("region", {
      name: text(locale, "landing", "destinationsTitle"),
    })
    if (expected.length === 0) {
      await expect(section).toHaveCount(0)
      return
    }
    const links = section.getByRole("link")
    await expect(links).toHaveCount(expected.length)
    for (const entry of expected) {
      await expect(
        section.getByRole("link", { name: contentFor(entry)!.label })
      ).toHaveAttribute("href", pagePath(entry))
    }
  })
}

test("le sélecteur de langue d'une page sans traduction renvoie vers la Landing", async ({
  page,
}) => {
  const alone = contentPages.find((entry) => !alternateLanguages(entry))!
  const other = alone.locale === "en" ? "fr" : "en"
  await page.goto(pagePath(alone))
  await page
    .getByRole("combobox", {
      name: text(alone.locale, "localeSwitcher", "label"),
    })
    .click()
  await page.getByRole("option", { name: LOCALE_NAMES[other] }).click()
  await expect(page).toHaveURL(new RegExp(`/${other}$`))
})

test("le sélecteur de langue propose l'espagnol", async ({ page }) => {
  await page.goto("/en")
  await page
    .getByRole("combobox", { name: en("localeSwitcher", "label") })
    .click()
  await page.getByRole("option", { name: LOCALE_NAMES.es }).click()
  await expect(page).toHaveURL(/\/es$/)
  await expect(page.locator("html")).toHaveAttribute("lang", "es")
})

test("le sitemap liste toutes les pages du registre et pas l'éditeur", async ({
  request,
}) => {
  const xml = await (await request.get("/sitemap.xml")).text()
  for (const entry of PAGES) expect(xml).toContain(`${pagePath(entry)}</loc>`)
  expect(xml).not.toContain("/editor")
})
