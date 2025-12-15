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

// Collection Path is Firebase Cloud DB
const SEX_COLLECTION = 'emigrantData/sex/years'

export interface SexData {
  Year: number
  MALE: number
  FEMALE: number
  [key: string]: number
}

// POST 
export const postSexData = async (year: number, data: Omit<SexData, 'Year'>) => {
  await postDataToFirestore(SEX_COLLECTION, year, data as Record<string, number>)
}

// GET specific year
export const getSexDataByYear = async (year: number): Promise<Omit<SexData, 'Year'> | null> => {
  return await getDataByYear(SEX_COLLECTION, year) as Omit<SexData, 'Year'> | null
}

// GET all data
export const getAllSexData = async (): Promise<SexData[]> => {
  return await getAllData(SEX_COLLECTION) as SexData[]
}

// PUT
export const updateSexData = async (year: number, updates: Partial<Omit<SexData, 'Year'>>) => {
  await updateDataByYear(SEX_COLLECTION, year, updates as Record<string, number>)
}

// DELETE
export const deleteSexData = async (year: number) => {
  await deleteDataByYear(SEX_COLLECTION, year)
}

// DELETE ALL
export const deleteAllSexData = async () => {
  await deleteAllData(SEX_COLLECTION)
}

// GET all available years
export const getAvailableSexYears = async (): Promise<number[]> => {
  return await getAvailableYears(SEX_COLLECTION)
}

// GET sex categories
export const getSexCategories = async (): Promise<string[]> => {
  return await getCategories(SEX_COLLECTION)
}

// Add new year sex data (with validation for preventing duplicates)
export const addNewSexYear = async (year: number, data: Omit<SexData, 'Year'>) => {
  const existing = await getSexDataByYear(year)

  if (existing) throw new Error(`Sex data for year ${year} already exists`)

  await postSexData(year, data)
}