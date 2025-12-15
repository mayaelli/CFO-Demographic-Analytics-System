// utils/mlpModel.ts
import * as tf from '@tensorflow/tfjs';

export function buildMLPModel(inputShape: number) {
  const model = tf.sequential();
  
  // Layer 1: The Input Layer (More neurons to capture complexity)
  model.add(tf.layers.dense({
    inputShape: [inputShape],
    units: 64, 
    activation: 'relu'
  }));

  // Improvement: Dropout Layer (Prevents overfitting on small data)
  model.add(tf.layers.dropout({ rate: 0.2 }));

  // Layer 2: Hidden Layer (Refining the pattern)
  model.add(tf.layers.dense({
    units: 32,
    activation: 'relu'
  }));

  // Output Layer
  model.add(tf.layers.dense({ units: 1 }));

  // Compile with a slightly lower learning rate for stability
  model.compile({
    optimizer: tf.train.adam(0.001), 
    loss: 'meanSquaredError'
  });

  return model;
}

export async function trainMLPModel(
  model: tf.LayersModel, 
  X: any, 
  y: any, 
  onEpochEnd: (epoch: number, logs: any) => void,
  epochs = 200 // Default increased to 200
) {
  const xs = tf.tensor2d(X);
  const ys = tf.tensor2d(y, [y.length, 1]);

  await model.fit(xs, ys, {
    epochs: epochs,
    batchSize: 4, // Smaller batch size helps with small datasets
    shuffle: true,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        if(onEpochEnd) onEpochEnd(epoch, logs);
      },
      // MAGIC SAUCE: Stop if validation loss doesn't improve for 20 epochs
      // (Note: Since we don't have a separate validation set, we monitor loss)
      onTrainEnd: () => console.log('Training finished') 
    }
  });

  xs.dispose();
  ys.dispose();
  return model;
}

export async function predictMLP(model: tf.LayersModel, X: number[][]) {
  const xs = tf.tensor2d(X);
  const predictions = model.predict(xs) as tf.Tensor;
  
  // FIX: Cast the result to 'number[][]' so TypeScript knows it's an array of arrays
  const result = (await predictions.array()) as number[][];
  
  xs.dispose();
  predictions.dispose();
  
  return result.map((r) => r[0]);
}

// Save to IndexedDB
export async function saveMLPModel(model: tf.LayersModel, metadata: any, modelName: string) {
  await model.save(`indexeddb://${modelName}`);
  localStorage.setItem(`${modelName}-metadata`, JSON.stringify(metadata));
}

// Load from IndexedDB
export async function loadMLPModel(modelName: string) {
  try {
    const model = await tf.loadLayersModel(`indexeddb://${modelName}`);
    const metadataStr = localStorage.getItem(`${modelName}-metadata`);
    const metadata = metadataStr ? JSON.parse(metadataStr) : null;
    return { model, metadata };
  } catch (error) {
    // Returns null if model doesn't exist yet
    return null;
  }
}

export async function deleteModelFromStorage(modelName: string) {
  try {
    // 1. Delete from IndexedDB (TensorFlow storage)
    await tf.io.removeModel(`indexeddb://${modelName}`);
  } catch (err) {
    // Ignore error if model didn't exist in IndexedDB
    console.warn('Model not found in IndexedDB to delete');
  }

  // 2. Delete metadata from LocalStorage
  localStorage.removeItem(`${modelName}-metadata`);
}
