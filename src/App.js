import React, { useState } from 'react';
import { fetchSignal, fetchScreener } from './api';
import SignalCard from './components/SignalCard';
import ScreenerGrid from './components/ScreenerGrid';
import { INDICES } from './indices';
import NseTab from './components/NseTab';

const CREDS = {
  username: process.env.REACT_APP_USERNAME,
  password: process.env.REACT_APP_PASSWORD,
};

const inputStyle = {
  padding: '10px 14px',
  background: 'rgba(255,255,255,0.04)',
  border: '0.5px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  color: '#f0f0f0',
  fontSize: 15,
  outline: 'none',
  width: '100%',
};

const btnStyle = (disabled) => ({
  padding: '10px 20px',
  background: disabled ? 'rgba(255,255,255,0.1)' : '#f0f0f0',
  color: disabled ? '#555' : '#0a0a0a',
  border: 'none',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  cursor: disabled ? 'not-allowed' : 'pointer',
  whiteSpace: 'nowrap',
});

function LoginPage({ onLogin, error }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 600, marginBottom: 6 }}>Stock Signal</div>
          <div style={{ fontSize: 14, color: '#555' }}>Indian equity swing trade signals</div>
        </div>
        <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1.75rem' }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Username</label>
            <input type="text" value={u} onChange={e => setU(e.target.value)} style={inputStyle} autoComplete="username" />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
            <input type="password" value={p} onChange={e => setP(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onLogin(u, p)}
              style={inputStyle} autoComplete="current-password" />
          </div>
          {error && <div style={{ fontSize: 13, color: '#ef4444', marginBottom: 14, textAlign: 'center' }}>{error}</div>}
          <button onClick={() => onLogin(u, p)} style={{ ...btnStyle(false), width: '100%' }}>Sign in</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [tab, setTab] = useState('signal');

  const [symbol, setSymbol] = useState('NSE-WIPRO');
  const [signalData, setSignalData] = useState(null);
  const [signalLoading, setSignalLoading] = useState(false);
  const [signalError, setSignalError] = useState('');

  const [selectedIndex, setSelectedIndex] = useState('NIFTY Bank');
  const [customSymbols, setCustomSymbols] = useState('');
  const [minScore, setMinScore] = useState(1);
  const [buyOnly, setBuyOnly] = useState(true);
  const [screenerData, setScreenerData] = useState(null);
  const [screenerLoading, setScreenerLoading] = useState(false);
  const [screenerError, setScreenerError] = useState('');
  function handleLogin(u, p) {
    if (u === CREDS.username && p === CREDS.password) { setAuthed(true); setLoginError(''); }
    else setLoginError('Invalid credentials');
  }

  async function handleFetchSignal() {
    if (!symbol.trim()) return;
    setSignalLoading(true); setSignalError(''); setSignalData(null);
    try { setSignalData(await fetchSignal(symbol.trim().toUpperCase())); }
    catch (e) { setSignalError(e.message); }
    finally { setSignalLoading(false); }
  }

  async function handleFetchScreener() {
    let symbols = [];
    if (selectedIndex === 'Custom') {
      symbols = customSymbols.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
      if (symbols.length === 0) { setScreenerError('Enter at least one symbol'); return; }
    } else {
      symbols = INDICES[selectedIndex] || [];
    }
    setScreenerLoading(true); setScreenerError(''); setScreenerData(null);
    try { setScreenerData(await fetchScreener(symbols, minScore, buyOnly)); }
    catch (e) { setScreenerError(e.message); }
    finally { setScreenerLoading(false); }
  }

  if (!authed) return <LoginPage onLogin={handleLogin} error={loginError} />;

  return (
    <div style={{ minHeight: '100vh', padding: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
        <div style={{ fontSize: 17, fontWeight: 600 }}>Stock Signal</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: '#444', background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: 6, border: '0.5px solid rgba(255,255,255,0.07)' }}>Live · Groww API</span>
          <button onClick={() => setAuthed(false)} style={{ fontSize: 12, color: '#555', background: 'none', border: 'none', cursor: 'pointer' }}>Sign out</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
        {['signal', 'screener','nse'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '7px 18px', fontSize: 14, borderRadius: 8,
            border: '0.5px solid rgba(255,255,255,0.1)', cursor: 'pointer',
            background: tab === t ? '#f0f0f0' : 'transparent',
            color: tab === t ? '#0a0a0a' : '#666',
            fontWeight: tab === t ? 600 : 400,
          }}>
              {t === 'signal' ? 'Single Stock' : t === 'screener' ? 'Screener' : 'NSE'}
          </button>
        ))}
      </div>

      {tab === 'signal' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
            <input type="text" value={symbol} onChange={e => setSymbol(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleFetchSignal()}
              placeholder="e.g. NSE-WIPRO" style={{ ...inputStyle, flex: 1 }} />
            <button onClick={handleFetchSignal} disabled={signalLoading} style={btnStyle(signalLoading)}>
              {signalLoading ? 'Loading…' : 'Analyse'}
            </button>
          </div>
          {signalError && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: '1rem' }}>{signalError}</div>}
          {signalData && <SignalCard data={signalData} />}
        </div>
      )}

      {tab === 'screener' && (
        <div>
          <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Index</label>
                <select value={selectedIndex} onChange={e => setSelectedIndex(e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}>
                  {Object.keys(INDICES).map(k => (
                    <option key={k} value={k} style={{ background: '#1a1a1a' }}>{k} {k !== 'Custom' ? `(${INDICES[k].length})` : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Min Score</label>
                <select value={minScore} onChange={e => setMinScore(Number(e.target.value))}
                  style={{ ...inputStyle, cursor: 'pointer' }}>
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n} style={{ background: '#1a1a1a' }}>{n}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#888', cursor: 'pointer' }}>
                  <input type="checkbox" checked={buyOnly} onChange={e => setBuyOnly(e.target.checked)} style={{ width: 14, height: 14 }} />
                  Buy signals only
                </label>
                <button onClick={handleFetchScreener} disabled={screenerLoading} style={btnStyle(screenerLoading)}>
                  {screenerLoading ? 'Scanning…' : 'Run Screener'}
                </button>
              </div>
            </div>

            {selectedIndex === 'Custom' && (
              <div style={{ marginTop: 12 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Symbols (comma separated)</label>
                <input type="text" value={customSymbols} onChange={e => setCustomSymbols(e.target.value)}
                  placeholder="NSE-WIPRO, NSE-RELIANCE, NSE-TCS" style={inputStyle} />
              </div>
            )}

            {selectedIndex !== 'Custom' && (
              <div style={{ marginTop: 10, fontSize: 12, color: '#444' }}>
                {INDICES[selectedIndex].slice(0, 8).map(s => s.replace('NSE-', '')).join(' · ')}
                {INDICES[selectedIndex].length > 8 && ` · +${INDICES[selectedIndex].length - 8} more`}
              </div>
            )}
          </div>

          {screenerError && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: '1rem' }}>{screenerError}</div>}
          {screenerData && <ScreenerGrid data={screenerData} />}
        </div>
      )}
      {tab === 'nse' && <NseTab />}
    </div>
  );
}