import corpus from '../../../content/processed/gospels.json';

export type Verse = { number: number; text: string; hash: string };
export type Chapter = { number: number; verses: Verse[] };
export type Book = { slug: string; name: string; chapters: Chapter[] };
export const books = corpus.books as Book[];
export const translation = 'Louis Segond 1910';
export function getBook(slug: string) { return books.find(book => book.slug === slug); }
export function getChapter(slug: string, chapter: number) { return getBook(slug)?.chapters.find(item => item.number === chapter); }
export function getVerse(slug: string, chapter: number, verse: number) { return getChapter(slug, chapter)?.verses.find(item => item.number === verse); }
export function chapterUrl(slug: string, chapter: number) { return `/bible/ls1910/${slug}/${chapter}`; }
export function verseUrl(slug: string, chapter: number, verse: number) { return `/versets/${slug}-${chapter}-${verse}`; }

export const allVerses = books.flatMap(book => book.chapters.flatMap(chapter => chapter.verses.map(verse => ({ book, chapter: chapter.number, verse: verse.number, text: verse.text }))));

export type GospelSymbol = { name: string; meaning: string; image: string };
export const gospelSymbols: Record<string, GospelSymbol> = {
  matthieu: { name: 'L’homme ailé', meaning: 'L’humanité du Christ', image: '/images/gospels/matthieu.svg' },
  marc: { name: 'Le lion', meaning: 'La royauté du Christ', image: '/images/gospels/marc.svg' },
  luc: { name: 'Le taureau', meaning: 'Le sacrifice du Christ', image: '/images/gospels/luc.svg' },
  jean: { name: 'L’aigle', meaning: 'La divinité du Christ', image: '/images/gospels/jean.svg' },
};

export function featuredVerseSlot(date = new Date()) {
  return Math.floor(date.getTime() / (6 * 60 * 60 * 1000));
}

export function featuredVerse(date = new Date()) {
  if (allVerses.length === 0) return null;
  const index = featuredVerseSlot(date) % allVerses.length;
  return allVerses[index];
}
