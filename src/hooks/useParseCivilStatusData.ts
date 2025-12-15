import { useState, useEffect } from 'react'
import { getAllCivilStatusData } from '../api/civilStatusService'

interface TransformedCivilStatusData {
  YEAR: number
  [key: string]: number
  Single: number
  Married: number
  Widower: number
  Separated: number
  Divorced: number
  'Not Reported': number
}

interface GroupedCivilStatusData {
  Period: string
  Single: number
  Married: number
  Widower: number
  Separated: number
  Divorced: number
  'Not Reported': number
}

interface UseParseCivilStatusDataReturn {
  chartData: TransformedCivilStatusData[]
  groupedChartData: GroupedCivilStatusData[]
  civilStatusCategories: string[]
  loading: boolean
  error: string | null
}

export const useParseCivilStatusData = (): UseParseCivilStatusDataReturn => {
  const [chartData, setChartData] = useState<TransformedCivilStatusData[]>([])
  const [groupedChartData, setGroupedChartData] = useState<GroupedCivilStatusData[]>([])
  const [civilStatusCategories, setCivilStatusCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFromFirebase()
  }, [])

  const fetchFromFirebase = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Fetching civil status data from Firebase...')
      const data = await getAllCivilStatusData()

      if (data.length === 0) {
        console.warn('No civil status data found in Firebase. Please upload data first.')
        setLoading(false)
        return
      }

      // Extract civil status categories
      const firstEntry = data[0]
      const allCategories = Object.keys(firstEntry).filter(key => key !== 'YEAR')
      setCivilStatusCategories(allCategories)

      const transformed: TransformedCivilStatusData[] = data.map(item => ({
        YEAR: item.Year,
        Single: item.Single,
        Married: item.Married,
        Widower: item.Widower,
        Separated: item.Separated,
        Divorced: item.Divorced,
        'Not Reported': item['Not Reported']
      }))

      // Group data into 3 year periods for Bar Chart
      const groupedData: GroupedCivilStatusData[] = []
      const startYear = 1988
      const endYear = 2020

      for (let year = startYear; year <= endYear; year += 3) {
        const periodEnd = Math.min(year + 2, endYear)
        const periodLabel = `${year} - ${periodEnd}`
        const periodData: GroupedCivilStatusData = {
          Period: periodLabel,
          Single: 0,
          Married: 0,
          Widower: 0,
          Separated: 0,
          Divorced: 0,
          'Not Reported': 0
        }

        for (let y = year; y <= periodEnd; y++) {
          const yearData = transformed.find(s => s.YEAR === y)
          if (yearData) {
            periodData.Single += yearData.Single
            periodData.Married += yearData.Married
            periodData.Widower += yearData.Widower
            periodData.Separated += yearData.Separated
            periodData.Divorced += yearData.Divorced
            periodData['Not Reported'] += yearData['Not Reported']
          }
        }

        groupedData.push(periodData)
      }

      setChartData(transformed)
      setGroupedChartData(groupedData)
      setLoading(false)
      console.log('Successfully loaded data from Firebase')
    } catch (err) {
      console.error('Error fetching civil status data from Firebase:', err)
      setError('Failed to load civil status data from Firebase')
      setLoading(false)
    }
  }

  return {
    chartData,
    groupedChartData,
    civilStatusCategories,
    loading,
    error
  }
}