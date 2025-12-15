import { useAuth } from '../context/authContext'
import AdminLoginModal from '@/components/adminLogin'
import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { 
  Database, 
  CloudUpload, 
  FileSpreadsheet, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react'

// Components & Utils
import UploadDataCard from '../components/uploadDataCard'
import { uploadConfigs, type DataType } from '../utils/uploadCardConfig'

export const Route = createFileRoute('/uploadData')({
  component: UploadData,
})

function UploadData() {
  const [uploading, setUploading] = useState<DataType | null>(null)
  const { isAuthenticated } = useAuth()
  const [showLogin, setShowLogin] = useState(false)


  // Force login modal on load if not auth
  useEffect(() => {
    if (!isAuthenticated) setShowLogin(true)
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FFFBF5]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-amber-900 mb-4">Restricted Access</h2>
          <button 
            onClick={() => setShowLogin(true)}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            Login as Admin
          </button>
        </div>
        <AdminLoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      </div>
    )
  }

  // State for messages
  const [messages, setMessages] = useState<Record<DataType, { type: 'success' | 'error' | 'info'; text: string } | null>>({
    age: null, education: null, occupation: null, sex: null, civilStatus: null,
    majorDestination: null, allDestination: null, region: null, province: null
  })

  // State for selected files
  const [selectedFiles, setSelectedFiles] = useState<Record<DataType, File | null>>({
    age: null, education: null, occupation: null, sex: null, civilStatus: null,
    majorDestination: null, allDestination: null, region: null, province: null
  })
  
  const handleFileSelect = (type: DataType, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFiles(prev => ({ ...prev, [type]: file }))
      setMessages(prev => ({ ...prev, [type]: null }))
    }
  }

  const handleUpload = async (type: DataType) => {
    const selectedFile = selectedFiles[type]
    
    if (!selectedFile) {
      setMessages(prev => ({ ...prev, [type]: { type: 'error', text: 'Please select a file first' } }))
      return
    }

    setUploading(type)
    setMessages(prev => ({ ...prev, [type]: { type: 'info', text: 'Uploading data...' } }))
    
    try {
      const uploadFunction = uploadConfigs[type].uploadFunction
      const result = await uploadFunction(selectedFile)
      
      setMessages(prev => ({ 
        ...prev, 
        [type]: { type: 'success', text: `${result.message || 'Upload complete'}.` }
      }))
      // Optional: Clear file after success
      setSelectedFiles(prev => ({ ...prev, [type]: null }))
    } catch (error: any) {
      setMessages(prev => ({ 
        ...prev, 
        [type]: { type: 'error', text: error.message || 'Upload failed' }
      }))
    } finally {
      setUploading(null)
    }
  }

  // Calculate active keys for the grid
  const dataTypes = Object.keys(uploadConfigs) as DataType[]

  return (
    <div className="min-h-screen bg-[#FFFBF5] font-sans text-slate-800 pb-20">
      
      {/* --- HEADER SECTION --- */}
      <div className="bg-white border-b border-amber-100 shadow-sm sticky top-0 z-10 backdrop-blur-md bg-white/90">
        <div className="container mx-auto max-w-7xl px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Title */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
                <Database size={32} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-amber-950 tracking-tight">
                  Data Import Hub
                </h1>
                <p className="text-amber-800/60 text-sm font-medium">
                  Manage and update system datasets via CSV
                </p>
              </div>
            </div>

            {/* Quick Stats / Info */}
            <div className="flex items-center gap-6 text-sm">
              <div className="hidden md:flex items-center gap-2 text-slate-500">
                <ShieldCheck size={18} className="text-green-600" />
                <span>Secure Transfer</span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-slate-500">
                <FileSpreadsheet size={18} className="text-blue-600" />
                <span>CSV Required</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="container mx-auto max-w-7xl px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Helper Banner */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 md:p-8 mb-10 text-white shadow-lg shadow-amber-900/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <CloudUpload className="text-amber-100" /> Bulk Update Available
            </h2>
            <p className="text-amber-100 max-w-2xl text-sm leading-relaxed">
              Ensure all CSV files follow the strict column naming conventions before uploading. 
              Uploading data will overwrite existing records for the matching year/category.
            </p>
          </div>
          <div className="shrink-0 bg-white/20 backdrop-blur-sm p-4 rounded-xl border border-white/30 text-center">
            <span className="block text-3xl font-bold">{dataTypes.length}</span>
            <span className="text-xs uppercase tracking-wider font-semibold opacity-80">Datasets</span>
          </div>
        </div>

        {/* --- GRID LAYOUT --- */}
        {/* Changed to 3 columns on XL screens for better density since there are 9 items */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {dataTypes.map(type => (
            <div key={type} className="transform transition-all duration-300 hover:-translate-y-1">
               <UploadDataCard
                  title={uploadConfigs[type].title}
                  description={uploadConfigs[type].description}
                  requirements={uploadConfigs[type].requirements}
                  selectedFile={selectedFiles[type]}
                  message={messages[type]}
                  uploading={uploading === type}
                  onFileSelect={(e) => handleFileSelect(type, e)}
                  onUpload={() => handleUpload(type)}
                  disabled={uploading !== null}
                />
            </div>
          ))}
        </div>

        {/* Empty State / Footer Helper */}
        {dataTypes.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <AlertTriangle className="mx-auto mb-4 opacity-50" size={48} />
            <p>No upload configurations found.</p>
          </div>
        )}
      </div>
    </div>
  )
}