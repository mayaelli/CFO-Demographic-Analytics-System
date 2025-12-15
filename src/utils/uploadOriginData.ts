import Papa from 'papaparse'
import { postRegionData, postProvinceData } from '../api/originService'

interface CSVRow {
  [key: string]: string
}

interface UploadResult {
  success: boolean
  message: string
  uploadedCount?: number
}

// ===== REGION UPLOAD =====

const validateRegionCSV = (data: CSVRow[]): { valid: boolean, error?: string } => {
  if (data.length === 0) return { valid: false, error: 'CSV file is empty' }

  const firstRow = data[0]
  const headers = Object.keys(firstRow)

  // Check for REGION column
  if (!headers.includes('REGION')) {
    return { valid: false, error: 'CSV must have a "REGION" column' }
  }

  // Check that we have year columns
  const yearColumns = headers.filter(key => key !== 'REGION')
  if (yearColumns.length === 0) {
    return { valid: false, error: 'CSV must have at least one year column' }
  }

  // Validate year columns are numbers
  for (const year of yearColumns) {
    if (isNaN(parseInt(year, 10))) {
      return { valid: false, error: `Invalid year column: "${year}"` }
    }
  }

  return { valid: true }
}

export const uploadRegionCSVToFirebase = async (file: File): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    if (!file.name.endsWith('.csv')) {
      resolve({
        success: false,
        message: 'Invalid file type. Please upload a CSV file.'
      })
      return
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rawData = results.data as CSVRow[]

          // Validate CSV structure
          const validation = validateRegionCSV(rawData)
          if (!validation.valid) {
            reject({
              success: false,
              message: `Validation failed: ${validation.error}`
            })
            return
          }

          const yearColumns = Object.keys(rawData[0]).filter(key => key !== 'REGION')

          // Transform data
          const yearDataMap: Record<string, Record<string, number>> = {}

          yearColumns.forEach(year => {
            yearDataMap[year] = {}
          })

          rawData.forEach(row => {
            const region = row.REGION
            if (!region) return

            yearColumns.forEach(year => {
              yearDataMap[year][region] = parseInt(row[year], 10) || 0
            })
          })

          // Upload to Firebase
          let uploadedCount = 0
          for (const year of yearColumns) {
            await postRegionData(parseInt(year, 10), yearDataMap[year])
            uploadedCount++
            console.log(`✓ Uploaded region data for year ${year} (${uploadedCount}/${yearColumns.length})`)
          }

          resolve({
            success: true,
            message: 'All region data uploaded successfully!',
            uploadedCount
          })
        } catch (error) {
          console.error('❌ Error uploading region data:', error)
          reject({
            success: false,
            message: error instanceof Error ? error.message : 'Upload failed'
          })
        }
      },
      error: (error) => {
        console.error('❌ CSV parsing error:', error)
        reject({ 
          success: false, 
          message: 'Failed to parse CSV file.' 
        })
      }
    })
  })
}


// ===== PROVINCE UPLOAD =====

const validateProvinceCSV = (data: CSVRow[]): { valid: boolean, error?: string } => {
  // Check if empty
  if (data.length === 0) return { valid: false, error: 'CSV file is empty' }

  // Check if PROVINCE column exists
  if (!data[0].hasOwnProperty('PROVINCE')) {
    return { valid: false, error: 'Missing required column: PROVINCE' }
  }

  // Check if year columns exist
  const yearColumns = Object.keys(data[0]).filter(key => key !== 'PROVINCE')
  if (yearColumns.length === 0) {
    return { valid: false, error: 'No year columns found' }
  }

  // Validate that year columns are numbers
  for (const year of yearColumns) {
    if (isNaN(parseInt(year, 10))) {
      return { valid: false, error: `Invalid year column: "${year}"` }
    }
  }

  return { valid: true }
}

export const uploadProvinceCSVToFirebase = async (file: File): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    if (!file.name.endsWith('.csv')) {
      resolve({
        success: false,
        message: 'Invalid file type. Please upload a CSV file.'
      })
      return
    }
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rawData = results.data as CSVRow[]

          const validation = validateProvinceCSV(rawData)
          if (!validation.valid) {
            reject({ success: false, message: `Validation failed: ${validation.error}` })
            return
          }
          
          console.log('📤 Starting province data upload to Firebase...')

          const yearColumns = Object.keys(rawData[0]).filter(key => key !== 'PROVINCE')
          
          // Transform data
          const yearDataMap: Record<string, Record<string, number>> = {}

          yearColumns.forEach(year => {
            yearDataMap[year] = {}
          })

          rawData.forEach(row => {
            const province = row.PROVINCE
            if (!province) return

            yearColumns.forEach(year => {
              yearDataMap[year][province] = parseInt(row[year], 10) || 0
            })
          })
          
          // Upload to Firebase
          let uploadedCount = 0
          for (const year of yearColumns) {
            await postProvinceData(parseInt(year, 10), yearDataMap[year])
            uploadedCount++
            console.log(`✓ Uploaded province data for year ${year} (${uploadedCount}/${yearColumns.length})`)
          }

          resolve({
            success: true,
            message: 'All province data uploaded successfully!',
            uploadedCount
          })
        } catch (error) {
          console.error('❌ Error uploading province data:', error)
          reject({
            success: false,
            message: error instanceof Error ? error.message : 'Upload failed'
          })
        }
      },
      error: (error) => {
        console.error('❌ CSV parsing error:', error)
        reject({ 
          success: false, 
          message: 'Failed to parse CSV file.' 
        })
      }
    })
  })
}