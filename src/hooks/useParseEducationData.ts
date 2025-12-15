import { useState, useEffect } from 'react'
import { getAllEducationData } from '../api/educationService'

interface TransformedEducationData {
  Year: number
  [educationLevel: string]: number 
}

interface GroupedEducationData {
  Period: string
  [educationLevel: string]: number | string
}

interface UseParseEducationDataReturn {
  chartData: TransformedEducationData[]
  groupedChartData: GroupedEducationData[]
  educationLevels: string[]
  loading: boolean
  error: string | null
}

export const useParseEducationData = (): UseParseEducationDataReturn => {
  const [chartData, setChartData] = useState<TransformedEducationData[]>([])
  const [groupedChartData, setGroupedChartData] = useState<GroupedEducationData[]>([])
  const [educationLevels, setEducationLevels] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Hook to Parse Education Data
  useEffect(() => {
    fetchFromFirebase()
  }, [])
  
  // Fetch from Firebase
  const fetchFromFirebase = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Fetching age data from Firebase...')
      const data = await getAllEducationData()

      if (data.length === 0) {
        console.warn('No age data found in Firebase. Please upload data first.')
        setLoading(false)
        return
      }

      // Extract age groups from first data entry
      const firstEntry = data[0]
      const allEducationLevels = Object.keys(firstEntry).filter(key => key !== 'Year')
      setEducationLevels(allEducationLevels)

      // Group data into 3 year periods for Bar Chart
      const groupedData = createGroupedData(data, allEducationLevels)

      setChartData(data)
      setGroupedChartData(groupedData)
      setLoading(false)
      console.log('Successfully loaded data from Firebase')
    } catch (err) {
      console.error('Error fetching education data from Firebase:', err)
      setError('Failed to load education data from Firebase')
      setLoading(false)
    }
  }

  const createGroupedData = (
    transformed: TransformedEducationData[],
    allEducationLevels: string[]
  ): GroupedEducationData[] => {
    const groupedData: GroupedEducationData[] = []
    const startYear = 1988
    const endYear = 2020

    for (let year = startYear; year <= endYear; year += 3) {
      const periodEnd = Math.min(year + 2, endYear)
      const periodLabel = `${year} - ${periodEnd}`
      const periodData: GroupedEducationData = { Period: periodLabel }

      allEducationLevels.forEach(educationLevel => {
        let sum = 0

        for (let y = year; y <= periodEnd; y++) {
          const yearData = transformed.find(e => e.Year === y)
          if (yearData && yearData[educationLevel]) {
            sum += yearData[educationLevel] as number
          }
        }

        periodData[educationLevel] = sum
      })

      groupedData.push(periodData)
    }

    return groupedData
  }

  return {
    chartData,
    groupedChartData,
    educationLevels,
    loading,
    error
  }
}