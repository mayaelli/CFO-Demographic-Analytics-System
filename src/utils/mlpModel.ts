import * as tf from '@tensorflow/tfjs';

// --- 1. Define the Shape of the Saved Data ---
export interface ModelMetadata {
  name: string;
  hyperparameters: {
    units: number;
    learningRate: number;
    lookback: number;
  };
  trainingHistory: Array<{
    epoch: number;
    loss: number;
    mae: number;
    accuracy: string;
    val_loss?: number;
  }>;
  totalEpochsTrained: number;
  lastUpdated: string;
}

// ==========================================
//        CORE MODEL LOGIC
// ==========================================

/**
 * Builds the MLP Model (Standard)
 */
export const buildMLPModel = (inputShape: number, units: number = 64, learningRate: number = 0.01) => {
  const model = tf.sequential();
  
  model.add(tf.layers.dense({ units: units, activation: 'relu', inputShape: [inputShape] }));
  model.add(tf.layers.dropout({ rate: 0.2 }));
  model.add(tf.layers.dense({ units: Math.floor(units / 2), activation: 'relu' }));
  model.add(tf.layers.dropout({ rate: 0.2 }));
  model.add(tf.layers.dense({ units: 1 }));

  model.compile({
    optimizer: tf.train.adam(learningRate),
    loss: 'meanSquaredError',
    metrics: ['mae']
  });

  return model;
};

/**
 * Trains the model.
 */
export const trainMLPModel = async (
  model: tf.Sequential, 
  inputs: number[][], 
  labels: number[], 
  onEpochEnd: (epoch: number, logs: any) => void,
  epochs: number = 100,
  initialEpoch: number = 0 
) => {
  const xs = tf.tensor2d(inputs);
  const ys = tf.tensor2d(labels, [labels.length, 1]);

  // Baseline for accuracy calculation
  const ySum = labels.reduce((a, b) => a + b, 0);
  const yMean = ySum / labels.length || 1; 

  await model.fit(xs, ys, {
    epochs: epochs + initialEpoch, 
    initialEpoch: initialEpoch,    
    validationSplit: 0.2,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        if (onEpochEnd && logs) {
            const currentMAE = logs.mae;
            const errorRatio = currentMAE / yMean; 
            const accuracyPercentage = Math.max(0, 100 * (1 - errorRatio));

            onEpochEnd(epoch, {
                loss: logs.loss,
                mae: currentMAE,
                val_loss: logs.val_loss,
                accuracy: accuracyPercentage.toFixed(2) 
            });
        }
      }
    }
  });

  xs.dispose();
  ys.dispose();
};

/**
 * NEW: Automated Hyperparameter Tuning
 * Runs a Grid Search to find the best configuration.
 * * @param inputs Training inputs
 * @param labels Training labels
 * @param progressCallback Optional callback to update UI on tuning progress (0-100%)
 */
export const tuneMLPModel = async (
  inputs: number[][], 
  labels: number[],
  progressCallback?: (status: string) => void
) => {
    // 1. Define the Search Grid (You can expand this if needed)
    const tuningGrid = {
        units: [32, 64, 128],
        learningRates: [0.01, 0.001]
    };

    let bestLoss = Infinity;
    let bestConfig = { units: 64, learningRate: 0.01 }; // Default fallback

    const totalCombinations = tuningGrid.units.length * tuningGrid.learningRates.length;
    let currentIteration = 0;

    // 2. Loop through every combination
    for (const units of tuningGrid.units) {
        for (const lr of tuningGrid.learningRates) {
            currentIteration++;
            if(progressCallback) progressCallback(`Tuning... Testing [Units: ${units}, LR: ${lr}] (${currentIteration}/${totalCombinations})`);

            // A. Build a temporary model
            // We use inputShape 1 (assuming normalized year input), adjust if your inputs change
            const tempModel = buildMLPModel(1, units, lr); 
            
            // B. Train for a short period (e.g., 30 epochs) just to check convergence
            let finalValLoss = Infinity;
            
            await trainMLPModel(tempModel, inputs, labels, (_, logs) => {
                // We only care about the loss at the very end
                if (logs.val_loss) finalValLoss = logs.val_loss;
                else finalValLoss = logs.loss; // Fallback if no validation
            }, 30, 0);

            // C. Compare results
            if (finalValLoss < bestLoss) {
                bestLoss = finalValLoss;
                bestConfig = { units, learningRate: lr };
            }

            // D. Clean up memory
            tempModel.dispose();
        }
    }

    if(progressCallback) progressCallback(`Tuning Complete. Best: ${bestConfig.units} units, LR ${bestConfig.learningRate}`);
    
    // 3. Return the winner
    return bestConfig;
};

export const predictMLP = async (model: tf.Sequential, inputData: number[][]) => {
  const xs = tf.tensor2d(inputData);
  const prediction = model.predict(xs) as tf.Tensor;
  const data = await prediction.data();
  xs.dispose();
  prediction.dispose();
  return Array.from(data);
};

// ==========================================
//      STORAGE & EXPORT MANAGER
// ==========================================

export const saveMLPModel = async (
  model: tf.Sequential, 
  metadata: ModelMetadata, 
  saveMode: 'local' | 'download' = 'local'
) => {
  const modelName = metadata.name || 'civil-status-mlp';

  if (saveMode === 'local') {
    await model.save(`localstorage://${modelName}`);
    localStorage.setItem(`${modelName}_meta`, JSON.stringify(metadata));
    console.log(`Model and Metadata saved locally as ${modelName}`);
  } else {
    await model.save(`downloads://${modelName}`);
    const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(metadataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${modelName}_metadata.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log(`Model exported as files.`);
  }
};

export const loadMLPModel = async (modelName: string = 'civil-status-mlp') => {
  try {
    const model = await tf.loadLayersModel(`localstorage://${modelName}`);
    const metaStr = localStorage.getItem(`${modelName}_meta`);
    
    if (!metaStr) {
        throw new Error("Model found but metadata is missing.");
    }

    const metadata: ModelMetadata = JSON.parse(metaStr);
    console.log("Model loaded successfully with history:", metadata.trainingHistory.length, "epochs.");
    return { model, metadata };

  } catch (e) {
    console.log("No saved model found in local storage.");
    return null;
  }
};

export const deleteMLPModel = async (modelName: string = 'civil-status-mlp') => {
    try {
        await tf.io.removeModel(`localstorage://${modelName}`);
    } catch (err) {
        // Ignore
    }
    localStorage.removeItem(`tensorflowjs_models/${modelName}/info`);
    localStorage.removeItem(`tensorflowjs_models/${modelName}/model_topology`);
    localStorage.removeItem(`tensorflowjs_models/${modelName}/weight_specs`);
    localStorage.removeItem(`tensorflowjs_models/${modelName}/weight_data`);
    localStorage.removeItem(`${modelName}_meta`);
    
    console.log("Model and metadata deleted.");
    return true;
};