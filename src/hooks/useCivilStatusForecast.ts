// src/hooks/useCivilStatusForecast.ts
import { useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import type { CivilStatusData } from '../api/civilStatusService';
import type { Metrics } from '../utils/dataPreparation';
import { prepareCivilStatusDataset } from '../model/prepareDataset';
import { flattenSequences } from 'src/model/mlpModel';
import { getAllCivilStatusData } from '../api/civilStatusService';
import { recursiveForecast, mergeActualForecast } from '../utils/forecastHelpers';

export interface ForecastPoint {
  year: string;
  actual: number | null;
  forecast: number | null;
}

export interface ForecastHookReturn {
  forecastData: ForecastPoint[];
  metrics: Metrics | null;
  isTraining: boolean;
  trainModel: () => Promise<void>;
}

export function useCivilStatusForecast(category: string, lookback = 3): ForecastHookReturn {
  const [forecastData, setForecastData] = useState<ForecastPoint[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isTraining, setIsTraining] = useState(false);

  const trainModel = useCallback(async () => {
    setIsTraining(true);

    try {
      // 1️⃣ Load raw Civil Status data
      const rawData: CivilStatusData[] = await getAllCivilStatusData();
      if (!rawData.length) throw new Error('No Civil Status data available');

      // 2️⃣ Prepare dataset
      const { X, y, normalization } = prepareCivilStatusDataset(rawData, category, lookback);

      // 3️⃣ Load pre-trained model from IndexedDB
      const model = await tf.loadLayersModel('indexeddb://civilstatus-mlp-model');

      // 4️⃣ Make predictions on training set for metrics
      const predsTensor = model.predict(tf.tensor2d(flattenSequences(X))) as tf.Tensor;
      const predictedArray = (await predsTensor.array()) as number[][];

      const actualDenorm = y.map(val => 
        (val * (normalization.maxs[category] - normalization.mins[category])) + normalization.mins[category]
      );
      const predictedDenorm = predictedArray.map(p => 
        (p[0] * (normalization.maxs[category] - normalization.mins[category])) + normalization.mins[category]
      );

      // 5️⃣ Compute metrics
      setMetrics({
        mae: metrics?.mae ?? '',
        rmse: metrics?.rmse ?? '',
        mape: metrics?.mape ?? '',
        r2: metrics?.r2 ?? '',
        accuracy: metrics?.accuracy ?? '',
        ...predictedDenorm
      });

      // 6️⃣ Prepare last normalized sequence for recursive forecast
      const sortedData = rawData.sort((a, b) => a.Year - b.Year);
      const lastYears = sortedData.slice(-lookback);
      const lastNormalizedSequence = lastYears.map(row => [
        (row[category] - normalization.mins[category]) / (normalization.maxs[category] - normalization.mins[category])
      ]);

      const forecastPoints = await recursiveForecast(
        model,
        lastNormalizedSequence,
        10, // predict 10 years ahead
        category,
        { min: normalization.mins[category], max: normalization.maxs[category] },
        lastYears[lastYears.length - 1].Year + 1
      );

      // 7️⃣ Merge actual and forecast data
      const actualArray = sortedData.map(row => ({ year: row.Year, value: row[category] }));
      const chartData = mergeActualForecast(actualArray, forecastPoints);

      setForecastData(chartData);

      predsTensor.dispose();
    } catch (error) {
      console.error('Error during forecasting:', error);
    } finally {
      setIsTraining(false);
    }
  }, [category, lookback]);

  return { forecastData, metrics, isTraining, trainModel };
}
