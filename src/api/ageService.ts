import { 
  postDataToFirestore,
  getDataByYear,
  getAllData,
  updateDataByYear,
  deleteDataByYear,
  deleteAllData,
  getAvailableYears,
  getCategories
} from './baseService'

const AGE_COLLECTION = 'emigrantData/age/years'

export interface AgeData {
  Year: number
  '14 - Below': number
  '15 - 19': number
  '20 - 24': number
  '25 - 29': number
  '30 - 34': number
  '35 - 39': number
  '40 - 44': number
  '45 - 49': number
  '50 - 54': number
  '55 - 59': number
  '60 - 64': number
  '65 - 69': number
  '70 - Above': number
  'Not Reported / No Response': number
  [key: string]: number
}

// POST
export const postAgeData = async (year: number, data: Omit<AgeData, 'Year'>) => {
  await postDataToFirestore(AGE_COLLECTION, year, data as Record<string, number>)
}

// GET specific year
export const getAgeDataByYear = async (year: number): Promise<Omit<AgeData, 'Year'> | null> => {
  return await getDataByYear(AGE_COLLECTION, year) as Omit<AgeData, 'Year'> | null
}

// GET all data
export const getAllAgeData = async (): Promise<AgeData[]> => {
  return await getAllData(AGE_COLLECTION) as AgeData[]
}

// PUT 
export const updateAgeData = async (year: number, updates: Partial<Omit<AgeData, 'Year'>>) => {
  await updateDataByYear(AGE_COLLECTION, year, updates as Record<string, number>)
}

// DELETE
export const deleteAgeData = async (year: number) => {
  await deleteDataByYear(AGE_COLLECTION, year)
}

// DELETE ALL
export const deleteAllAgeData = async () => {
  await deleteAllData(AGE_COLLECTION)
}

// GET all available years
export const getAvailableAgeYears = async (): Promise<number[]> => {
  return await getAvailableYears(AGE_COLLECTION)
}

// GET all AGE GROUPS
export const getAgeGroups = async (): Promise<string[]> => {
  return await getCategories(AGE_COLLECTION)
}


// Add new year age data (with validation for preventing duplicates)
export const addNewAgeYear = async (year: number, data: Omit<AgeData, 'Year'>) => {
  const existing = await getAgeDataByYear(year)

  if (existing) throw new Error(`Age data for year ${year} already exists`)

  await postAgeData(year, data)
}