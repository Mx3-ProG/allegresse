import { ImageResponse } from 'next/og';

export const alt = 'Bibléva — Lire, comprendre, grandir';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: '#faf8f3', color: '#17283d', padding: '76px 90px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ position: 'absolute', right: -90, top: -165, width: 620, height: 620, borderRadius: '50%', border: '2px solid #e6e0d5' }} />
      <div style={{ position: 'absolute', right: 20, top: -55, width: 400, height: 400, borderRadius: '50%', border: '2px solid #e6e0d5' }} />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 54, fontWeight: 700 }}><span style={{ color: '#b68f51' }}>●</span>Bibléva<span style={{ color: '#b68f51' }}>.</span></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ color: '#9a7338', fontFamily: 'Arial, sans-serif', fontSize: 22, letterSpacing: 5, textTransform: 'uppercase' }}>Explorer la Parole</div>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 76, lineHeight: 1.1, letterSpacing: -3 }}><span>Lire, comprendre,</span><span>grandir.</span></div>
          <div style={{ color: '#58616b', fontFamily: 'Arial, sans-serif', fontSize: 27 }}>Les quatre Évangiles, à découvrir librement.</div>
        </div>
      </div>
      <div style={{ position: 'absolute', right: 112, bottom: 77, color: '#b68f51', fontSize: 100 }}>●</div>
    </div>, size
  );
}
