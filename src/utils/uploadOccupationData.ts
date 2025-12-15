import Papa from 'papaparse'
import { postOccupationData } from '../api/occupationService'

interface CSVRow {
  [key: string]: string
}

interface UploadResult {
  success: boolean
  message: string
  yearsUploaded?: number
}

// Expected occupation types for validation
const EXPECTED_OCCUPATION_TYPES = [
  "Prof'l",
  "Managerial",
  "Clerical",
  "Sales",
  "Service",
  "Agriculture",
  "Production",
  "Armed Forces",
  "Housewives",
  "Retirees",
  "Students",
  "Minors",
  "Out of School Youth",
  "No Occupation Reported"
]

// CSV Structure validation
const validateCSVStructure = (data: CSVRow[]): { valid: boolean; error?: string } => {
  if (data.length === 0) return { valid: false, error: 'CSV file is empty' }

  // Check if Occupation column exists
  if (!data[0].hasOwnProperty('Occupation')) {
    return { valid: false, error: 'Missing required column: Occupation' }
  }

  // Extract occupation types from CSV
  const csvOccupationTypes = data.map(row => row.Occupation).filter(Boolean)

  // Check if we have the correct number of occupation types
  if (csvOccupationTypes.length !== EXPECTED_OCCUPATION_TYPES.length) {
    return {
      valid: false,
      error: `Expected ${EXPECTED_OCCUPATION_TYPES.length} occupation types, but found ${csvOccupationTypes.length}`
    }
  }

  // Check if all expected occupation types are present
  const missingTypes = EXPECTED_OCCUPATION_TYPES.filter(type => !csvOccupationTypes.includes(type))
  if (missingTypes.length > 0) {
    return {
      valid: false,
      error: `Missing occupation types: ${missingTypes.join(', ')}`
    }
  }

  // Check if year columns exist
  const yearColumns = Object.keys(data[0]).filter(key => key !== 'Occupation')
  if (yearColumns.length === 0) {
    return { valid: false, error: 'No year columns found in CSV'}
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

// Upload Occupation data from CSV to Firebase
export const uploadOccupationCSVToFirebase = async (file: File): Promise<UploadResult> => {
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

          const yearColumns = Object.keys(rawData[0]).filter(key => key !== 'Occupation')
          let uploadedCount = 0

          // Upload data for each year
          for (const year of yearColumns) {
            const yearData: Record<string, number> = {}

            rawData.forEach(row => {
              const occupation = row['Occupation']
              const value = parseInt(row[year], 10)
              if (occupation && occupation.trim() !== '') {
                yearData[occupation] = isNaN(value) ? 0 : value
              }
            })

            await postOccupationData(parseInt(year, 10), yearData)
            uploadedCount++
            console.log(`✓ Uploaded occupation data for year ${year}`)
          }

          console.log('✅ All occupation data uploaded successfully!')
          resolve({
            success: true,
            message: `Successfully uploaded ${uploadedCount} years of occupation data`,
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