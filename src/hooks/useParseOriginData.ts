import { useState, useEffect } from 'react'
import { getAllRegionData } from '../api/originService'

interface TransformedOriginData {
  YEAR: number
  [region: string]: number
}

interface BarChartData {
  region: string
  total: number
}

interface UseParseOriginDataReturn {
  chartData: TransformedOriginData[]
  barChartData: BarChartData[]
  regions: string[]
  loading: boolean
  error: string | null
}

export const useParseOriginData = (): UseParseOriginDataReturn => {
  const [chartData, setChartData] = useState<TransformedOriginData[]>([])
  const [barChartData, setBarChartData] = useState<BarChartData[]>([])
  const [regions, setRegions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Hook to Parse Origin Data
  useEffect(() => {
    fetchFromFirebase()
  }, [])

  const fetchFromFirebase = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await getAllRegionData()

      if (data.length === 0) {
        setError('No region data found in Firebase. Please upload data first.')
        setLoading(false)
        return
      }

      // Extract region names
      const allRegions = Object.keys(data[0]).filter(key => key !== 'Year')
      setRegions(allRegions)

      // Transform data
      const transformed: TransformedOriginData[] = data.map(yearData => ({
        YEAR: yearData.Year,
        ...Object.fromEntries(
          allRegions.map(region => [region, yearData[region] || 0])
        )
      }))

      // Calculate totals for bar chart
      const totals: { [key: string]: number } = {}
      allRegions.forEach(region => {
        totals[region] = 0
      })

      transformed.forEach(yearData => {
        allRegions.forEach(region => {
          totals[region] += yearData[region] || 0
        })
      })

      // Convert totals to bar chart data
      const barData = allRegions.map(region => ({
        region,
        total: totals[region]
      })).sort((a, b) => b.total - a.total)

      setChartData(transformed)
      setBarChartData(barData)
      setLoading(false)
      console.log('✅ Successfully loaded origin data from Firebase')
    } catch (err) {
      console.error('Error fetching origin data from Firebase:', err)
      setError('Failed to load origin data from Firebase. Please check your connection.')
      setLoading(false)
    }
  }

  return {
    chartData,
    barChartData,
    regions,
    loading,
    error
  }
}