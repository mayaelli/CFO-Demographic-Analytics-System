import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo, useEffect, useRef } from 'react'
import { useAuth } from '../context/authContext'
import { 
  Users, Calendar, ArrowUpRight, 
  Table as TableIcon, UploadCloud, Save, X, Edit2, Trash2, 
  AlertCircle, FileSpreadsheet, CheckCircle2, FileUp, HeartHandshake
} from 'lucide-react'
import CivilStatusForecast from '@/components/forecast/CivilStatusForecast'

// --- CUSTOM HOOKS & UTILS ---
import { useParseCivilStatusData } from '../hooks/useParseCivilStatusData'
import { COLUMN_ORDERS } from '../utils/columnOrders'
import LoadingScreen from '../components/loadingScreen'
import CivilStatusCharts from '@/components/charts/civilStatusCharts'

// Assumed API services (Mocking these based on pattern)
import { getAllCivilStatusData, updateCivilStatusData, deleteCivilStatusData } from '../api/civilStatusService'

// --- 1. SPECIALIZED UPLOAD COMPONENT ---
const CivilStatusUpload = () => {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setMessage(null)
    try {
      const response = await uploadCivilStatusData(file)
      setMessage({ type: 'success', text: response.message || 'Civil Status data uploaded successfully!' })
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Upload failed.' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-lg p-8 md:p-12 rounded-2xl shadow-xl border-2 border-amber-200 min-h-[500px] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-amber-100 p-5 rounded-full mb-6 shadow-inner">
        <UploadCloud size={48} className="text-amber-600" />
      </div>
      <h3 className="text-2xl font-bold text-amber-950 mb-3">Upload Civil Status Data</h3>
      <p className="text-amber-800/60 max-w-md mb-8 text-sm md:text-base">
        Upload a CSV containing civil status demographics.<br/>
        <span className="text-xs font-mono bg-amber-50 px-2 py-1 rounded mt-2 inline-block border border-amber-100">
            Required: Year, Single, Married, Widowed, Separated, Divorced
        </span>
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
            <div className="flex items-center gap-3"><FileSpreadsheet className="text-green-600" size={24} /><span className="text-amber-900 font-medium truncate">{file.name}</span></div>
            <button onClick={() => setFile(null)}><X size={20} className="text-amber-400 hover:text-red-500" /></button>
          </div>
        )}
        <button onClick={handleUpload} disabled={!file || uploading} className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${!file || uploading ? 'bg-gray-200 text-gray-400' : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:scale-[1.01]'}`}>
          {uploading ? 'Uploading...' : <><UploadCloud size={20} /> Upload Data</>}
        </button>
        {message && <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'} border`}>{message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}{message.text}</div>}
      </div>
    </div>
  )
}

