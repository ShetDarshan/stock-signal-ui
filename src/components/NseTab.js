import React, { useState, useEffect } from 'react';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const card = {
  background: '#111',
  border: '0.5px solid rgba(255,255,255,0.07)',
  borderRadius: 12,
  padding: '1rem 1.25rem',
  marginBottom: '1rem',
};

const badge = (type) => {
  const map = {
    BUY:     { bg: 'rgba(34,197,94,0.12)',  color: '#22c55e' },
    WATCH:   { bg: 'rgba(234,179,8,0.12)',  color: '#eab308' },
    SELL:    { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444' },
    NOISE:   { bg: 'rgba(255,255,255,0.06)', color: '#555' },
    BULK:    { bg: 'rgba(99,102,241,0.12)', color: '#818cf8' },
    BLOCK:   { bg: 'rgba(14,165,233,0.12)', color: '#38bdf8' },
    MUTUAL_FUND: { bg: 'rgba(34,197,94,0.1)', color: '#86efac' },
    FII:         { bg: 'rgba(14,165,233,0.1)', color: '#7dd3fc' },
    INSURANCE:   { bg: 'rgba(168,85,247,0.1)', color: '#d8b4fe' },
    PROMOTER:    { bg: 'rgba(249,115,22,0.1)', color: '#fdba74' },
    PROP_DESK:   { bg: 'rgba(255,255,255,0.05)', color: '#555' },
    HNI:         { bg: 'rgba(255,255,255,0.05)', color: '#666' },
    UNKNOWN:     { bg: 'rgba(255,255,255,0.03)', color: '#444' },
  };
  const s = map[type] || map.UNKNOWN;
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '2px 8px', borderRadius: 6,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.03em',
    }}>{type}</span>
  );
};

const fmt = (n) => n == null ? '—' : Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const crore = (n) => n == null ? '—' : `₹${fmt(n)} Cr`;

// ── Pipeline Loading Screen ───────────────────────────────────────────────────
const PIPELINE_STEPS = [
  { key: 'bulk',  label: 'Downloading Bulk Deals',      sub: 'archives.nseindia.com/content/equities/bulk.csv',      duration: 8000  },
  { key: 'block', label: 'Downloading Block Deals',     sub: 'archives.nseindia.com/content/equities/block.csv',     duration: 6000  },
  { key: 'bhav',  label: 'Downloading Bhavcopy',        sub: 'sec_bhavdata_full — ~2000 equity records',             duration: 10000 },
  { key: 'fii',   label: 'Downloading FII / DII Flow',  sub: 'fii_stats — market-wide institutional flow',           duration: 6000  },
  { key: 'index', label: 'Downloading Index Data',      sub: 'ind_close_all — all NSE sector indices',               duration: 6000  },
  { key: 'parse', label: 'Parsing & Scoring Signals',   sub: 'Classifying clients, computing delivery %, scoring',   duration: 8000  },
  { key: 'save',  label: 'Saving to Database',          sub: 'Persisting ~2500 rows to Neon PostgreSQL',             duration: 40000 },
];

