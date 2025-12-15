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

// Collection Path in Firebase Cloud DB
const CIVIL_STATUS_COLLECTION = 'emigrantData/civilStatus/years'

export interface CivilStatusData {
  Year: number
  Single: number
  Married: number
  Widower: number
  Separated: number
  Divorced: number
  'Not Reported': number
  [key: string]: number
}

// POST
export const postCivilStatusData = async (year: number, data: Omit<CivilStatusData, 'Year'>) => {
  await postDataToFirestore(CIVIL_STATUS_COLLECTION, year, data as Record<string, number>)
}

// GET specific year
export const getCivilStatusDataByYear = async (year: number): Promise<Omit<CivilStatusData, 'Year'> | null> => {
  return await getDataByYear(CIVIL_STATUS_COLLECTION, year) as Omit<CivilStatusData, 'Year'> | null
}

// GET all data
export const getAllCivilStatusData = async (): Promise<CivilStatusData[]> => {
  return await getAllData(CIVIL_STATUS_COLLECTION) as CivilStatusData[]
}

// PUT 
export const updateCivilStatusData = async (year: number, updates: Partial<Omit<CivilStatusData, 'Year'>>) => {
  await updateDataByYear(CIVIL_STATUS_COLLECTION, year, updates as Record<string, number>)
}

// DELETE
export const deleteCivilStatusData = async (year: number) => {
  await deleteDataByYear(CIVIL_STATUS_COLLECTION, year)
}

// DELETE ALL
export const deleteAllCivilStatusData = async () => {
  await deleteAllData(CIVIL_STATUS_COLLECTION)
}

// GET all available years
export const getAvailableCivilStatusYears = async (): Promise<number[]> => {
  return await getAvailableYears(CIVIL_STATUS_COLLECTION)
}

// GET civil status categories
export const getCivilStatusCategories = async (): Promise<string[]> => {
  return await getCategories(CIVIL_STATUS_COLLECTION)
}

// Add new year civil status data (with validation for preventing duplicates)
export const addNewCivilStatusYear = async (year: number, data: Omit<CivilStatusData, 'Year'>) => {
  const existing = await getCivilStatusDataByYear(year)

  if (existing) throw new Error(`Civil status data for year ${year} already exists`)

  await postCivilStatusData(year, data)
}