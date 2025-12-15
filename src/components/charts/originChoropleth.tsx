import { useCallback } from 'react'
import { ResponsiveChoropleth } from '@nivo/geo'
import { useParseOriginProvinceData } from '../../hooks/useParseOriginProvinceData'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useGeoJSON } from '../../hooks/useGeoJSON'
import { useYearFilter } from '../../hooks/useYearFilter'
import LoadingScreen from '../loadingScreen'

const normalizeName = (s: string) =>
  (s || '')
    .toUpperCase()
    .trim()
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const PHOriginChoropleth = () => {
  const { selectedYear, onSelectChange } = useYearFilter('all')
  const { totals, years, min, max, loading, error: dataError } = useParseOriginProvinceData(selectedYear)
  const isMobile = useIsMobile()
  
  const transform = useCallback((fc: any) => (
    (fc?.features || []).filter((feat: any) =>
      (feat?.properties?.ENGTYPE_1 || '').toUpperCase() === 'PROVINCE' &&
      feat?.properties?.PROVINCE
    ).map((feat: any) => ({
      ...feat,
      id: normalizeName(feat.properties.PROVINCE)
    }))
  ), [])

  const { data: features, loading: geoLoading, error: geoError } = useGeoJSON<any[]>(
    '/data/Provinces.json',
    transform    
  )

  if (geoError) return <div className="text-red-500 p-6">Error: {geoError}</div>
  if (dataError) return <div className="text-red-500 p-6">Error: {dataError}</div>
  if (loading || geoLoading || !features) return <LoadingScreen />

  const data = Object.entries(totals).map(([name, total]) => ({
    id: name,
    value: total,
    total
  }))

return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border-2 border-amber-200">
      <h2 className="text-xl text-center font-semibold text-amber-900 mb-6 tracking-tight">
        {selectedYear === 'all' 
          ? 'Emigrant Origin Density by Province (1988 - 2020)' 
          : `Emigrant Origin Density by Province in ${selectedYear}`
        }
      </h2>

      {/* Year Filter Dropdown */}
      <div className="mb-6 flex justify-center">
        <select
          value={selectedYear}
          onChange={onSelectChange}
          className="bg-white border-2 border-amber-300 text-amber-900 rounded-xl px-4 py-2 font-medium shadow-md hover:shadow-lg hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all cursor-pointer"
        >
          <option value="all">All Years (1988-2020)</option>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <div className={isMobile ? 'overflow-x-auto rounded-xl' : ''}>
        <div style={{ width: isMobile ? '600px' : '100%', height: '600px' }}>
          <ResponsiveChoropleth
            data={data}
            features={features}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            colors={[
                '#FED172', // Light Gold/Cream (Trully's brightest shade)
                '#FF9854', // Lighter Orange (A high-contrast warm mid-tone)
                '#F3742B', // Bright Orange (Trully's clear orange anchor)
                '#B83A14', // Rust Red/Burnt Orange (Trully's dark warm mid-tone)
                '#231650', // Deep Navy/Indigo (Trully's deepest cool tone for contrast)
                '#612E37', // Dark Plum/Maroon (Trully's deepest warm tone)
                '#E64E24' // Bright Brick Red (A strong red accent for distinction)
            ]}           
            domain={[min, max]}
            unknownColor="#78350F"
            label="properties.PROVINCE"
            valueFormat={(v) => Number(v).toLocaleString()}
            tooltip={({ feature }: any) => (
              <div
                style={{
                  background: '#FFF7ED',
                  border: '2px solid #F59E0B',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  color: '#92400E',
                  fontSize: '13px',
                  fontWeight: 500,
                  boxShadow: '0 10px 25px rgba(217, 119, 6, 0.2)'
                }}
              >
                <strong style={{ color: '#B45309', fontSize: '14px' }}>
                  {feature.properties?.PROVINCE}
                </strong>
                <br />
                <span style={{ color: '#92400E' }}>
                  Total: {feature.data?.total?.toLocaleString() || 'N/A'}
                </span>
              </div>
            )}
            // Tuned to center/scale PH; adjust if needed
            projectionScale={2000}
            projectionTranslation={[0.5, 0.72]}
            projectionRotation={[-122, -8.5, 0]}
            enableGraticule={false}
            borderWidth={1}
            borderColor="#D97706"
          />
        </div>
      </div>
    </div>
  )
}

export default PHOriginChoropleth