import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../context/authContext'
import { useNotifications } from '../../context/notificationContext';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine, ReferenceArea 
} from 'recharts';
import { 
  Settings, Play, TrendingUp, AlertCircle, Save, 
  Trash2, Download, Upload, Sliders, Clock, Calendar, Activity, Terminal
} from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import { 
  buildMLPModel, trainMLPModel, predictMLP, 
  saveMLPModel, loadMLPModel, deleteMLPModel
} from '../../utils/mlpModel';
import type { ModelMetadata } from '../../utils/mlpModel';
import { sortData, normalizeData, createSequences, denormalize } from '../../utils/cfoDataPrep';

interface CivilStatusForecastProps {
  data: any[];
}

// Interface for our structured logs
interface TrainingLogEntry {
  epoch: number | string;
  loss: number;
  mae: number;
  accuracy: string;
  type?: 'info' | 'winner' | 'record'; 
  message?: string; 
}

export default function CivilStatusForecast({ data }: CivilStatusForecastProps) {
  const { isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState<'view' | 'train'>('view');
  
  // Model State
  const [model, setModel] = useState<any>(null);
  const [metadata, setMetadata] = useState<ModelMetadata | any>(null);
  const [forecastData, setForecastData] = useState<any[]>([]);
  
  // Training State
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  
  // --- SETTINGS ---
  const [lookback, setLookback] = useState<number>(3); 
  const [epochs, setEpochs] = useState<number>(200); 
  const [predictionHorizon, setPredictionHorizon] = useState<number>(10); 
  
  const [isTraining, setIsTraining] = useState(false);
  const [trainingLogs, setTrainingLogs] = useState<TrainingLogEntry[]>([]);
  const [progress, setProgress] = useState<{ epoch: number; loss: number; mae: number; accuracy: string } | null>(null);

  // Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { addNotification } = useNotifications()
  const MODEL_NAME = 'civil-status-mlp';

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

  // --- 1. Load Model on Mount ---
  useEffect(() => {
    loadSavedModel();
  }, []);

  const loadSavedModel = async () => {
    const result = await loadMLPModel(MODEL_NAME); 
    if (result) {
      setModel(result.model);
      setMetadata(result.metadata);
      
      // RESTORE UI STATE
      if (result.metadata.hyperparameters) {
          setLookback(result.metadata.hyperparameters.lookback || 3);
      }
      // Restore Logs
      if (result.metadata.trainingHistory) {
          setTrainingLogs(result.metadata.trainingHistory);
      }

      generateForecast(result.model, result.metadata);
    }
  };

  const generateForecast = async (loadedModel: any, meta: any) => {
    if (!loadedModel || !meta || !data.length) return;
    try {
      const targetKey = meta.targetStatus || meta.name; // Fallback
      const modelLookback = meta.hyperparameters?.lookback || meta.lookback || 3; 
      const horizon = predictionHorizon; 

      const cleanData = data.map(d => ({ year: d.YEAR, value: d[targetKey] || 0 }));
      const sorted = sortData(cleanData);
      const { normalized, min, max } = normalizeData(sorted, 'value');

      if (normalized.length < modelLookback) {
        console.warn("Not enough data history for this lookback period");
        return;
      }

      let currentInput = normalized.slice(-modelLookback).map((d: any) => d.normalizedValue);
      const lastYear = sorted[sorted.length - 1].year;
      const futurePredictions = [];

      for (let i = 1; i <= horizon; i++) {
        const inputTensor = [currentInput];
        const pred = await predictMLP(loadedModel, inputTensor);
        const predValue = pred[0];
        const realValue = Math.round(denormalize(predValue, min, max));
        
        futurePredictions.push({
          year: lastYear + i,
          forecast: Math.max(0, realValue),
          history: null 
        });
        currentInput = [...currentInput.slice(1), predValue];
      }

      const history = sorted.map((d, index) => {
        const isLastItem = index === sorted.length - 1;
        return {
          year: d.year,
          history: d.value,
          forecast: isLastItem ? d.value : null 
        };
      });

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
      const trainingLookback = lookback; 

      const cleanData = data.map(d => ({ year: d.YEAR, value: d[targetKey] || 0 }));
      const sorted = sortData(cleanData);
      const { normalized, min, max } = normalizeData(sorted, 'value');

      if (normalized.length <= trainingLookback + 1) {
          throw new Error(`Data too short (${normalized.length} rows) for lookback of ${trainingLookback}.`);
      }

      const { X, y } = createSequences(normalized, trainingLookback);

      // --- 🏆 HYPERPARAMETER TUNING ---
      addNotification("Auto-Tuning", "Testing architectures...", "info");
      setTrainingLogs(prev => [{ epoch: '-', loss: 0, mae: 0, accuracy: '', type: 'info', message: '--- STARTING ARCHITECTURE SEARCH ---' }]);

      const candidates = [
        { name: 'Speed', units: 32 },
        { name: 'Balanced', units: 64 },
        { name: 'Deep', units: 128 }
      ];

      let bestConfig = candidates[0];
      let lowestLoss = Infinity;

      for (const config of candidates) {
        const tempModel = buildMLPModel(trainingLookback, config.units); 
        let finalLoss = 0;
        
        await trainMLPModel(tempModel, X, y, (_, logs) => {
            finalLoss = logs.loss;
        }, 15); // Short sprint

        setTrainingLogs(prev => [{
            epoch: 'TEST',
            loss: finalLoss,
            mae: 0,
            accuracy: '-',
            type: 'info',
            message: `Tested ${config.name}: Loss ${finalLoss.toFixed(4)}`
        }, ...prev]);

        if (finalLoss < lowestLoss) {
          lowestLoss = finalLoss;
          bestConfig = config;
        }
        tempModel.dispose();
      }

      setTrainingLogs(prev => [{ epoch: '-', loss: 0, mae: 0, accuracy: '', type: 'winner', message: `🏆 WINNER: ${bestConfig.name} Model` }, ...prev]);

      // 2. Build the WINNER Model
      const newModel = buildMLPModel(trainingLookback, bestConfig.units);

      // 3. Train for Real
      setTrainingLogs(prev => [{ epoch: '-', loss: 0, mae: 0, accuracy: '', type: 'info', message: '--- STARTING FULL TRAINING ---' }, ...prev]);
      
      // We use a temp array to capture logs for saving later
      let currentSessionLogs: TrainingLogEntry[] = [];

      await trainMLPModel(newModel, X, y, (epoch: number, logs: any) => {
        
        const acc = logs.accuracy || "0.00";
        const currentMAE = logs.mae || 0;
        const currentLoss = logs.loss || 0;

        const logEntry: TrainingLogEntry = {
             epoch: epoch + 1,
             loss: currentLoss,
             mae: currentMAE,
             accuracy: acc
        };

        setProgress({
          epoch: epoch + 1,
          loss: currentLoss,
          mae: currentMAE,
          accuracy: acc
        });
        currentSessionLogs.push(logEntry);

        // Update UI every 5 epochs to save render cycles
        if ((epoch + 1) % 5 === 0 || epoch === 0) { 
          setTrainingLogs(prev => [logEntry, ...prev]);
        }

      }, epochs); 

      // 4. Save & Finalize
      const newMetadata = {
        name: MODEL_NAME,
        targetStatus: targetKey,
        hyperparameters: {
            units: bestConfig.units,
            learningRate: 0.001,
            lookback: trainingLookback
        },
        min,
        max,
        trainingHistory: currentSessionLogs.map(log => ({
            epoch: typeof log.epoch === 'string' ? parseInt(log.epoch) : log.epoch,
            loss: log.loss,
            mae: log.mae,
            accuracy: log.accuracy
        })),
        totalEpochsTrained: epochs,
        lastUpdated: new Date().toISOString()
      };

      // Save to Local Storage
      await saveMLPModel(newModel, newMetadata, 'local');
      
      setModel(newModel);
      setMetadata(newMetadata);
      setActiveTab('view');
      generateForecast(newModel, newMetadata);

      addNotification("Training Complete", "Model saved locally.", "success");

    } catch (error: any) {
      console.error("Training Error:", error);
      addNotification("Training Failed", error.message, "error");
    } finally {
      setIsTraining(false);
    }
  };

  // --- DELETE ---
  const handleDeleteModel = async () => {
    if (confirm("Delete model and all training history?")) {
      await deleteMLPModel(MODEL_NAME);
      setModel(null);
      setMetadata(null);
      setForecastData([]);
      setTrainingLogs([]); // Clear Logs
      setProgress(null);   // Clear Progress
      addNotification("Deleted", "Model removed from storage.", "info");
    }
  };

  // --- EXPORT ---
  const handleDownloadModel = async () => {
    if (!model || !metadata) return;
    // Use the utility to download zip/files
    await saveMLPModel(model, metadata, 'download');
    addNotification("Exporting", "Downloading model files...", "success");
  };

  // --- IMPORT ---
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
      // 1. Load Model into Memory
      const loadedModel = await tf.loadLayersModel(tf.io.browserFiles([modelJsonFile, weightsFile])) as any;
      let loadedMetadata = null;
      
      // 2. Load Metadata
      if (metadataFile) {
        const text = await (metadataFile as File).text();
        loadedMetadata = JSON.parse(text);
      } else {
        // Fallback if user lost the metadata file
        const manualInput = prompt("Metadata missing. Enter Target Target (e.g. Single):");
        if (!manualInput) throw new Error("Metadata required.");
        loadedMetadata = { targetStatus: manualInput, lookback: 3, predictionHorizon: 10, min: 0, max: 1000, trainingHistory: [] };
      }

      // 3. Save to Local Storage Immediately (Persistence)
      await saveMLPModel(loadedModel, loadedMetadata, 'local');

      // 4. Update UI
      setModel(loadedModel);
      setMetadata(loadedMetadata);
      
      if (loadedMetadata.hyperparameters?.lookback) setLookback(loadedMetadata.hyperparameters.lookback);
      if (loadedMetadata.trainingHistory) setTrainingLogs(loadedMetadata.trainingHistory);

      if (fileInputRef.current) fileInputRef.current.value = "";
      setActiveTab('view');
      generateForecast(loadedModel, loadedMetadata);
      addNotification("Import Success", "Model restored from files.", "success");

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
            {metadata ? `Active: ${metadata.targetStatus || metadata.name} (Acc: ${metadata.trainingHistory?.[metadata.trainingHistory.length-1]?.accuracy || '?'}%)` : 'No model loaded'}
          </p>
        </div>
        
        <div className="flex bg-amber-50 rounded-lg p-1 border border-amber-200">
          <button onClick={() => setActiveTab('view')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'view' ? 'bg-amber-500 text-white shadow' : 'text-amber-800 hover:bg-amber-100'}`}>Forecast View</button>
          
          {isAuthenticated && (
            <button onClick={() => setActiveTab('train')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'train' ? 'bg-amber-500 text-white shadow' : 'text-amber-800 hover:bg-amber-100'}`}>
              <Settings className="w-4 h-4" /> Manager
            </button>
          )}
        </div>
      </div>

      {/* VIEW TAB */}
      {activeTab === 'view' && (
        <div className="animate-in fade-in duration-500">
          {!model ? (
            <div className="flex flex-col items-center justify-center h-80 bg-amber-50/50 rounded-xl border-2 border-dashed border-amber-200">
              <AlertCircle className="w-12 h-12 text-amber-400 mb-2" />
              <h4 className="text-lg font-semibold text-amber-900">No Model Loaded</h4>
              <p className="text-amber-700/70 mb-4">
                {isAuthenticated ? 'Train or import a model to see predictions.' : 'No forecast data available currently.'}
              </p>
              {isAuthenticated && (
                <button onClick={() => setActiveTab('train')} className="px-6 py-2 bg-amber-600 text-white rounded-lg">Go to Manager</button>
              )}
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
                  
                  {/* Forecast Background Area */}
                  {forecastData.length > 0 && (
                    <ReferenceArea 
                      x1={forecastData.find(d => d.forecast !== null && d.history !== null)?.year} 
                      x2={forecastData[forecastData.length - 1].year} 
                      strokeOpacity={0}
                      fill="#fffbeb" 
                    />
                  )}
                   {/* Vertical Line */}
                   {forecastData.length > 0 && (
                    <ReferenceLine 
                      x={forecastData.find(d => d.forecast !== null && d.history !== null)?.year} 
                      stroke="#d97706" 
                      strokeDasharray="3 3"
                      label={{ position: 'top', value: 'Forecast Starts', fill: '#d97706', fontSize: 12 }} 
                    />
                  )}

                  <Line type="monotone" dataKey="history" name="Actual History" stroke="#d97706" strokeWidth={3} dot={{ r: 4, fill: '#d97706' }} connectNulls />
                  <Line type="monotone" dataKey="forecast" name="AI Prediction" stroke="#d97706" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, fill: '#fff', stroke: '#d97706', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
              <p className="mt-2 text-xs text-center text-amber-800/50">
                Model: MLP | Lookback: {metadata.hyperparameters?.lookback || 3} Years | Last Updated: {new Date(metadata.lastUpdated || metadata.trainedAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TRAIN / MANAGE TAB */}
      {activeTab === 'train' && isAuthenticated && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-right duration-300">

          <div className="space-y-8">
            {/* TRAINING CONFIG CARD */}
            <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
              <h4 className="font-bold text-amber-900 mb-4 flex items-center gap-2">
                <Play className="w-4 h-4" /> Train Configuration
              </h4>
              
              <div className="space-y-4 mb-6">
                {/* Target */}
                <div>
                    <label className="block text-sm font-bold text-amber-800 mb-1">Target Attribute</label>
                    <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full p-3 border border-amber-200 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 outline-none">
                    {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>

                {/* Lookback */}
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-bold text-amber-800 flex items-center gap-2">
                            <Sliders className="w-3 h-3"/> Lookback Period
                        </label>
                        <span className="text-xs font-mono bg-amber-200 text-amber-900 px-2 py-0.5 rounded">{lookback} Years</span>
                    </div>
                    <input type="range" min="2" max="8" step="1" value={lookback} onChange={(e) => setLookback(Number(e.target.value))} className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"/>
                </div>

                {/* Advanced */}
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-amber-200">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-amber-800 flex items-center gap-1"><Clock className="w-3 h-3"/> Epochs</label>
                      <span className="text-xs font-mono text-amber-700">{epochs}</span>
                    </div>
                    <input type="range" min="50" max="500" step="50" value={epochs} onChange={(e) => setEpochs(Number(e.target.value))} className="w-full h-1.5 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"/>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-amber-800 flex items-center gap-1"><Calendar className="w-3 h-3"/> Predict</label>
                      <span className="text-xs font-mono text-amber-700">{predictionHorizon} Yrs</span>
                    </div>
                    <input type="range" min="1" max="10" step="1" value={predictionHorizon} onChange={(e) => setPredictionHorizon(Number(e.target.value))} className="w-full h-1.5 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"/>
                  </div>
                </div>
              </div>

              <button onClick={handleTrain} disabled={isTraining} className={`w-full py-3 rounded-lg font-bold text-white shadow-lg flex justify-center items-center gap-2 transition-all ${isTraining ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700'}`}>
                {isTraining ? 'Training Model...' : 'Start Training'}
              </button>
            </div>

            {/* STORAGE CARD */}
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

          {/* LOGS PANEL */}
          <div className="bg-slate-900 rounded-xl p-4 font-mono text-sm text-green-400 h-[550px] overflow-hidden shadow-inner flex flex-col border border-slate-800">
            <div className="flex justify-between border-b border-slate-700 pb-2 mb-2">
              <span className="text-white font-bold flex items-center gap-2">
                <Terminal className="w-4 h-4" /> Neural Network Logs
              </span>
              {isTraining && <span className="animate-pulse text-green-400 flex items-center gap-1"><Activity className="w-3 h-3"/> Training</span>}
            </div>
            
            {/* REAL-TIME PROGRESS BOX */}
            {progress && (
              <div className="mb-4 p-3 bg-slate-800 rounded border border-slate-700 shadow-lg">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Model Confidence (Accuracy)</span>
                    <span className="text-white font-bold">{progress.accuracy}%</span>
                </div>
                
                {/* ACCURACY BAR */}
                <div className="w-full bg-slate-700 h-2 rounded-full mb-3 overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300"
                        style={{ width: `${Math.min(100, Number(progress.accuracy))}%` }}
                    />
                </div>

                <div className="flex justify-between items-center text-xs border-t border-slate-700 pt-2">
                    <div className="text-center">
                        <div className="text-slate-500">Epoch</div>
                        <div className="text-yellow-500 font-bold text-lg">{progress.epoch}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-slate-500">Loss</div>
                        <div className="text-red-400">{progress.loss.toFixed(4)}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-slate-500">MAE</div>
                        <div className="text-blue-400 font-bold">{progress.mae.toFixed(4)}</div>
                    </div>
                </div>
              </div>
            )}

            {/* SCROLLING TABLE FOR LOGS */}
            <div className="flex-1 overflow-y-auto font-mono text-xs custom-scrollbar">
              {trainingLogs.length === 0 && !isTraining && (
                <div className="text-slate-600 italic h-full flex items-center justify-center">System Ready. Initiate Training.</div>
              )}
              
              {trainingLogs.length > 0 && (
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-900 text-slate-500 border-b border-slate-700">
                        <tr>
                            <th className="py-2 pl-2 w-16">Epoch</th>
                            <th className="py-2">Loss</th>
                            <th className="py-2">MAE</th>
                            <th className="py-2 text-right pr-2">Acc %</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trainingLogs.map((log, i) => {
                            // If it's a message row (Info/Winner)
                            if (log.message) {
                                const colorClass = log.type === 'winner' ? 'text-yellow-400 font-bold border-y border-yellow-900 bg-yellow-900/20' : 'text-slate-400 italic';
                                return (
                                    <tr key={i} className={colorClass}>
                                        <td colSpan={4} className="py-2 pl-2">{log.message}</td>
                                    </tr>
                                )
                            }
                            // If it's a data row
                            return (
                                <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                                    <td className="py-2 pl-2 text-slate-300">{log.epoch}</td>
                                    <td className="py-2 text-red-300">{log.loss?.toFixed(5)}</td>
                                    <td className="py-2 text-blue-300">{log.mae?.toFixed(5)}</td>
                                    <td className="py-2 text-right pr-2 text-green-300">{log.accuracy}%</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}