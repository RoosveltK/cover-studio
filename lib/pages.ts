import { defaultLocale, hasLocale, locales, type Locale } from "@/i18n/routing"

import { EXPORT_SIZES } from "./export-sizes"

/**
 * Registre des pages indexables : c'est la carte des mots-clés du site (docs/SEO.md).
 * Sitemap, canonicals, hreflang et liens internes en sont tirés. Une règle simple :
 * un groupe de mots-clés appartient à une seule URL (vérifié par `registryProblems`).
 */

export type PageKind =
  "landing" | "use-case" | "feature" | "guide" | "comparison"

export type SitePage = {
  kind: PageKind
  locale: Locale
  /** Chemin sans préfixe de langue ni « / » initial ; "" pour la Landing. */
  slug: string
  /** Les traductions d'une même page partagent ce groupe (paires hreflang). */
  group: string
  primaryKeyword: string
  secondaryKeywords: string[]
  /** Slugs, dans la même langue, des pages sœurs liées dans le corps. */
  sisters?: string[]
  /** Guide : slug, dans la même langue, de la page qu'il soutient. */
  supports?: string
  /** Export format recommandé, présélectionné dans l'éditeur. */
  exportSize?: string
  /** Source d'import ouverte à l'arrivée (« url » : capture d'un site). */
  startSource?: "files" | "url"
  /** Dernière modification réelle du contenu (AAAA-MM-JJ), reprise par le sitemap. */
  updatedAt: string
}

export const PAGES: SitePage[] = [
  {
    kind: "landing",
    locale: "en",
    slug: "",
    group: "landing",
    primaryKeyword: "screenshot mockup generator",
    secondaryKeywords: [
      "app screenshot mockup generator",
      "app mockup generator",
      "free mockup generator",
    ],
    updatedAt: "2026-10-14",
  },
  {
    kind: "landing",
    locale: "fr",
    slug: "",
    group: "landing",
    primaryKeyword: "générateur de mockup gratuit",
    secondaryKeywords: [
      "générateur de mockup",
      "mockup en ligne gratuit",
      "mockup application",
    ],
    updatedAt: "2026-10-14",
  },
  {
    kind: "landing",
    locale: "es",
    slug: "",
    group: "landing",
    primaryKeyword: "generador de mockups gratis",
    secondaryKeywords: [
      "generador de mockups",
      "mockup online gratis",
      "mockup de aplicación",
    ],
    updatedAt: "2026-10-14",
  },
  {
    kind: "use-case",
    locale: "en",
    slug: "github-social-preview",
    group: "github-social-preview",
    primaryKeyword: "github social preview image generator",
    secondaryKeywords: [
      "github social preview generator",
      "github social preview template",
      "github repo image generator",
      "github social image generator",
    ],
    sisters: ["readme-banner"],
    exportSize: "github",
    updatedAt: "2026-10-14",
  },
  {
    kind: "use-case",
    locale: "en",
    slug: "readme-banner",
    group: "readme-banner",
    primaryKeyword: "github readme banner generator",
    secondaryKeywords: [
      "readme banner generator",
      "github repo banner generator",
      "github project banner generator",
      "github readme banner maker",
    ],
    sisters: ["github-social-preview"],
    exportSize: "cover",
    updatedAt: "2026-10-14",
  },
  {
    kind: "feature",
    locale: "en",
    slug: "website-mockup-from-url",
    group: "website-mockup-from-url",
    primaryKeyword: "website mockup generator from url",
    secondaryKeywords: [
      "website mockup from url",
      "website screenshot mockup",
      "url to mockup",
    ],
    startSource: "url",
    updatedAt: "2026-10-14",
  },
  {
    kind: "feature",
    locale: "fr",
    slug: "mockup-site-web",
    group: "website-mockup-from-url",
    primaryKeyword: "mockup site web",
    secondaryKeywords: [
      "mockup site web gratuit",
      "mockup site internet",
      "capture d'écran site web",
    ],
    startSource: "url",
    updatedAt: "2026-10-14",
  },
]

/**
 * Types rendus par la route `app/[locale]/[slug]` ; la Landing a la sienne. Une page
 * d'un autre type n'a pas encore de route : le registre la refuse.
 */
export const SLUG_PAGE_KINDS: PageKind[] = ["use-case", "feature", "comparison"]

/** Segments déjà pris par d'autres routes de `app/[locale]`. */
const RESERVED_SLUGS = new Set(["editor", "guides"])

const DATE = /^\d{4}-\d{2}-\d{2}$/

/** `/en`, `/en/readme-banner`. */
export function pagePath(page: Pick<SitePage, "locale" | "slug">) {
  return page.slug ? `/${page.locale}/${page.slug}` : `/${page.locale}`
}

export function findPage(
  locale: string,
  slug: string,
  pages: SitePage[] = PAGES
) {
  if (!hasLocale(locale)) return undefined
  return pages.find((page) => page.locale === locale && page.slug === slug)
}

