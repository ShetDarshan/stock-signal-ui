const BASE_URL = process.env.REACT_APP_API_BASE_URL ||
  'http://stock-signal-api-alb-1101643266.ap-south-1.elb.amazonaws.com/api/v1';

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
