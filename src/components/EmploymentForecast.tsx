import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Settings, Play, TrendingUp, AlertCircle, Save, 
  Trash2, Download, Upload, Sliders 
} from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import { 
  buildMLPModel, trainMLPModel, predictMLP, 
  saveMLPModel, loadMLPModel, deleteModelFromStorage 
} from '../utils/mlpModel';
import { sortData, normalizeData, createSequences, denormalize } from '../utils/cfoDataPrep';

interface CivilStatusForecastProps {
  data: any[];
}

export default function EmploymentForecast({ data }: CivilStatusForecastProps) {
  const [activeTab, setActiveTab] = useState<'view' | 'train'>('view');
  
  // Model State
  const [model, setModel] = useState<any>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any[]>([]);
  
  // Training State
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  
  // --- NEW: Lookback State ---
  const [lookback, setLookback] = useState<number>(3); 
  
  const [isTraining, setIsTraining] = useState(false);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState<{ epoch: number; loss: number } | null>(null);

  // Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const MODEL_NAME = 'employment-mlp';

  const statusOptions = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]).filter(k => 
      k !== 'YEAR' && k !== 'total' && typeof data[0][k] === 'number'
    );
  }, [data]);

  useEffect(() => {
    if (statusOptions.length > 0 && !selectedStatus) {
      setSelectedStatus(statusOptions[0]);
    }
  }, [statusOptions]);

  useEffect(() => {
    loadSavedModel();
  }, []);

  const loadSavedModel = async () => {
    const result = await loadMLPModel(MODEL_NAME);
    if (result) {
      setModel(result.model);
      setMetadata(result.metadata);
      // Update the slider to match the loaded model's setting
      if (result.metadata.lookback) {
          setLookback(result.metadata.lookback);
      }
      generateForecast(result.model, result.metadata);
    }
  };

  const generateForecast = async (loadedModel: any, meta: any) => {
    if (!loadedModel || !meta || !data.length) return;
    try {
      const targetKey = meta.targetStatus;
      // Important: Use the lookback stored in the model metadata, not the current UI slider
      const modelLookback = meta.lookback || 3; 

      const cleanData = data.map(d => ({ year: d.YEAR, value: d[targetKey] || 0 }));
      const sorted = sortData(cleanData);
      const { normalized, min, max } = normalizeData(sorted, 'value');

      // Ensure we have enough data for the lookback
      if (normalized.length < modelLookback) {
        console.warn("Not enough data history for this lookback period");
        return;
      }

      let currentInput = normalized.slice(-modelLookback).map((d: any) => d.normalizedValue);
      const lastYear = sorted[sorted.length - 1].year;
      const futurePredictions = [];

      for (let i = 1; i <= 10; i++) {
        const inputTensor = [currentInput];
        const pred = await predictMLP(loadedModel, inputTensor);
        const predValue = pred[0];
        const realValue = Math.round(denormalize(predValue, min, max));
        
        futurePredictions.push({
          year: lastYear + i,
          [targetKey]: Math.max(0, realValue),
          type: 'Forecast'
        });
        currentInput = [...currentInput.slice(1), predValue];
      }

      const history = sorted.map(d => ({
        year: d.year,
        [targetKey]: d.value,
        type: 'Historical'
      }));

      setForecastData([...history, ...futurePredictions]);
    } catch (e) {
      console.error("Forecast generation error", e);
    }
  };

  const handleTrain = async () => {
    if (!selectedStatus) return;
    setIsTraining(true);
    setTrainingLogs([]);
    setProgress(null);

    try {
      const targetKey = selectedStatus;
      
      // Use the User's selected Lookback
      const trainingLookback = lookback; 

      const cleanData = data.map(d => ({ year: d.YEAR, value: d[targetKey] || 0 }));
      const sorted = sortData(cleanData);
      const { normalized, min, max } = normalizeData(sorted, 'value');

      // Guard clause: Data must be larger than lookback
      if (normalized.length <= trainingLookback + 1) {
          throw new Error(`Data too short (${normalized.length} rows) for lookback of ${trainingLookback}.`);
      }

      const { X, y } = createSequences(normalized, trainingLookback);

      // Pass lookback to build the correct input shape
      const newModel = buildMLPModel(trainingLookback);

      await trainMLPModel(newModel, X, y, (epoch: number, logs: any) => {
        setProgress({ epoch: epoch + 1, loss: logs.loss });
        if ((epoch + 1) % 10 === 0) {
          setTrainingLogs(prev => [`Epoch ${epoch + 1}: Loss ${logs.loss.toFixed(5)}`, ...prev]);
        }
      }, 150); // Increased epochs slightly for better learning

      const newMetadata = {
        targetStatus: targetKey,
        lookback: trainingLookback, // Save this so we know how to run it later
        min,
        max,
        trainedAt: new Date().toISOString()
      };

      await saveMLPModel(newModel, newMetadata, MODEL_NAME);
      setModel(newModel);
      setMetadata(newMetadata);
      setActiveTab('view');
      generateForecast(newModel, newMetadata);

    } catch (error: any) {
      alert('Training failed: ' + error.message);
    } finally {
      setIsTraining(false);
    }
  };

  const handleDeleteModel = async () => {
    if (confirm("Delete model?")) {
      await deleteModelFromStorage(MODEL_NAME);
      setModel(null);
      setMetadata(null);
      setForecastData([]);
    }
  };

  const handleDownloadModel = async () => {
    if (!model || !metadata) return;
    await model.save(`downloads://${MODEL_NAME}`);
    const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${MODEL_NAME}_metadata.json`;
    link.click();
  };

  const handleUploadModel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const files = event.target.files;
    if (!files || files.length === 0) return;

    let modelJsonFile: File | null = null;
    let weightsFile: File | null = null;
    let metadataFile: File | null = null;

    Array.from(files).forEach(file => {
      if (file.name.includes('metadata') && file.name.endsWith('.json')) metadataFile = file;
      else if (file.name.endsWith('.json')) modelJsonFile = file;
      else if (file.name.endsWith('.bin')) weightsFile = file;
    });

    if (!modelJsonFile || !weightsFile) {
      setUploadError("Missing files. Need model.json and .bin weights.");
      return;
    }

    try {
      const loadedModel = await tf.loadLayersModel(tf.io.browserFiles([modelJsonFile, weightsFile]));
      let loadedMetadata = null;
      
      if (metadataFile) {
        const text = await (metadataFile as File).text();
        loadedMetadata = JSON.parse(text);
      } else {
        // Fallback if they lose the metadata file
        const manualInput = prompt("Metadata missing. Enter Target Name (e.g. Single):");
        if (!manualInput) throw new Error("Metadata required.");
        loadedMetadata = { targetStatus: manualInput, lookback: 3, min: 0, max: 1000 };
      }

      await saveMLPModel(loadedModel, loadedMetadata, MODEL_NAME);
      setModel(loadedModel);
      setMetadata(loadedMetadata);
      
      // Update the UI slider to reflect what we just uploaded
      if (loadedMetadata.lookback) setLookback(loadedMetadata.lookback);

      if (fileInputRef.current) fileInputRef.current.value = "";
      setActiveTab('view');
      generateForecast(loadedModel, loadedMetadata);
    } catch (err: any) {
      setUploadError("Import Failed: " + err.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-amber-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-amber-600" />
            Civil Status Forecasting
          </h3>
          <p className="text-sm text-amber-700/60">
            {metadata ? `Active: ${metadata.targetStatus} (Lookback: ${metadata.lookback} yrs)` : 'No model loaded'}
          </p>
        </div>
        
        <div className="flex bg-amber-50 rounded-lg p-1 border border-amber-200">
          <button onClick={() => setActiveTab('view')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'view' ? 'bg-amber-500 text-white shadow' : 'text-amber-800 hover:bg-amber-100'}`}>Forecast View</button>
          <button onClick={() => setActiveTab('train')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'train' ? 'bg-amber-500 text-white shadow' : 'text-amber-800 hover:bg-amber-100'}`}><Settings className="w-4 h-4" /> Manager</button>
        </div>
      </div>

      {/* VIEW TAB */}
      {activeTab === 'view' && (
        <div className="animate-in fade-in duration-500">
          {!model ? (
            <div className="flex flex-col items-center justify-center h-80 bg-amber-50/50 rounded-xl border-2 border-dashed border-amber-200">
              <AlertCircle className="w-12 h-12 text-amber-400 mb-2" />
              <h4 className="text-lg font-semibold text-amber-900">No Model Loaded</h4>
              <p className="text-amber-700/70 mb-4">Train or import a model to see predictions.</p>
              <button onClick={() => setActiveTab('train')} className="px-6 py-2 bg-amber-600 text-white rounded-lg">Go to Manager</button>
            </div>
          ) : (
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="year" stroke="#92400e" />
                  <YAxis stroke="#92400e" />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #fbbf24' }} />
                  <Legend />
                  <Line type="monotone" dataKey={metadata?.targetStatus} stroke="#d97706" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
              <p className="mt-2 text-xs text-center text-amber-800/50">
                Model: MLP | Lookback: {metadata.lookback} Years | Trained: {new Date(metadata.trainedAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TRAIN / MANAGE TAB */}
      {activeTab === 'train' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-right duration-300">
          
          <div className="space-y-8">
            {/* TRAINING CARD */}
            <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
              <h4 className="font-bold text-amber-900 mb-4 flex items-center gap-2">
                <Play className="w-4 h-4" /> Train Configuration
              </h4>
              
              <div className="space-y-4 mb-6">
                {/* Target Selection */}
                <div>
                    <label className="block text-sm font-bold text-amber-800 mb-1">Target Attribute</label>
                    <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full p-3 border border-amber-200 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 outline-none">
                    {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>

                {/* --- NEW: Lookback Slider --- */}
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-bold text-amber-800 flex items-center gap-2">
                            <Sliders className="w-3 h-3"/> Lookback Period
                        </label>
                        <span className="text-xs font-mono bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                            {lookback} Years
                        </span>
                    </div>
                    <input 
                        type="range" 
                        min="2" 
                        max="8" 
                        step="1" 
                        value={lookback} 
                        onChange={(e) => setLookback(Number(e.target.value))}
                        className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                    <p className="text-xs text-amber-700/60 mt-1">
                        Higher values smooth out noise but react slower to recent trends.
                    </p>
                </div>
              </div>

              <button onClick={handleTrain} disabled={isTraining} className={`w-full py-3 rounded-lg font-bold text-white shadow-lg flex justify-center items-center gap-2 transition-all ${isTraining ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700'}`}>
                {isTraining ? 'Training Model...' : 'Start Training'}
              </button>
            </div>

            {/* STORAGE CARD (Download/Upload/Delete) */}
            <div className="bg-white p-6 rounded-xl border-2 border-slate-100">
               <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Save className="w-4 h-4" /> Model Storage
              </h4>
              <div className="grid grid-cols-1 gap-3">
                <button onClick={handleDownloadModel} disabled={!model} className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 text-slate-700 font-medium">
                  <span className="flex items-center gap-2"><Download className="w-4 h-4 text-blue-500"/> Export Model</span>
                </button>
                <div className="relative">
                  <input type="file" multiple accept=".json,.bin" ref={fileInputRef} onChange={handleUploadModel} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-700 font-medium cursor-pointer">
                     <span className="flex items-center gap-2"><Upload className="w-4 h-4 text-green-500"/> Import Model</span>
                  </div>
                </div>
                <button onClick={handleDeleteModel} disabled={!model} className="flex items-center justify-between px-4 py-3 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 disabled:opacity-50 text-red-700 font-medium mt-2">
                  <span className="flex items-center gap-2"><Trash2 className="w-4 h-4"/> Delete Model</span>
                </button>
              </div>
              {uploadError && <div className="mt-3 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">{uploadError}</div>}
            </div>
          </div>

          {/* LOGS */}
          <div className="bg-slate-900 rounded-xl p-4 font-mono text-sm text-green-400 h-[500px] overflow-y-auto shadow-inner flex flex-col">
            <div className="flex justify-between border-b border-slate-700 pb-2 mb-2">
              <span className="text-white font-bold">System Logs</span>
              {isTraining && <span className="animate-pulse text-green-400">● Training</span>}
            </div>
            {progress && <div className="mb-4 p-2 bg-slate-800 rounded text-yellow-400 border border-slate-700">Epoch {progress.epoch} | Loss: {progress.loss.toFixed(6)}</div>}
            <div className="space-y-1 flex-1 overflow-y-auto">
              {trainingLogs.length === 0 && !isTraining && <div className="text-slate-600 italic h-full flex items-center justify-center">Ready to train.</div>}
              {trainingLogs.map((log, i) => <div key={i} className="opacity-90 border-l-2 border-green-800 pl-2">{log}</div>)}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}