import Papa from 'papaparse'
import { postEducationData } from '../api/educationService'

interface CSVRow {
  [key: string]: string
}

interface UploadResult {
  success: boolean
  message: string
  yearsUploaded?: number
}

// Mappings for combining education levels
const educationLevelMappings: Record<string, string[]> = {
  "Non-Formal Education": ["No Formal Education", "Non-Formal Education "],
  "Elementary": ["Elementary Level", "Elementary Graduate"],
  "High School": ["High School Level", "High School Graduate"],
  "Vocational": ["Vocational Level", "Vocational Graduate"],
  "College": ["College Level", "College Graduate"],
  "Post Graduate": ["Post Graduate Level", "Post Graduate"]
}

// Education Levels not merged
const unmappedLevels = [
  "Not of Schooling Age",
  "Not Reported / No Response"
]

const validateEducationCSVStructure = (data: CSVRow[]): { valid: boolean; error?: string } => {
  if (data.length === 0) return { valid: false, error: 'CSV file is empty' }

  if(!data[0].hasOwnProperty('EDUCATIONAL ATTAINMENT')) {
    return { valid: false, error: 'No year columns found in CSV' }
  }

  const yearColumns = Object.keys(data[0]).filter(key => key !== 'EDUCATIONAL ATTAINMENT')
  if (yearColumns.length === 0) {
    return { valid: false, error: 'No year columns found in CSV' }
  }

  const invalidYears = yearColumns.filter(year => isNaN(parseInt(year, 10)))
  if (invalidYears.length > 0) {
    return {
      valid: false,
      error: `Invalid year columns: ${invalidYears.join(', ')}`
    }
  }

  return { valid: true }
}

export const uploadEducationCSVToFirebase = async (file: File): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    if (!file.name.endsWith('.csv')) {
      reject({
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

          const validation = validateEducationCSVStructure(rawData)
          if (!validation.valid) {
            reject({ 
              success: false, 
              message: `Validation failed: ${validation.error}` 
            })
            return
          }

          console.log('📤 Starting education data upload to Firebase...')

          const yearColumns = Object.keys(rawData[0]).filter(key => key !== 'EDUCATIONAL ATTAINMENT')
          let uploadedCount = 0

          for (const year of yearColumns) {
            // First, create raw data for the year
            const rawYearData: Record<string, number> = {}
            
            rawData.forEach(row => {
              const educationLevel = row['EDUCATIONAL ATTAINMENT']
              const value = parseInt(row[year], 10)
              if (educationLevel && educationLevel.trim() !== '') {
                rawYearData[educationLevel] = isNaN(value) ? 0 : value
              }
            })

            // Then aggregate according to mappings
            const aggregatedYearData: Record<string, number> = {}

            for (const newLevel in educationLevelMappings) {
              const oldLevels = educationLevelMappings[newLevel]
              aggregatedYearData[newLevel] = oldLevels.reduce((sum, oldLevel) => {
                return sum + (rawYearData[oldLevel] || 0)
              }, 0)
            }

            unmappedLevels.forEach(level => {
              aggregatedYearData[level] = rawYearData[level] || 0
            })

            await postEducationData(parseInt(year, 10), aggregatedYearData)
            uploadedCount++
            console.log(`✓ Uploaded education data for year ${year} (${uploadedCount}/${yearColumns.length})`)
          }

          console.log('✅ All education data uploaded successfully!')
          resolve({
            success: true,
            message: `Successfully uploaded ${uploadedCount} years of education data`,
            yearsUploaded: uploadedCount
          })
        } catch (error) {
          console.error('❌ Error uploading education data:', error)
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