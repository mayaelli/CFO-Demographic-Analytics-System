import { useMemo } from 'react'
import { ResponsiveChoropleth } from '@nivo/geo'
import { useParseAllDestinationData } from '../../hooks/useParseAllDestinationData'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useGeoJSON } from '../../hooks/useGeoJSON'
import { useYearFilter } from '../../hooks/useYearFilter'
import { toIso3 } from '../../utils/countryMapping'
import LoadingScreen from '../loadingScreen'

const ChoroplethMap = () => {
  const { selectedYear, onSelectChange } = useYearFilter('all')
  const { mapData, loading, years } = useParseAllDestinationData(selectedYear)
  const isMobile = useIsMobile()
  const { data: geoData, loading: geoLoading, error: geoError } = useGeoJSON('/data/worldCountries.json')

  // Transform data for Nivo Choropleth format
  const nivoData = useMemo(() => {
    return mapData.map(item => {
      let categoryValue = 0
      if (item.total >= 1000000) categoryValue = 4
      else if (item.total >= 500000) categoryValue = 3
      else if (item.total >= 100000) categoryValue = 2
      else if (item.total >= 10000) categoryValue = 1
      
      return {
        id: toIso3(item.country) || item.country,
        value: categoryValue,
        total: item.total
      }
    })
  }, [mapData])

  if (geoError) return (
    <div className="bg-red-500/20 border border-red-500 text-red-300 rounded-lg p-4 m-8">
      <p className="font-bold">⚠️ Error Loading Data</p>
      <p>{geoError}</p>
    </div>
  )

  if (loading || geoLoading || !geoData) return <LoadingScreen />


  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border-2 border-amber-200">
      <h2 className="text-xl text-center font-semibold text-amber-900 mb-6 tracking-tight">
        {selectedYear === 'all' 
          ? 'Emigrant Destination of Filipinos by Country (1981 - 2020)' 
          : `Emigrant Destination of Filipinos by Country in ${selectedYear}`
        }
      </h2>

      {/* Year Filter Dropdown */}
      <div className="mb-6 flex justify-center">
        <div className="relative inline-block">
          <select
            value={selectedYear}
            onChange={onSelectChange}
            className="appearance-none px-6 py-3 bg-white border-2 border-amber-300 rounded-xl text-amber-900 font-semibold shadow-lg hover:shadow-xl hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all cursor-pointer min-w-[200px]"
          >
            <option value="all">All Years (1981-2020)</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute bottom-0 right-0 flex items-center px-3 pb-3 text-amber-700">
            <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <div className={isMobile ? 'overflow-x-auto rounded-xl' : ''}>
        <div style={{ width: isMobile ? '900px' : '100%', height: '650px' }}>
          <ResponsiveChoropleth
            data={nivoData}
            features={geoData.features}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            colors={['#FEF3C7', '#FCD34D', '#F59E0B', '#D97706', '#92400E']}
            domain={[0, 4]}
            unknownColor="#FEF3C7"
            label="properties.name"
            valueFormat={(value) => {
              const country = nivoData.find(item => item.value === value)
              return country ? country.total.toLocaleString() : value.toString()
            }}
            tooltip={({ feature }) => (
              <div style={{
                background: '#FFF7ED',
                border: '2px solid #F59E0B',
                borderRadius: '12px',
                padding: '12px 16px',
                color: '#92400E',
                fontWeight: 500,
                boxShadow: '0 10px 25px rgba(217, 119, 6, 0.2)'
              }}>
                <strong style={{ color: '#B45309', fontSize: '15px' }}>
                  {feature.label}
                </strong>
                <br />
                <span style={{ fontSize: '14px' }}>
                  Total: {feature.data?.total?.toLocaleString() || 'N/A'}
                </span>
              </div>
            )}
            projectionScale={130}
            projectionTranslation={[0.5, 0.6]}
            projectionRotation={[0, 0, 0]}
            enableGraticule={false}
            borderWidth={1}
            borderColor="#D97706"
          />
        </div>
      </div>

      {/* Custom Legend */}
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <div className="flex items-center gap-2 bg-amber-50/50 px-3 py-2 rounded-lg border border-amber-200">
          <div className="w-6 h-6 rounded shadow-sm" style={{ backgroundColor: '#92400E' }}></div>
          <span className="text-amber-900 text-sm font-medium">Extreme (≥1M)</span>
        </div>
        <div className="flex items-center gap-2 bg-amber-50/50 px-3 py-2 rounded-lg border border-amber-200">
          <div className="w-6 h-6 rounded shadow-sm" style={{ backgroundColor: '#D97706' }}></div>
          <span className="text-amber-900 text-sm font-medium">Significant (≥500K)</span>
        </div>
        <div className="flex items-center gap-2 bg-amber-50/50 px-3 py-2 rounded-lg border border-amber-200">
          <div className="w-6 h-6 rounded shadow-sm" style={{ backgroundColor: '#F59E0B' }}></div>
          <span className="text-amber-900 text-sm font-medium">Moderate (≥100K)</span>
        </div>
        <div className="flex items-center gap-2 bg-amber-50/50 px-3 py-2 rounded-lg border border-amber-200">
          <div className="w-6 h-6 rounded shadow-sm" style={{ backgroundColor: '#FCD34D' }}></div>
          <span className="text-amber-900 text-sm font-medium">Slight (≥10K)</span>
        </div>
        <div className="flex items-center gap-2 bg-amber-50/50 px-3 py-2 rounded-lg border border-amber-200">
          <div className="w-6 h-6 rounded shadow-sm" style={{ backgroundColor: '#FEF3C7' }}></div>
          <span className="text-amber-900 text-sm font-medium">Nil (&lt;10K)</span>
        </div>
      </div>
    </div>
  )
}

export default ChoroplethMap
