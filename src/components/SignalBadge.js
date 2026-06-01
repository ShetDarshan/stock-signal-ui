import React from 'react';

const colors = {
  BUY: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  STRONG_BUY: { color: '#16a34a', bg: 'rgba(22,163,74,0.15)' },
  SELL: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  STRONG_SELL: { color: '#dc2626', bg: 'rgba(220,38,38,0.15)' },
  HOLD: { color: '#888', bg: 'rgba(255,255,255,0.07)' },
};

export default function SignalBadge({ signal, size = 'md' }) {
  const s = signal || 'HOLD';
  const { color, bg } = colors[s] || colors.HOLD;
  return (
    <span style={{
      color, background: bg,
      fontSize: size === 'sm' ? 11 : 12,
      fontWeight: 600,
      padding: size === 'sm' ? '2px 8px' : '3px 10px',
      borderRadius: 6,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      {s.replace('_', ' ')}
    </span>
  );
}