const PipelineLoader = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 400);
    return () => clearInterval(dotsInterval);
  }, []);

  useEffect(() => {
    let elapsed = 0;
    const timers = PIPELINE_STEPS.map((step, i) => {
      const timer = setTimeout(() => {
        setCurrentStep(i);
        if (i > 0) setCompletedSteps(prev => [...prev, i - 1]);
      }, elapsed);
      elapsed += step.duration;
      return timer;
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 1rem', gap: '2rem' }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%',
        border: '2px solid rgba(255,255,255,0.05)', borderTop: '2px solid #f0f0f0',
        animation: 'spin 1s linear infinite' }} />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.8)} }
      `}</style>

      <div style={{ width: '100%', maxWidth: 480 }}>
        {PIPELINE_STEPS.map((step, i) => {
          const isDone    = completedSteps.includes(i);
          const isActive  = currentStep === i;
          const isPending = !isDone && !isActive;
          return (
            <div key={step.key} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0',
              borderBottom: i < PIPELINE_STEPS.length - 1 ? '0.5px solid rgba(255,255,255,0.04)' : 'none',
              opacity: isPending ? 0.25 : 1, transition: 'opacity 0.4s ease',
            }}>
              <div style={{ width: 20, height: 20, flexShrink: 0, marginTop: 2 }}>
                {isDone && (
                  <svg viewBox="0 0 20 20" fill="none" style={{ width: 20, height: 20 }}>
                    <circle cx="10" cy="10" r="9" fill="rgba(34,197,94,0.15)" stroke="#22c55e" strokeWidth="1" />
                    <path d="M6 10l3 3 5-5" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {isActive && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f0f0f0',
                  margin: '6px', boxShadow: '0 0 8px rgba(240,240,240,0.6)', animation: 'pulse 1s ease-in-out infinite' }} />}
                {isPending && <div style={{ width: 8, height: 8, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)', margin: '6px' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: isActive ? 600 : 400,
                  color: isDone ? '#22c55e' : isActive ? '#f0f0f0' : '#555' }}>
                  {step.label}{isActive ? dots : ''}
                </div>
                <div style={{ fontSize: 11, color: '#333', marginTop: 2 }}>{step.sub}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 12, color: '#333', textAlign: 'center' }}>
        First run downloads & saves all data — subsequent runs load instantly from DB
      </div>
    </div>
  );
};

// ── Sub components ────────────────────────────────────────────────────────────

const DownloadStatus = ({ status }) => {
  if (!status) return null;
  return (
  <div style={{ ...card, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
    {Object.entries(status).map(([file, msg]) => {
      const ok = msg.startsWith('OK');
      return (
        <div key={file} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
            background: ok ? '#22c55e' : '#ef4444' }} />
          <div>
            <div style={{ fontSize: 12, color: '#ccc', fontWeight: 500 }}>{file}</div>
            <div style={{ fontSize: 11, color: ok ? '#555' : '#7f1d1d' }}>
              {ok ? msg.replace('OK ', '') : msg.replace('FAILED: ', '')}
            </div>
          </div>
        </div>
      );
    })}
  </div>
  );
};

const StatsRow = ({ data }) => {
  const stats = [
    { label: 'Bulk Deals',       val: data.bulkDealsProcessed },
    { label: 'Block Deals',      val: data.blockDealsProcessed },
    { label: 'Bhavcopy',         val: `${data.bhavRecordsProcessed} stocks` },
    { label: 'Symbols Analysed', val: data.symbolSummariesBuilt },
    { label: 'BUY Signals',      val: data.buySignals?.length,   color: '#22c55e' },
    { label: 'WATCH',            val: data.watchSignals?.length,  color: '#eab308' },
    { label: 'SELL',             val: data.sellSignals?.length,   color: '#ef4444' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, marginBottom: '1rem' }}>
      {stats.map(s => (
        <div key={s.label} style={{ ...card, marginBottom: 0, padding: '0.75rem 1rem' }}>
          <div style={{ fontSize: 11, color: '#555', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: s.color || '#f0f0f0' }}>{s.val ?? '—'}</div>
        </div>
      ))}
    </div>
  );
};

const SignalRow = ({ sig }) => (
  <div style={{ ...card, marginBottom: '0.5rem', padding: '0.875rem 1.25rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <span style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f0', minWidth: 100 }}>{sig.symbol}</span>
      {badge(sig.signalType)}
      <span style={{ fontSize: 18, fontWeight: 700, color:
        sig.signalType === 'BUY' ? '#22c55e' : sig.signalType === 'SELL' ? '#ef4444' :
        sig.signalType === 'WATCH' ? '#eab308' : '#444' }}>{sig.score}/100</span>
    </div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {sig.scoringReasons?.map((r, i) => (
        <span key={i} style={{
          fontSize: 11, padding: '3px 8px', borderRadius: 6,
          background: r.startsWith('+') ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
          color: r.startsWith('+') ? '#86efac' : '#fca5a5',
          border: `0.5px solid ${r.startsWith('+') ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
        }}>{r}</span>
      ))}
    </div>
  </div>
);

