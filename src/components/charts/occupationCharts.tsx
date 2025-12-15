import { useState, useEffect, useMemo } from 'react'
import {
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Briefcase, Filter, PieChart } from 'lucide-react'

// --- IMPORTS ---
import LoadingScreen from '../loadingScreen'
import { useParseOccupationData } from '../../hooks/useParseOccupationData'
import { useIsMobile } from '../../hooks/useIsMobile'
import { COLUMN_ORDERS } from '../../utils/columnOrders'
import { OCCUPATION_LABELS, formatOccupationTooltip } from '../../utils/occupationLabels'

// IMPORT YOUR READY-MADE COMPONENT HERE
import TreemapNivo from '../charts/treemapNivo' 

const OccupationCharts = () => {
  const { chartData, occupations, loading, error } = useParseOccupationData()
  const [selectedOccupations, setSelectedOccupations] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState<string>('All Years')
  const isMobile = useIsMobile()

  useEffect(() => {
    if (occupations.length > 0 && selectedOccupations.length === 0) {
        setSelectedOccupations(occupations)
    }
  }, [occupations])

  const years = useMemo(() => {
    if (!chartData.length) return ['All Years']
    const uniqueYears = [...new Set(chartData.map(d => d.Year))].sort((a, b) => b - a)
    return ['All Years', ...uniqueYears]
  }, [chartData])

  // --- PREPARE DATA FOR NIVO ---
  const nivoFormattedData = useMemo(() => {
    let stats: Record<string, number> = {}

    if (selectedYear === 'All Years') {
       occupations.forEach(occ => {
         stats[occ] = chartData.reduce((acc, curr) => acc + (Number(curr[occ]) || 0), 0)
       })
    } else {
       const yearRow = chartData.find(d => String(d.Year) === String(selectedYear))
       if (yearRow) {
         occupations.forEach(occ => {
           stats[occ] = Number(yearRow[occ]) || 0
         })
       }
    }
    
    return COLUMN_ORDERS.occupation
      .map(occ => ({
        name: occ, 
        value: stats[occ] || 0,
      }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value)
  }, [chartData, selectedYear, occupations])

  const handleOccupationChange = (occupation: string) => {
    setSelectedOccupations(prev =>
      prev.includes(occupation) ? prev.filter(o => o !== occupation) : [...prev, occupation]
    )
  }

  if (loading) return <LoadingScreen />
  if (error) return <div className="p-8 text-red-500">{error}</div>

  const colors = [
    '#F3742B', '#612E37', '#FED172', '#800755', 
    '#A38590', '#FFEFBC', '#0F0C20', '#FF9854', 
    '#7E4850', '#D2B475', '#4A3678', '#8A5741', 
    '#EB6A1B', '#03005d', '#ffa1a1' 
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* --- CHART 1: LINE CHART (HERO - FULL WIDTH) --- */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 md:p-8 border border-white/50">
        <div className="flex flex-col xl:flex-row justify-between items-start mb-8 gap-6">
            <div>
                <h2 className="text-2xl font-bold text-amber-950 tracking-tight flex items-center gap-2">
                <Briefcase className="text-amber-600" />
                Occupation Trends
                </h2>
                <p className="text-amber-800/60 text-sm font-medium">Historical volume by job category</p>
            </div>
            
            {/* Filter Buttons - Grid layout for better use of space */}
            <div className="flex flex-wrap gap-2 w-full xl:w-2/3 xl:justify-end">
                {COLUMN_ORDERS.occupation.map((occ, i) => (
                <button
                    key={occ}
                    onClick={() => handleOccupationChange(occ)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold transition-all border 
                    ${selectedOccupations.includes(occ) 
                        ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-sm' 
                        : 'bg-transparent border-transparent text-gray-400 hover:bg-gray-50'}`}
                >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedOccupations.includes(occ) ? colors[i % colors.length] : '#cbd5e1' }} />
                    {OCCUPATION_LABELS[occ] || occ}
                </button>
                ))}
            </div>
        </div>

        <div className={isMobile ? "overflow-x-auto" : ""}>
            <div style={{ minWidth: isMobile ? '800px' : '100%' }}>
                <ResponsiveContainer width="100%" height={450}>
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fed7aa" opacity={0.5} />
                    <XAxis dataKey="Year" stroke="#9a3412" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#9a3412" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val >= 1000 ? `${val/1000}k` : val} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#fff7ed', borderRadius: '12px', border: '1px solid #fdba74', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                        formatter={formatOccupationTooltip}
                    />
                    {occupations.map((occ, i) => selectedOccupations.includes(occ) && (
                    <Line 
                        key={occ} 
                        type="monotone" 
                        dataKey={occ} 
                        stroke={colors[i % colors.length]} 
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                    ))}
                </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* --- BOTTOM GRID: TREEMAP & BAR CHART --- */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        {/* --- CHART 2: TREEMAP (Side-by-side) --- */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 backdrop-blur-xl rounded-3xl shadow-xl p-6 md:p-8 border border-white/50 flex flex-col min-h-[500px]">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-xl font-bold text-amber-950 flex items-center gap-2">
                        <PieChart className="text-amber-700" size={20} />
                        Occupation Mix
                    </h2>
                    <p className="text-amber-800/60 text-sm">Proportional view</p>
                </div>
                
                {/* Year Selector */}
                <div className="relative group z-10">
                    <select 
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="appearance-none bg-white border border-amber-200 text-amber-900 py-1.5 pl-3 pr-8 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-sm"
                    >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <Filter className="absolute right-2 top-2 text-amber-500 pointer-events-none" size={14} />
                </div>
            </div>

            <div className="flex-grow flex items-center justify-center relative w-full h-[400px]">
                <TreemapNivo 
                    data={nivoFormattedData} 
                    occupationLabelMap={OCCUPATION_LABELS} 
                />
            </div>
        </div>

        {/* --- CHART 3: 100% STACKED BAR --- */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 md:p-8 border border-white/50 min-h-[500px] flex flex-col">
            <h2 className="text-xl font-bold text-amber-950 mb-2">Market Share Shift</h2>
            <p className="text-amber-800/60 text-sm mb-6">Relative dominance of occupations over time</p>
            
            <div className="flex-grow flex items-center justify-center">
                <div style={{ width: '100%', height: '400px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} stackOffset="expand" margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <XAxis dataKey="Year" stroke="#9a3412" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#9a3412" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#fff7ed', borderRadius: '8px', border: 'none' }}
                            formatter={(value: number) => value.toLocaleString()}
                            labelStyle={{ color: '#9a3412', fontWeight: 'bold' }}
                        />
                        {occupations.map((occ, i) => (
                            <Bar 
                            key={occ}
                            dataKey={occ} 
                            stackId="a" 
                            fill={colors[i % colors.length]} 
                            animationDuration={1000}
                            />
                        ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

      </div>
    </div>
  )
}

export default OccupationCharts