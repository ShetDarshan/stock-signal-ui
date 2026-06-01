import React from 'react';
import SignalBadge from './SignalBadge';

const fmt = (n) => n != null ? Number(n).toFixed(2) : '—';
const fmtPrice = (n) => n != null
  ? `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  : '—';

function MiniCard({ data }) {
  const scorePct = Math.max(0, Math.min(100, (data.score / data.maxScore) * 100));
  const shortSymbol = data.symbol.replace('NSE-', '').replace('BSE-', '');
  const isCandidate = data.signal === 'BUY' || data.signal === 'STRONG_BUY';

  return (
    <div style={{
      background: '#111',
      border: `0.5px solid ${isCandidate ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.07)'}`,
      borderRadius: 12,
      padding: '1rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{shortSymbol}</div>
        <SignalBadge signal={data.signal} size="sm" />
      </div>
      <div style={{ fontSize: 17, fontWeight: 600, fontFamily: 'DM Mono, monospace', marginBottom: 10 }}>
        {fmtPrice(data.currentPrice)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 10 }}>
        {[['RSI', fmt(data.rsi)], ['ADX', fmt(data.adx)], ['Vol', `${fmt(data.volumeRatio)}x`], ['Trend', data.trend || '—']].map(([l, v]) => (
          <div key={l} style={{ fontSize: 12 }}>
            <span style={{ color: '#555' }}>{l} </span>
            <span style={{ color: '#ccc', fontWeight: 500 }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${scorePct}%`, height: '100%', background: isCandidate ? '#22c55e' : '#333', borderRadius: 2 }} />
      </div>
      <div style={{ fontSize: 11, color: '#444', marginTop: 4 }}>Score {data.score}/{data.maxScore}</div>
    </div>
  );
}

export default function ScreenerGrid({ data }) {
  const candidates = data.candidates || [];
  const all = data.allResults || [];

  return (
    <div>
      <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
        <p style={{ fontSize: 13, color: '#777', marginBottom: 12 }}>{data.summary}</p>
        <div style={{ display: 'flex', gap: 24 }}>
          {[['Scanned', data.totalScanned || 0], ['Candidates', data.candidatesFound || 0], ['Errors', data.errors?.length || 0]].map(([l, v]) => (
            <div key={l}>
              <div style={{ fontSize: 22, fontWeight: 600 }}>{v}</div>
              <div style={{ fontSize: 12, color: '#555' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {candidates.length > 0 && (
        <>
          <div style={{ fontSize: 11, color: '#22c55e', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>✦ Candidates</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 10, marginBottom: '1.5rem' }}>
            {candidates.map(s => <MiniCard key={s.symbol} data={s} />)}
          </div>
        </>
      )}

      {all.length > 0 && (
        <>
          <div style={{ fontSize: 11, color: '#444', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>All results</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 10 }}>
            {all.map(s => <MiniCard key={s.symbol} data={s} />)}
          </div>
        </>
      )}

      {data.errors?.length > 0 && (
        <div style={{ marginTop: '1rem', fontSize: 12, color: '#555' }}>Errors: {data.errors.join(', ')}</div>
      )}
    </div>
  );
}
