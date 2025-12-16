import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo, useEffect } from 'react'
import { 
  Users, TrendingUp, Calendar, ArrowUpRight, 
  Table as TableIcon, Save, X, Edit2, Trash2
} from 'lucide-react'

// --- CUSTOM HOOKS & UTILS ---
import { useParseSexData } from '../hooks/useParseSexData'

// --- API SERVICES ---
import { getAllSexData, updateSexData, deleteSexData } from '../api/sexService'
import { useAuth } from '../context/authContext'
// --- COMPONENTS ---
import LoadingScreen from '../components/loadingScreen'
// IMPORT THE FORECAST COMPONENT HERE
import SexCharts from '../components/charts/sexCharts'


// --- 2. DATA TABLE COMPONENT ---
const SexDataTable = () => {
  const { isAuthenticated } = useAuth()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [editingYear, setEditingYear] = useState<number | null>(null)
  const [editFormData, setEditFormData] = useState<any | null>(null)
 
  const loadData = async () => {
    setLoading(true)
    try {
      const result = await getAllSexData()
      setData(result.sort((a: any, b: any) => b.Year - a.Year))
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [])

  const handleSave = async () => {
    if (!editFormData) return
    const { Year, ...updates } = editFormData
    await updateSexData(Year, updates)
    setEditingYear(null)
    loadData()
  }

  const handleDelete = async (year: number) => {
    if (confirm(`Delete data for ${year}?`)) {
      await deleteSexData(year)
      loadData()
    }
  }

  const columns = ['MALE', 'FEMALE']

  if (loading && data.length === 0) return <LoadingScreen />

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border-2 border-amber-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
      <div className="p-6 border-b border-amber-200 bg-amber-50/50 flex justify-between"><h3 className="text-xl font-bold text-amber-900 flex gap-2"><TableIcon className="text-amber-600"/> Manage Gender Data</h3></div>
      <div className="overflow-x-auto max-h-[600px]">
        <table className="w-full text-sm text-left">
          <thead className="bg-amber-100/50 text-amber-900 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 font-bold border-b border-amber-200">Year</th>
              {columns.map(col => <th key={col} className="px-4 py-3 font-semibold border-b border-amber-200">{col}</th>)}
            {isAuthenticated && (
              <th className="px-4 py-3 font-bold border-b border-amber-200 text-center">Actions</th>
            )}
              </tr>
          </thead>

          <tbody className="divide-y divide-amber-100">
            {data.map((row) => {
              const isEditing = editingYear === row.Year
              return (
                <tr key={row.Year} className="hover:bg-amber-50/60">
                  
                  <td className="px-4 py-3 font-bold text-amber-900">{row.Year}</td>

             
                  {columns.map(col => (
                    <td key={col} className="px-4 py-2">
                      {isEditing ? (
                        <input type="number" value={editFormData[col]} onChange={e => setEditFormData({...editFormData, [col]: +e.target.value})} className="w-full px-2 py-1 border border-amber-300 rounded" />
                      ) : <span className="text-amber-800">{row[col]?.toLocaleString() || 0}</span>}
                    </td>      
                  ))}
                
                  {isAuthenticated && (
                  <td className="px-4 py-2 flex justify-center gap-2">
                    {isEditing ? (
                      <><button onClick={handleSave} className="p-1.5 bg-green-100 text-green-700 rounded"><Save size={16}/></button><button onClick={() => setEditingYear(null)} className="p-1.5 bg-gray-100 text-gray-600 rounded"><X size={16}/></button></>
                    ) : (
                      <><button onClick={() => {setEditingYear(row.Year); setEditFormData({...row})}} className="p-1.5 text-amber-600 hover:bg-amber-100 rounded"><Edit2 size={16}/></button><button onClick={() => handleDelete(row.Year)} className="p-1.5 text-red-400 hover:bg-red-50 rounded"><Trash2 size={16}/></button></>
                    )}
                  </td>
                  )}
                  
              
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
export const Route = createFileRoute('/genderDataCategory')({
  component: GenderDistribution,
})

const TABS = [
  { id: 'charts', label: 'Charts', restricted: false },
  { id: 'table', label: 'Data Table', restricted: false },
]

function GenderDistribution() {
  const { isAuthenticated } = useAuth()
  const { chartData, loading, error } = useParseSexData()
  const [activeView, setActiveView] = useState('charts')

  const stats = useMemo(() => {
    if (!chartData || chartData.length === 0) return null

    // 1. Total Volume
    const totalMale = chartData.reduce((acc, curr) => acc + (Number(curr.MALE) || 0), 0)
    const totalFemale = chartData.reduce((acc, curr) => acc + (Number(curr.FEMALE) || 0), 0)
    const total = totalMale + totalFemale

    // 2. Dominant Gender
    const dominant = totalMale > totalFemale ? 'Male' : 'Female'
    const dominantPercent = ((Math.max(totalMale, totalFemale) / total) * 100).toFixed(1)

    // 3. Peak Year
    let peakYear = ''
    let peakVal = 0
    chartData.forEach(row => {
      const yearTotal = (Number(row.MALE) || 0) + (Number(row.FEMALE) || 0)
      if (yearTotal > peakVal) { peakVal = yearTotal; peakYear = String(row.YEAR); }
    })

    return [
      { label: 'Total Emigrants', value: total.toLocaleString(), sub: '1981 - 2020', icon: Users },
      { label: 'Dominant Gender', value: dominant, sub: `${dominantPercent}% of total`, icon: TrendingUp },
      { label: 'Peak Year', value: peakYear, sub: `${peakVal.toLocaleString()} recorded`, icon: Calendar }
    ]
  }, [chartData])

  if (loading) return <LoadingScreen />
  if (error) return <div className="p-12 text-center text-red-500 font-bold">Error loading data: {error}</div>

  return (
    <div className="min-h-screen w-full bg-[#FFFBF5] p-4 md:p-8 lg:p-12 space-y-8 font-sans">
      <header className="space-y-2 max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-amber-950 tracking-tight">Gender Distribution</h1>
        <p className="text-amber-900/60 font-medium text-lg max-w-2xl">Comparative analysis of emigration trends by biological sex.</p>
      </header>

      {/* Tabs */}
  <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
          {TABS.filter(tab => !tab.restricted || isAuthenticated).map((tab) => {
            const isActive = activeView === tab.id
            
            // You need to explicitly return the JSX here
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`
                  group relative py-4 text-sm font-bold uppercase tracking-wider transition-colors duration-300 whitespace-nowrap
                  ${isActive ? 'text-amber-800' : 'text-amber-800/40 hover:text-amber-700'}
                `}
              >
                {tab.label}
                <span 
                  className={`
                    absolute bottom-0 left-0 h-[3px] bg-amber-600 rounded-full transition-all duration-300
                    ${isActive ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-1/2 group-hover:opacity-30'}
                  `} 
                />
              </button>
            )
          })}
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
           {activeView === 'charts' && <SexCharts />}
           {activeView === 'table' && <SexDataTable />}
           
        </div>
      </main>
    </div>
  )
}
