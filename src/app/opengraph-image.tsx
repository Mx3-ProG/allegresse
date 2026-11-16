import { ImageResponse } from 'next/og';

export const alt = 'Allégresse — Lire, comprendre, grandir';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', overflow: 'hidden', background: '#faf8f3', color: '#17283d', padding: '74px 88px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ position: 'absolute', right: -110, top: -150, width: 630, height: 630, borderRadius: '50%', border: '2px solid #e6e0d5' }} />
      <div style={{ position: 'absolute', right: 28, top: -40, width: 380, height: 380, borderRadius: '50%', border: '2px solid #e6e0d5' }} />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 53, fontWeight: 700, letterSpacing: -2 }}><span style={{ color: '#b68f51' }}>●</span>Allégresse<span style={{ color: '#b68f51' }}>.</span></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 23 }}>
          <div style={{ color: '#9a7338', fontSize: 20, letterSpacing: 5, textTransform: 'uppercase' }}>Explorer la Parole</div>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 74, lineHeight: 1.1, letterSpacing: -3 }}><span>Lire, comprendre,</span><span>grandir.</span></div>
          <div style={{ color: '#58616b', fontSize: 26 }}>Les quatre Évangiles, à découvrir librement.</div>
        </div>
      </div>
      <div style={{ position: 'absolute', right: 112, bottom: 65, color: '#b68f51', fontSize: 100 }}>●</div>
    </div>, size
  );
}
