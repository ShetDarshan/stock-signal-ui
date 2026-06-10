import React, { useState, useEffect } from 'react';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const card = {
  background: '#111',
  border: '0.5px solid rgba(255,255,255,0.07)',
  borderRadius: 12,
  padding: '1rem 1.25rem',
  marginBottom: '0.75rem',
};

const fmt   = (n) => n == null ? '—' : Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const crore = (n) => n == null ? '—' : `₹${fmt(n)} Cr`;

const actionStyle = (hint) => {
  if (!hint) return { bg: 'rgba(255,255,255,0.04)', color: '#444' };
  if (hint.startsWith('WATCH')) return { bg: 'rgba(234,179,8,0.12)', color: '#eab308' };
  return { bg: 'rgba(255,255,255,0.04)', color: '#444' };
};

const DeliveryBar = ({ pct }) => {
  const val   = Number(pct) || 0;
  const color = val >= 80 ? '#22c55e' : val >= 65 ? '#eab308' : '#888';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
        <div style={{ width: `${Math.min(val, 100)}%`, height: '100%',
          background: color, borderRadius: 2, transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color, minWidth: 42, textAlign: 'right' }}>
        {val.toFixed(1)}%
      </span>
    </div>
  );
};

const TrendDots = ({ upDays, total }) => {
  const n = Number(total) || 0;
  const u = Number(upDays) || 0;
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: '50%',
          background: i < u ? '#22c55e' : '#ef4444',
        }} />
      ))}
      <span style={{ fontSize: 11, color: '#555', marginLeft: 4 }}>
        {u}/{n} days up
      </span>
    </div>
  );
};

