import { useState, useEffect } from 'react'
import { getAllMajorDestinationData } from '../api/destinationService'

interface TransformedMajorDestinationData {
  YEAR: number
  [key: string]: number
  USA: number
  CANADA: number
  JAPAN: number
  AUSTRALIA: number
  ITALY: number
  'NEW ZEALAND': number
  'UNITED KINGDOM': number
  GERMANY: number
  'SOUTH KOREA': number
  SPAIN: number
  OTHERS: number
}

interface BarChartData {
  country: string
  total: number
}

interface UseParseMajorDestinationDataReturn {
  chartData: TransformedMajorDestinationData[]
  barChartData: BarChartData[]
  countries: string[]
  loading: boolean
  error: string | null
}

export const useParseMajorDestinationData = (): UseParseMajorDestinationDataReturn => {
  const [chartData, setChartData] = useState<TransformedMajorDestinationData[]>([])
  const [barChartData, setBarChartData] = useState<BarChartData[]>([])
  const [countries, setCountries] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFromFirebase()
  }, [])

  const fetchFromFirebase = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Fetching major destination data from Firebase...')
      const data = await getAllMajorDestinationData()

      if (data.length === 0) {
        setError('No major destination data found in Firebase. Please upload data first.')
        setLoading(false)
        return
      }

      // Extract country names
      const firstEntry = data[0]
      const allCountries = Object.keys(firstEntry).filter(key => key !== 'Year')
      setCountries(allCountries)

      // Transform data
      const transformed: TransformedMajorDestinationData[] = data.map(item => ({
        YEAR: item.Year,
        USA: item.USA,
        CANADA: item.CANADA,
        JAPAN: item.JAPAN,
        AUSTRALIA: item.AUSTRALIA,
        ITALY: item.ITALY,
        'NEW ZEALAND': item['NEW ZEALAND'],
        'UNITED KINGDOM': item['UNITED KINGDOM'],
        GERMANY: item.GERMANY,
        'SOUTH KOREA': item['SOUTH KOREA'],
        SPAIN: item.SPAIN,
        OTHERS: item.OTHERS
      }))

      // Calculate totals for bar chart
      const totals: { [key: string]: number } = {}
      allCountries.forEach(country => {
        totals[country] = 0
      })
      
      transformed.forEach(yearData => {
        allCountries.forEach(country => {
          totals[country] += yearData[country as keyof TransformedMajorDestinationData] as number
        })
      })
      
      // Convert totals to bar chart data
      const barData = allCountries.map(country => ({
        country,
        total: totals[country]
      })).sort((a, b) => b.total - a.total)

      setChartData(transformed)
      setBarChartData(barData)
      setLoading(false)
      console.log('✅ Successfully loaded major destination data from Firebase')
    } catch (err) {
      console.error('Error fetching major destination data from Firebase:', err)
      setError('Failed to load major destination data from Firebase. Please check your connection.')
      setLoading(false)
    }
  }

  return {
    chartData,
    barChartData,
    countries,
    loading,
    error
  }
}