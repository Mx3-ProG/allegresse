import { books, type Verse } from '../bible/data';

export type SearchResult = { book: string; name: string; chapter: number; verse: Verse; score: number };
export function normalize(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’']/g, ' ').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim(); }
export function parseReference(query: string) {
  const match = normalize(query).match(/^(matthieu|matt?|marc|luc|jean|jn)\s+(\d{1,2})(?:\s+(\d{1,2}))?$/);
  if (!match) return null;
  const aliases: Record<string, string> = { matt: 'matthieu', mat: 'matthieu', jn: 'jean' };
  return { book: aliases[match[1]] ?? match[1], chapter: Number(match[2]), verse: match[3] ? Number(match[3]) : null };
}
export function search(query: string, limit = 30): SearchResult[] {
  const ref = parseReference(query);
  if (ref) {
    const book = books.find(b => b.slug === ref.book);
    const chapter = book?.chapters.find(c => c.number === ref.chapter);
    return chapter?.verses.filter(v => ref.verse === null || v.number === ref.verse).map(verse => ({ book: book!.slug, name: book!.name, chapter: chapter.number, verse, score: 100 })) ?? [];
  }
  const normalized = normalize(query);
  const terms = normalized.split(' ').filter(term => term.length > 2);
  if (!terms.length) return [];
  const results: SearchResult[] = [];
  for (const book of books) for (const chapter of book.chapters) for (const verse of chapter.verses) {
    const text = normalize(verse.text);
    const matches = terms.filter(term => text.includes(term)).length;
    if (matches) results.push({ book: book.slug, name: book.name, chapter: chapter.number, verse, score: matches * 10 + (text.includes(normalized) ? 20 : 0) - text.length / 1000 });
  }
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}
