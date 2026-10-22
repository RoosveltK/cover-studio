import { describe, expect, it } from "vitest"

import {
  PAGES,
  alternateLanguages,
  localePaths,
  pagePath,
  registryProblems,
  type SitePage,
} from "@/lib/pages"

const page = (overrides: Partial<SitePage>): SitePage => ({
  kind: "use-case",
  locale: "en",
  slug: "readme-banner",
  group: "readme-banner",
  primaryKeyword: "github readme banner generator",
  secondaryKeywords: [],
  updatedAt: "2026-10-14",
  ...overrides,
})

const landings = PAGES.filter((p) => p.kind === "landing")

describe("registre des pages (carte des mots-clés)", () => {
  it("est cohérent", () => {
    expect(registryProblems()).toEqual([])
  })

  it("refuse deux pages sur le même mot-clé principal", () => {
    const problems = registryProblems([
      ...landings,
      page({}),
      page({
        slug: "readme-header",
        group: "readme-header",
        primaryKeyword: "GitHub README banner  generator",
      }),
    ])
    expect(problems.join("\n")).toMatch(
      /mot-clé principal de \/en\/readme-banner et \/en\/readme-header/
    )
  })

  it("refuse le mot-clé principal d'une page en secondaire d'une autre", () => {
    const problems = registryProblems([
      ...landings,
      page({}),
      page({
        slug: "github-social-preview",
        group: "github-social-preview",
        primaryKeyword: "github social preview image generator",
        secondaryKeywords: ["github readme banner generator"],
      }),
    ])
    expect(problems.join("\n")).toMatch(
      /secondaire de \/en\/github-social-preview/
    )
  })

  it("refuse une page sœur ou une page soutenue absente de la langue", () => {
    const problems = registryProblems([
      ...landings,
      page({ sisters: ["github-social-preview"] }),
      page({
        kind: "guide",
        slug: "readme-banner-size",
        group: "readme-banner-size",
        primaryKeyword: "readme banner size",
        supports: "readme-banner",
        locale: "fr",
      }),
    ])
    expect(problems).toContain(
      "/en/readme-banner : page sœur « github-social-preview » absente de en"
    )
    expect(problems).toContain(
      "/fr/readme-banner-size : un Guide soutient une page existante de sa langue"
    )
    // Pas encore de route pour les Guides : le sitemap listerait une 404.
    expect(problems).toContain(
      "/fr/readme-banner-size : aucune route ne rend les pages « guide »"
    )
  })

  it("refuse un export format inconnu, un slug réservé et une date invalide", () => {
    const problems = registryProblems([
      ...landings,
      page({ exportSize: "banner" }),
      page({
        slug: "editor",
        group: "editor",
        primaryKeyword: "x",
        updatedAt: "14/10/2026",
      }),
    ])
    expect(problems).toContain(
      "/en/readme-banner : export format inconnu « banner »"
    )
    expect(problems).toContain("/en/editor : slug réservé")
    expect(problems).toContain("/en/editor : updatedAt invalide")
  })
})

describe("hreflang", () => {
  const en = page({
    kind: "feature",
    slug: "website-mockup-from-url",
    group: "url",
  })
  const fr = page({
    kind: "feature",
    locale: "fr",
    slug: "mockup-site-web",
    group: "url",
    primaryKeyword: "mockup site web",
  })
  const alone = page({})
  const pages = [...landings, en, fr, alone]

  it("relie les vraies traductions, x-default vers l'anglais", () => {
    expect(alternateLanguages(fr, pages)).toEqual({
      fr: "/fr/mockup-site-web",
      en: "/en/website-mockup-from-url",
      "x-default": "/en/website-mockup-from-url",
    })
  })

  it("n'en déclare aucun pour une page sans traduction", () => {
    expect(alternateLanguages(alone, pages)).toBeUndefined()
  })

  it("envoie le sélecteur de langue vers la Landing quand la traduction manque", () => {
    expect(localePaths(alone, pages)).toEqual({ fr: "/", en: "/readme-banner", es: "/" })
    expect(localePaths(en, pages)).toEqual({
      fr: "/mockup-site-web",
      en: "/website-mockup-from-url",
      es: "/",
    })
  })

  it("construit les chemins avec la langue", () => {
    expect(pagePath(landings[0])).toBe(`/${landings[0].locale}`)
    expect(pagePath(alone)).toBe("/en/readme-banner")
  })
})
