import React, { useState, useEffect } from 'react';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const card = {
  background: '#111',
  border: '0.5px solid rgba(255,255,255,0.07)',
  borderRadius: 12,
  padding: '1rem 1.25rem',
  marginBottom: '0.75rem',
};

const fmt    = (n) => n == null ? '—' : Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const pct    = (n) => n == null ? '—' : `${Number(n).toFixed(2)}%`;
const crore  = (n) => n == null ? '—' : `₹${fmt(n)} Cr`;

const CapBadge = ({ cap }) => {
  const map = {
    LARGECAP:  { bg: 'rgba(34,197,94,0.12)',   color: '#22c55e' },
    MIDCAP:    { bg: 'rgba(234,179,8,0.12)',   color: '#eab308' },
    SMALLCAP:  { bg: 'rgba(239,68,68,0.12)',   color: '#ef4444' },
  };
  const s = map[cap] || { bg: 'rgba(255,255,255,0.05)', color: '#555' };
  return cap ? (
    <span style={{ background: s.bg, color: s.color, padding: '2px 7px',
      borderRadius: 5, fontSize: 10, fontWeight: 600, letterSpacing: '0.04em' }}>{cap}</span>
  ) : null;
};

const DeliveryBar = ({ pct }) => {
  const val = Number(pct) || 0;
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

const StockCard = ({ s }) => {
  const changePct  = Number(s.change_pct)  || 0;
  const isUp       = changePct >= 0;
  const hasDeal    = s.has_deal === true || s.has_deal === 't';

  return (
    <div style={{ ...card, border: hasDeal
      ? '0.5px solid rgba(34,197,94,0.25)'
      : '0.5px solid rgba(255,255,255,0.07)' }}>

      {/* Row 1 — symbol + price + change */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#f0f0f0', minWidth: 110 }}>{s.symbol}</span>
        <CapBadge cap={s.market_cap_category} />
        {hasDeal && (
          <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 5, fontWeight: 600,
            background: 'rgba(34,197,94,0.15)', color: '#22c55e', letterSpacing: '0.04em' }}>
            BULK/BLOCK DEAL
          </span>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 15, fontWeight: 700, color: '#f0f0f0' }}>
          ₹{fmt(s.close)}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: isUp ? '#22c55e' : '#ef4444' }}>
          {isUp ? '+' : ''}{pct(s.change_pct)}
        </span>
      </div>

      {/* Row 2 — delivery bar */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: '#444', textTransform: 'uppercase',
          letterSpacing: '0.05em', marginBottom: 4 }}>Delivery %</div>
        <DeliveryBar pct={s.delivery_pct} />
      </div>

      {/* Row 3 — stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, marginBottom: 8 }}>
        {[
          ['Volume',       Number(s.total_traded_qty).toLocaleString('en-IN')],
          ['Traded Value', crore(s.traded_value_cr)],
          ['Sector',       s.sector || '—'],
          ['Index',        s.nifty_index || '—'],
        ].map(([l, v]) => (
          <div key={l}>
            <div style={{ fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l}</div>
            <div style={{ fontSize: 12, color: '#ccc', fontWeight: 500, marginTop: 2 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Row 4 — deal details */}
      {hasDeal && s.deal_info && (
        <div style={{ marginTop: 8, padding: '8px 10px', borderRadius: 8,
          background: 'rgba(34,197,94,0.05)', border: '0.5px solid rgba(34,197,94,0.15)' }}>
          <div style={{ fontSize: 10, color: '#444', textTransform: 'uppercase',
            letterSpacing: '0.05em', marginBottom: 4 }}>Deal Activity</div>
          <div style={{ fontSize: 11, color: '#86efac', lineHeight: 1.6 }}>
            {s.deal_info}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
            {Number(s.inst_buy_cr) > 0 && (
              <span style={{ fontSize: 11, color: '#22c55e' }}>
                Buy: {crore(s.inst_buy_cr)}
              </span>
            )}
            {Number(s.inst_sell_cr) > 0 && (
              <span style={{ fontSize: 11, color: '#ef4444' }}>
                Sell: {crore(s.inst_sell_cr)}
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
  const [filter, setFilter]   = useState('ALL'); // ALL / DEAL / NODEAL

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`${BASE_URL}/screener/daily?date=${date}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load screener');
      setStocks(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);  // load on mount

  const filtered = stocks.filter(s => {
    if (filter === 'DEAL')   return s.has_deal === true || s.has_deal === 't';
    if (filter === 'NODEAL') return s.has_deal !== true && s.has_deal !== 't';
    return true;
  });

  const dealCount   = stocks.filter(s => s.has_deal === true || s.has_deal === 't').length;
  const noDealCount = stocks.length - dealCount;

  const inputStyle = {
    padding: '9px 14px', background: 'rgba(255,255,255,0.04)',
    border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8,
    color: '#f0f0f0', fontSize: 14, outline: 'none',
  };

  const btnStyle = (active) => ({
    padding: '9px 20px', background: active ? '#f0f0f0' : 'rgba(255,255,255,0.06)',
    color: active ? '#0a0a0a' : '#888', border: 'none', borderRadius: 8,
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
  });

  const filterBtn = (val, label) => ({
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
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
        <button onClick={load} disabled={loading} style={btnStyle(!loading)}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
        {stocks.length > 0 && (
          <span style={{ fontSize: 12, color: '#444', marginLeft: 4 }}>
            {stocks.length} stocks · {dealCount} with deals
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
          <button style={filterBtn('ALL',    'All')}    onClick={() => setFilter('ALL')}>
            All ({stocks.length})
          </button>
          <button style={filterBtn('DEAL',   'Deals')}  onClick={() => setFilter('DEAL')}>
            With Deals ({dealCount})
          </button>
          <button style={filterBtn('NODEAL', 'No Deal')} onClick={() => setFilter('NODEAL')}>
            No Deal ({noDealCount})
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#444', fontSize: 13 }}>
          Loading top stocks…
        </div>
      )}

      {/* Cards */}
      {!loading && filtered.map((s, i) => <StockCard key={i} s={s} />)}

      {!loading && filtered.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#444', fontSize: 13 }}>
          No stocks found for this date. Run the pipeline first.
        </div>
      )}
    </div>
  );
}