const StockCard = ({ s }) => {
  const changePct = Number(s.change_pct) || 0;
  const isUp      = changePct >= 0;
  const hasDeal   = s.has_deal === true || s.has_deal === 't';
  const volRatio  = Number(s.vol_ratio) || 0;
  const pctAbove  = Number(s.pct_above_5d_low);
  const action    = s.action_hint || 'MONITOR';
  const aStyle    = actionStyle(action);

  return (
    <div style={{ ...card,
      border: hasDeal
        ? '0.5px solid rgba(234,179,8,0.3)'
        : '0.5px solid rgba(255,255,255,0.07)',
    }}>

      {/* Row 1 — symbol + price + change + action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#f0f0f0', minWidth: 110 }}>{s.symbol}</span>

        {hasDeal && (
          <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 5, fontWeight: 600,
            background: 'rgba(99,102,241,0.15)', color: '#818cf8', letterSpacing: '0.04em' }}>
            BULK/BLOCK
          </span>
        )}

        <span style={{ fontSize: 10, padding: '2px 10px', borderRadius: 5, fontWeight: 600,
          background: aStyle.bg, color: aStyle.color, letterSpacing: '0.03em', marginLeft: 'auto' }}>
          {action}
        </span>

        <span style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f0' }}>₹{fmt(s.close)}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: isUp ? '#22c55e' : '#ef4444' }}>
          {isUp ? '+' : ''}{Number(s.change_pct).toFixed(2)}%
        </span>
      </div>

      {/* Row 2 — delivery bar */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: '#444', textTransform: 'uppercase',
          letterSpacing: '0.05em', marginBottom: 4 }}>Delivery %</div>
        <DeliveryBar pct={s.delivery_pct} />
      </div>

      {/* Row 3 — stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8, marginBottom: 10 }}>
        {[
          ['Volume',        Number(s.total_traded_qty).toLocaleString('en-IN')],
          ['Traded Value',  crore(s.traded_value_cr)],
          ['Vol Ratio',     volRatio > 0 ? `${volRatio.toFixed(2)}x avg` : '—'],
          ['5d Avg Price',  s.avg_close_5d ? `₹${fmt(s.avg_close_5d)}` : '—'],
          ['5d Low',        s.low_5d ? `₹${fmt(s.low_5d)}` : '—'],
          ['Above Support', !isNaN(pctAbove) ? `+${pctAbove.toFixed(1)}%` : '—'],
        ].map(([l, v]) => (
          <div key={l}>
            <div style={{ fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l}</div>
            <div style={{ fontSize: 12, color: '#ccc', fontWeight: 500, marginTop: 2 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Row 4 — trend dots */}
      {s.days_available > 0 && (
        <div style={{ marginBottom: hasDeal && s.deal_info ? 10 : 0 }}>
          <div style={{ fontSize: 10, color: '#444', textTransform: 'uppercase',
            letterSpacing: '0.05em', marginBottom: 6 }}>5-day trend</div>
          <TrendDots upDays={s.up_days} total={s.days_available} />
        </div>
      )}

      {/* Row 5 — deal details */}
      {hasDeal && s.deal_info && (
        <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 8,
          background: 'rgba(99,102,241,0.06)', border: '0.5px solid rgba(99,102,241,0.2)' }}>
          <div style={{ fontSize: 10, color: '#444', textTransform: 'uppercase',
            letterSpacing: '0.05em', marginBottom: 4 }}>Institutional Activity</div>
          <div style={{ fontSize: 11, color: '#c7d2fe', lineHeight: 1.7 }}>
            {s.deal_info}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
            {Number(s.inst_buy_cr) > 0 && (
              <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>
                ↑ Buy: {crore(s.inst_buy_cr)}
              </span>
            )}
            {Number(s.inst_sell_cr) > 0 && (
              <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>
                ↓ Sell: {crore(s.inst_sell_cr)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function ScreenerTab() {
  const [date, setDate]       = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [stocks, setStocks]   = useState([]);
  const [filter, setFilter]   = useState('ALL');

  const load = async (d) => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`${BASE_URL}/screener/daily?date=${d}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load screener');
      setStocks(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(date); }, []);

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const filtered = stocks.filter(s => {
    const hasDeal = s.has_deal === true || s.has_deal === 't';
    if (filter === 'WATCH')  return s.action_hint?.startsWith('WATCH');
    if (filter === 'DEAL')   return hasDeal;
    return true;
  });

  const watchCount = stocks.filter(s => s.action_hint?.startsWith('WATCH')).length;
  const dealCount  = stocks.filter(s => s.has_deal === true || s.has_deal === 't').length;

  const inputStyle = {
    padding: '9px 14px', background: 'rgba(255,255,255,0.04)',
    border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8,
    color: '#f0f0f0', fontSize: 14, outline: 'none',
  };

  const btnStyle = (active) => ({
    padding: '9px 20px',
    background: active ? '#f0f0f0' : 'rgba(255,255,255,0.06)',
    color: active ? '#0a0a0a' : '#888',
    border: 'none', borderRadius: 8,
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
  });

  const filterBtn = (val) => ({
    padding: '5px 14px', fontSize: 12, borderRadius: 6, cursor: 'pointer',
    border: '0.5px solid rgba(255,255,255,0.1)',
    background: filter === val ? 'rgba(255,255,255,0.1)' : 'transparent',
    color: filter === val ? '#f0f0f0' : '#555',
    fontWeight: filter === val ? 600 : 400,
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input type="date" value={date} onChange={handleDateChange} style={inputStyle} />
        <button onClick={() => load(date)} disabled={loading} style={btnStyle(!loading)}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
        {stocks.length > 0 && (
          <span style={{ fontSize: 12, color: '#444', marginLeft: 4 }}>
            {stocks.length} stocks · {watchCount} to watch · {dealCount} with deals
          </span>
        )}
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444',
          padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* Filter tabs */}
      {stocks.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: '1rem' }}>
          <button style={filterBtn('ALL')}   onClick={() => setFilter('ALL')}>All ({stocks.length})</button>
          <button style={filterBtn('WATCH')} onClick={() => setFilter('WATCH')}>Watch ({watchCount})</button>
          <button style={filterBtn('DEAL')}  onClick={() => setFilter('DEAL')}>With Deals ({dealCount})</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#444', fontSize: 13 }}>
          Loading daily picks…
        </div>
      )}

      {/* Cards */}
      {!loading && filtered.map((s, i) => <StockCard key={i} s={s} />)}

      {!loading && filtered.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#444', fontSize: 13 }}>
          No stocks found. Run the NSE pipeline first for this date.
        </div>
      )}
    </div>
  );
}