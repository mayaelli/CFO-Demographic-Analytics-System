import { useState, useMemo } from 'react'
import {
  LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ReferenceLine,
  PieChart, Pie
} from 'recharts'
import LoadingScreen from '../loadingScreen'
import { useParseSexData } from '../../hooks/useParseSexData'
import { useIsMobile } from '../../hooks/useIsMobile'

// --- CONSTANTS & CONFIG ---
const COLORS = {
  MALE: '#0e7490',   // Cyan-700 (Cool, distinct)
  FEMALE: '#be123c', // Rose-700 (Warm, distinct)
  GRID: '#f59e0b',   // Amber for grid lines
  TEXT: '#78350f'    // Amber-900 for text
}

const SexCharts = () => {
  const { chartData, loading, error } = useParseSexData()
  const [selectedYear, setSelectedYear] = useState<string>('All Years')
  const isMobile = useIsMobile()

  // Extract years for the dropdown
  const years = useMemo(() => {
    if (!chartData) return []
    return ['All Years', ...chartData.map((d: any) => d.YEAR)]
  }, [chartData])

  // --- DATA TRANSFORMATION 1: BUTTERFLY CHART (Replaces Nivo) ---
  const butterflyData = useMemo(() => {
    if (!chartData) return []
    return chartData.map((d: any) => ({
      ...d,
      // Create a negative value for males so bars go left
      MaleNegative: (d.MALE || 0) * -1,
      MaleAbs: d.MALE || 0,
      FemaleAbs: d.FEMALE || 0
    }))
  }, [chartData])

  // --- DATA TRANSFORMATION 2: DONUT CHART ---
  const donutData = useMemo(() => {
    if (!chartData) return []
    
    let maleTotal = 0
    let femaleTotal = 0

    if (selectedYear === 'All Years') {
      maleTotal = chartData.reduce((acc: number, curr: any) => acc + (Number(curr.MALE) || 0), 0)
      femaleTotal = chartData.reduce((acc: number, curr: any) => acc + (Number(curr.FEMALE) || 0), 0)
    } else {
      const yearRow = chartData.find((d: any) => String(d.YEAR) === String(selectedYear))
      if (yearRow) {
        maleTotal = Number(yearRow.MALE) || 0
        femaleTotal = Number(yearRow.FEMALE) || 0
      }
    }

    return [
      { name: 'Male', value: maleTotal, color: COLORS.MALE },
      { name: 'Female', value: femaleTotal, color: COLORS.FEMALE },
    ]
  }, [selectedYear, chartData])


  // --- RENDER STATES ---
  if (loading) return <LoadingScreen />
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 m-8 text-center shadow-lg">
        <p className="font-bold text-lg mb-2">⚠️ Unable to Load Data</p>
        <p className="text-sm opacity-80">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* --- HEADER & CONTROLS --- */}
      <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-amber-200/50 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
         <h2 className="text-lg font-bold text-amber-950">Gender Demographics Dashboard</h2>
         
         <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-amber-200 shadow-sm">
            <span className="text-amber-900 font-bold text-xs uppercase tracking-wide">Analysis Period:</span>
            <select
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                className="bg-transparent text-amber-900 text-sm font-medium focus:outline-none cursor-pointer"
            >
                {years.map((year: string) => <option key={year} value={year}>{year}</option>)}
            </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- CHART 1: SNAPSHOT (Donut) --- */}
        <div className="col-span-1 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6 flex flex-col items-center justify-center">
            <h3 className="text-lg font-bold text-amber-950 mb-2">
                {selectedYear === 'All Years' ? 'Total Distribution' : `${selectedYear} Split`}
            </h3>
            <div className="relative w-full h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={donutData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {donutData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                            formatter={(value: number) => value.toLocaleString()}
                        />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Percentage */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <span className="block text-3xl font-bold text-rose-700">
                           {((donutData[1].value / (donutData[0].value + donutData[1].value || 1)) * 100).toFixed(0)}%
                        </span>
                        <span className="text-xs text-rose-900/60 font-bold uppercase tracking-wider">Female</span>
                    </div>
                </div>
            </div>
        </div>

        {/* --- CHART 2: PROPORTIONAL TREND (Stacked Area) --- */}
        <div className="col-span-1 lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6 md:p-8">
            <h3 className="text-xl font-bold text-amber-950 mb-2">Ratio Evolution</h3>
            <p className="text-amber-900/60 mb-6 text-sm">
                Visualizing the <span className="font-bold text-rose-700">Feminization of Migration</span> by showing the percentage share over time.
            </p>
            
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} stackOffset="expand" margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} stroke={COLORS.GRID} />
                        <XAxis 
                            dataKey="YEAR" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fill: COLORS.TEXT }} 
                            minTickGap={30}
                        />
                        <YAxis 
                            tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fill: COLORS.TEXT }} 
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                            formatter={(value: number, name: string, props: any) => {
                                const total = props.payload.MALE + props.payload.FEMALE;
                                const percent = ((value / total) * 100).toFixed(1);
                                return [`${value.toLocaleString()} (${percent}%)`, name];
                            }}
                        />
                        <Legend />
                        <Area type="monotone" dataKey="FEMALE" stackId="1" stroke={COLORS.FEMALE} fill={COLORS.FEMALE} fillOpacity={0.8} />
                        <Area type="monotone" dataKey="MALE" stackId="1" stroke={COLORS.MALE} fill={COLORS.MALE} fillOpacity={0.8} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

      </div>

      {/* --- CHART 3: BUTTERFLY CHART (Volume & Balance) --- */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6 md:p-8">
        <h3 className="text-xl font-bold text-amber-950 mb-2">Population Pyramid (Butterfly Chart)</h3>
        <p className="text-amber-900/60 mb-6 text-sm">
            Comparison of raw volume per year. 
            <span style={{color: COLORS.MALE}} className="font-bold"> Left is Male</span>, 
            <span style={{color: COLORS.FEMALE}} className="font-bold"> Right is Female</span>.
        </p>

        <div style={{ width: '100%', height: isMobile ? 400 : 600 }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                    data={butterflyData} 
                    layout="vertical" 
                    stackOffset="sign" 
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.2} stroke={COLORS.GRID}/>
                    <XAxis type="number" hide />
                    <YAxis 
                        dataKey="YEAR" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false} 
                        width={50} 
                        tick={{ fill: COLORS.TEXT, fontSize: 11, fontWeight: 'bold' }} 
                    />
                    <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                    <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-amber-100 text-sm">
                                        <p className="font-bold mb-2 text-amber-900 border-b border-amber-100 pb-1">{data.YEAR}</p>
                                        <div className="space-y-1">
                                            <p className="flex justify-between w-32 font-medium" style={{ color: COLORS.MALE }}>
                                                <span>Male:</span> <span>{data.MaleAbs.toLocaleString()}</span>
                                            </p>
                                            <p className="flex justify-between w-32 font-medium" style={{ color: COLORS.FEMALE }}>
                                                <span>Female:</span> <span>{data.FemaleAbs.toLocaleString()}</span>
                                            </p>
                                            <p className="text-gray-400 text-xs mt-2 pt-1 border-t border-dashed border-gray-200">
                                                Diff: {Math.abs(data.MaleAbs - data.FemaleAbs).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <ReferenceLine x={0} stroke={COLORS.TEXT} strokeOpacity={0.5} />
                    
                    {/* Left Bars (Male) */}
                    <Bar dataKey="MaleNegative" fill={COLORS.MALE} stackId="stack" barSize={isMobile ? 12 : 18} radius={[4, 0, 0, 4]} />
                    
                    {/* Right Bars (Female) */}
                    <Bar dataKey="FEMALE" fill={COLORS.FEMALE} stackId="stack" barSize={isMobile ? 12 : 18} radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* --- CHART 4: STANDARD LINE CHART (Volume Trend) --- */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6 md:p-8">
         <h3 className="text-xl font-bold text-amber-950 mb-6">Historical Volume Trend</h3>
         <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke={COLORS.GRID} />
                <XAxis 
                    dataKey="YEAR" 
                    stroke={COLORS.TEXT} 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    minTickGap={30}
                />
                <YAxis 
                    stroke={COLORS.TEXT} 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => val >= 1000 ? `${val/1000}k` : val}
                />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#FFF7ED', borderRadius: '12px', border: '1px solid #FCD34D', color: COLORS.TEXT }}
                />
                <Legend iconType="circle"/>
                <Line 
                    type="monotone" 
                    dataKey="MALE" 
                    stroke={COLORS.MALE} 
                    strokeWidth={3} 
                    dot={false} 
                    activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Line 
                    type="monotone" 
                    dataKey="FEMALE" 
                    stroke={COLORS.FEMALE} 
                    strokeWidth={3} 
                    dot={false} 
                    activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
         </div>
      </div>

    </div>
  )
}

export default SexCharts