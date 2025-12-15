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

const EDUCATION_COLLECTION = 'emigrantData/education/years'

export interface EducationData {
  Year: number
  'Not of Schooling Age': number
  'No Formal Education': number
  'Elementary Level': number
  'Elementary Graduate': number
  'High School Level': number
  'High School Graduate': number
  'Vocational Level': number
  'Vocational Graduate': number
  'College Level': number
  'College Graduate': number
  'Post Graduate Level': number
  'Post Graduate': number
  'Non-Formal Education': number
  'Not Reported / No Response': number
  [key: string]: number
}

// POST
export const postEducationData = async (year: number, data: Omit<EducationData, 'Year'>) => {
  await postDataToFirestore(EDUCATION_COLLECTION, year, data as Record<string, number>)
}

// GET specific year
export const getEducationDataByYear = async (year: number): Promise<Omit<EducationData, 'Year'> | null> => {
  return await getDataByYear(EDUCATION_COLLECTION, year) as Omit<EducationData, 'Year'> | null
}

// GET all data
export const getAllEducationData = async (): Promise<EducationData[]> => {
  return await getAllData(EDUCATION_COLLECTION) as EducationData[]
}

// PUT 
export const updateEducationData = async (year: number, updates: Partial<Omit<EducationData, 'Year'>>) => {
  await updateDataByYear(EDUCATION_COLLECTION, year, updates as Record<string, number>)
}

// DELETE
export const deleteEducationData = async (year: number) => {
  await deleteDataByYear(EDUCATION_COLLECTION, year)
}

// DELETE ALL
export const deleteAllEducationData = async () => {
  await deleteAllData(EDUCATION_COLLECTION)
}

// GET all available years
export const getAvailableEducationYears = async (): Promise<number[]> => {
  return await getAvailableYears(EDUCATION_COLLECTION)
}

// GET all education levels
export const getEducationLevels = async (): Promise<string[]> => {
  return await getCategories(EDUCATION_COLLECTION)
}

// Add new year education data (with validation for preventing duplicates)
export const addNewEducationYear = async (year: number, data: Omit<EducationData, 'Year'>) => {
  const existing = await getEducationDataByYear(year)

  if (existing) throw new Error(`Education data for year ${year} already exists`)

  await postEducationData(year, data)
}