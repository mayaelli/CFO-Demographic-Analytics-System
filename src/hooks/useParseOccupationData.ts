import { useState, useEffect, useMemo } from 'react'
import { getAllOccupationData } from '../api/occupationService'

interface TransformedOccupationData {
  Year: number
  [occupation: string]: number
}

interface TreemapData {
  name: string
  value: number
}

interface UseParseOccupationDataReturn {
  chartData: TransformedOccupationData[]
  occupations: string[]
  years: number[]
  treemapData: TreemapData[]
  loading: boolean
  error: string | null
}

export const useParseOccupationData = (year: number | 'all' = 'all'): UseParseOccupationDataReturn => {
  const [chartData, setChartData] = useState<TransformedOccupationData[]>([])
  const [occupations, setOccupations] = useState<string[]>([])
  const [allRows, setAllRows] = useState<TransformedOccupationData[]>([])
  const [treemapData, setTreemapData] = useState<TreemapData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Hook to Parse Occupation Data
  useEffect(() => {
    fetchFromFirebase()
  }, [])

  useEffect(() => {
    if (allRows.length === 0) return

    const rows = year === 'all' ? allRows : allRows.filter((r: any) => r.Year === year)

    if (rows.length === 0) {
      setChartData([])
      setTreemapData([])
      return
    }

    // Extract occupations from first data entry
    const firstEntry = rows[0]
    const allOccupations = Object.keys(firstEntry).filter(key => key !== 'Year')
    setOccupations(allOccupations)

    // Calculate totals for treemap
    const totals: { [key: string]: number } = {}
    allOccupations.forEach(occupation => {
      totals[occupation] = 0
    })

    rows.forEach(yearData => {
      allOccupations.forEach(occupation => {
        totals[occupation] += yearData[occupation] || 0
      })
    })

    const treemap = allOccupations.map(occupation => ({
      name: occupation,
      value: totals[occupation]
    }))

    setChartData(rows)
    setTreemapData(treemap)
    setLoading(false)
  }, [year, allRows])

  const years = useMemo(() => {
    return Array.from(new Set(allRows.map(r => r.Year))).sort((a, b) => b - a)
  }, [allRows])

  const fetchFromFirebase = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Fetching occupation data from Firebase...')
      const data = await getAllOccupationData()

      if (data.length === 0) {
        setError('No occupation data found in Firebase. Please upload data first.')
        setLoading(false)
        return
      }

      setAllRows(data)
      setLoading(false)
      console.log('Successfully loaded data from Firebase')
    } catch (err) {
      console.error('Error fetching occupation data from Firebase:', err)
      setError('Failed to load occupation data from Firebase')
      setLoading(false)
    }
  }

  return {
    chartData,
    occupations,
    years,
    treemapData,
    loading,
    error
  }
}