const SummaryCard = ({ s }) => (
  <div style={{ ...card, marginBottom: '0.5rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f0' }}>{s.symbol}</span>
      {s.hasBlockDeal && badge('BLOCK')}
      {s.hasBulkDeal && badge('BULK')}
      <span style={{ marginLeft: 'auto', fontSize: 13, color: s.netInstFlowCr > 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
        {s.netInstFlowCr > 0 ? '+' : ''}{crore(s.netInstFlowCr)} net inst.
      </span>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 6, marginBottom: 8 }}>
      {[
        ['Inst. Buy',   crore(s.instBuyCr)],
        ['Inst. Sell',  crore(s.instSellCr)],
        ['Avg Price',   `₹${fmt(s.avgDealPrice)}`],
        ['Close',       s.closePrice ? `₹${fmt(s.closePrice)}` : '—'],
        ['Delivery %',  s.deliveryPct ? `${fmt(s.deliveryPct)}%` : '—'],
        ['Buyers',      s.numInstBuyers],
      ].map(([l, v]) => (
        <div key={l}>
          <div style={{ fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l}</div>
          <div style={{ fontSize: 13, color: '#ccc', fontWeight: 500 }}>{v}</div>
        </div>
      ))}
    </div>
    {s.institutionalBuyers?.length > 0 && (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {s.institutionalBuyers.slice(0, 5).map(b => (
          <span key={b} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4,
            background: 'rgba(34,197,94,0.07)', color: '#86efac', border: '0.5px solid rgba(34,197,94,0.15)' }}>
            {b.length > 30 ? b.slice(0, 30) + '…' : b}
          </span>
        ))}
        {s.institutionalBuyers.length > 5 && (
          <span style={{ fontSize: 10, color: '#444' }}>+{s.institutionalBuyers.length - 5} more</span>
        )}
      </div>
    )}
  </div>
);

