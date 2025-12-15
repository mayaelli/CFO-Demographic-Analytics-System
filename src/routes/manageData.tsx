import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { 
  Trash2, Edit2, Save, X, Database, AlertCircle, CheckCircle2, 
  ChevronRight, AlertTriangle, Search, ChevronDown, Check
} from 'lucide-react'

// --- YOUR EXISTING IMPORTS ---
import LoadingScreen from '../components/loadingScreen'
import { COLUMN_ORDERS } from '../utils/columnOrders'
import { getAllAgeData, updateAgeData, deleteAgeData, deleteAllAgeData } from '../api/ageService'
import { getAllCivilStatusData, updateCivilStatusData, deleteCivilStatusData, deleteAllCivilStatusData } from '../api/civilStatusService'
import { 
  getAllMajorDestinationData, updateMajorDestinationData, deleteMajorDestinationData, deleteAllMajorDestinationData, 
  getAllAllDestinationData, updateAllDestinationData, deleteAllDestinationData, deleteAllAllDestinationData
} from '../api/destinationService'
import { getAllEducationData, updateEducationData, deleteEducationData, deleteAllEducationData } from '../api/educationService'
import { getAllOccupationData, updateOccupationData, deleteOccupationData, deleteAllOccupationData } from '../api/occupationService'
import { getAllSexData, updateSexData, deleteSexData, deleteAllSexData } from '../api/sexService'
import { 
  getAllRegionData, updateRegionData, deleteRegionData, deleteAllProvinceData, 
  getAllProvinceData, updateProvinceData, deleteProvinceData, deleteAllRegionData
} from '../api/originService'

export const Route = createFileRoute('/manageData') ({
  component: ManageData
})

type DataType = 'age' | 'civilStatus' | 'majorDestination' | 'allDestination' | 'education' | 'occupation' | 'sex' | 'region' | 'province'

// Column order helper function
const getOrderedColumns = (dataType: DataType, data: any[]): string[] => {
  if (!data || data.length === 0) return []
  const order = COLUMN_ORDERS[dataType]
  if (order && order.length > 0) return order 
  const keys = Object.keys(data[0]).filter(key => key !== 'Year')
  return keys.sort()
}

// Helper for display labels
const DATA_LABELS: Record<DataType, string> = {
  age: 'Age Demographics',
  sex: 'Sex / Gender',
  civilStatus: 'Civil Status',
  education: 'Education Level',
  occupation: 'Occupation',
  majorDestination: 'Major Destinations',
  allDestination: 'All Destinations',
  region: 'Regional Origin',
  province: 'Provincial Origin',
}

