export default function Loading() {
  return <main className="loading-page" role="status" aria-live="polite">
    <div className="loading-halo" aria-hidden="true">
      <div className="cross cross-spinning"><span className="cross-vertical" /><span className="cross-horizontal" /></div>
    </div>
    <p>Chargement des Évangiles…</p>
  </main>;
}
