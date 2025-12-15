import { useState, useEffect, useMemo } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { Map, BarChart3, TrendingUp, Filter } from 'lucide-react'
import LoadingScreen from '../loadingScreen'
import OriginChoropleth from './originChoropleth'
import { useParseOriginData } from '../../hooks/useParseOriginData'
import { useIsMobile } from '../../hooks/useIsMobile'
import { COLUMN_ORDERS } from '../../utils/columnOrders'

const OriginCharts = () => {
  const { chartData, barChartData, regions, loading, error } = useParseOriginData()
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState<string>('All Years')
  const isMobile = useIsMobile()

  useEffect(() => {
    if (regions.length > 0) setSelectedRegions(regions)
  }, [regions])

  const years = useMemo(() => ['All Years', ...chartData.map(d => d.YEAR)], [chartData])

  // Function to extract region shorthand
  const getRegionShorthand = (fullRegion: string): string => {
    const acronymMatch = fullRegion.match(/\(([A-Z]+)\)/)
    if (acronymMatch) return acronymMatch[1]
    
    const regionMatch = fullRegion.match(/^Region\s+(I+|[IVX]+|[A-Z]+)\s*(-|–)/)
    if (regionMatch) return `Region ${regionMatch[1]}`

    if (fullRegion.includes('Region IV A')) return 'Region IV-A'
    if (fullRegion.includes('Region IV B')) return 'Region IV-B'    
    
    return fullRegion
  }

  const singleYearData = useMemo(() => {
    if (selectedYear === 'All Years') return []

    const yearData = chartData.find(d => String(d.YEAR) === String(selectedYear))
    if (!yearData) return []

    return COLUMN_ORDERS.region.map(region => ({
      region,
      shorthand: getRegionShorthand(region),
      total: yearData[region] || 0
    }))
  }, [selectedYear, chartData, regions])

  // Region Toggle handler
  const handleRegionChange = (region: string) => {
    setSelectedRegions(prev =>
      prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
    )
  }

  if (loading) return ( <LoadingScreen /> )

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 m-8 shadow-sm">
        <p className="font-bold flex items-center gap-2">⚠️ Error Loading Data</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    )
  }

  // Refined "Warm Professional" Palette
  const colors = [
    '#ea580c', // Vibrant Orange
    '#0f766e', // Teal
    '#b45309', // Amber 700
    '#be185d', // Pink/Magenta
    '#4338ca', // Indigo
    '#a16207', // Yellow Brown
    '#881337', // Rose
    '#1e3a8a', // Dark Blue
    '#7c2d12', // Oak
    '#374151', // Gray
    '#047857', // Emerald
    '#9a3412', // Deep Orange
    '#c2410c', // Orange Red
    '#15803d', // Green
  ]

  // Transform barChartData to include shorthand
  const barChartDataWithShorthand = barChartData.map(item => ({
    ...item,
    shorthand: getRegionShorthand(item.region)
  }))

  const CustomBarTooltip = (props: any, colorArray: string[]) => {
    const { active, payload } = props

    if (active && payload && payload.length) {
      const data = payload[0]
      const index = barChartData.findIndex(item => item.region === data.payload.region)
      const color = colorArray[index % colorArray.length]
      
      return (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          border: '1px solid #fdba74',
          borderLeft: `5px solid ${color}`,
          borderRadius: '8px',
          padding: '12px 16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          fontFamily: 'Inter, sans-serif'
        }}>
          <p style={{ color: '#111', fontWeight: '800', marginBottom: '4px', fontSize: '13px' }}>
            {data.payload.region}
          </p>
          <p style={{ color: '#4b5563', fontSize: '12px', margin: 0, display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <span>Total Emigrants:</span>
            <span style={{ fontWeight: 'bold', color: color }}>{data.value?.toLocaleString()}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

       {/* --- CHART 1: CHOROPLETH MAP (HERO) --- */}
       <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 backdrop-blur-xl rounded-3xl shadow-xl p-6 md:p-8 border border-white/50">
        <div className="mb-6">
            <h2 className="text-2xl font-bold text-amber-950 flex items-center gap-2">
                <Map className="text-amber-700" />
                Geographic Distribution
            </h2>
            <p className="text-amber-800/60 text-sm">Heatmap of emigrant origin density</p>
        </div>
        
        {/* Map Container */}
        <div className="w-full h-full flex items-center justify-center bg-white/40 rounded-2xl border border-amber-100 overflow-hidden relative">
             <OriginChoropleth />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      
        {/* --- CHART 2: BAR CHART --- */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 md:p-8 border border-white/50 flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h2 className="text-xl font-bold text-amber-950 flex items-center gap-2">
                <BarChart3 className="text-amber-600" />
                Volume by Region
              </h2>
              <p className="text-amber-800/60 text-sm font-medium">
                 {selectedYear === 'All Years' ? 'Total accumulated emigrants (1988 - 2020)' : `Total emigrants in ${selectedYear}`}
              </p>
            </div>

            {/* Year Filter */}
            <div className="relative group z-10">
                <select
                    id="year-filter"
                    value={selectedYear}
                    onChange={e => setSelectedYear(e.target.value)}
                    className="appearance-none bg-white border border-amber-200 text-amber-900 py-2 pl-4 pr-10 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-sm transition-all hover:border-amber-300"
                >
                    {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                    ))}
                </select>
                <Filter className="absolute right-3 top-2.5 text-amber-500 pointer-events-none" size={16} />
            </div>
          </div>
          
          <div className={`${isMobile ? 'overflow-x-auto' : ''} flex-grow`}>
            <div style={{ width: isMobile ? '600px' : '100%', height: '100%', minHeight: '500px' }}>
              <ResponsiveContainer width="100%" height="100%">
                {selectedYear === 'All Years' ? (
                  <BarChart 
                    data={barChartDataWithShorthand} 
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#fed7aa" opacity={0.5} />
                    <XAxis 
                      type="number" 
                      tickFormatter={(val) => val >= 1000000 ? `${(val/1000000).toFixed(1)}m` : val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}
                      domain={[0, 700000]}
                      tickCount={6}
                      axisLine={false}
                      tickLine={false}
                      stroke="#9a3412"
                      fontSize={11}
                      dy={10}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="shorthand" 
                      width={100}
                      axisLine={false}
                      tickLine={false}
                      stroke="#4b5563"
                      fontSize={11}
                      fontWeight={600}
                    />
                    <Tooltip 
                      content={(props) => CustomBarTooltip(props, colors)} 
                      cursor={{ fill: '#fff7ed', opacity: 0.5 }}
                    />
                    <Bar dataKey="total" radius={[0, 6, 6, 0]} barSize={24}>
                      {barChartDataWithShorthand.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <BarChart 
                    data={singleYearData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#fed7aa" opacity={0.5} />
                    <XAxis 
                      type="number" 
                      tickFormatter={(val) => val >= 1000000 ? `${(val/1000000).toFixed(1)}m` : val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}
                      tickCount={6}
                      axisLine={false}
                      tickLine={false}
                      stroke="#9a3412"
                      fontSize={11}
                      dy={10}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="shorthand" 
                      width={100}
                      axisLine={false}
                      tickLine={false}
                      stroke="#4b5563"
                      fontSize={11}
                      fontWeight={600}
                    />
                    <Tooltip 
                      content={(props) => CustomBarTooltip(props, colors)} 
                      cursor={{ fill: '#fff7ed', opacity: 0.5 }}
                    />
                    <Bar dataKey="total" radius={[0, 6, 6, 0]} barSize={24}>
                      {singleYearData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* --- CHART 3: LINE CHART --- */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 md:p-8 border border-white/50 flex flex-col">
          <div className="mb-6">
              <h2 className="text-xl font-bold text-amber-950 flex items-center gap-2">
                <TrendingUp className="text-amber-600" />
                Regional Trends
              </h2>
              <p className="text-amber-800/60 text-sm font-medium">Historical performance (1988 - 2020)</p>
          </div>

          {/* Interactive Filter Pills */}
          <div className="flex flex-wrap gap-2 mb-6 max-h-[120px] overflow-y-auto custom-scrollbar pr-2">
            {COLUMN_ORDERS.region.map((region, i) => (
              <button
                key={region}
                onClick={() => handleRegionChange(region)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold transition-all border 
                ${selectedRegions.includes(region) 
                    ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-sm' 
                    : 'bg-transparent border-transparent text-gray-400 hover:bg-gray-50'}`}
              >
                <span 
                    className="w-2 h-2 rounded-full transition-colors" 
                    style={{ backgroundColor: selectedRegions.includes(region) ? colors[i % colors.length] : '#cbd5e1' }} 
                />
                {getRegionShorthand(region)}
              </button>
            ))}
          </div>

          <div className={`${isMobile ? 'overflow-x-auto' : ''} flex-grow`}>
            <div style={{ width: isMobile ? '800px' : '100%', height: '100%', minHeight: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fed7aa" opacity={0.5} />
                  <XAxis 
                    dataKey="YEAR" 
                    axisLine={false}
                    tickLine={false}
                    stroke="#9a3412"
                    fontSize={11}
                    dy={10}
                    minTickGap={30}
                  />
                  <YAxis 
                    domain={[0, 'auto']}
                    axisLine={false}
                    tickLine={false}
                    stroke="#9a3412"
                    fontSize={11}
                    tickFormatter={(val) => val >= 1000 ? `${val/1000}k` : val}
                  />
                  <Tooltip 
                    wrapperStyle={{ outline: 'none' }} 
                    contentStyle={{
                      backgroundColor: '#fff7ed',
                      border: '1px solid #fdba74',
                      borderRadius: '12px',
                      color: '#7c2d12',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    itemStyle={{ fontWeight: 600 }}
                  />
                  {regions.map((region, i) => (
                    selectedRegions.includes(region) && (
                      <Line 
                        key={region} 
                        type="monotone" 
                        dataKey={region} 
                        stroke={colors[i % colors.length]} 
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 6, strokeWidth: 0, fill: colors[i % colors.length] }}
                      />
                    )
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default OriginCharts