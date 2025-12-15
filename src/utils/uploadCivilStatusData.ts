import Papa from 'papaparse'
import { postCivilStatusData } from '../api/civilStatusService'

interface CSVRow {
  [key: string]: string
}

interface UploadResult {
  success: boolean
  message: string
  yearsUploaded?: number
}

// Expected civil status categories for validation
const EXPECTED_CIVIL_STATUS_CATEGORIES = [
  'Single',
  'Married',
  'Widower',
  'Separated',
  'Divorced',
  'Not Reported'
]

// CSV structure validation
const validateCSVStructure = (data: CSVRow[]): { valid: boolean; error?: string } => {
  if (data.length === 0) return { valid: false, error: 'CSV file is empty' }

  // Check required columns
  const requiredColumns = ['YEAR', ...EXPECTED_CIVIL_STATUS_CATEGORIES]
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

// Upload civil status data from CSV to Firebase
export const uploadCivilStatusCSVToFirebase = async (file: File): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.name.endsWith('.csv')) {
      reject({
        success: false,
        message: 'Invalid file type. Please upload a properly structured CSV file.'
      })
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rawData = results.data as CSVRow[]

          // Validate CSV structure
          const validation = validateCSVStructure(rawData)
          if (!validation.valid) {
            reject({
              success: false,
              message: `Validation failed: ${validation.error}`
            })
            return
          }

          console.log ('📤 Starting upload to Firebase...')

          let uploadedCount = 0

          // Upload data for each year
          for (const row of rawData) {
            const year = parseInt(row.YEAR, 10)
            const yearData = {
              Single: parseInt(row.Single, 10) || 0,
              Married: parseInt(row.Married, 10) || 0,
              Widower: parseInt(row.Widower, 10) || 0,
              Separated: parseInt(row.Separated, 10) || 0,
              Divorced: parseInt(row.Divorced, 10) || 0,
              'Not Reported': parseInt(row['Not Reported'], 10) || 0
            }

            await postCivilStatusData(year, yearData)
            uploadedCount++
            console.log(`✓ Uploaded Civil Status data for year ${year}`)
          }

          console.log('✅ All Civil Status data uploaded successfully!')
          resolve({
            success: true,
            message: `Successfully uploaded ${uploadedCount} years of Civil Status data`,
            yearsUploaded: uploadedCount
          })
        } catch (error) {
          console.error('❌ Error uploading Civil Status data:', error)
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