import Papa from 'papaparse'
import { postAgeData } from '../api/ageService'

interface CSVRow {
  [key: string]: string
}

interface UploadResult {
  success: boolean
  message: string
  yearsUploaded?: number
}

// Expected age groups for validation
const EXPECTED_AGE_GROUPS = [
  '14 - Below',
  '15 - 19',
  '20 - 24',
  '25 - 29',
  '30 - 34',
  '35 - 39',
  '40 - 44',
  '45 - 49',
  '50 - 54',
  '55 - 59',
  '60 - 64',
  '65 - 69',
  '70 - Above',
  'Not Reported / No Response'
]

// CSV structure validation
const validateCSVStructure = (data: CSVRow[]): { valid: boolean; error?: string } => {
  if (data.length === 0) return { valid: false, error: 'CSV file is empty' }

  // Check if AGE_GROUP column exists
  if (!data[0].hasOwnProperty('AGE_GROUP')) {
    return { valid: false, error: 'Missing required column: AGE_GROUP' }
  }

  // Extract age groups from CSV
  const csvAgeGroups = data.map(row => row.AGE_GROUP).filter(Boolean)

  // Check if we have the correct number of age groups
  if (csvAgeGroups.length !== EXPECTED_AGE_GROUPS.length) {
    return { 
      valid: false, 
      error: `Expected ${EXPECTED_AGE_GROUPS.length} age groups, but found ${csvAgeGroups.length}` 
    }
  }

  // Check if all expected age groups are present
  const missingGroups = EXPECTED_AGE_GROUPS.filter(group => !csvAgeGroups.includes(group))
  if (missingGroups.length > 0) {
    return { 
      valid: false, 
      error: `Missing age groups: ${missingGroups.join(', ')}` 
    }
  }

  // Check if year columns exist
  const yearColumns = Object.keys(data[0]).filter(key => key !== 'AGE_GROUP')
  if (yearColumns.length === 0) {
    return { valid: false, error: 'No year columns found in CSV' }
  }

  // Validate that year columns are numbers
  const invalidYears = yearColumns.filter(year => isNaN(parseInt(year, 10)))
  if (invalidYears.length > 0) {
    return { 
      valid: false, 
      error: `Invalid year columns: ${invalidYears.join(', ')}` 
    }
  }

  return { valid: true }
}

// Upload age data from CSV to Firebase
export const uploadAgeCSVToFirebase = async (file: File): Promise<UploadResult> => {
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
          const validation = validateCSVStructure(rawData)
          if (!validation.valid) {
            reject({ 
              success: false, 
              message: `Validation failed: ${validation.error}` 
            })
            return
          }

          console.log('📤 Starting upload to Firebase...')

          // Get year columns (all columns except AGE_GROUP)
          const yearColumns = Object.keys(rawData[0]).filter(key => key !== 'AGE_GROUP')
          let uploadedCount = 0

          // Upload data for each year
          for (const year of yearColumns) {
            const yearData: Record<string, number> = {}
            
            rawData.forEach(row => {
              const ageGroup = row['AGE_GROUP']
              const value = parseInt(row[year], 10)
              if (ageGroup && ageGroup.trim() !== '') {
                yearData[ageGroup] = isNaN(value) ? 0 : value
              }
            })

            await postAgeData(parseInt(year, 10), yearData)
            uploadedCount++
            console.log(`✓ Uploaded age data for year ${year}`)
          }

          console.log('✅ All age data uploaded successfully!')
          resolve({
            success: true,
            message: `Successfully uploaded ${uploadedCount} years of age data`,
            yearsUploaded: uploadedCount
          })
        } catch (error) {
          console.error('❌ Error uploading data:', error)
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