function ManageData() {
  const [selectedDataType, setSelectedDataType] = useState<DataType>('age')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [editingYear, setEditingYear] = useState<number | null>(null)
  const [editFormData, setEditFormData] = useState<any | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [selectedDataType])

  // --- YOUR EXISTING LOGIC FUNCTIONS (loadData, handleEdit, handleSaveEdit, handleDelete, handleDeleteAll) ---
  // Paste your logic here exactly as it was. 
  // For brevity in this snippet, I am assuming the logic is present.
  
  // ... [INSERT YOUR loadData FUNCTION HERE] ...
  const loadData = async () => {
    setLoading(true); setMessage(null);
    try {
      let result: any[] = []
      // ... your switch statement ...
      switch (selectedDataType) {
        case 'age': result = await getAllAgeData(); break;
        case 'civilStatus': result = await getAllCivilStatusData(); break;
        case 'majorDestination': result = await getAllMajorDestinationData(); break;
        case 'allDestination': result = await getAllAllDestinationData(); break;
        case 'education': result = await getAllEducationData(); break;
        case 'occupation': result = await getAllOccupationData(); break;
        case 'sex': result = await getAllSexData(); break;
        case 'region': result = await getAllRegionData(); break;
        case 'province': result = await getAllProvinceData(); break;
      }
      setData(result)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to load data' })
    } finally { setLoading(false) }
  }

  const handleEdit = (item: any) => { setEditingYear(item.Year); setEditFormData({ ...item }); }
  const handleCancelEdit = () => { setEditingYear(null); setEditFormData(null); }
  const handleFieldChange = (field: string, value: string) => { setEditFormData((prev: any) => ({ ...prev, [field]: parseFloat(value) || 0 })) }

  // ... [INSERT YOUR handleSaveEdit, handleDelete, handleDeleteAll FUNCTIONS HERE] ...
  const handleSaveEdit = async () => {
     if (!editFormData || editingYear === null) return
     setLoading(true)
     try {
       const { Year, ...updates } = editFormData
       // ... your switch statement ...
       switch (selectedDataType) {
        case 'age': await updateAgeData(editingYear, updates); break;
        case 'civilStatus': await updateCivilStatusData(editingYear, updates); break;
        case 'majorDestination': await updateMajorDestinationData(editingYear, updates); break;
        case 'allDestination': await updateAllDestinationData(editingYear, updates); break;
        case 'education': await updateEducationData(editingYear, updates); break;
        case 'occupation': await updateOccupationData(editingYear, updates); break;
        case 'sex': await updateSexData(editingYear, updates); break;
        case 'region': await updateRegionData(editingYear, updates); break;
        case 'province': await updateProvinceData(editingYear, updates); break;
       }
       setMessage({ type: 'success', text: 'Changes saved successfully' })
       handleCancelEdit()
       await loadData()
     } catch (error: any) {
       setMessage({ type: 'error', text: error.message || 'Failed to save changes' })
     } finally { setLoading(false) }
  }

  const handleDelete = async (year: number) => {
    if (!confirm(`Delete data for Year ${year}?`)) return
    setLoading(true)
    try {
        // ... your switch statement ...
        switch (selectedDataType) {
            case 'age': await deleteAgeData(year); break;
            case 'civilStatus': await deleteCivilStatusData(year); break;
            case 'majorDestination': await deleteMajorDestinationData(year); break;
            case 'allDestination': await deleteAllDestinationData(year); break;
            case 'education': await deleteEducationData(year); break;
            case 'occupation': await deleteOccupationData(year); break;
            case 'sex': await deleteSexData(year); break;
            case 'region': await deleteRegionData(year); break;
            case 'province': await deleteProvinceData(year); break;
        }
        setMessage({ type: 'success', text: `Deleted Year ${year}` })
        await loadData()
    } catch(e: any) { setMessage({ type: 'error', text: e.message }) }
    finally { setLoading(false) }
  }

  const handleDeleteAll = async () => {
    if (!confirm(`Delete ALL records for ${selectedDataType}?`)) return
    setLoading(true)
    try {
        // ... your switch statement ...
        switch (selectedDataType) {
            case 'age': await deleteAllAgeData(); break;
            case 'civilStatus': await deleteAllCivilStatusData(); break;
            case 'majorDestination': await deleteAllMajorDestinationData(); break;
            case 'allDestination': await deleteAllAllDestinationData(); break;
            case 'education': await deleteAllEducationData(); break;
            case 'occupation': await deleteAllOccupationData(); break;
            case 'sex': await deleteAllSexData(); break;
            case 'region': await deleteAllRegionData(); break;
            case 'province': await deleteAllProvinceData(); break;
        }
        setMessage({ type: 'success', text: `All records deleted.` })
        await loadData()
    } catch(e: any) { setMessage({ type: 'error', text: e.message }) }
    finally { setLoading(false) }
  }

  // --- NEW UI IMPLEMENTATION ---
  return (
    <div className="min-h-screen bg-[#FFFBF5] p-6 md:p-10 font-sans text-amber-950">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-amber-100 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-amber-900 flex items-center gap-3">
              <Database className="text-amber-500" size={32} />
              Data Manager
            </h1>
            <p className="text-amber-700/60 font-medium mt-1">
              Select a dataset below to view, edit, or delete records.
            </p>
          </div>
          
          {/* Global Actions (Delete All) */}
          {data.length > 0 && (
            <button 
              onClick={handleDeleteAll}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-600 hover:text-white hover:shadow-lg hover:border-red-600 transition-all font-semibold text-sm group"
            >
              <Trash2 size={16} className="group-hover:animate-bounce" />
              <span>Delete All {DATA_LABELS[selectedDataType]}</span>
            </button>
          )}
        </div>

        {/* Dataset Selector Dropdown */}
        <div className="relative w-full md:w-72">
          <label className="block text-xs font-bold text-amber-900/70 uppercase mb-2 tracking-wider ml-1">
            Select Dataset
          </label>
          
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`
              w-full flex items-center justify-between px-5 py-3.5 bg-white border-2 rounded-xl text-left transition-all
              ${isDropdownOpen 
                ? 'border-amber-500 ring-4 ring-amber-500/20' 
                : 'border-amber-200 hover:border-amber-400 hover:shadow-md'
              }
            `}
          >
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-amber-900">
                {DATA_LABELS[selectedDataType]}
              </span>
            </div>
            <ChevronDown 
              size={20} 
              className={`text-amber-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <>
              {/* Invisible backdrop to close when clicking outside */}
              <div 
                className="fixed inset-0 z-30 cursor-default" 
                onClick={() => setIsDropdownOpen(false)}
              />
              
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-amber-100 rounded-xl shadow-2xl z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="max-h-80 overflow-y-auto custom-scrollbar p-1.5 space-y-1">
                  {(Object.keys(DATA_LABELS) as DataType[]).map((key) => {
                    const isSelected = selectedDataType === key
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          setSelectedDataType(key)
                          setIsDropdownOpen(false)
                        }}
                        className={`
                          w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-colors group
                          ${isSelected 
                            ? 'bg-amber-50 text-amber-900 font-bold' 
                            : 'text-amber-700 hover:bg-amber-50/50 hover:text-amber-900 font-medium'
                          }
                        `}
                      >
                        {DATA_LABELS[key]}
                        {isSelected && <Check size={16} className="text-amber-600" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Message Banner */}
        {message && (
          <div className={`
            flex items-center gap-3 p-4 rounded-xl border-l-4 shadow-sm animate-in fade-in slide-in-from-top-2
            ${message.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-500 text-red-800'}
          `}>
            {message.type === 'success' ? <CheckCircle2 size={20}/> : <AlertCircle size={20}/>}
            <span className="font-semibold">{message.text}</span>
          </div>
        )}

        {/* Loading / Data Area */}
        {loading ? (
           <div className="h-96 flex items-center justify-center bg-white/50 border-2 border-amber-100 rounded-3xl backdrop-blur-sm">
             <LoadingScreen />
           </div>
        ) : (
          <>
            {data.length > 0 ? (
              <div className="bg-white rounded-3xl shadow-xl border border-amber-200 overflow-hidden flex flex-col h-[70vh]">
                {/* Table Scroll Area */}
                <div className="flex-1 overflow-auto custom-scrollbar relative">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-amber-100/80 text-amber-900 font-bold sticky top-0 z-20 backdrop-blur-md">
                      <tr>
                        <th className="px-6 py-4 sticky left-0 z-20 bg-amber-100/95 border-b border-amber-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Year</th>
                        {getOrderedColumns(selectedDataType, data).map(key => (
                          <th key={key} className="px-6 py-4 whitespace-nowrap border-b border-amber-200">
                            {key}
                          </th>
                        ))}
                        <th className="px-6 py-4 text-center sticky right-0 z-20 bg-amber-100/95 border-b border-amber-200 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100">
                      {data.map((item) => {
                         const isEditing = editingYear === item.Year
                         return (
                          <tr key={item.Year} className={`hover:bg-amber-50/50 transition-colors ${isEditing ? 'bg-amber-50' : 'bg-white'}`}>
                            
                            {/* Year Column */}
                            <td className="px-6 py-3 font-bold text-amber-900 sticky left-0 z-10 bg-inherit border-r border-amber-100">
                              {item.Year}
                            </td>

                            {/* Data Columns */}
                            {getOrderedColumns(selectedDataType, data).map(key => (
                              <td key={key} className="px-6 py-3 whitespace-nowrap text-amber-800">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    value={editFormData[key]}
                                    onChange={(e) => handleFieldChange(key, e.target.value)}
                                    className="w-24 px-2 py-1 bg-white border-2 border-amber-300 rounded focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-amber-900 font-medium transition-all"
                                  />
                                ) : (
                                  item[key]?.toLocaleString() || '-'
                                )}
                              </td>
                            ))}

                            {/* Actions Column */}
                            <td className="px-6 py-3 sticky right-0 z-10 bg-inherit border-l border-amber-100 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                              <div className="flex items-center justify-center gap-2">
                                {isEditing ? (
                                  <>
                                    <button onClick={handleSaveEdit} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm" title="Save">
                                      <Save size={16} />
                                    </button>
                                    <button onClick={handleCancelEdit} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-600 hover:text-white transition-all shadow-sm" title="Cancel">
                                      <X size={16} />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => handleEdit(item)} className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-all" title="Edit">
                                      <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(item.Year)} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all" title="Delete">
                                      <Trash2 size={16} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                {/* Footer / Count */}
                <div className="bg-amber-50/50 p-3 text-center text-xs text-amber-700 border-t border-amber-200">
                  Showing {data.length} records for {DATA_LABELS[selectedDataType]}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 bg-white/60 border-2 border-dashed border-amber-200 rounded-3xl">
                 <div className="p-4 bg-amber-100 rounded-full mb-4">
                    <Search className="text-amber-500" size={32} />
                 </div>
                 <h3 className="text-xl font-bold text-amber-900">No Data Found</h3>
                 <p className="text-amber-700/60 mt-1">There are no records available for {DATA_LABELS[selectedDataType]}</p>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}