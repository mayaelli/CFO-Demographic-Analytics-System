import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo, useEffect } from 'react'
import { 
  Users, TrendingUp, Calendar, ArrowUpRight, BarChart3, 
  Table as TableIcon, Save, X, Edit2, Trash2, AlertCircle 
} from 'lucide-react'

// Components
import AgeCharts from '../components/charts/ageCharts'
import { useParseAgeData } from '../hooks/useParseAgeData'

import { getAllAgeData, updateAgeData, deleteAgeData } from '../api/ageService'
import { COLUMN_ORDERS } from '../utils/columnOrders'

import { useAuth } from '../context/authContext'

// --- PLACEHOLDER COMPONENTS ---

const AgeDataTable = () => {
  const { isAuthenticated } = useAuth()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [editingYear, setEditingYear] = useState<number | null>(null)
  const [editFormData, setEditFormData] = useState<any | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Load data specifically for AGE
  const loadData = async () => {
    setLoading(true)
    try {
      const result = await getAllAgeData()
      // Sort by Year descending by default
      setData(result.sort((a: any, b: any) => b.Year - a.Year))
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to load table data.' })
    } finally {
      setLoading(false)
    }
  }

  // Load on mount
  useEffect(() => {
    loadData()
  }, [])

  // Start Edit
  const handleEdit = (item: any) => {
    setEditingYear(item.Year)
    setEditFormData({ ...item })
    setMessage(null)
  }

  // Cancel Edit
  const handleCancelEdit = () => {
    setEditingYear(null)
    setEditFormData(null)
    setMessage(null)
  }

  // Handle Input Change
  const handleFieldChange = (field: string, value: string) => {
    setEditFormData((prev: any) => ({ ...prev, [field]: parseFloat(value) || 0 }))
  }

  // Save Changes
  const handleSaveEdit = async () => {
    if (!editFormData || editingYear === null) return
    setLoading(true)
    try {
      const { Year, ...updates } = editFormData
      await updateAgeData(editingYear, updates)
      setMessage({ type: 'success', text: `Year ${editingYear} updated successfully.` })
      handleCancelEdit()
      await loadData() // Refresh table
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to save changes.' })
    } finally {
      setLoading(false)
    }
  }

  // Delete Row
  const handleDelete = async (year: number) => {
    if (!confirm(`Are you sure you want to delete data for Year ${year}?`)) return
    setLoading(true)
    try {
      await deleteAgeData(year)
      setMessage({ type: 'success', text: `Data for ${year} deleted.` })
      await loadData()
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to delete.' })
    } finally {
      setLoading(false)
    }
  }

  // Get Columns (Hardcoded to Age logic)
  const columns = COLUMN_ORDERS['age'] || []

  if (loading && data.length === 0) return <div className="p-8 text-center text-amber-800">Loading table data...</div>

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border-2 border-amber-200 overflow-hidden">
      
      {/* Table Header / Status Bar */}
      <div className="p-6 border-b border-amber-200 flex justify-between items-center bg-amber-50/50">
        <h3 className="text-xl font-bold text-amber-900 flex items-center gap-2">
          <TableIcon className="text-amber-600" /> Manage Age Data
        </h3>
        {message && (
          <div className={`text-sm px-3 py-1 rounded-full flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <AlertCircle size={14} /> {message.text}
          </div>
        )}
      </div>

      {/* The Table */}
      <div className="overflow-x-auto max-h-[600px]">
        <table className="w-full text-sm text-left">
          <thead className="bg-amber-100/50 text-amber-900 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-4 py-3 font-bold border-b border-amber-200 w-24">Year</th>
              {columns.map(col => (
                <th key={col} className="px-4 py-3 font-semibold border-b border-amber-200 min-w-[100px]">
                  {col}
                </th>
              ))}
            { isAuthenticated && (
              <th className="px-4 py-3 font-bold border-b border-amber-200 text-center w-32">Actions</th>
            )}
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-100">
            {data.map((row) => {
              const isEditing = editingYear === row.Year
              return (
                <tr key={row.Year} className={`hover:bg-amber-50/60 transition-colors ${isEditing ? 'bg-amber-50' : ''}`}>
                  
                  {/* Year Column (Read Only) */}
                  <td className="px-4 py-3 font-bold text-amber-900">{row.Year}</td>

                  {/* Data Columns */}
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

                  {/* Actions Column */}
                  {isAuthenticated && (
                  <td className="px-4 py-2">
                    <div className="flex justify-center gap-2">
                      {isEditing ? (
                        <>
                          <button onClick={handleSaveEdit} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200" title="Save">
                            <Save size={16} />
                          </button>
                          <button onClick={handleCancelEdit} className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200" title="Cancel">
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(row)} className="p-1.5 text-amber-600 hover:bg-amber-100 rounded transition-colors" title="Edit">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(row.Year)} className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded transition-colors" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {data.length === 0 && !loading && (
        <div className="p-8 text-center text-amber-800/50">No data available.</div>
      )}
    </div>
  )
}

export const Route = createFileRoute('/ageCategory')({
  component: AgeComposition,
})

// --- CONFIGURATION ---
// Removed Upload and Forecasting from TABS
const TABS = [
  { id: 'charts', label: 'Charts', restricted: false },
  { id: 'table', label: 'Data Table', restricted: false },
]

function AgeComposition() {
  // 1. Data Fetching
  const { isAuthenticated } = useAuth()
  const { chartData, ageGroups } = useParseAgeData()
  
  // 2. State Management
  const [activeView, setActiveView] = useState('charts') // Default to 'charts'
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState<string>('All Years')

  // Initialize defaults
  useEffect(() => {
    if (ageGroups.length > 0 && selectedAgeGroups.length === 0) {
      setSelectedAgeGroups(ageGroups)
    }
  }, [ageGroups])

  // 3. Stats Calculation (Your existing logic)
  const computedStats = useMemo(() => {
    if (!chartData || chartData.length === 0) return null
    const sumKey = (data: any[], key: string) => data.reduce((acc, curr) => acc + (Number(curr[key]) || 0), 0)

    let stat1 = { label: 'Total Emigrants', value: '0', sub: 'In selected view', icon: Users }
    let stat2 = { label: 'Top Age Group', value: '-', sub: 'Highest volume', icon: TrendingUp }
    let stat3 = { label: 'Peak Year', value: '-', sub: 'Highest recorded', icon: Calendar }

    if (selectedYear === 'All Years') {
      // Total Volume
      const totalVolume = chartData.reduce((acc, yearRow) => {
        let rowSum = 0
        selectedAgeGroups.forEach(group => { rowSum += (Number(yearRow[group]) || 0) })
        return acc + rowSum
      }, 0)
      stat1.value = totalVolume.toLocaleString()
      stat1.sub = 'Total (1981 - 2020)'

      // Top Age Group
      let maxGroup = ''
      let maxGroupVal = 0
      selectedAgeGroups.forEach(group => {
        const groupTotal = sumKey(chartData, group)
        if (groupTotal > maxGroupVal) { maxGroupVal = groupTotal; maxGroup = group; }
      })
      stat2.value = maxGroup
      stat2.sub = `${maxGroupVal.toLocaleString()} recorded`

      // Peak Year
      let peakYear = ''
      let peakYearVal = 0
      chartData.forEach(row => {
        let rowSum = 0
        selectedAgeGroups.forEach(group => { rowSum += (Number(row[group]) || 0) })
        if (rowSum > peakYearVal) {
          peakYearVal = rowSum
          peakYear = String(row.Year) // Fix for TS error
        }
      })
      stat3.value = peakYear
      stat3.sub = `${peakYearVal.toLocaleString()} recorded`

    } else {
      // Specific Year Logic
      const yearRow = chartData.find(d => String(d.Year) === String(selectedYear))
      if (yearRow) {
        let yearTotal = 0
        selectedAgeGroups.forEach(group => { yearTotal += (Number(yearRow[group]) || 0) })
        stat1.value = yearTotal.toLocaleString()
        stat1.sub = `Total in ${selectedYear}`

        let maxGroup = ''
        let maxGroupVal = 0
        selectedAgeGroups.forEach(group => {
           const val = Number(yearRow[group]) || 0
           if (val > maxGroupVal) { maxGroupVal = val; maxGroup = group; }
        })
        stat2.value = maxGroup
        stat2.sub = `${((maxGroupVal/yearTotal)*100).toFixed(1)}% of total`
        
        stat3.icon = BarChart3
        stat3.label = "Yearly Contribution"
        // Simple placeholder logic for 3rd stat in single year view
        stat3.value = "N/A" 
        stat3.sub = "Select 'All Years' for trends"
      }
    }

    return [stat1, stat2, stat3]
  }, [chartData, selectedYear, selectedAgeGroups])


  return (
    <div className="min-h-screen w-full bg-[#FFFBF5] p-4 md:p-8 lg:p-12 space-y-8 font-sans">
      
      {/* Header */}
      <header className="space-y-2 max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-amber-950 tracking-tight">
          Demographic Composition
        </h1>
        <p className="text-amber-900/60 font-medium text-lg max-w-2xl">
          Analysis of emigration trends categorized by age groups.
        </p>
      </header>

      {/* --- REFACTORED TABS NAVIGATION --- */}
      <div className="sticky top-0 z-30 bg-[#FFFBF5]/95 backdrop-blur-sm border-b border-amber-200/60 max-w-7xl mx-auto mb-6">
        <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
          {TABS.filter(tab => !tab.restricted || isAuthenticated).map((tab) => {
    const isActive = activeView === tab.id
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
                {/* Active Indicator Line */}
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
      </div>

      {/* --- MAIN GRID --- */}
      <main className="grid grid-cols-1 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
        
        {/* RIGHT COLUMN (Stats) */}
        <div className="xl:col-span-1 order-1 xl:order-2 space-y-4">
          <h3 className="text-amber-950 font-bold text-lg uppercase tracking-wider opacity-80 mb-4 hidden xl:block">
            Quick Insights
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-4">
            {computedStats ? computedStats.map((stat) => (
              <div 
                key={stat.label}
                className="bg-white/60 hover:bg-white/80 backdrop-blur-md border border-amber-200/50 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="p-2 bg-amber-100/50 rounded-lg text-amber-700 group-hover:bg-amber-100 group-hover:text-amber-800 transition-colors">
                    <stat.icon size={20} strokeWidth={2} />
                  </div>
                  <ArrowUpRight className="text-amber-300 group-hover:text-amber-500 transition-colors" size={16} />
                </div>
                
                <div className="space-y-1">
                  <p className="text-amber-900/50 text-xs font-bold uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-amber-950 truncate">
                    {stat.value}
                  </p>
                  <p className="text-xs text-amber-700 font-medium truncate">
                    {stat.sub}
                  </p>
                </div>
              </div>
            )) : (
              // Loading Skeletons
              [1,2,3].map(i => <div key={i} className="animate-pulse bg-amber-900/5 h-24 rounded-xl"></div>)
            )}
          </div>
        </div>

        {/* LEFT COLUMN (Dynamic Content) */}
        <div className="xl:col-span-3 order-2 xl:order-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
           {/* CONDITIONAL RENDERING BASED ON ACTIVE VIEW */}
           
           {activeView === 'charts' && (
             <AgeCharts />
           )}

           {activeView === 'table' && (
             <AgeDataTable />
           )}

        </div>

      </main>
    </div>
  )
}