import { useState, useEffect } from 'react'
import { getAllAgeData } from '../api/ageService'

interface TransformedAgeData {
  Year: number
  [ageGroup: string]: number
}

interface GroupedAgeData {
  Period: string
  [ageGroup: string]: number | string
}

interface UseParseAgeDataReturn {
  chartData: TransformedAgeData[]
  groupedChartData: GroupedAgeData[]
  ageGroups: string[]
  loading: boolean
  error: string | null
}

export const useParseAgeData = (): UseParseAgeDataReturn => {
  const [chartData, setChartData] = useState<TransformedAgeData[]>([])
  const [groupedChartData, setGroupedChartData] = useState<GroupedAgeData[]>([])
  const [ageGroups, setAgeGroups] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFromFirebase()
  }, [])

  // Fetch from Firebase
  const fetchFromFirebase = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Fetching age data from Firebase...')
      const data = await getAllAgeData()

      if (data.length === 0) {
        console.warn('No age data found in Firebase. Please upload data first.')
        setLoading(false)
        return
      }

      // Extract age groups from first data entry
      const firstEntry = data[0]
      const allAgeGroups = Object.keys(firstEntry).filter(key => key !== 'Year')
      setAgeGroups(allAgeGroups)

      // Group data into 5 year periods for Bar Chart
      const groupedData = createGroupedData(data, allAgeGroups)

      setChartData(data)
      setGroupedChartData(groupedData)
      setLoading(false)
      console.log('Successfully loaded data from Firebase')
    } catch (err) {
      console.error('Error fetching age data from Firebase:', err)
      setError('Failed to load age data from Firebase')
      setLoading(false)
    }
  }

  // Helper function to create grouped data
  const createGroupedData = (
    transformed: TransformedAgeData[],
    allAgeGroups: string[]
  ): GroupedAgeData[] => {
    const groupedData: GroupedAgeData[] = []
    const startYear = 1981
    const endYear = 2020

    for (let year = startYear; year <= endYear; year += 5) {
      const periodEnd = Math.min(year + 4, endYear)
      const periodLabel = `${year} - ${periodEnd}`
      const periodData: GroupedAgeData = { Period: periodLabel }

      // Sum up values for each age group in the period
      allAgeGroups.forEach(ageGroup => {
        let sum = 0

        for (let y = year; y <= periodEnd; y++) {
          const yearData = transformed.find(a => a.Year === y)
          
          if (yearData && yearData[ageGroup]) sum += yearData[ageGroup] as number
        }

        periodData[ageGroup] = sum
      })

      groupedData.push(periodData)
    }

    return groupedData
  }

  return {
    chartData,
    groupedChartData,
    ageGroups,
    loading,
    error
  }
}