/** Pages d'une langue, dans l'ordre du registre, éventuellement filtrées par type. */
export function pagesOf(
  locale: Locale,
  kinds?: PageKind[],
  pages: SitePage[] = PAGES
) {
  return pages.filter(
    (page) => page.locale === locale && (!kinds || kinds.includes(page.kind))
  )
}

/** Toutes les traductions d'une page, elle comprise, dans l'ordre des langues. */
export function translationsOf(page: SitePage, pages: SitePage[] = PAGES) {
  return locales.flatMap((locale) =>
    pages.filter(
      (other) => other.group === page.group && other.locale === locale
    )
  )
}

/**
 * Alternates hreflang d'une page : seulement entre traductions réelles, avec un
 * `x-default` vers la version anglaise. Une page sans traduction n'en déclare aucun.
 */
export function alternateLanguages(page: SitePage, pages: SitePage[] = PAGES) {
  const translations = translationsOf(page, pages)
  if (translations.length < 2) return undefined
  const languages: Record<string, string> = Object.fromEntries(
    translations.map((other) => [other.locale, pagePath(other)])
  )
  const fallback = translations.find((other) => other.locale === defaultLocale)
  if (fallback) languages["x-default"] = pagePath(fallback)
  return languages
}

/**
 * Chemin de la page dans chaque langue, pour le sélecteur de langue : sa traduction
 * si elle existe, sinon la Landing de la langue.
 */
export function localePaths(page: SitePage, pages: SitePage[] = PAGES) {
  const translations = translationsOf(page, pages)
  return Object.fromEntries(
    locales.map((locale) => {
      const translation = translations.find((other) => other.locale === locale)
      return [locale, translation?.slug ? `/${translation.slug}` : "/"]
    })
  ) as Record<Locale, string>
}

const normalize = (keyword: string) =>
  keyword.trim().toLowerCase().replace(/\s+/g, " ")

/** Incohérences du registre ; vide quand tout va bien. Lu par le test de contrat. */
export function registryProblems(pages: SitePage[] = PAGES): string[] {
  const problems: string[] = []
  const id = (page: SitePage) => pagePath(page)
  const sizes = new Set(EXPORT_SIZES.map((size) => size.id))

  const paths = new Set<string>()
  for (const page of pages) {
    if (paths.has(id(page)))
      problems.push(`${id(page)} : URL déclarée deux fois`)
    paths.add(id(page))
  }

  for (const locale of locales) {
    const landings = pages.filter(
      (page) => page.locale === locale && page.kind === "landing"
    )
    if (landings.length !== 1 || landings[0].slug !== "") {
      problems.push(`${locale} : il faut exactement une Landing, de slug vide`)
    }
  }

  // Un mot-clé principal n'appartient qu'à une URL, et n'est le secondaire d'aucune autre.
  const owners = new Map<string, string>()
  for (const page of pages) {
    const keyword = normalize(page.primaryKeyword)
    const owner = owners.get(keyword)
    if (owner)
      problems.push(
        `« ${page.primaryKeyword} » : mot-clé principal de ${owner} et ${id(page)}`
      )
    owners.set(keyword, id(page))
  }
  for (const page of pages) {
    for (const secondary of page.secondaryKeywords) {
      const owner = owners.get(normalize(secondary))
      if (owner && owner !== id(page)) {
        problems.push(
          `« ${secondary} » : secondaire de ${id(page)}, principal de ${owner}`
        )
      }
    }
  }

  for (const page of pages) {
    const here = (slug: string) => findPage(page.locale, slug, pages)
    if (
      page.kind !== "landing" &&
      !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(page.slug)
    ) {
      problems.push(`${id(page)} : slug invalide`)
    }
    if (page.kind !== "landing" && !SLUG_PAGE_KINDS.includes(page.kind)) {
      problems.push(
        `${id(page)} : aucune route ne rend les pages « ${page.kind} »`
      )
    }
    if (RESERVED_SLUGS.has(page.slug))
      problems.push(`${id(page)} : slug réservé`)
    if (
      !DATE.test(page.updatedAt) ||
      Number.isNaN(Date.parse(page.updatedAt))
    ) {
      problems.push(`${id(page)} : updatedAt invalide`)
    }
    if (page.exportSize && !sizes.has(page.exportSize)) {
      problems.push(
        `${id(page)} : export format inconnu « ${page.exportSize} »`
      )
    }
    if (
      pages.filter((o) => o.group === page.group && o.locale === page.locale)
        .length > 1
    ) {
      problems.push(
        `${id(page)} : deux pages du groupe « ${page.group} » dans la même langue`
      )
    }
    for (const sister of page.sisters ?? []) {
      if (sister === page.slug || !here(sister)) {
        problems.push(
          `${id(page)} : page sœur « ${sister} » absente de ${page.locale}`
        )
      }
    }
    if (page.kind === "guide") {
      if (!page.supports || !here(page.supports)) {
        problems.push(
          `${id(page)} : un Guide soutient une page existante de sa langue`
        )
      }
    } else if (page.supports) {
      problems.push(`${id(page)} : seul un Guide soutient une page`)
    }
  }

  return problems
}
