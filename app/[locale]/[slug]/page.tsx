import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ContentPage } from "@/components/content/content-page"
import { contentFor } from "@/content/pages"
import { pageMetadata } from "@/lib/page-metadata"
import { PAGES, SLUG_PAGE_KINDS, findPage } from "@/lib/pages"
import {
  contentPageStructuredData,
  serializeJsonLd,
} from "@/lib/structured-data"

type Props = { params: Promise<{ locale: string; slug: string }> }

// Export statique : une page par entrée du registre dans cette langue, 404 sinon.
export const dynamicParams = false

// Toutes les langues d'un coup : une langue sans page de ce type (l'espagnol n'a que
// la Landing) ferait échouer l'export, qui exige au moins une route par appel.
export function generateStaticParams() {
  return PAGES.filter((page) => SLUG_PAGE_KINDS.includes(page.kind)).map(
    ({ locale, slug }) => ({ locale, slug })
  )
}

function resolve(locale: string, slug: string) {
  const page = findPage(locale, slug)
  const content = page && contentFor(page)
  return page && content ? { page, content } : undefined
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const found = resolve(locale, slug)
  if (!found) return {}
  const { page, content } = found

  return pageMetadata(page, {
    title: content.title,
    description: content.description,
    ogImage: {
      url: content.ogImage.src,
      width: 1200,
      height: 630,
      alt: content.ogImage.alt,
    },
  })
}

export default async function Page({ params }: Props) {
  const { locale, slug } = await params
  const found = resolve(locale, slug)
  if (!found) notFound()
  const { page, content } = found

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(contentPageStructuredData(page, content)),
        }}
      />
      <ContentPage page={page} content={content} />
    </>
  )
}
