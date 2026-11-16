import { describe, expect, it } from 'vitest';
import { books, getChapter, getVerse } from '../src/modules/bible/data';
import { parseReference, search } from '../src/modules/search/search';

describe('corpus des Évangiles', () => {
  it('contient les quatre livres et 89 chapitres sans lacune', () => {
    expect(books.map(b => b.slug)).toEqual(['matthieu','marc','luc','jean']);
    expect(books.reduce((n,b) => n+b.chapters.length,0)).toBe(89);
    expect(books.reduce((n,b) => n+b.chapters.reduce((m,c) => m+c.verses.length,0),0)).toBe(3781);
    for (const book of books) for (const chapter of book.chapters) expect(chapter.verses.map(v=>v.number)).toEqual(Array.from({length:chapter.verses.length},(_,i)=>i+1));
  });
  it('retrouve exactement Jean 3:16', () => {
    expect(getVerse('jean',3,16)?.text).toBe('Car Dieu a tant aimé le monde qu’il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu’il ait la vie éternelle.');
    expect(getChapter('jean',22)).toBeUndefined();
  });
});
describe('recherche', () => {
  it('donne la priorité à une référence exacte', () => {
    expect(parseReference('Jean 3:16')).toEqual({book:'jean',chapter:3,verse:16});
    const results=search('Jean 3:16');
    expect(results).toHaveLength(1);
    expect(results[0].verse.number).toBe(16);
  });
  it('retrouve une expression et tolère les accents', () => {
    expect(search('aime le monde').some(r=>r.book==='jean'&&r.chapter===3&&r.verse.number===16)).toBe(true);
    expect(search('pardon').length).toBeGreaterThan(0);
  });
  it('ne fabrique pas de référence inconnue', () => expect(search('Jean 99:99')).toEqual([]));
});
