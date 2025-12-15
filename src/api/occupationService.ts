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
const OCCUPATION_COLLECTION = 'emigrantData/occupation/years'

export interface OccupationData {
  Year: number
  "Prof'l": number
  "Managerial": number
  "Clerical": number
  "Sales": number
  "Service": number
  "Agriculture": number
  "Production": number
  "Armed Forces": number
  "Housewives": number
  "Retirees": number
  "Students": number
  "Minors": number
  "Out of School Youth": number
  "No Occupation Reported": number
  [key: string]: number
}

// POST
export const postOccupationData = async (year: number, data: Omit<OccupationData, 'Year'>) => {
  await postDataToFirestore(OCCUPATION_COLLECTION, year, data as Record<string, number>)
}

// GET specific year
export const getOccupationDataByYear = async (year: number): Promise<Omit<OccupationData, 'Year'> | null> => {
  return await getDataByYear(OCCUPATION_COLLECTION, year) as Omit<OccupationData, 'Year'> | null
}

// GET all data
export const getAllOccupationData = async (): Promise<OccupationData[]> => {
  return await getAllData(OCCUPATION_COLLECTION) as OccupationData[]
}

// PUT 
export const updateOccupationData = async (year: number, updates: Partial<Omit<OccupationData, 'Year'>>) => {
  await updateDataByYear(OCCUPATION_COLLECTION, year, updates as Record<string, number>)
}

// DELETE
export const deleteOccupationData = async (year: number) => {
  await deleteDataByYear(OCCUPATION_COLLECTION, year)
}

// DELETE ALL
export const deleteAllOccupationData = async () => {
  await deleteAllData(OCCUPATION_COLLECTION)
}

// GET all available years
export const getAvailableOccupationYears = async (): Promise<number[]> => {
  return await getAvailableYears(OCCUPATION_COLLECTION)
}

// GET all occupation types
export const getOccupationTypes = async (): Promise<string[]> => {
  return await getCategories(OCCUPATION_COLLECTION)
}

// Add new year occupation data (with validation for preventing duplicates)
export const addNewOccupationYear = async (year: number, data: Omit<OccupationData, 'Year'>) => {
  const existing = await getOccupationDataByYear(year)

  if (existing) throw new Error (`Occupation data for year ${year} already exists`)

  await postOccupationData(year, data)
}