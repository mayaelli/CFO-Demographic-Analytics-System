// src/ml/mlpModel.ts
import * as tf from '@tensorflow/tfjs';

export interface TrainMLPOptions {
  X: number[][][];
  y: number[];
  epochs?: number;
  validationSplit?: number;
  onEpochEnd?: (epoch: number, logs: tf.Logs) => void;
}

export function buildMLPModel(lookback = 3, features = 1): tf.LayersModel {
  const model = tf.sequential();

  const inputSize = lookback * features;

  model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [inputSize] }));
  model.add(tf.layers.dropout({ rate: 0.2 }));

  model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
  model.add(tf.layers.dropout({ rate: 0.2 }));

  model.add(tf.layers.dense({ units: 1 }));

  model.compile({ optimizer: tf.train.adam(0.001), loss: 'meanSquaredError', metrics: ['mae'] });

  return model;
}

/**
 * Flatten 3D sequences into 2D for MLP input
 * @param X - shape [samples, time_steps, features]
 * @returns 2D array [samples, time_steps*features]
 */
export function flattenSequences(X: number[][][]): number[][] {
  return X.map(seq => seq.flat());
}

/**
 * Train an MLP model
 */
export async function trainMLPModel(model: tf.LayersModel, options: TrainMLPOptions) {
  const { X, y, epochs = 100, validationSplit = 0.2, onEpochEnd } = options;

  const xs = tf.tensor2d(flattenSequences(X));
  const ys = tf.tensor2d(y, [y.length, 1]);
  const batchSize = Math.min(32, X.length);

  const history = await model.fit(xs, ys, {
    epochs,
    batchSize,
    validationSplit,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        if (onEpochEnd && epoch % 20 === 0) onEpochEnd(epoch, logs);
      },
    },
  });

  xs.dispose();
  ys.dispose();

  return history;
}

/**
 * Predict using an MLP model
 */
export async function predictMLP(model: tf.LayersModel, X: number[][][]): Promise<number[]> {
  const xs = tf.tensor2d(flattenSequences(X));
  const predsTensor = model.predict(xs) as tf.Tensor;
  const preds = (await predsTensor.array()) as number[][];
  xs.dispose();
  predsTensor.dispose();
  return preds.map(p => p[0]);
}

/**
 * Save model to IndexedDB
 */
export async function saveMLPModel(model: tf.LayersModel, name = 'mlp-model') {
  await model.save(`indexeddb://${name}`);
}

/**
 * Load model from IndexedDB
 */
export async function loadMLPModel(name = 'mlp-model'): Promise<tf.LayersModel | null> {
  try {
    const model = await tf.loadLayersModel(`indexeddb://${name}`);
    return model;
  } catch (error) {
    console.error('Failed to load model:', error);
    return null;
  }
}

/**
 * Delete model from IndexedDB
 */
export async function deleteMLPModel(name = 'mlp-model'): Promise<boolean> {
  try {
    await tf.io.removeModel(`indexeddb://${name}`);
    return true;
  } catch (error) {
    console.error('Failed to delete model:', error);
    return false;
  }
}

/**
 * Download model files
 */
export async function downloadMLPModel(model: tf.LayersModel, name = 'mlp-model') {
  await model.save(`downloads://${name}`);
}
