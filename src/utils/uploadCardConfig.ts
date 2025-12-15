import { uploadAgeCSVToFirebase } from './uploadAgeData'
import { uploadEducationCSVToFirebase } from './uploadEducationData'
import { uploadOccupationCSVToFirebase } from './uploadOccupationData'
import { uploadSexCSVToFirebase } from './uploadSexData'
import { uploadCivilStatusCSVToFirebase } from './uploadCivilStatusData'
import { uploadMajorDestinationCSVToFirebase, uploadAllDestinationCSVToFirebase } from './uploadDestinationData'
import { uploadRegionCSVToFirebase, uploadProvinceCSVToFirebase } from './uploadOriginData'

export type DataType = 'age' | 'education' | 'occupation' | 'sex' | 'civilStatus' | 'majorDestination' | 'allDestination' | 'region' | 'province'

export interface UploadConfig {
  title: string
  description: string
  requirements: string[]
  uploadFunction: (file: File) => Promise<{ message: string }>
}

export const uploadConfigs: Record<DataType, UploadConfig> = {
  age: {
    title: 'Age Data',
    description: 'Submit emigrant age information',
    requirements: [
      'Include a column labeled "AGE_GROUP"',
      'Data must cover 14 distinct age groups',
      'Year fields should contain numeric values only',
      'All entries must be numerical'
    ],
    uploadFunction: uploadAgeCSVToFirebase
  },
  civilStatus: {
    title: 'Civil Status Data',
    description: 'Submit emigrant civil status information',
    requirements: [
      'Ensure there is a "YEAR" column',
      'Provide data for 7 civil status categories',
      'Years must be numeric',
      'All values must be numbers'
    ],
    uploadFunction: uploadCivilStatusCSVToFirebase
  },
  majorDestination: {
    title: 'Major Destination',
    description: 'Submit data for primary destination countries (1981-2020)',
    requirements: [
      'Include a YEAR column',
      'Provide 11 major destination country columns',
      'Years should range from 1981 to 2020'
    ],
    uploadFunction: uploadMajorDestinationCSVToFirebase
  },
  allDestination: {
    title: 'All Destinations',
    description: 'Submit data covering all destination countries (1981-2020)',
    requirements: [
      'Include a COUNTRY column',
      'Provide year columns from 1981-2020',
      'Approximately 175 countries should be listed'
    ],
    uploadFunction: uploadAllDestinationCSVToFirebase
  },
  education: {
    title: 'Education Data',
    description: 'Submit emigrant education background data',
    requirements: [
      'Include a column named "EDUCATIONAL ATTAINMENT"',
      'Provide data for 14 education levels',
      'Year fields must be numeric',
      'All values must be numbers'
    ],
    uploadFunction: uploadEducationCSVToFirebase
  },
  occupation: {
    title: 'Occupation Data',
    description: 'Submit emigrant occupation information (1981-2020)',
    requirements: [
      'Include an "Occupation" column',
      'Provide data for 14 types of occupations',
      'Year columns should cover 1981-2020'
    ],
    uploadFunction: uploadOccupationCSVToFirebase
  },
  sex: {
    title: 'Sex Data',
    description: 'Submit emigrant data by gender (1981-2020)',
    requirements: [
      'Columns must include YEAR, MALE, FEMALE',
      'Years should range from 1981 to 2020',
      'All entries must be numerical'
    ],
    uploadFunction: uploadSexCSVToFirebase
  },
  region: {
    title: 'Origin (Region)',
    description: 'Submit emigrant data by region of origin',
    requirements: [
      'Include a "REGION" column',
      'Data must cover 17 regions',
      'Year columns should range from 1988-2020',
      'All values must be numbers'
    ],
    uploadFunction: uploadRegionCSVToFirebase
  },
  province: {
    title: 'Origin (Province)',
    description: 'Submit emigrant data by province of origin',
    requirements: [
      'Include a "PROVINCE" column',
      'Provide data for 82 provinces',
      'Year columns should cover 1988-2020',
      'All values must be numeric'
    ],
    uploadFunction: uploadProvinceCSVToFirebase
  }
}
