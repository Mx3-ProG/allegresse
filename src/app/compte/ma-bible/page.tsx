import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/core/db/server';
import { getBook, getVerse } from '@/modules/bible/data';
import { chapterUrl } from '@/modules/bible/data';

export const metadata: Metadata = { title: 'Ma Bible', robots: { index: false } };

export default async function MyBiblePage() {
  const client = await createClient();
  if (!client) return <main className="container auth-page"><h1>Ma Bible</h1><p>Le service de comptes est en cours de configuration.</p></main>;
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect('/connexion');
  const { data: entries, error } = await client.from('personal_verses')
    .select('reference,favorite,highlight,note,updated_at')
    .eq('user_id', user.id).order('updated_at', { ascending: false });
  const { data: chapters } = await client.from('user_chapter_progress')
    .select('book,chapter,completed_at').eq('user_id', user.id).order('completed_at', { ascending: false });
  return <main className="container pricing-page">
    <div className="breadcrumb"><Link href="/compte">Mon espace</Link> / Ma Bible</div>
    <div className="eyebrow">Mon espace gratuit</div><h1>Ma Bible</h1>
    <p className="pricing-intro">Retrouvez vos favoris, surlignages et notes privées.</p>
    <section className="pricing-card" style={{ marginBottom: 32 }}><h2>Ma progression de lecture</h2><p>{chapters?.length ?? 0} chapitre{chapters?.length === 1 ? '' : 's'} terminé{chapters?.length === 1 ? '' : 's'} sur 89.</p>{chapters?.slice(0, 8).map(item => <p key={`${item.book}-${item.chapter}`}><Link href={chapterUrl(item.book, item.chapter)}>{getBook(item.book)?.name} {item.chapter}</Link></p>)}</section>
    {error && <p>Vos passages sont temporairement indisponibles.</p>}
    {!error && entries?.length === 0 && <p>Aucun passage enregistré. <Link href="/bible">Découvrir les Évangiles</Link></p>}
    <div className="dashboard-grid">{entries?.map(entry => {
      const [slug, chapter, verse] = entry.reference.split('-');
      const book = getBook(slug);
      const text = getVerse(slug, Number(chapter), Number(verse))?.text;
      if (!book || !text) return null;
      return <section className="dashboard-card" key={entry.reference}>
        <h2><Link href={`/versets/${entry.reference}`}>{book.name} {chapter}:{verse}</Link></h2>
        <p>{text}</p>
        <p>{entry.favorite ? '★ Favori' : ''}{entry.highlight ? ` · Surligné en ${entry.highlight}` : ''}</p>
        {entry.note && <p className="personal-note">{entry.note}</p>}
      </section>;
    })}</div>
  </main>;
}
