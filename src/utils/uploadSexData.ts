import Papa from 'papaparse'
import { postSexData } from '../api/sexService'

interface CSVRow {
  [key: string]: string
}

interface UploadResult {
  success: boolean
  message: string
  yearsUploaded?: number
}

// Expected sex categories for validation
const EXPECTED_SEX_CATEGORIES = [
  'MALE',
  'FEMALE'
]

const validateSexCSVStructure = (data: CSVRow[]): { valid: boolean; error?: string } => {
  if (data.length === 0) return { valid: false, error: 'CSV file is empty' }

  // Check required columns
  const requiredColumns = ['YEAR', ...EXPECTED_SEX_CATEGORIES]
  for (const column of requiredColumns) {
    if (!data[0].hasOwnProperty(column)) {
      return { valid: false, error: `Missing required column: ${column}`}
    }
  }

  // Validate that all years are numbers
  const invalidYears = data.filter(row => isNaN(parseInt(row.YEAR, 10)))
  if (invalidYears.length > 0) {
    return { 
      valid: false, 
      error: 'Some YEAR values are not valid numbers' 
    }
  }

  return { valid: true }
}

// Upload sex data from CSV to Firebase
export const uploadSexCSVToFirebase = async (file: File): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.name.endsWith('.csv')) {
      reject({
        success: false,
        message: 'Invalid file type. Please upload a properly structured CSV file.'
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
          const validation = validateSexCSVStructure(rawData)
          if (!validation.valid) {
            reject({
              success: false,
              message: `Validation failed: ${validation.error}`
            })
            return
          }

          console.log('📤 Starting upload to Firebase...')

          let uploadedCount = 0

          // Upload data for each year
          for (const row of rawData) {
            const year = parseInt(row.YEAR, 10)
            const male = parseInt(row.MALE, 10) || 0
            const female = parseInt(row.FEMALE, 10) || 0

            const yearData = {
              MALE: male,
              FEMALE: female
            }

            await postSexData(year, yearData)
            uploadedCount++
            console.log(`✓ Uploaded sex data for year ${year}`)
          }

          console.log('✅ All sex data uploaded successfully!')
          resolve({
            success: true,
            message: `Successfully uploaded ${uploadedCount} years of sex data`,
            yearsUploaded: uploadedCount
          })
        } catch (error) {
          console.error('❌ Error uploading sex data:', error)
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
          message: 'Failed to parse CSV file. Please check the file format.'
        })
      }
    })
  })
}