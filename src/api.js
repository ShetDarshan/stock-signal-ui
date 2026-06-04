const BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const fetchSignal = async (symbol) => {
  const res = await fetch(`${BASE_URL}/signal/${symbol}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch signal');
  return data;
};

export const fetchScreener = async (symbols, minScore = 1, buyOnly = true) => {
  const res = await fetch(`${BASE_URL}/screener`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbols, minScore, buyOnly }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch screener');
  return data;
};

export const fetchNseSignals = async (date) => {
  const params = date ? `?date=${date}` : '';
  const res = await fetch(`${BASE_URL}/nse/signals/run${params}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch NSE signals');
  return data;
};