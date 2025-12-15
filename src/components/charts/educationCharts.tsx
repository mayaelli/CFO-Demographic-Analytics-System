import { useState, useEffect, useMemo } from 'react'
import {
  LineChart, Line,
  AreaChart, Area,
  RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PolarAngleAxis
} from 'recharts'
import { Filter, GraduationCap } from 'lucide-react'
import LoadingScreen from '../loadingScreen'
import { useParseEducationData } from '../../hooks/useParseEducationData'
import { useIsMobile } from '../../hooks/useIsMobile'
import { COLUMN_ORDERS } from '../../utils/columnOrders'

const EducationCharts = () => {
  const { chartData, educationLevels, loading, error } = useParseEducationData()
  const [selectedEducationLevels, setSelectedEducationLevels] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState<string>('All Years')
  const isMobile = useIsMobile()

  useEffect(() => {
    if (educationLevels.length > 0) setSelectedEducationLevels(educationLevels)
  }, [educationLevels])

  // --- DATA PREPARATION ---

  const years = useMemo(() => {
    const uniqueYears = [...new Set(chartData.map(d => d.Year))].sort((a, b) => b - a)
    return ['All Years', ...uniqueYears]
  }, [chartData])

  // Prepare Data for Radial Bar (Snapshot view)
  const radialData = useMemo(() => {
    let dataMap: Record<string, number> = {}

    if (selectedYear === 'All Years') {
       // Sum all years
       educationLevels.forEach(level => {
         dataMap[level] = chartData.reduce((acc, curr) => acc + (Number(curr[level]) || 0), 0)
       })
    } else {
       // Specific year
       const row = chartData.find(d => String(d.Year) === String(selectedYear))
       if (row) {
         educationLevels.forEach(level => {
           dataMap[level] = Number(row[level]) || 0
         })
       }
    }

    // Colors mapping
    const colorPalette = [
        '#F3742B', '#B83A14', '#E64E24', '#231650', 
        '#612E37', '#FF9854', '#FED172', '#4A3678'
    ]

    // Transform for RadialBar
    // We sort by value so the rings look organized (smallest to largest or vice versa)
    return COLUMN_ORDERS.education
      .map((level, index) => ({
        name: level,
        uv: dataMap[level] || 0,
        fill: colorPalette[index % colorPalette.length]
      }))
      // Filter out zero values to avoid ugly empty rings
      .filter(d => d.uv > 0)
      .sort((a, b) => a.uv - b.uv)
  }, [chartData, selectedYear, educationLevels])


  const handleEducationLevelChange = (level: string) => {
    setSelectedEducationLevels(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
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
    '#F3742B', '#B83A14', '#E64E24', '#231650', 
    '#612E37', '#FF9854', '#FED172', '#4A3678'
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* --- CHART 1: LINE CHART (Trends) --- */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 md:p-8 border border-white/50">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-amber-950 tracking-tight flex items-center gap-2">
              <GraduationCap className="text-amber-600" />
              Education Trends
            </h2>
            <p className="text-amber-800/60 text-sm font-medium">Historical migration volume by qualification</p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-end gap-2 max-w-3xl">
            {COLUMN_ORDERS.education.map((level, i) => (
              <button
                key={level}
                onClick={() => handleEducationLevelChange(level)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold transition-all border 
                  ${selectedEducationLevels.includes(level) 
                    ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-sm' 
                    : 'bg-transparent border-transparent text-gray-400 hover:bg-gray-50'}`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedEducationLevels.includes(level) ? colors[i % colors.length] : '#cbd5e1' }} />
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className={isMobile ? "overflow-x-auto" : ""}>
          <div style={{ minWidth: isMobile ? '800px' : '100%' }}>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fed7aa" opacity={0.5} />
                <XAxis dataKey="Year" stroke="#9a3412" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#9a3412" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val >= 1000 ? `${val/1000}k` : val} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff7ed', borderRadius: '12px', border: '1px solid #fdba74', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                />
                {educationLevels.map((level, i) => selectedEducationLevels.includes(level) && (
                  <Line 
                    key={level} 
                    type="monotone" 
                    dataKey={level} 
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

        {/* --- CHART 2: STACKED AREA (Brain Drain Composition) --- */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 md:p-8 border border-white/50">
           <h2 className="text-xl font-bold text-amber-950 mb-2">Qualification Composition</h2>
           <p className="text-amber-800/60 text-sm mb-6">Cumulative volume and educational shift over time</p>
           
           <div className={isMobile ? "overflow-x-auto" : ""}>
             <div style={{ minWidth: isMobile ? '500px' : '100%' }}>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      {educationLevels.map((level, i) => (
                        <linearGradient key={`grad${i}`} id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0.1}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <XAxis dataKey="Year" stroke="#9a3412" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9a3412" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff7ed', borderRadius: '8px', border: 'none' }} />
                    {educationLevels.map((level, i) => (
                      <Area 
                        key={level}
                        type="monotone" 
                        dataKey={level} 
                        stackId="1" 
                        stroke={colors[i % colors.length]} 
                        fill={`url(#grad${i})`} 
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
             </div>
           </div>
        </div>

        {/* --- CHART 3: RADIAL BAR (Snapshot) --- */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 backdrop-blur-xl rounded-3xl shadow-xl p-6 md:p-8 border border-white/50 flex flex-col">
          <div className="flex justify-between items-start mb-2">
             <div>
                <h2 className="text-xl font-bold text-amber-950">Volume Comparison</h2>
                <p className="text-amber-800/60 text-sm">Radial snapshot by level</p>
             </div>
             
             {/* Year Selector */}
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

          <div className="flex-grow flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height={380}>
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="10%" 
                outerRadius="90%" 
                barSize={20} 
                data={radialData}
                startAngle={180} 
                endAngle={0}
              >
                <RadialBar
                  label={{ position: 'insideStart', fill: '#fff', fontSize: '10px', fontWeight: 'bold' }} 
                  background
                  dataKey="uv"
                  cornerRadius={10}
                />
                <Legend 
                  iconSize={10} 
                  layout="vertical" 
                  verticalAlign="middle" 
                  wrapperStyle={{ right: 0, top: 20, fontSize: '11px', fontWeight: 600, color: '#78350f' }}
                />
                <Tooltip 
                  cursor={false}
                  contentStyle={{ backgroundColor: '#fff7ed', borderRadius: '8px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            
          </div>
        </div>

      </div>
    </div>
  )
}

export default EducationCharts