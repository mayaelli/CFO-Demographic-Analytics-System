import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useMemo, useRef } from 'react'
import { useAuth } from '../context/authContext'
import { 
  Users, TrendingUp, Calendar, ArrowUpRight, 
  Table as TableIcon, UploadCloud, LineChart as LineChartIcon, Save, X, Edit2, Trash2, AlertCircle, CheckCircle2, FileUp, FileSpreadsheet 
} from 'lucide-react'

// Hooks & Components
import LoadingScreen from '../components/loadingScreen'
import OriginCharts from '../components/charts/originCharts'
import { useParseOriginData } from '../hooks/useParseOriginData'
import { useIsMobile } from '../hooks/useIsMobile'
import { COLUMN_ORDERS } from '../utils/columnOrders'

// --- MOCK API SERVICES ---
const getAllOriginData = async () => [] 
const updateOriginData = async (year: number, data: any) => { console.log(year, data) }
const deleteOriginData = async (year: number) => { console.log(year) }
const uploadOriginData = async (file: File) => { return { message: "File uploaded" } }


export const Route = createFileRoute('/originDataCategory')({
  component: OriginCategory,
})

// --- SUB-COMPONENT: DATA TABLE ---
const OriginDataTable = () => {
  const { isAuthenticated } = useAuth()
  const { chartData: initialData } = useParseOriginData() // Using hook data for initial display
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [editingYear, setEditingYear] = useState<number | null>(null)
  const [editFormData, setEditFormData] = useState<any | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Load data (Simulated fetch)
  useEffect(() => {
    if (initialData.length > 0) setData(initialData.sort((a, b) => b.YEAR - a.YEAR))
  }, [initialData])

  const handleEdit = (item: any) => {
    setEditingYear(item.YEAR)
    setEditFormData({ ...item })
    setMessage(null)
  }

  const handleCancelEdit = () => {
    setEditingYear(null)
    setEditFormData(null)
    setMessage(null)
  }

  const handleFieldChange = (field: string, value: string) => {
    setEditFormData((prev: any) => ({ ...prev, [field]: parseFloat(value) || 0 }))
  }

  const handleSaveEdit = async () => {
    if (!editFormData || editingYear === null) return
    setLoading(true)
    try {
      await updateOriginData(editingYear, editFormData)
      // Optimistic update for UI
      setData(prev => prev.map(row => row.YEAR === editingYear ? editFormData : row))
      setMessage({ type: 'success', text: `Year ${editingYear} updated successfully.` })
      handleCancelEdit()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save changes.' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (year: number) => {
    if (!confirm(`Are you sure you want to delete data for Year ${year}?`)) return
    setLoading(true)
    try {
      await deleteOriginData(year)
      setData(prev => prev.filter(item => item.YEAR !== year))
      setMessage({ type: 'success', text: `Data for ${year} deleted.` })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete.' })
    } finally {
      setLoading(false)
    }
  }

  // Use Region Columns
  const columns = COLUMN_ORDERS['region'] || []

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border-2 border-amber-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="p-6 border-b border-amber-200 flex justify-between items-center bg-amber-50/50">
        <h3 className="text-xl font-bold text-amber-900 flex items-center gap-2">
          <TableIcon className="text-amber-600" /> Manage Regional Data
        </h3>
        {message && (
          <div className={`text-sm px-3 py-1 rounded-full flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <AlertCircle size={14} /> {message.text}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[600px]">
        <table className="w-full text-sm text-left">
          <thead className="bg-amber-100/50 text-amber-900 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-4 py-3 font-bold border-b border-amber-200 w-24">Year</th>
              {columns.map(col => (
              
                <th key={col} className="px-4 py-3 font-semibold border-b border-amber-200 min-w-[100px] whitespace-nowrap">
                  {col}
                </th>

              ))}
            {isAuthenticated && (
              <th className="px-4 py-3 font-bold border-b border-amber-200 text-center w-32 sticky right-0 bg-amber-100">Actions</th>
            )}
              </tr>
          </thead>
          <tbody className="divide-y divide-amber-100">
            {data.map((row) => {
              const isEditing = editingYear === row.YEAR
              return (
                <tr key={row.YEAR} className={`hover:bg-amber-50/60 transition-colors ${isEditing ? 'bg-amber-50' : ''}`}>
                  <td className="px-4 py-3 font-bold text-amber-900">{row.YEAR}</td>
                  {columns.map(col => (
                    <td key={col} className="px-4 py-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editFormData[col]}
                          onChange={(e) => handleFieldChange(col, e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-amber-300 rounded focus:ring-2 focus:ring-amber-400 focus:outline-none text-amber-900"
                        />
                      ) : (
                        <span className="text-amber-800">{row[col]?.toLocaleString() || 0}</span>
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-2 sticky right-0 bg-white/50 backdrop-blur-sm">
                    <div className="flex justify-center gap-2">
                      {isEditing ? (
                        <>
                          <button onClick={handleSaveEdit} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200"><Save size={16} /></button>
                          <button onClick={handleCancelEdit} className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"><X size={16} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(row)} className="p-1.5 text-amber-600 hover:bg-amber-100 rounded transition-colors"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(row.YEAR)} className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded transition-colors"><Trash2 size={16} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// --- SUB-COMPONENT: UPLOAD ---
const OriginUpload = () => {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    try {
      await uploadOriginData(file)
      setMessage({ type: 'success', text: 'Origin data uploaded successfully!' })
      setFile(null)
    } catch (e) {
      setMessage({ type: 'error', text: 'Upload failed.' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-lg p-8 md:p-12 rounded-2xl shadow-xl border-2 border-amber-200 min-h-[500px] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-amber-100 p-5 rounded-full mb-6 shadow-inner">
        <UploadCloud size={48} className="text-amber-600" />
      </div>
      <h3 className="text-2xl font-bold text-amber-950 mb-3">Upload Regional Data</h3>
      <p className="text-amber-800/60 max-w-md mb-8 text-sm md:text-base leading-relaxed">
        Upload a CSV containing columns for Philippine Regions (e.g., NCR, Region I, CAR).
      </p>
      
      <div className="w-full max-w-lg space-y-4">
        <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" ref={fileInputRef} />
        {!file ? (
          <button onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-amber-300 hover:border-amber-500 hover:bg-amber-50 rounded-xl p-8 transition-all group flex flex-col items-center gap-3">
             <FileUp className="text-amber-400 group-hover:text-amber-600" size={32} />
             <span className="text-amber-700 font-semibold">Click to Select CSV</span>
          </button>
        ) : (
          <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <FileSpreadsheet className="text-green-600 shrink-0" size={24} />
              <span className="text-amber-900 font-medium truncate">{file.name}</span>
            </div>
            <button onClick={() => setFile(null)} className="text-amber-400 hover:text-red-500"><X size={20} /></button>
          </div>
        )}
        <button onClick={handleUpload} disabled={!file || uploading} className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${!file ? 'bg-gray-200 text-gray-400' : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600'}`}>
          {uploading ? 'Uploading...' : 'Upload Data'}
        </button>
        {message && (
          <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 text-left text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message.type === 'success' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>} {message.text}
          </div>
        )}
      </div>
    </div>
  )
}

const OriginForecasting = () => (
  <div className="bg-white/80 p-8 rounded-2xl border-2 border-amber-200 shadow-xl min-h-[400px]">
    <h3 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2"><LineChartIcon className="text-amber-600" /> Regional Predictions</h3>
    <p className="text-amber-800/60">Forecasting models for regional migration trends will appear here...</p>
  </div>
)

// --- MAIN COMPONENT ---
const TABS = [
  { id: 'charts', label: 'Charts', restricted: false },
  { id: 'table', label: 'Data Table', restricted: false },
  { id: 'upload', label: 'Upload', restricted: true },
  { id: 'forecasting', label: 'Forecasting', restricted: false },
]

function OriginCategory() {
  const { isAuthenticated } = useAuth()
  const { chartData, regions, loading } = useParseOriginData()
  const isMobile = useIsMobile()
  
  // State
  const [activeView, setActiveView] = useState('charts')

  // Helper to extract region shorthand for display
  const getRegionShorthand = (fullRegion: string): string => {
    const acronymMatch = fullRegion.match(/\(([A-Z]+)\)/)
    if (acronymMatch) return acronymMatch[1]
    const regionMatch = fullRegion.match(/^Region\s+(I+|[IVX]+|[A-Z]+)\s*(-|–)/)
    if (regionMatch) return `Region ${regionMatch[1]}`
    if (fullRegion.includes('Region IV A')) return 'Region IV-A'
    if (fullRegion.includes('Region IV B')) return 'Region IV-B'    
    return fullRegion
  }

  // Stats Logic (Global Summary)
  const computedStats = useMemo(() => {
    if (!chartData || chartData.length === 0 || regions.length === 0) return null
    
    // Helper to sum a specific key across all rows
    const sumKey = (data: any[], key: string) => data.reduce((acc, curr) => acc + (Number(curr[key]) || 0), 0)

    // 1. Total Volume (Sum of all regions over all years)
    const totalVolume = chartData.reduce((acc, row) => {
      let rowSum = 0;
      regions.forEach(r => rowSum += (Number(row[r]) || 0));
      return acc + rowSum;
    }, 0);

    // 2. Top Region (Highest total accumulated emigrants)
    let maxRegion = ''
    let maxRegionVal = 0
    regions.forEach(region => {
         const regionTotal = sumKey(chartData, region)
         if(regionTotal > maxRegionVal) { maxRegionVal = regionTotal; maxRegion = region; }
    })

    // 3. Peak Year (Year with highest total emigration)
    let peakYear = ''
    let peakYearVal = 0
    chartData.forEach(row => {
      let rowTotal = 0
      regions.forEach(r => rowTotal += (Number(row[r]) || 0))
      if(rowTotal > peakYearVal) { peakYearVal = rowTotal; peakYear = String(row.YEAR); }
    })

    return [
      { label: 'Total Emigrants', value: totalVolume.toLocaleString(), sub: 'All Years (1988 - 2020)', icon: Users },
      { label: 'Top Region', value: getRegionShorthand(maxRegion), sub: `${maxRegionVal.toLocaleString()} total`, icon: TrendingUp },
      { label: 'Peak Year', value: peakYear, sub: `${peakYearVal.toLocaleString()} emigrants`, icon: Calendar }
    ]
  }, [chartData, regions])

  if (loading) return <LoadingScreen />

  return (
    <div className="min-h-screen w-full bg-[#FFFBF5] p-4 md:p-8 lg:p-12 space-y-8 font-sans">
      
      {/* Header */}
      <header className="space-y-2 max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-amber-950 tracking-tight">
          Regional Origin Analysis
        </h1>
        <p className="text-amber-900/60 font-medium text-lg max-w-2xl">
          Explore the distribution of Filipino emigrants based on their region of origin in the Philippines.
        </p>
      </header>

      {/* Tabs */}
      <div className="sticky top-0 z-30 bg-[#FFFBF5]/95 backdrop-blur-sm border-b border-amber-200/60 max-w-7xl mx-auto mb-6">
        <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
          
          {/* FILTER ADDED HERE */}
          {TABS.filter(tab => !tab.restricted || isAuthenticated).map((tab) => {
            const isActive = activeView === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`group relative py-4 text-sm font-bold uppercase tracking-wider transition-colors duration-300 whitespace-nowrap ${isActive ? 'text-amber-800' : 'text-amber-800/40 hover:text-amber-700'}`}
              >
                {tab.label}
                <span className={`absolute bottom-0 left-0 h-[3px] bg-amber-600 rounded-full transition-all duration-300 ${isActive ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-1/2 group-hover:opacity-30'}`} />
              </button>
            )
          })}
          
        </div>
      </div>
      

      {/* Main Content Grid */}
      <main className="grid grid-cols-1 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
        
        {/* RIGHT COLUMN (Stats - Global Summary) */}
        <div className="xl:col-span-1 order-1 xl:order-2 space-y-4">
          <h3 className="text-amber-950 font-bold text-lg uppercase tracking-wider opacity-80 mb-4 hidden xl:block">Quick Insights</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-4">
             {computedStats ? computedStats.map((stat) => (
               <div key={stat.label} className="bg-white/60 hover:bg-white/80 backdrop-blur-md border border-amber-200/50 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group">
                 <div className="flex items-start justify-between mb-2">
                   <div className="p-2 bg-amber-100/50 rounded-lg text-amber-700 group-hover:bg-amber-100 group-hover:text-amber-800"><stat.icon size={20} strokeWidth={2} /></div>
                   <ArrowUpRight className="text-amber-300 group-hover:text-amber-500" size={16} />
                 </div>
                 <div className="space-y-1">
                   <p className="text-amber-900/50 text-xs font-bold uppercase tracking-wide">{stat.label}</p>
                   <p className="text-2xl font-bold text-amber-950 truncate">{stat.value}</p>
                   <p className="text-xs text-amber-700 font-medium truncate">{stat.sub}</p>
                 </div>
               </div>
             )) : [1,2,3].map(i => <div key={i} className="animate-pulse bg-amber-900/5 h-24 rounded-xl"></div>)}
          </div>
        </div>

        {/* LEFT COLUMN (Active View Content) */}
        <div className="xl:col-span-3 order-2 xl:order-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {activeView === 'charts' && <OriginCharts />}
           {activeView === 'table' && <OriginDataTable />}
           {activeView === 'upload' && <OriginUpload />}
           {activeView === 'forecasting' && <OriginForecasting />}
        </div>
      </main>
    </div>
  )
}