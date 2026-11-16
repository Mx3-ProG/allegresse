import Link from 'next/link';
export default function NotFound(){return <main className="container" style={{paddingTop:80}}><h1 className="page-title">Cette page n’existe pas</h1><p className="muted">Reprenez votre exploration depuis la bibliothèque.</p><Link className="primary" href="/bible">Voir les Évangiles</Link></main>}
