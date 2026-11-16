import type { Metadata } from 'next';
import Link from 'next/link';
import { books, chapterUrl } from '@/features/bible/data';
export const metadata: Metadata = { title: 'Les quatre Évangiles' };
export default function BiblePage(){ return <main className="container"><div className="breadcrumb"><Link href="/">Accueil</Link> / Bible</div><h1 className="page-title">Les quatre Évangiles</h1><p className="section-sub">Lisez librement les 89 chapitres des Évangiles, sans compte ni abonnement.</p><div className="grid-4 section">{books.map((book,i)=><Link className="card" href={chapterUrl(book.slug,1)} key={book.slug}><span className="num">0{i+1}</span><h3>{book.name}</h3><p>{book.chapters.length} chapitres · Louis Segond 1910</p><span className="arrow">Commencer →</span></Link>)}</div></main> }
