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

/**
 * Start NSE pipeline for a date and poll until complete.
 * Returns the full PipelineResult when done.
 *
 * Flow:
 * 1. POST /run?date=... → { jobId, status: "RUNNING" }
 * 2. Poll /status/{jobId} every 10s until COMPLETED or FAILED
 * 3. Return result or throw error
 */
export const fetchNseSignals = async (date, onStatusUpdate) => {
  const params = date ? `?date=${date}` : '';

  // Step 1 — start the job
  const startRes = await fetch(`${BASE_URL}/nse/signals/run${params}`);
  const startData = await startRes.json();
  if (!startRes.ok) throw new Error(startData.message || 'Failed to start NSE pipeline');

  // If already completed (cache hit returns immediately)
  if (startData.status === 'COMPLETED') {
    return startData.result;
  }

  if (startData.status === 'FAILED') {
    throw new Error(startData.message || 'Pipeline failed');
  }

  const jobId = startData.jobId;

  // Step 2 — poll every 10 seconds
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const res = await fetch(`${BASE_URL}/nse/signals/status/${jobId}`);
        const data = await res.json();

        if (!res.ok) {
          reject(new Error(data.message || 'Failed to poll status'));
          return;
        }

        if (typeof onStatusUpdate === 'function') {
          onStatusUpdate(data.status);
        }

        if (data.status === 'COMPLETED') {
          resolve(data.result);
        } else if (data.status === 'FAILED') {
          reject(new Error(data.message || 'Pipeline failed'));
        } else {
          // Still RUNNING — poll again in 10 seconds
          setTimeout(poll, 10000);
        }
      } catch (e) {
        reject(e);
      }
    };

    // First poll after 10 seconds
    setTimeout(poll, 10000);
  });
};