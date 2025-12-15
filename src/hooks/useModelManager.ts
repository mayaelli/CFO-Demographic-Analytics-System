import * as tf from '@tensorflow/tfjs';
import { useState, useEffect, useCallback } from 'react';

// The specific name we use to save in the browser's database
const DB_MODEL_PATH = 'indexeddb://current-mlp-model';
const DEFAULT_MODEL_PATH = '/models/mlp/model.json'; // The one in your public folder

export const useModelManager = () => {
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [modelStatus, setModelStatus] = useState<'loading' | 'ready' | 'error' | 'none'>('none');
  const [source, setSource] = useState<'default' | 'uploaded'>('default');

  // 1. LOAD MODEL (The "Start" Button)
  // It tries to find a custom uploaded model first. If not, it loads the default one.
  const loadModel = useCallback(async () => {
    setModelStatus('loading');
    try {
      // Try loading from IndexedDB (Uploaded model)
      console.log('Attempting to load custom model...');
      const customModel = await tf.loadLayersModel(DB_MODEL_PATH);
      setModel(customModel);
      setSource('uploaded');
      setModelStatus('ready');
      console.log('✅ Custom model loaded from browser storage');
    } catch (err) {
      // If that fails, load the default cartridge from Public folder
      console.log('No custom model found. Loading default...');
      try {
        const defaultModel = await tf.loadLayersModel(DEFAULT_MODEL_PATH);
        setModel(defaultModel);
        setSource('default');
        setModelStatus('ready');
        console.log('✅ Default model loaded from Public folder');
      } catch (defaultErr) {
        console.error('❌ Failed to load any model', defaultErr);
        setModelStatus('error');
      }
    }
  }, []);

  // 2. UPLOAD MODEL (The "Import" Button)
  // Takes files from a <input type="file"> and saves them to IndexedDB
  const uploadModel = async (files: FileList) => {
    setModelStatus('loading');
    try {
      // TensorFlow needs the .json and the .bin files together
      const loadedModel = await tf.loadLayersModel(tf.io.browserFiles([ ...files ]));
      
      // Save it immediately to the browser database
      await loadedModel.save(DB_MODEL_PATH);
      
      setModel(loadedModel);
      setSource('uploaded');
      setModelStatus('ready');
      alert('Model uploaded and saved successfully!');
    } catch (err) {
      console.error('Upload failed', err);
      alert('Failed to upload model. Make sure you selected both .json and .bin files.');
      setModelStatus('error');
    }
  };

  // 3. DOWNLOAD MODEL (The "Export" Button)
  // Saves the current model to your 'Downloads' folder
  const downloadModel = async () => {
    if (!model) return;
    try {
      await model.save('downloads://my-mlp-model');
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  // 4. DELETE MODEL (The "Reset" Button)
  // Wipes the IndexedDB and reverts to the default public model
  const deleteModel = async () => {
    try {
      await tf.io.removeModel(DB_MODEL_PATH);
      
      // Reload the default model immediately
      await loadModel();
      
      alert('Custom model deleted. Reverted to default.');
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  // Auto-load on startup
  useEffect(() => {
    loadModel();
  }, [loadModel]);

  return {
    model,
    modelStatus,
    source,
    loadModel,
    uploadModel,
    downloadModel,
    deleteModel
  };
};