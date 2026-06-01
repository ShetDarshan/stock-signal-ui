import React, { useState } from 'react';
import SignalBadge from './SignalBadge';

const fmt = (n, dec = 2) => n != null ? Number(n).toFixed(dec) : '—';
const fmtPrice = (n) => n != null
  ? `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  : '—';

function Metric({ label, value, sub }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 500 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function IndSignal({ label, signal }) {
  const colors = { BUY: '#22c55e', SELL: '#ef4444', HOLD: '#666', STRONG_BUY: '#16a34a', STRONG_SELL: '#dc2626' };
  const color = colors[signal] || '#666';
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>
      <span style={{ fontSize: 13, color: '#888' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color, background: `${color}18`, padding: '2px 8px', borderRadius: 5 }}>
        {(signal || 'HOLD').replace('_', ' ')}
      </span>
    </div>
  );
}

export default function SignalCard({ data }) {
  const [showAll, setShowAll] = useState(false);
  const hasTradeplan = data.tradePlan || (data.target1 && data.target1 > 0);
  const scorePct = Math.max(0, Math.min(100, (data.score / data.maxScore) * 100));
  const tp = data.tradePlan || data;

  return (
    <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 2 }}>{data.symbol}</div>
          <div style={{ fontSize: 11, color: '#555', marginBottom: 6 }}>via {data.dataSource || 'Groww'}</div>
          <div style={{ fontSize: 24, fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>{fmtPrice(data.currentPrice)}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <SignalBadge signal={data.overallSignal || data.signal} />
          <div style={{ fontSize: 12, color: '#555' }}>Score {data.score}/{data.maxScore}</div>
          <div style={{ width: 80, height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${scorePct}%`, height: '100%', background: '#22c55e', borderRadius: 2 }} />
          </div>
          {data.marketTrend && (
            <span style={{ fontSize: 11, color: data.marketTrend === 'BULLISH' ? '#22c55e' : data.marketTrend === 'BEARISH' ? '#ef4444' : '#888', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 5 }}>
              Market: {data.marketTrend}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8, marginBottom: '1rem' }}>
        <Metric label="RSI" value={fmt(data.rsi)} />
        <Metric label="ADX" value={fmt(data.adx)} sub={data.adxStrength} />
        <Metric label="MACD" value={fmt(data.macd)} sub={`Signal: ${fmt(data.macdSignalLine)}`} />
        <Metric label="Volume ratio" value={`${fmt(data.volumeRatio)}x`} sub={data.volumeClimaxDetected ? '⚡ Climax' : ''} />
        <Metric label="Trend" value={data.trend || '—'} />
        <Metric label="BB Width" value={fmt(data.bbWidth)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: '1rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 14px' }}>
          <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Moving Averages</div>
          {[['SMA 20', data.sma20], ['SMA 50', data.sma50], ['EMA 20', data.ema20], ['EMA 50', data.ema50]].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '3px 0' }}>
              <span style={{ color: '#666' }}>{l}</span>
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12 }}>{fmtPrice(v)}</span>
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 14px' }}>
          <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Bollinger Bands</div>
          {[['Upper', data.bbUpper], ['Middle', data.bbMiddle], ['Lower', data.bbLower]].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '3px 0' }}>
              <span style={{ color: '#666' }}>{l}</span>
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12 }}>{fmtPrice(v)}</span>
            </div>
          ))}
          <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.05)', marginTop: 6, paddingTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: '#666' }}>Support</span>
            <span style={{ color: '#22c55e', fontFamily: 'DM Mono, monospace', fontSize: 12 }}>{fmtPrice(data.supportLevel)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingTop: 4 }}>
            <span style={{ color: '#666' }}>Resistance</span>
            <span style={{ color: '#ef4444', fontFamily: 'DM Mono, monospace', fontSize: 12 }}>{fmtPrice(data.resistanceLevel)}</span>
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 14px', marginBottom: '1rem' }}>
        <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Individual Signals</div>
        {data.maSignal && <IndSignal label="Moving Average" signal={data.maSignal} />}
        {data.rsiSignal && <IndSignal label="RSI" signal={data.rsiSignal} />}
        {data.macdSignal && <IndSignal label="MACD" signal={data.macdSignal} />}
        {data.srSignal && <IndSignal label="Support / Resistance" signal={data.srSignal} />}
        {data.bbSignal && <IndSignal label="Bollinger Bands" signal={data.bbSignal} />}
        {data.volumeSignal && <IndSignal label="Volume" signal={data.volumeSignal} />}
      </div>

      {data.reasons && data.reasons.length > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 8, padding: '10px 14px', marginBottom: '1rem' }}>
          <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Analysis Reasons</div>
          {(showAll ? data.reasons : data.reasons.slice(0, 3)).map((r, i) => (
            <div key={i} style={{ fontSize: 13, color: '#aaa', padding: '4px 0', lineHeight: 1.5, borderBottom: i < data.reasons.length - 1 ? '0.5px solid rgba(255,255,255,0.04)' : 'none' }}>
              {r}
            </div>
          ))}
          {data.reasons.length > 3 && (
            <button onClick={() => setShowAll(!showAll)} style={{ marginTop: 8, fontSize: 12, color: '#555', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              {showAll ? 'Show less ↑' : `Show ${data.reasons.length - 3} more ↓`}
            </button>
          )}
        </div>
      )}

      {hasTradeplan && tp.entryPrice > 0 && (
        <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.07)', paddingTop: '1rem' }}>
          <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Trade Plan</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 10 }}>
            {[['Entry', fmtPrice(tp.entryPrice), '#f0f0f0'], ['Target 1', fmtPrice(tp.target1), '#22c55e'], ['Stop Loss', fmtPrice(tp.stopLoss), '#ef4444']].map(([l, v, c]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#555', marginBottom: 3 }}>{l}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: c, fontFamily: 'DM Mono, monospace' }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            {tp.target2 > 0 && <span style={{ fontSize: 12, color: '#666' }}>T2 <span style={{ color: '#22c55e', fontWeight: 500 }}>{fmtPrice(tp.target2)}</span></span>}
            {tp.rrRatio > 0 && <span style={{ fontSize: 12, color: '#666' }}>R:R <span style={{ color: '#f0f0f0', fontWeight: 500 }}>{fmt(tp.rrRatio)}</span></span>}
            {tp.holdingPeriod && tp.holdingPeriod !== 'N/A' && <span style={{ fontSize: 12, color: '#666' }}>Hold <span style={{ color: '#f0f0f0', fontWeight: 500 }}>{tp.holdingPeriod}</span></span>}
          </div>
          {tp.tradeRationale && tp.tradeRationale !== 'N/A' && (
            <div style={{ marginTop: 10, fontSize: 13, color: '#666', lineHeight: 1.6 }}>{tp.tradeRationale}</div>
          )}
        </div>
      )}
    </div>
  );
}
