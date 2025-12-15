import Papa from 'papaparse'
import { postMajorDestinationData, postAllDestinationData } from '../api/destinationService'

interface CSVRow {
  [key: string]: string
}

interface UploadResult {
  success: boolean
  message: string
  yearsUploaded?: number
}

// ===== MAJOR DESTINATION UPLOAD =====

const validateMajorDestinationCSV = (data: CSVRow[]): { valid: boolean; error?: string } => {
  if (data.length === 0) return { valid: false, error: 'CSV file is empty' }

  if (!data[0].hasOwnProperty('YEAR')) {
    return { valid: false, error: 'Missing required column: YEAR' }
  }

  const expectedCountries = ['USA', 'CANADA', 'JAPAN', 'AUSTRALIA', 'ITALY', 'NEW ZEALAND', 
                             'UNITED KINGDOM', 'GERMANY', 'SOUTH KOREA', 'SPAIN', 'OTHERS']
  
  const missingCountries = expectedCountries.filter(c => !data[0].hasOwnProperty(c))
  if (missingCountries.length > 0) {
    return { valid: false, error: `Missing columns: ${missingCountries.join(', ')}` }
  }

  return { valid: true }
}

export const uploadMajorDestinationCSVToFirebase = async (file: File): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    if (!file.name.endsWith('.csv')) {
      reject({ success: false, message: 'Invalid file type. Please upload a CSV file.' })
      return
    }
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rawData = results.data as CSVRow[]

          const validation = validateMajorDestinationCSV(rawData)
          if (!validation.valid) {
            reject({ success: false, message: `Validation failed: ${validation.error}` })
            return
          }

          console.log('📤 Starting major destination data upload to Firebase...')

          let uploadedCount = 0

          for (const row of rawData) {
            const year = parseInt(row.YEAR, 10)
            
            const yearData = {
              USA: parseInt(row.USA, 10) || 0,
              CANADA: parseInt(row.CANADA, 10) || 0,
              JAPAN: parseInt(row.JAPAN, 10) || 0,
              AUSTRALIA: parseInt(row.AUSTRALIA, 10) || 0,
              ITALY: parseInt(row.ITALY, 10) || 0,
              'NEW ZEALAND': parseInt(row['NEW ZEALAND'], 10) || 0,
              'UNITED KINGDOM': parseInt(row['UNITED KINGDOM'], 10) || 0,
              GERMANY: parseInt(row.GERMANY, 10) || 0,
              'SOUTH KOREA': parseInt(row['SOUTH KOREA'], 10) || 0,
              SPAIN: parseInt(row.SPAIN, 10) || 0,
              OTHERS: parseInt(row.OTHERS, 10) || 0
            }

            await postMajorDestinationData(year, yearData)
            uploadedCount++
            console.log(`✓ Uploaded major destination data for year ${year} (${uploadedCount}/${rawData.length})`)
          }

          console.log('✅ All major destination data uploaded successfully!')
          resolve({
            success: true,
            message: `Successfully uploaded ${uploadedCount} years of major destination data`,
            yearsUploaded: uploadedCount
          })
        } catch (error) {
          console.error('❌ Error uploading major destination data:', error)
          reject({
            success: false,
            message: error instanceof Error ? error.message : 'Upload failed'
          })
        }
      },
      error: (error) => {
        console.error('❌ CSV parsing error:', error)
        reject({ success: false, message: 'Failed to parse CSV file.' })
      }
    })
  })
}

// ===== ALL DESTINATION UPLOAD =====

const validateAllDestinationCSV = (data: CSVRow[]): { valid: boolean; error?: string } => {
  // Check if empty
  if (data.length === 0) return { valid: false, error: 'CSV file is empty' }

  // Check if COUNTRY column exists
  if (!data[0].hasOwnProperty('COUNTRY')) {
    return { valid: false, error: 'Missing required column: COUNTRY' }
  }

  // Check if year columns exist
  const yearColumns = Object.keys(data[0]).filter(key => key !== 'COUNTRY')
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

export const uploadAllDestinationCSVToFirebase = async (file: File): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    if (!file.name.endsWith('.csv')) {
      reject({ success: false, message: 'Invalid file type. Please upload a CSV file.' })
      return
    }
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rawData = results.data as CSVRow[]

          const validation = validateAllDestinationCSV(rawData)
          if (!validation.valid) {
            reject({ success: false, message: `Validation failed: ${validation.error}` })
            return
          }

          console.log('📤 Starting all destination data upload to Firebase...')

          const yearColumns = Object.keys(rawData[0]).filter(key => key !== 'COUNTRY')
          
          // Group data by year instead of by country
          const yearDataMap: Record<string, Record<string, number>> = {}
          
          // Initialize year data
          yearColumns.forEach(year => {
            yearDataMap[year] = {}
          })

          // Transform CSV from row-per-country to year-based documents
          rawData.forEach(row => {
            const country = row.COUNTRY
            yearColumns.forEach(year => {
              yearDataMap[year][country] = parseInt(row[year], 10) || 0
            })
          })

          // Upload each year's data
          let uploadedCount = 0
          for (const year of yearColumns) {
            await postAllDestinationData(parseInt(year, 10), yearDataMap[year])
            uploadedCount++
            console.log(`✓ Uploaded all destination data for year ${year} (${uploadedCount}/${yearColumns.length})`)
          }

          console.log('✅ All destination data uploaded successfully!')
          resolve({
            success: true,
            message: `Successfully uploaded ${uploadedCount} years of all destination data`,
            yearsUploaded: uploadedCount
          })
        } catch (error) {
          console.error('❌ Error uploading all destination data:', error)
          reject({
            success: false,
            message: error instanceof Error ? error.message : 'Upload failed'
          })
        }
      },
      error: (error) => {
        console.error('❌ CSV parsing error:', error)
        reject({ success: false, message: 'Failed to parse CSV file.' })
      }
    })
  })
}
