import { useState, useEffect } from 'react'
import { getAllSexData } from '../api/sexService'

interface TransformedSexData {
  YEAR: number
  MALE: number
  FEMALE: number
}

interface GroupedSexData {
  Period: string
  MALE: number
  FEMALE: number
}

interface PopulationPyramidData {
  Period: string
  MALE: number
  FEMALE: number
  MaleNegative: number
  [key: string]: string | number
}

interface ScatterPlotData {
  male: { x: number; y: number }[]
  female: { x: number; y: number }[]
}

interface TrendlineData {
  x: number
  y: number
}

interface TrendlineDataSet {
  maleTrend: TrendlineData[]
  femaleTrend: TrendlineData[]
}

interface UseParseSexDataReturn {
  chartData: TransformedSexData[]
  groupedChartData: GroupedSexData[]
  populationPyramidData: PopulationPyramidData[]
  scatterPlotData: ScatterPlotData
  trendlineData: TrendlineDataSet
  sexCategories: string[]
  loading: boolean
  error: string | null
}

export const useParseSexData = (): UseParseSexDataReturn => {
  const [chartData, setChartData] = useState<TransformedSexData[]>([])
  const [groupedChartData, setGroupedChartData] = useState<GroupedSexData[]>([])
  const [populationPyramidData, setPopulationPyramidData] = useState<PopulationPyramidData[]>([])
  const [scatterPlotData, setScatterPlotData] = useState<ScatterPlotData>({ male: [], female: [] })
  const [trendlineData, setTrendlineData] = useState<TrendlineDataSet>({ maleTrend: [], femaleTrend: [] })
  const [sexCategories, setSexCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Calculate Linear Regression for Scatter Plot Trendline
  const calculateLinearRegression = (data: { x: number; y: number}[]) => {
    const n = data.length
    const sumX = data.reduce((sum, point) => sum + point.x, 0)
    const sumY = data.reduce((sum, point) => sum + point.y, 0)
    const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0)
    const sumXX = data.reduce((sum, point) => sum + point.x * point.x, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n
    
    return { slope, intercept }
  }

  useEffect(() => {
    fetchFromFirebase()
  }, [])

  const fetchFromFirebase = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Fetching sex data from Firebase...')
      const data = await getAllSexData()

      if (data.length === 0) {
        console.warn('No sex data found in Firebase. Please upload data first.')
        setLoading(false)
        return
      }

      // Extract sex categories
      const allCategories = ["MALE", "FEMALE"]
      setSexCategories(allCategories)

      const transformed: TransformedSexData[] = data.map(item => ({
        YEAR: item.Year,
        MALE: item.MALE,
        FEMALE: item.FEMALE
      }))

      // Group data into 5 year periods for Bar Chart
      const groupedData: GroupedSexData[] = []
      const startYear = 1981
      const endYear = 2020

      for (let year = startYear; year <= endYear; year += 5) {
        const periodEnd = Math.min(year + 4, endYear)
        const periodLabel = `${year} - ${periodEnd}`
        const periodData: GroupedSexData = {
          Period: periodLabel,
          MALE: 0,
          FEMALE: 0
        }

        for (let y = year; y <= periodEnd; y++) {
          const yearData = transformed.find(s => s.YEAR === y)
          if (yearData) {
            periodData.MALE += yearData.MALE
            periodData.FEMALE += yearData.FEMALE
          }
        }

        groupedData.push(periodData)
      }

      // Create Population Pyramid Data with negative male values
      const pyramidData: PopulationPyramidData[] = groupedData.map((period) => ({
        Period: period.Period,
        MALE: period.MALE,
        FEMALE: period.FEMALE,
        MaleNegative: -period.MALE
      }))

      // Create Scatterplot data
      const maleScatterData = transformed.map(item => ({ x: item.YEAR, y: item.MALE  }))
      const femaleScatterData = transformed.map(item => ({ x: item.YEAR, y: item.FEMALE }))

      // Calculate trendlines
      const maleRegression = calculateLinearRegression(maleScatterData)
      const femaleRegression = calculateLinearRegression(femaleScatterData)

      const maleTrendline: TrendlineData[] = [
        { x: startYear, y: maleRegression.slope * startYear + maleRegression.intercept },
        { x: endYear, y: maleRegression.slope * endYear + maleRegression.intercept }
      ]

      const femaleTrendline: TrendlineData[] = [
        { x: startYear, y: femaleRegression.slope * startYear + femaleRegression.intercept },
        { x: endYear, y: femaleRegression.slope * endYear + femaleRegression.intercept }
      ]

      setChartData(transformed)
      setGroupedChartData(groupedData)
      setPopulationPyramidData(pyramidData)
      setScatterPlotData({ male: maleScatterData, female: femaleScatterData })
      setTrendlineData({ maleTrend: maleTrendline, femaleTrend: femaleTrendline })
      setLoading(false)
      console.log('Successfully loaded data from Firebase')
    } catch (err) {
      console.error('Error fetching sex data from Firebase:', err)
      setError('Failed to load sex data from Firebase')
      setLoading(false)
    }
  }

  return {
    chartData,
    groupedChartData,
    populationPyramidData,
    scatterPlotData,
    trendlineData,
    sexCategories,
    loading,
    error
  }  
}