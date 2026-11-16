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
