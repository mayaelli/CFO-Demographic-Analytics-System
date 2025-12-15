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
  Legend,
  ResponsiveContainer
} from 'recharts'
import { 
  TrendingUp, 
  BarChart3, 
  Map as MapIcon, 
  Filter, 
  Calendar,
  Check
} from 'lucide-react'

import { useParseMajorDestinationData } from '../../hooks/useParseMajorDestinationData'
import ChoroplethMap from './choroplethMap'
import { useIsMobile } from '../../hooks/useIsMobile'
import { COLUMN_ORDERS } from '../../utils/columnOrders'
import { CustomTooltip } from '../customTooltip'
import LoadingScreen from '../loadingScreen'

const DestinationCharts = () => {
  const { chartData, barChartData, countries, loading, error } = useParseMajorDestinationData()
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState<string>('All Years')
  const isMobile = useIsMobile()

  useEffect(() => {
    if (countries.length > 0) setSelectedCountries(countries)
  }, [countries])

  const years = useMemo(() => ['All Years', ...chartData.map(d => d.YEAR)], [chartData])

  const singleYearData = useMemo(() => {
    if (selectedYear === 'All Years') return []

    const yearData = chartData.find(d => String(d.YEAR) === String(selectedYear))
    if (!yearData) return []

    return COLUMN_ORDERS.majorDestination.map(country => ({
      country,
      total: yearData[country] || 0
    }))
  }, [selectedYear, chartData, countries])

  // Country Toggle handler
  const handleCountryChange = (country: string) => {
    setSelectedCountries(prev =>
      prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country]
    )
  }
  
  if (loading) return ( <LoadingScreen /> )

  if (error) {
    return (
      <div className="bg-red-50 text-red-800 border border-red-200 rounded-xl p-6 m-8 text-center shadow-sm">
        <p className="font-bold text-lg mb-2">⚠️ Unable to Load Data</p>
        <p className="text-sm opacity-80">{error}</p>
      </div>
    )
  }

  const colors = [
    '#D97706', '#EA580C', '#DC2626', '#B91C1C', '#92400E', '#78350F',
    '#F59E0B', '#FB923C', '#FCA5A5', '#FDBA74', '#FCD34D', '#B45309',
    '#C2410C', '#991B1B'
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* 1. Global Map Section */}
      <section className="bg-white/60 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-amber-100 shadow-xl shadow-amber-900/5">
        <div className="flex items-center gap-3 mb-6 border-b border-amber-100 pb-4">
          <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
            <MapIcon size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-amber-950">Global Distribution</h2>
            <p className="text-xs text-amber-800/60">Geospatial view of emigrant density</p>
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden border border-amber-100">
          <ChoroplethMap />
        </div>
      </section>

      {/* 2. Trends Line Chart */}
      <section className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-amber-900/5 p-6 md:p-8 border border-amber-100 relative overflow-hidden">
        {/* Decorative background gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-100/40 to-transparent rounded-full blur-3xl -z-10" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 text-orange-700 rounded-lg">
              <TrendingUp size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-amber-950">Historical Trends</h2>
              <p className="text-sm text-amber-800/60">Migration volume over time (1981 - 2020)</p>
            </div>
          </div>
        </div>
        
        {/* Country Filter Pills */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-amber-800/50 uppercase tracking-wider">
            <Filter size={12} /> Filter Countries:
          </div>
          <div className="flex flex-wrap gap-2">
            {COLUMN_ORDERS.majorDestination.map(country => {
              const isActive = selectedCountries.includes(country);
              return (
                <button
                  key={country}
                  onClick={() => handleCountryChange(country)}
                  className={`
                    relative pl-3 pr-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border flex items-center gap-1.5
                    ${isActive 
                      ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20 scale-105' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:bg-amber-50'
                    }
                  `}
                >
                  {isActive && <Check size={10} strokeWidth={4} />}
                  {country}
                </button>
              )
            })}
          </div>
        </div>

        {/* Chart Area */}
        <div className={`transition-all ${isMobile ? "overflow-x-auto pb-4" : ""}`}>
          <div style={{ minWidth: isMobile ? '600px' : 'auto' }}>
            <ResponsiveContainer width="100%" height={500}>
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke='#fcd34d' vertical={false} opacity={0.3} />
                <XAxis 
                  dataKey="YEAR" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60}
                  tick={{ fill: '#78350F', fontSize: 11, fontWeight: 500 }}
                  axisLine={{ stroke: '#fcd34d' }}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  domain={[0, 50000]}
                  tickCount={6}
                  tick={{ fill: '#78350F', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value}
                />
                <Tooltip 
                  cursor={{ stroke: '#F59E0B', strokeWidth: 2 }}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    fontFamily: 'inherit',
                    padding: '12px'
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}/>

                {countries.map((country, i) => (
                  selectedCountries.includes(country) && (
                    <Line 
                      key={country} 
                      type="monotone" 
                      dataKey={country} 
                      stroke={colors[i % colors.length]} 
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      animationDuration={1500}
                    />
                  )
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* 3. Bar Chart Volume Section */}
      <section className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-amber-900/5 p-6 md:p-8 border border-amber-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
              <BarChart3 size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-amber-950">Comparative Volume</h2>
              <p className="text-sm text-amber-800/60">
                {selectedYear === 'All Years' ? 'Total accumulation across all years' : `Specific breakdown for ${selectedYear}`}
              </p>
            </div>
          </div>

          {/* Styled Year Selector */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-600">
              <Calendar size={16} />
            </div>
            <select
              id="year-filter"
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="appearance-none pl-10 pr-10 py-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl font-semibold shadow-sm hover:bg-white hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all cursor-pointer min-w-[140px]"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            {/* Custom Chevron */}
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-amber-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        <div className={`transition-all ${isMobile ? "overflow-x-auto pb-4" : ""}`}>
          <div style={{ minWidth: isMobile ? '700px' : 'auto' }}>
            <ResponsiveContainer width="100%" height={600}>
              {selectedYear === 'All Years' ? (
                <BarChart data={barChartData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke='#fcd34d' opacity={0.2} />
                  <XAxis 
                    type="number" 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => value >= 1000000 ? `${(value / 1000000).toFixed(1)}m` : `${(value / 1000).toFixed(0)}k`}
                    tick={{ fill: '#92400E', fontSize: 11, fontWeight: 600 }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="country" 
                    width={140}
                    tick={{ fill: '#451a03', fontSize: 12, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{fill: '#fef3c7', opacity: 0.4}}
                    content={<CustomTooltip data={barChartData} colors={colors} categoryKey="country" />} 
                  />
                  <Bar dataKey="total" radius={[0, 6, 6, 0]} barSize={24}>
                    {barChartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <BarChart data={singleYearData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke='#fcd34d' opacity={0.2} />
                  <XAxis 
                    type="number" 
                    domain={[0, 50000]} // Fixed domain for better year comparison
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    tick={{ fill: '#92400E', fontSize: 11, fontWeight: 600 }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="country" 
                    width={140}
                    tick={{ fill: '#451a03', fontSize: 12, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{fill: '#fef3c7', opacity: 0.4}}
                    content={<CustomTooltip data={singleYearData} colors={colors} categoryKey="country" />} 
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
      </section>

    </div>
  )
}

export default DestinationCharts