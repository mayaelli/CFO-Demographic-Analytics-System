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
const REGION_COLLECTION = 'emigrantData/region/years'
const PROVINCE_COLLECTION = 'emigrantData/province/years'

// ====== REGION (by Year) ======

export interface RegionData {
  Year: number
  [region: string]: number
}

export const postRegionData = async (year: number, data: Record<string, number>) => {
  await postDataToFirestore(REGION_COLLECTION, year, data as Record<string, number>)
}

export const getRegionDataByYear = async (year: number): Promise<Record<string, number> | null> => {
  return await getDataByYear(REGION_COLLECTION, year) as Record<string, number> | null
}

export const getAllRegionData = async (): Promise<RegionData[]> => {
  return await getAllData(REGION_COLLECTION) as RegionData[]
}

export const updateRegionData = async (year: number, updates: Record<string, number>) => {
  await updateDataByYear(REGION_COLLECTION, year, updates as Record<string, number>)
}

export const deleteRegionData = async (year: number) => {
  await deleteDataByYear(REGION_COLLECTION, year)
}

export const deleteAllRegionData = async () => {
  await deleteAllData(REGION_COLLECTION)
}

export const getAvailableRegionYears = async (): Promise<number[]> => {
  return await getAvailableYears(REGION_COLLECTION)
}

export const getRegions = async (): Promise<string[]> => {
  return await getCategories(REGION_COLLECTION)
}

export const addNewRegionYear = async (year: number, regions: string[]) => {
  const existing = await getRegionDataByYear(year)

  if (existing) throw new Error(`Region data for year ${year} already exists`)

  const data: Record<string, number> = {}
  regions.forEach(region => {
    data[region] = 0
  })

  await postRegionData(year, data)
}


// ====== PROVINCE (by Year) ======

export interface ProvinceData {
  Year: number
  [province: string]: number
}

export const postProvinceData = async (year: number, data: Record<string, number>) => {
  await postDataToFirestore(PROVINCE_COLLECTION, year, data as Record<string, number>)
}

export const getProvinceDataByYear = async (year: number): Promise<Record<string, number> | null> => {
  return await getDataByYear(PROVINCE_COLLECTION, year) as Record<string, number> | null
}

export const getAllProvinceData = async (): Promise<ProvinceData[]> => {
  return await getAllData(PROVINCE_COLLECTION) as ProvinceData[]
}

export const updateProvinceData = async (year: number, updates: Record<string, number>) => {
  await updateDataByYear(PROVINCE_COLLECTION, year, updates as Record<string, number>)
}

export const deleteProvinceData = async (year: number) => {
  await deleteDataByYear(PROVINCE_COLLECTION, year)
}

export const deleteAllProvinceData = async () => {
  await deleteAllData(PROVINCE_COLLECTION)
}

export const getAvailableProvinceYears = async (): Promise<number[]> => {
  return await getAvailableYears(PROVINCE_COLLECTION)
}

export const getProvinces = async (): Promise<string[]> => {
  return await getCategories(PROVINCE_COLLECTION)
}

export const addNewProvinceYear = async (year: number, provinces: string[]) => {
  const existing = await getProvinceDataByYear(year)

  if (existing) throw new Error(`Province data for year ${year} already exists`)

  const data: Record<string, number> = {}
  provinces.forEach(province => {
    data[province] = 0
  })

  await postProvinceData(year, data)
}