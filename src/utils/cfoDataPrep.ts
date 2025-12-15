// utils/civilStatusDataPrep.ts

export const sortData = (data: any[]) => {
  return [...data].sort((a, b) => a.year - b.year);
};

export const normalizeData = (data: any[], targetKey: string) => {
  const values = data.map((d) => d[targetKey]);
  const min = Math.min(...values);
  const max = Math.max(...values);

  const normalized = data.map((d) => ({
    ...d,
    normalizedValue: max === min ? 0 : (d[targetKey] - min) / (max - min),
  }));

  return { normalized, min, max };
};

export const denormalize = (value: number, min: number, max: number) => {
  return value * (max - min) + min;
};

// Create sequences for Univariate Time Series (using past N years to predict next 1)
export const createSequences = (data: any[], lookback = 3) => {
  const X = [];
  const y = [];

  for (let i = lookback; i < data.length; i++) {
    // Input: The previous 'lookback' normalized values
    const sequence = data.slice(i - lookback, i).map((d) => d.normalizedValue);
    X.push(sequence);
    
    // Target: The current normalized value
    y.push(data[i].normalizedValue);
  }

  return { X, y };
};