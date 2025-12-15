import { useState, useEffect, useMemo } from 'react'
import {
  LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Radar, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import { useParseAgeData } from '../../hooks/useParseAgeData'
import LoadingScreen from '../loadingScreen'
import { useIsMobile } from '../../hooks/useIsMobile'
import { COLUMN_ORDERS } from '../../utils/columnOrders'
import { CustomTooltip } from '../customTooltip'

// A cleaner, cohesive "Sunset" palette
const MODERN_COLORS = [
  '#f59e0b', // Amber 500 (Youngest)
  '#ea580c', // Orange 600
  '#dc2626', // Red 600
  '#db2777', // Pink 600
  '#9333ea', // Purple 600
  '#4f46e5', // Indigo 600
  '#2563eb', // Blue 600
  '#0891b2', // Cyan 600
  '#059669', // Emerald 600
  '#65a30d', // Lime 600
  '#78350f', // Amber 900
  '#71717a', // Zinc 500 (Oldest/Others)
]

const AgeCharts = () => {
  const { chartData, groupedChartData, ageGroups, loading, error } = useParseAgeData()
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState<string>('All Years')
  const isMobile = useIsMobile()

  useEffect(() => {
    if (ageGroups.length > 0) setSelectedAgeGroups(ageGroups)
  }, [ageGroups])  

  const years = useMemo(() => ['All Years', ...chartData.map(d => d.Year)], [chartData])

  // --- DATA PREP FOR BAR CHART ---
  const singleYearData = useMemo(() => {
    if (selectedYear === 'All Years') return []
    const yearData = chartData.find(d => String(d.Year) === String(selectedYear))
    if (!yearData) return []
    return COLUMN_ORDERS.age.map(ageGroup => ({
      ageGroup,
      population: yearData[ageGroup] || 0
    }))
  }, [selectedYear, chartData])

  // --- DATA PREP FOR RADAR CHART (NEW!) ---
  const radarData = useMemo(() => {
    // If "All Years", calculate the average for each age group
    if (selectedYear === 'All Years') {
        if (chartData.length === 0) return []
        return COLUMN_ORDERS.age.map(ageGroup => {
            const total = chartData.reduce((acc, curr) => acc + (curr[ageGroup] || 0), 0)
            return {
                subject: ageGroup,
                A: Math.round(total / chartData.length), // Average
                fullMark: 15000 // Arbitrary max for scaling
            }
        })
    }

    // If Single Year, just show that year's shape
    const yearData = chartData.find(d => String(d.Year) === String(selectedYear))
    if (!yearData) return []
    
    return COLUMN_ORDERS.age.map(ageGroup => ({
        subject: ageGroup,
        A: yearData[ageGroup] || 0,
        fullMark: 15000
    }))
  }, [selectedYear, chartData])

  const handleAgeGroupChange = (ageGroup: string) => {
    setSelectedAgeGroups(prev =>
      prev.includes(ageGroup) ? prev.filter(ag => ag !== ageGroup) : [...prev, ageGroup]
    )
  }

  if (loading) return ( <LoadingScreen /> )
  if (error) return ( <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl">⚠️ Error: {error}</div> )

  return (
    <div className="space-y-8">
      
      {/* --- CONTROLS SECTION --- */}
      <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-amber-200/50 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
             {/* Year Selector */}
             <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-amber-200 shadow-sm">
                <span className="text-amber-900 font-bold text-sm uppercase tracking-wide">Period:</span>
                <select
                    value={selectedYear}
                    onChange={e => setSelectedYear(e.target.value)}
                    className="bg-transparent text-amber-900 font-medium focus:outline-none cursor-pointer"
                >
                    {years.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap justify-center gap-2">
                <button 
                    onClick={() => setSelectedAgeGroups(COLUMN_ORDERS.age)}
                    className="px-3 py-1 text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
                >
                    Select All
                </button>
                <button 
                    onClick={() => setSelectedAgeGroups([])}
                    className="px-3 py-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                    Clear
                </button>
                <div className="w-[1px] h-6 bg-amber-200 mx-2"></div>
                {COLUMN_ORDERS.age.map((ageGroup, i) => {
                    const isSelected = selectedAgeGroups.includes(ageGroup)
                    return (
                        <button
                            key={ageGroup}
                            onClick={() => handleAgeGroupChange(ageGroup)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 border
                                ${isSelected 
                                    ? 'text-white border-transparent shadow-md transform scale-105' 
                                    : 'bg-white text-gray-500 border-gray-200 hover:border-amber-300'
                                }`}
                            style={{ backgroundColor: isSelected ? MODERN_COLORS[i % MODERN_COLORS.length] : undefined }}
                        >
                            {ageGroup}
                        </button>
                    )
                })}
            </div>
        </div>
      </div>

      {/* --- CHART 1: LINE CHART (Trends) --- */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6 md:p-8">
        <h2 className="text-2xl font-bold text-amber-950 mb-2">Long-term Age Trends</h2>
        <p className="text-amber-900/60 mb-8 text-sm">Historical fluctuation of specific age groups over time.</p>

        <div style={{ width: '100%', height: 500 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#fcd34d" vertical={false} opacity={0.3} />
                <XAxis 
                    dataKey="Year" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#78350f', fontSize: 12 }} 
                    dy={10}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#78350f', fontSize: 12 }} 
                />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                
                {ageGroups.map((ageGroup, i) => (
                    selectedAgeGroups.includes(ageGroup) && (
                    <Line 
                        key={ageGroup} 
                        type="monotone" // Curves the line
                        dataKey={ageGroup} 
                        stroke={MODERN_COLORS[i % MODERN_COLORS.length]} 
                        strokeWidth={3}
                        dot={false} // Clean look, no dots unless hovering
                        activeDot={{ r: 8, strokeWidth: 0 }}
                    />
                    )
                ))}
              </LineChart>
            </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* --- CHART 2: BAR CHART (Comparison) --- */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6 md:p-8">
            <h2 className="text-xl font-bold text-amber-950 mb-6">
                {selectedYear === 'All Years' ? 'Volume by Year' : `Population Breakdown (${selectedYear})`}
            </h2>
            <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                {selectedYear === 'All Years' ? (
                    <BarChart data={groupedChartData}>
                        <CartesianGrid vertical={false} stroke="#fcd34d" opacity={0.3} />
                        <XAxis dataKey="Period" hide={isMobile} axisLine={false} tickLine={false} tick={{fill:'#78350f', fontSize: 10}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill:'#78350f', fontSize: 12}} />
                        <Tooltip cursor={{fill: '#fffbeb'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                        {ageGroups.map((ageGroup, i) => (
                            <Bar 
                                key={ageGroup} 
                                dataKey={ageGroup} 
                                stackId="a" 
                                fill={MODERN_COLORS[i % MODERN_COLORS.length]} 
                            />
                        ))}
                    </BarChart>
                ) : (
                    <BarChart data={singleYearData} layout="vertical">
                         <CartesianGrid horizontal={false} stroke="#fcd34d" opacity={0.3} />
                         <XAxis type="number" hide />
                         <YAxis 
                            dataKey="ageGroup" 
                            type="category" 
                            width={80} 
                            tick={{fill:'#78350f', fontSize: 11, fontWeight: 600}} 
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip cursor={{fill: '#fffbeb'}} content={<CustomTooltip data={singleYearData} colors={MODERN_COLORS} categoryKey="ageGroup" />} />
                        <Bar dataKey="population" radius={[0, 4, 4, 0]}>
                            {singleYearData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={MODERN_COLORS[index % MODERN_COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                )}
                </ResponsiveContainer>
            </div>
        </div>

        {/* --- CHART 3: RADAR CHART (Profile Shape) --- */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6 md:p-8 flex flex-col">
             <div className="mb-4">
                <h2 className="text-xl font-bold text-amber-950">Demographic Profile Shape</h2>
                <p className="text-amber-900/60 text-xs">
                    {selectedYear === 'All Years' 
                        ? 'Average profile across all recorded history.' 
                        : `Specific profile shape for the year ${selectedYear}.`}
                </p>
             </div>

             <div className="flex-grow flex items-center justify-center -ml-6" style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="#fbbf24" />
                        <PolarAngleAxis 
                            dataKey="subject" 
                            tick={{ fill: '#78350f', fontSize: 11, fontWeight: 'bold' }} 
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                        <Radar
                            name="Population"
                            dataKey="A"
                            stroke="#d97706"
                            strokeWidth={3}
                            fill="#fbbf24"
                            fillOpacity={0.5}
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
             </div>
        </div>

      </div>
    </div>
  )
}

export default AgeCharts