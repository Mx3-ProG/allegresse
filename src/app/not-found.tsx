import Link from 'next/link';
import { chapterUrl, getVerse } from '@/modules/bible/data';

export default function NotFound() {
  const verse = getVerse('jean', 14, 6)!;
  return <main className="not-found-page">
    <div className="not-found-scene" aria-hidden="true">
      <div className="not-found-rays" />
      <div className="cross cross-still"><span className="cross-vertical" /><span className="cross-horizontal" /></div>
      <div className="not-found-number">404</div>
    </div>
    <div className="not-found-content container">
      <div className="eyebrow">Une autre route vous attend</div>
      <h1>Cette page s’est égarée.</h1>
      <p>Le chemin continue dans les Évangiles.</p>
      <blockquote>« {verse.text} »<cite><Link href={`${chapterUrl('jean', 14)}#v6`}>Jean 14:6 · Louis Segond 1910</Link></cite></blockquote>
      <Link className="primary" href="/bible">Découvrir les Évangiles →</Link>
    </div>
  </main>;
}
