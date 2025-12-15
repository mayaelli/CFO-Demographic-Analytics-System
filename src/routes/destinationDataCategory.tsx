import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useMemo, useRef } from 'react'
import { useAuth } from '../context/authContext'
import {
   BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts'
import { 
  Users, TrendingUp, Calendar, ArrowUpRight, BarChart3, 
  Table as TableIcon, UploadCloud, LineChart as LineChartIcon, Save, X, Edit2, Trash2, AlertCircle, CheckCircle2, FileUp, FileSpreadsheet, Globe, Map as MapIcon
} from 'lucide-react'

// Hooks & Components
import LoadingScreen from '../components/loadingScreen'
import ChoroplethMap from '../components/charts/choroplethMap' 
import { useParseMajorDestinationData } from '../hooks/useParseMajorDestinationData'
import { useIsMobile } from '../hooks/useIsMobile'
import { COLUMN_ORDERS } from '../utils/columnOrders'
import DestinationCharts from '@/components/charts/destinationCharts'

// --- MOCK API SERVICES ---
const getAllDestData = async () => [] 
const updateDestData = async (year: number, data: any) => { console.log(year, data) }
const deleteDestData = async (year: number) => { console.log(year) }
const uploadDestData = async (file: File) => { return { message: "File uploaded successfully" } }

export const Route = createFileRoute('/destinationDataCategory')({
  component: DestinationCategory,
})

// --- SUB-COMPONENT: DATA TABLE ---
const DestinationDataTable = () => {
  const { isAuthenticated } = useAuth()
  const { chartData: initialData } = useParseMajorDestinationData()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [editingYear, setEditingYear] = useState<number | null>(null)
  const [editFormData, setEditFormData] = useState<any | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Load Data
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
      await updateDestData(editingYear, editFormData)
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
      await deleteDestData(year)
      setData(prev => prev.filter(item => item.YEAR !== year))
      setMessage({ type: 'success', text: `Data for ${year} deleted.` })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete.' })
    } finally {
      setLoading(false)
    }
  }

  const columns = COLUMN_ORDERS['majorDestination'] || []

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border-2 border-amber-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      <div className="p-6 border-b border-amber-200 flex justify-between items-center bg-amber-50/50">
        <h3 className="text-xl font-bold text-amber-900 flex items-center gap-2">
          <TableIcon className="text-amber-600" /> Manage Destination Data
        </h3>
        {message && (
          <div className={`text-sm px-3 py-1 rounded-full flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <AlertCircle size={14} /> {message.text}
          </div>
        )}
      </div>

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
const DestinationUpload = () => {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    try {
      await uploadDestData(file)
      setMessage({ type: 'success', text: 'Destination data uploaded successfully!' })
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
      <h3 className="text-2xl font-bold text-amber-950 mb-3">Upload Destination Data</h3>
      <p className="text-amber-800/60 max-w-md mb-8 text-sm md:text-base leading-relaxed">
        Upload a CSV containing columns for Major Destination Countries (e.g., USA, Canada, Japan).
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

const DestinationForecasting = () => (
  <div className="bg-white/80 p-8 rounded-2xl border-2 border-amber-200 shadow-xl min-h-[400px]">
    <h3 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2"><LineChartIcon className="text-amber-600" /> Destination Predictions</h3>
    <p className="text-amber-800/60">AI forecasting models for major destination trends will appear here...</p>
  </div>
)

// --- MAIN COMPONENT ---
const TABS = [
  { id: 'charts', label: 'Charts', restricted: false },
  { id: 'table', label: 'Data Table', restricted: false },
  { id: 'upload', label: 'Upload', restricted: true },
  { id: 'forecasting', label: 'Forecasting', restricted: false },
]

function DestinationCategory() {
  const { isAuthenticated } = useAuth()
  const { chartData, barChartData, countries, loading } = useParseMajorDestinationData()
  const isMobile = useIsMobile()
  
  // State
  const [activeView, setActiveView] = useState('charts')
  const [activeChartSubTab, setActiveChartSubTab] = useState<'map' | 'bar' | 'line'>('map')
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState<string>('All Years')

  // Initialize Countries
  useEffect(() => {
    if (countries.length > 0 && selectedCountries.length === 0) setSelectedCountries(countries)
  }, [countries])

  const years = useMemo(() => ['All Years', ...chartData.map(d => d.YEAR)], [chartData])

  // Single Year Data
  const singleYearData = useMemo(() => {
    if (selectedYear === 'All Years') return []
    const yearData = chartData.find(d => String(d.YEAR) === String(selectedYear))
    if (!yearData) return []
    return COLUMN_ORDERS.majorDestination.map(country => ({
      country,
      total: yearData[country] || 0
    }))
  }, [selectedYear, chartData])

  const colors = [
    '#D97706', '#EA580C', '#DC2626', '#B91C1C', '#92400E', '#78350F',
    '#F59E0B', '#FB923C', '#FCA5A5', '#FDBA74', '#FCD34D', '#B45309',
    '#C2410C', '#991B1B'
  ]

  // Stats Logic
  const computedStats = useMemo(() => {
    if (!chartData || chartData.length === 0) return null
    
    let stat1 = { label: 'Total Emigrants', value: '0', sub: 'In selected view', icon: Users }
    let stat2 = { label: 'Top Destination', value: '-', sub: 'Highest volume', icon: Globe }
    let stat3 = { label: 'Peak Year', value: '-', sub: 'Highest recorded', icon: Calendar }

    const sumKey = (data: any[], key: string) => data.reduce((acc, curr) => acc + (Number(curr[key]) || 0), 0)

    if (selectedYear === 'All Years') {
      const totalVolume = chartData.reduce((acc, row) => {
        let rowSum = 0;
        selectedCountries.forEach(c => rowSum += (Number(row[c]) || 0));
        return acc + rowSum;
      }, 0);
      stat1.value = totalVolume.toLocaleString()
      stat1.sub = 'Total (1981 - 2020)'

      let maxCountry = ''
      let maxCountryVal = 0
      selectedCountries.forEach(country => {
         const total = sumKey(chartData, country)
         if(total > maxCountryVal) { maxCountryVal = total; maxCountry = country; }
      })
      stat2.value = maxCountry
      stat2.sub = `${maxCountryVal.toLocaleString()} recorded`

      let peakYear = ''
      let peakYearVal = 0
      chartData.forEach(row => {
        let rowTotal = 0
        selectedCountries.forEach(c => rowTotal += (Number(row[c]) || 0))
        if(rowTotal > peakYearVal) { peakYearVal = rowTotal; peakYear = String(row.YEAR); }
      })
      stat3.value = peakYear
      stat3.sub = `${peakYearVal.toLocaleString()} recorded`

    } else {
      const yearRow = chartData.find(d => String(d.YEAR) === String(selectedYear))
      if(yearRow) {
        let yearTotal = 0
        selectedCountries.forEach(c => yearTotal += (Number(yearRow[c]) || 0))
        stat1.value = yearTotal.toLocaleString()
        stat1.sub = `Total in ${selectedYear}`

        let maxCountry = ''
        let maxCountryVal = 0
        selectedCountries.forEach(c => {
           const val = Number(yearRow[c]) || 0
           if(val > maxCountryVal) { maxCountryVal = val; maxCountry = c; }
        })
        stat2.value = maxCountry
        stat2.sub = `${((maxCountryVal/yearTotal)*100).toFixed(1)}% of total`

        stat3.label = "Yearly Status"
        stat3.value = "Active"
        stat3.sub = "Data verified"
      }
    }

    return [stat1, stat2, stat3]
  }, [chartData, selectedYear, selectedCountries])

  if (loading) return <LoadingScreen />

  return (
    <div className="min-h-screen w-full bg-[#FFFBF5] p-4 md:p-8 lg:p-12 space-y-8 font-sans">
      
      {/* Header */}
      <header className="space-y-2 max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-amber-950 tracking-tight">
          Major Destination Analysis
        </h1>
        <p className="text-amber-900/60 font-medium text-lg max-w-2xl">
          Analyze emigration trends by major destination countries (USA, Canada, etc.) from 1981 to 2020.
        </p>
      </header>

      {/* Tabs */}
      <div className="sticky top-0 z-30 bg-[#FFFBF5]/95 backdrop-blur-sm border-b border-amber-200/60 max-w-7xl mx-auto mb-6">
        <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
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
      
      {/* Main Grid */}
      <main className="grid grid-cols-1 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
        
        {/* Right Column (Stats) */}
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

        {/* Left Column (Content) */}
        <div className="xl:col-span-3 order-2 xl:order-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
           
           {/* CHARTS VIEW */}
           {activeView === 'charts' && (
             <div className="space-y-6">
               {/* Sub-Tabs */}
               <div className="flex flex-wrap gap-4 mb-6">
                 <button onClick={() => setActiveChartSubTab('map')} className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${activeChartSubTab === 'map' ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20' : 'bg-white text-amber-900 border border-amber-200 hover:bg-amber-50'}`}>
                   <MapIcon size={16} /> Global Map
                 </button>
                 <button onClick={() => setActiveChartSubTab('bar')} className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${activeChartSubTab === 'bar' ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20' : 'bg-white text-amber-900 border border-amber-200 hover:bg-amber-50'}`}>
                   <BarChart3 size={16} /> Rankings
                 </button>
                 <button onClick={() => setActiveChartSubTab('line')} className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${activeChartSubTab === 'line' ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20' : 'bg-white text-amber-900 border border-amber-200 hover:bg-amber-50'}`}>
                   <TrendingUp size={16} /> Historical
                 </button>
               </div>

               {/* Map */}
               {activeChartSubTab === 'map' && (
                 <div className="bg-white/80 backdrop-blur rounded-2xl p-4 border border-amber-200 shadow-xl">
                   <ChoroplethMap />
                 </div>
               )}

               {/* Bar */}
               {activeChartSubTab === 'bar' && (
                 <div className="bg-white/80 backdrop-blur rounded-2xl p-8 border border-amber-200 shadow-xl">
                   <div className="flex justify-between items-center mb-6">
                     <h3 className="font-bold text-amber-900 text-lg">Top Destinations</h3>
                     <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="bg-white border border-amber-300 text-amber-900 rounded-lg px-3 py-1 text-sm font-semibold">
                       {years.map(y => <option key={y} value={y}>{y}</option>)}
                     </select>
                   </div>
                   <div style={{ width: isMobile ? '1000px' : 'auto', overflowX: isMobile ? 'auto' : 'visible' }}>
                     <ResponsiveContainer width="100%" height={600}>
                       {selectedYear === 'All Years' ? (
                          <BarChart data={barChartData} layout="vertical" margin={{ left: 20 }}>
                             <CartesianGrid strokeDasharray="3 3" stroke='#D97706' opacity={0.1} horizontal={false} />
                             <XAxis type="number" stroke="#92400E" tickFormatter={val => val >= 1000000 ? `${(val/1000000).toFixed(1)}m` : `${(val/1000).toFixed(0)}k`} style={{ fontSize: '0.75rem' }} />
                             <YAxis type="category" dataKey="country" width={100} stroke="#92400E" style={{ fontSize: '0.75rem', fontWeight: 600 }} />
                             <RechartsTooltip cursor={{fill: '#fef3c7', opacity: 0.4}} contentStyle={{ backgroundColor: '#FFF7ED', borderColor: '#F59E0B', borderRadius: '12px' }} />
                             <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                               {barChartData.map((_, index) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />)}
                             </Bar>
                           </BarChart>
                       ) : (
                          <BarChart data={singleYearData} layout="vertical" margin={{ left: 20 }}>
                             <CartesianGrid strokeDasharray="3 3" stroke='#D97706' opacity={0.1} horizontal={false} />
                             <XAxis type="number" stroke="#92400E" style={{ fontSize: '0.75rem' }} />
                             <YAxis type="category" dataKey="country" width={100} stroke="#92400E" style={{ fontSize: '0.75rem', fontWeight: 600 }} />
                             <RechartsTooltip cursor={{fill: '#fef3c7', opacity: 0.4}} contentStyle={{ backgroundColor: '#FFF7ED', borderColor: '#F59E0B', borderRadius: '12px' }} />
                             <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                               {singleYearData.map((_, index) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />)}
                             </Bar>
                           </BarChart>
                       )}
                     </ResponsiveContainer>
                   </div>
                 </div>
               )}

               {/* Line */}
               {activeChartSubTab === 'line' && <DestinationCharts />}
             </div>
           )}
           
           {/* These are now correctly OUTSIDE the charts block */}
           {activeView === 'table' && <DestinationDataTable />}
           {activeView === 'upload' && <DestinationUpload />}
           {activeView === 'forecasting' && <DestinationForecasting />}
         </div>
      </main>

    </div>
   
  
    
      
  )
}