import { useState, useEffect, useMemo } from 'react'
import {
  LineChart, Line,
  AreaChart, Area,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Filter } from 'lucide-react'
import LoadingScreen from '../loadingScreen'
import { useParseCivilStatusData } from '../../hooks/useParseCivilStatusData'
import { useIsMobile } from '../../hooks/useIsMobile'
import { COLUMN_ORDERS } from '../../utils/columnOrders'

const CivilStatusCharts = () => {
  const { chartData, civilStatusCategories, loading, error } = useParseCivilStatusData()
  const [selectedCivilStatusCategories, setSelectedCivilStatusCategories] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState<string>('All Years')
  const isMobile = useIsMobile()
  
  useEffect(() => {
    if (civilStatusCategories.length > 0) setSelectedCivilStatusCategories(civilStatusCategories)
  }, [civilStatusCategories])

  // --- DATA PREPARATION ---

  // Get unique years for the dropdown
  const years = useMemo(() => {
    const uniqueYears = [...new Set(chartData.map(d => d.YEAR))].sort((a, b) => b - a)
    return ['All Years', ...uniqueYears]
  }, [chartData])

  // Prepare Data for Radar Chart (Snapshot view)
  const radarData = useMemo(() => {
    if (!chartData.length) return []

    let stats: Record<string, number> = {}

    if (selectedYear === 'All Years') {
      // Aggregate all years
      civilStatusCategories.forEach(cat => {
        stats[cat] = chartData.reduce((acc, curr) => acc + (Number(curr[cat]) || 0), 0)
      })
    } else {
      // Find specific year
      const yearRow = chartData.find(d => String(d.YEAR) === String(selectedYear))
      if (yearRow) {
        civilStatusCategories.forEach(cat => {
          stats[cat] = Number(yearRow[cat]) || 0
        })
      }
    }

    // Format for Recharts Radar: [{ subject: 'Single', A: 120, fullMark: 150 }]
    // Find max value to normalize the chart visually
    const maxVal = Math.max(...Object.values(stats)) || 100

    return civilStatusCategories.map(cat => ({
      subject: cat,
      value: stats[cat] || 0,
      fullMark: maxVal
    }))
  }, [chartData, selectedYear, civilStatusCategories])

  // Filter handlers
  const handleCivilStatusCategoryChange = (cat: string) => {
    setSelectedCivilStatusCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  if (loading) return <LoadingScreen />
  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-6 m-4 text-center">
      <p className="font-bold">Unable to load data</p>
      <p className="text-sm">{error}</p>
    </div>
  )

  const colors = [
    '#cb8b66', // Bright Orange
    '#751e04', // Rust Red
    '#ff95a7', // Pink/Plum
    '#E64E24', // Brick Red
    '#231650', // Navy
    '#9d3f00', // Deep Orange
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* --- CHART 1: LINE CHART (Trends) --- */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 md:p-8 border border-white/50">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-amber-950 tracking-tight">Timeline Analysis</h2>
            <p className="text-amber-800/60 text-sm font-medium">Historical volume by civil status (1988-2020)</p>
          </div>
          
          {/* Legend / Toggles */}
          <div className="flex flex-wrap justify-center md:justify-end gap-3 max-w-2xl">
            {civilStatusCategories.map((cat, i) => (
              <button
                key={cat}
                onClick={() => handleCivilStatusCategoryChange(cat)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border 
                  ${selectedCivilStatusCategories.includes(cat) 
                    ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-sm' 
                    : 'bg-transparent border-transparent text-gray-400 hover:bg-gray-50'}`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedCivilStatusCategories.includes(cat) ? colors[i % colors.length] : '#cbd5e1' }} />
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className={isMobile ? "overflow-x-auto" : ""}>
          <div style={{ minWidth: isMobile ? '800px' : '100%' }}>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fed7aa" opacity={0.5} />
                <XAxis dataKey="YEAR" stroke="#9a3412" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#9a3412" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val >= 1000 ? `${val/1000}k` : val} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff7ed', borderRadius: '12px', border: '1px solid #fdba74', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                />
                {civilStatusCategories.map((cat, i) => selectedCivilStatusCategories.includes(cat) && (
                  <Line 
                    key={cat} 
                    type="monotone" 
                    dataKey={cat} 
                    stroke={colors[i % colors.length]} 
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* --- CHART 2: STACKED AREA CHART (Composition) --- */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 md:p-8 border border-white/50">
           <h2 className="text-xl font-bold text-amber-950 mb-2">Demographic Composition</h2>
           <p className="text-amber-800/60 text-sm mb-6">Cumulative growth and proportion share</p>
           
           <div className={isMobile ? "overflow-x-auto" : ""}>
             <div style={{ minWidth: isMobile ? '500px' : '100%' }}>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      {civilStatusCategories.map((cat, i) => (
                        <linearGradient key={`splitColor${i}`} id={`color${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0.1}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <XAxis dataKey="YEAR" stroke="#9a3412" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9a3412" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff7ed', borderRadius: '8px', border: 'none' }} />
                    {civilStatusCategories.map((cat, i) => (
                      <Area 
                        key={cat}
                        type="monotone" 
                        dataKey={cat} 
                        stackId="1" 
                        stroke={colors[i % colors.length]} 
                        fill={`url(#color${i})`} 
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
             </div>
           </div>
        </div>

        {/* --- CHART 3: RADAR CHART (Distribution Shape) --- */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 backdrop-blur-xl rounded-3xl shadow-xl p-6 md:p-8 border border-white/50 flex flex-col">
          <div className="flex justify-between items-start mb-6">
             <div>
                <h2 className="text-xl font-bold text-amber-950">Status Distribution</h2>
                <p className="text-amber-800/60 text-sm">Relative dominance of categories</p>
             </div>
             
             {/* Year Dropdown for Radar */}
             <div className="relative group">
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="appearance-none bg-white border border-amber-200 text-amber-900 py-2 pl-4 pr-10 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-sm"
                >
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <Filter className="absolute right-3 top-2.5 text-amber-500 pointer-events-none" size={16} />
             </div>
          </div>

          <div className="flex-grow flex items-center justify-center">
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#fed7aa" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#78350f', fontSize: 11, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                <Radar
                  name="Population"
                  dataKey="value"
                  stroke="#ea580c"
                  strokeWidth={3}
                  fill="#fb923c"
                  fillOpacity={0.5}
                />
                <Tooltip 
                  cursor={false}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => value.toLocaleString()}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  )
}

export default CivilStatusCharts