const DealsTable = ({ deals }) => {
  const [filter, setFilter] = useState('ALL');
  const cats = ['ALL', 'MUTUAL_FUND', 'FII', 'INSURANCE', 'PROMOTER', 'HNI'];
  const filtered = (filter === 'ALL' ? deals : deals.filter(d => d.clientCategory === filter))
    .sort((a, b) => Number(b.dealValueCr) - Number(a.dealValueCr));

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {cats.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{
            padding: '4px 12px', borderRadius: 6, border: '0.5px solid rgba(255,255,255,0.1)',
            background: filter === c ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: filter === c ? '#f0f0f0' : '#555', fontSize: 12, cursor: 'pointer',
          }}>{c}</button>
        ))}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
              {['Symbol', 'Client', 'Category', 'Side', 'Qty', 'Price', 'Value', 'Type'].map(h => (
                <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: '#444',
                  fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => (
              <tr key={i} style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '7px 10px', fontWeight: 600, color: '#e0e0e0' }}>{d.symbol}</td>
                <td style={{ padding: '7px 10px', color: '#888', maxWidth: 180, overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={d.clientName}>{d.clientName}</td>
                <td style={{ padding: '7px 10px' }}>{badge(d.clientCategory)}</td>
                <td style={{ padding: '7px 10px' }}>
                  <span style={{ color: d.buySell === 'BUY' ? '#22c55e' : '#ef4444', fontWeight: 600 }}>{d.buySell}</span>
                </td>
                <td style={{ padding: '7px 10px', color: '#888', fontFamily: 'monospace' }}>{fmt(d.quantity)}</td>
                <td style={{ padding: '7px 10px', color: '#888', fontFamily: 'monospace' }}>₹{fmt(d.price)}</td>
                <td style={{ padding: '7px 10px', color: '#ccc', fontFamily: 'monospace', fontWeight: 500 }}>{crore(d.dealValueCr)}</td>
                <td style={{ padding: '7px 10px' }}>{badge(d.dealType)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

export default function NseTab() {
  const [date, setDate]       = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [data, setData]       = useState(null);
  const [view, setView]       = useState('signals');

  const run = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = date ? `?date=${date}` : '';

      // Step 1 — start job, returns instantly (202 Accepted)
      const startRes  = await fetch(`${BASE_URL}/nse/signals/run${params}`);
      const startData = await startRes.json();

      if (!startRes.ok) throw new Error(startData.message || 'Failed to start pipeline');

      // Cache hit — backend already completed synchronously
      if (startData.status === 'COMPLETED') {
        setData(startData.result);
        setLoading(false);
        return;
      }

      if (startData.status === 'FAILED') {
        throw new Error(startData.message || 'Pipeline failed');
      }

      // Step 2 — poll every 10s until done
      const jobId = startData.jobId;

      const poll = async () => {
        try {
          const res  = await fetch(`${BASE_URL}/nse/signals/status/${jobId}`);
          const json = await res.json();

          if (json.status === 'COMPLETED') {
            setData(json.result);
            setLoading(false);
          } else if (json.status === 'FAILED') {
            setError(json.message || 'Pipeline failed');
            setLoading(false);
          } else {
            setTimeout(poll, 10000); // still RUNNING
          }
        } catch (e) {
          setError(e.message);
          setLoading(false);
        }
      };

      setTimeout(poll, 10000); // first poll after 10s

    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
    // NOTE: no finally block — setLoading(false) is handled per-path above
  };

  const allSignals = data ? [
    ...(data.buySignals  || []),
    ...(data.watchSignals || []),
    ...(data.sellSignals  || []),
    ...(data.noiseSignals || []),
  ] : [];

  const inputStyle = {
    padding: '9px 14px', background: 'rgba(255,255,255,0.04)',
    border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8,
    color: '#f0f0f0', fontSize: 14, outline: 'none',
  };

  const btnStyle = (disabled) => ({
    padding: '9px 20px', background: disabled ? 'rgba(255,255,255,0.1)' : '#f0f0f0',
    color: disabled ? '#555' : '#0a0a0a', border: 'none', borderRadius: 8,
    fontSize: 14, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
  });

  const subTab = (t) => ({
    padding: '6px 14px', fontSize: 13, borderRadius: 6, cursor: 'pointer',
    border: '0.5px solid rgba(255,255,255,0.1)',
    background: view === t ? 'rgba(255,255,255,0.1)' : 'transparent',
    color: view === t ? '#f0f0f0' : '#555',
    fontWeight: view === t ? 600 : 400,
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
        <button onClick={run} disabled={loading} style={btnStyle(loading)}>
          {loading ? 'Running…' : 'Run Pipeline'}
        </button>
        {data && !loading && (
          <span style={{ fontSize: 12, color: '#444', marginLeft: 4 }}>Last run: {data.date}</span>
        )}
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444',
          padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* Loading screen — shows while polling */}
      {loading && <PipelineLoader />}

      {/* Results — shows only when not loading */}
      {!loading && data && data.buySignals && (
        <>
          <div style={{ fontSize: 11, color: '#444', textTransform: 'uppercase',
            letterSpacing: '0.05em', marginBottom: 8 }}>File Status</div>
          <DownloadStatus status={data.downloadStatus} />
          <StatsRow data={data} />

          <div style={{ display: 'flex', gap: 6, marginBottom: '1rem' }}>
            <button style={subTab('signals')}   onClick={() => setView('signals')}>Signals ({allSignals.length})</button>
            <button style={subTab('summaries')} onClick={() => setView('summaries')}>Summaries ({data.allSummaries?.length})</button>
            <button style={subTab('deals')}     onClick={() => setView('deals')}>All Deals ({data.allDeals?.length})</button>
          </div>

          {view === 'signals' && (
            <div>
              {allSignals.length === 0
                ? <div style={{ color: '#444', fontSize: 13, padding: '2rem', textAlign: 'center' }}>
                    No signals generated — check scores in noise signals below
                  </div>
                : allSignals.map((s, i) => <SignalRow key={i} sig={s} />)
              }
            </div>
          )}

          {view === 'summaries' && (
            <div>{(data.allSummaries || []).map((s, i) => <SummaryCard key={i} s={s} />)}</div>
          )}

          {view === 'deals' && (
            <DealsTable deals={data.allDeals || []} />
          )}
        </>
      )}
    </div>
  );
}