// --- 2. DATA TABLE COMPONENT ---
const CivilStatusDataTable = () => {
  const { isAuthenticated } = useAuth()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [editingYear, setEditingYear] = useState<number | null>(null)
  const [editFormData, setEditFormData] = useState<any | null>(null)

  const loadData = async () => {
  setLoading(true)
  try {
    const result = await getAllCivilStatusData()
    
    // Normalize keys: Create a new array where we ensure 'YEAR' exists
    const normalized = result.map((item: any) => ({
      ...item,
      YEAR: item.YEAR || item.year || item.Year // Standardize to uppercase YEAR
    }))

    // Now sort using the guaranteed YEAR property
    setData(normalized.sort((a: any, b: any) => b.YEAR - a.YEAR))
  } catch (e) { 
    console.error(e) 
  } finally { 
    setLoading(false) 
  }
}

  useEffect(() => { loadData() }, [])

  const handleSave = async () => {
    if (!editFormData) return
    const { YEAR, ...updates } = editFormData
    await updateCivilStatusData(YEAR, updates)
    setEditingYear(null)
    loadData()
  }

  const handleDelete = async (year: number) => {
    if (confirm(`Delete data for ${year}?`)) {
      await deleteCivilStatusData(year)
      loadData()
    }
  }

  const columns = COLUMN_ORDERS.civilStatus

  if (loading && data.length === 0) return <LoadingScreen />

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border-2 border-amber-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
      <div className="p-6 border-b border-amber-200 bg-amber-50/50 flex justify-between"><h3 className="text-xl font-bold text-amber-900 flex gap-2"><TableIcon className="text-amber-600"/> Manage Civil Status Data</h3></div>
      <div className="overflow-x-auto max-h-[600px]">
        <table className="w-full text-sm text-left">
          <thead className="bg-amber-100/50 text-amber-900 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 font-bold border-b border-amber-200 min-w-[80px]">Year</th>
              
              {columns.map(col => <th key={col} className="px-4 py-3 font-semibold border-b border-amber-200 min-w-[150px]">{col}</th>)}
              {isAuthenticated && (
              <th className="px-4 py-3 font-bold border-b border-amber-200 text-center sticky right-0 bg-amber-50/90 backdrop-blur-sm">Actions</th>
              )}
              </tr>
          </thead>
          <tbody className="divide-y divide-amber-100">
            {data.map((row) => {
              const isEditing = editingYear === row.YEAR
              return (
                <tr key={row.YEAR} className="hover:bg-amber-50/60">
                  <td className="px-4 py-3 font-bold text-amber-900">{row.YEAR || row.year || row.Year}</td>
                  {columns.map(col => (
                    <td key={col} className="px-4 py-2">
                      {isEditing ? (
                        <input type="number" value={editFormData[col]} onChange={e => setEditFormData({...editFormData, [col]: +e.target.value})} className="w-full px-2 py-1 border border-amber-300 rounded focus:ring-2 focus:ring-amber-400" />
                      ) : <span className="text-amber-800">{row[col]?.toLocaleString() || 0}</span>}
                    </td>
                  ))}
                  <td className="px-4 py-2 flex justify-center gap-2 sticky right-0 bg-white/50 backdrop-blur-sm border-l border-amber-100">
                    {isEditing ? (
                      <><button onClick={handleSave} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200"><Save size={16}/></button><button onClick={() => setEditingYear(null)} className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"><X size={16}/></button></>
                    ) : (
                      <><button onClick={() => {setEditingYear(row.YEAR); setEditFormData({...row})}} className="p-1.5 text-amber-600 hover:bg-amber-100 rounded"><Edit2 size={16}/></button><button onClick={() => handleDelete(row.YEAR)} className="p-1.5 text-red-400 hover:bg-red-50 rounded"><Trash2 size={16}/></button></>
                    )}
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



// --- MAIN PAGE COMPONENT ---
export const Route = createFileRoute('/civilstatusDataCategory')({
  component: CivilStatusDistribution,
})

const TABS = [
  { id: 'charts', label: 'Charts', restricted: false },
  { id: 'table', label: 'Data Table', restricted: false },
  { id: 'upload', label: 'Upload', restricted: true },
  { id: 'forecasting', label: 'Forecasting', restricted: false },
]

function CivilStatusDistribution() {
  const { isAuthenticated } = useAuth()
  const { chartData, loading, error } = useParseCivilStatusData()
  const [activeView, setActiveView] = useState('charts')

  // Calculate Statistics dynamically
  const stats = useMemo(() => {
    if (!chartData || chartData.length === 0) return null

    // 1. Total Analyzed
    let grandTotal = 0
    // 2. Dominant Status
    const statusTotals: Record<string, number> = {}
    
    chartData.forEach(row => {
        COLUMN_ORDERS.civilStatus.forEach(status => {
            const val = Number(row[status]) || 0
            grandTotal += val
            statusTotals[status] = (statusTotals[status] || 0) + val
        })
    })

    const dominantStatus = Object.entries(statusTotals).reduce((a, b) => a[1] > b[1] ? a : b)[0]
    const dominantPercent = ((statusTotals[dominantStatus] / grandTotal) * 100).toFixed(1)

    // 3. Peak Year
    let peakYear = ''
    let peakVal = 0
    chartData.forEach(row => {
        const yearTotal = COLUMN_ORDERS.civilStatus.reduce((acc, status) => acc + (Number(row[status]) || 0), 0)
        if (yearTotal > peakVal) { peakVal = yearTotal; peakYear = String(row.YEAR); }
    })

    return [
      { label: 'Total Analyzed', value: grandTotal.toLocaleString(), sub: '1988 - 2020', icon: Users },
      { label: 'Dominant Status', value: dominantStatus, sub: `${dominantPercent}% of total`, icon: HeartHandshake },
      { label: 'Peak Year', value: peakYear, sub: `${peakVal.toLocaleString()} recorded`, icon: Calendar }
    ]
  }, [chartData])

  if (loading) return <LoadingScreen />
  if (error) return <div className="p-12 text-center text-red-500 font-bold border border-red-200 bg-red-50 rounded-lg m-8">Error loading data: {error}</div>

  return (
    <div className="min-h-screen w-full bg-[#FFFBF5] p-4 md:p-8 lg:p-12 space-y-8 font-sans">
      <header className="space-y-2 max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-amber-950 tracking-tight">Civil Status Distribution</h1>
        <p className="text-amber-900/60 font-medium text-lg max-w-2xl">Analysis of emigrant population by civil status category (Single, Married, etc.).</p>
      </header>

    {/* Tabs */}
      <div className="sticky top-0 z-30 bg-[#FFFBF5]/95 backdrop-blur-sm border-b border-amber-200/60 max-w-7xl mx-auto mb-6">
        <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
          
          {/* CHANGE IS HERE: We filter the tabs before mapping them */}
          {TABS.filter(tab => !tab.restricted || isAuthenticated).map((tab) => (
            
            <button 
              key={tab.id} 
              onClick={() => setActiveView(tab.id)} 
              className={`group relative py-4 text-sm font-bold uppercase tracking-wider transition-colors duration-300 whitespace-nowrap ${activeView === tab.id ? 'text-amber-800' : 'text-amber-800/40 hover:text-amber-700'}`}
            >
              {tab.label}
              <span className={`absolute bottom-0 left-0 h-[3px] bg-amber-600 rounded-full transition-all duration-300 ${activeView === tab.id ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-1/2 group-hover:opacity-30'}`} />
            </button>

          ))}
        </div>
      </div>
      
      <main className="grid grid-cols-1 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {/* Right Sidebar (Stats) */}
        <div className="xl:col-span-1 order-1 xl:order-2 space-y-4">
          <h3 className="text-amber-950 font-bold text-lg uppercase tracking-wider opacity-80 mb-4 hidden xl:block">Quick Insights</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-4">
            {stats ? stats.map((stat) => (
              <div key={stat.label} className="bg-white/60 hover:bg-white/80 backdrop-blur-md border border-amber-200/50 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group">
                <div className="flex items-start justify-between mb-2">
                  <div className="p-2 bg-amber-100/50 rounded-lg text-amber-700 group-hover:bg-amber-100 transition-colors"><stat.icon size={20} /></div>
                  <ArrowUpRight className="text-amber-300 group-hover:text-amber-500 transition-colors" size={16} />
                </div>
                <div className="space-y-1">
                  <p className="text-amber-900/50 text-xs font-bold uppercase tracking-wide">{stat.label}</p>
                  <p className="text-2xl font-bold text-amber-950 truncate">{stat.value}</p>
                  <p className="text-xs text-amber-700 font-medium truncate">{stat.sub}</p>
                </div>
              </div>
            )) : <div className="h-24 bg-amber-900/5 rounded-xl animate-pulse" />}
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="xl:col-span-3 order-2 xl:order-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {activeView === 'charts' && <CivilStatusCharts />}
           {activeView === 'table' && <CivilStatusDataTable />}
           {activeView === 'upload' && <CivilStatusUpload />}
           {activeView === 'forecasting' && <CivilStatusForecast data={chartData} />}
        </div>
      </main>
    </div>
  )
}

async function uploadCivilStatusData(file: File): Promise<{ message: string }> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/civil-status/upload', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to upload file')
  }

  return response.json()
}