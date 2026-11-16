import type { MetadataRoute } from 'next';
import { books, chapterUrl } from '@/modules/bible/data';
export default function sitemap():MetadataRoute.Sitemap{const base=process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000';return ['/', '/bible', '/tarifs', ...books.map(b=>`/bible/${b.slug}`),...books.flatMap(b=>b.chapters.map(c=>chapterUrl(b.slug,c.number))),...['pardon','foi','amour'].map(t=>`/themes/${t}`)].map(path=>({url:base+path,changeFrequency:'monthly',priority:path==='/'?1:.7}));}
