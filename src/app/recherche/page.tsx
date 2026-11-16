import type { Metadata } from 'next';
import Link from 'next/link';
import { SearchForm } from '@/components/SearchForm';
import { chapterUrl, verseUrl } from '@/modules/bible/data';
import { search } from '@/modules/search/search';
export const metadata:Metadata={title:'Rechercher dans les Évangiles',robots:{index:false,follow:true}};
export default async function SearchPage({searchParams}:{searchParams:Promise<{q?:string}>}){const {q=''}=await searchParams;const query=q.slice(0,160);const results=query?search(query):[];return <main className="container" style={{maxWidth:880}}><div className="breadcrumb"><Link href="/">Accueil</Link> / Recherche</div><h1 className="page-title">Explorer les Évangiles</h1><SearchForm defaultValue={query}/>{query&&<><p className="muted">{results.length?`${results.length} premiers résultats pour « ${query} »`:`Aucun résultat pour « ${query} »`}</p>{results.map(({book,name,chapter,verse})=><article className="result" key={`${book}-${chapter}-${verse.number}`}><Link href={verseUrl(book,chapter,verse.number)}><h2>{name} {chapter}:{verse.number} →</h2></Link><p>{verse.text}</p><Link className="muted" href={chapterUrl(book,chapter)+`#v${verse.number}`}>Lire dans son chapitre</Link></article>)}</>}</main>}
