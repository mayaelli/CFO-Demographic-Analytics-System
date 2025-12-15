export const OCCUPATION_LABELS: Record<string, string> = {
  "Prof'l": "Prof'l, Tech'l, & Related Workers",
  "Managerial": "Managerial, Executive, and Administrative Workers",
  "Clerical": "Clerical Workers",
  "Sales": "Sales Workers",
  "Service": "Service Workers",
  "Agriculture": "Agriculture, Animal Husbandry, Forestry Workers & Fishermen",
  "Production": "Production Process, Transport Equipment Operators, & Laborers",
  "Armed Forces": "Members of the Armed Forces",
  "Housewives": "Housewives",
  "Retirees": "Retirees",
  "Students": "Students",
  "Minors": "Minors (Below 7 years old)",
  "Out of School Youth": "Out of School Youth",
  "No Occupation Reported": "No Occupation Reported"
}
  
export const formatOccupationTooltip = (value: any, name: string) => {
  const fullName = OCCUPATION_LABELS[name] || name
  return [Number(value).toLocaleString(), fullName]
}