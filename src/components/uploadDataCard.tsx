import { useRef } from 'react'
import { Upload, FileText, CheckCircle, XCircle, Info } from 'lucide-react'

interface UploadDataCardProps {
  title: string
  description: string
  requirements: string[]
  selectedFile: File | null
  message: { type: 'success' | 'error' | 'info'; text: string } | null
  uploading: boolean
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  onUpload: () => void
  disabled?: boolean
}

export default function UploadDataCard({
  title,
  description,
  requirements,
  selectedFile,
  message,
  uploading,
  onFileSelect,
  onUpload,
  disabled = false
}: UploadDataCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div 
      className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-xl p-6 border border-amber-200/50 hover:shadow-2xl transition-all duration-300"
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-300/30 rounded-lg blur-md"></div>
            <div className="relative bg-gradient-to-br from-amber-700 to-orange-600 p-2.5 rounded-xl shadow-md">
              <Upload className="text-amber-50 w-5 h-5" strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-800 to-orange-700">
            {title}
          </h2>
        </div>
        <p className="text-amber-700/80 text-sm font-medium ml-12">{description}</p>
      </div>

      {/* Decorative divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent mb-5"></div>

      {/* File Selection */}
      <div className="mb-5">
        <label className="flex items-center gap-2 text-amber-900 font-semibold mb-3 text-sm">
          <FileText className="w-4 h-4 text-orange-600" strokeWidth={2.5} />
          Select CSV File
        </label>
        
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={onFileSelect}
            disabled={disabled}
            className="w-full p-3 bg-white/80 text-amber-900 rounded-xl border-2 border-amber-300/50 text-sm
                      hover:border-amber-400/70 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-300/50
                      file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 
                      file:text-sm file:font-semibold file:bg-gradient-to-r file:from-amber-600 file:to-orange-600 file:text-white
                      hover:file:from-amber-700 hover:file:to-orange-700 file:shadow-md hover:file:shadow-lg
                      file:transition-all file:duration-300 file:cursor-pointer
                      disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-300"
          />
        </div>
        
        {selectedFile && (
          <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-300/50 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" strokeWidth={2.5} />
            <p className="text-sm text-green-800 font-medium">
              Selected: <span className="text-green-700 font-semibold">{selectedFile.name}</span>
            </p>
          </div>
        )}
      </div>

      
      {/* Upload Button */}
      <button
        onClick={onUpload}
        disabled={disabled || !selectedFile}
        className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3.5 rounded-xl font-bold text-sm
                  hover:from-amber-700 hover:to-orange-700 hover:shadow-lg hover:scale-[1.02]
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                  transition-all duration-300 shadow-md flex items-center justify-center gap-2"
      >
        {uploading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" strokeWidth={2.5} />
            <span>Upload File</span>
          </>
        )}
      </button>

      {/* Message Display */}
      {message && (
        <div className={`mt-5 p-4 rounded-xl border-2 text-sm shadow-md ${
          message.type === 'success' 
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-400/60' 
            : message.type === 'error'
            ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-400/60'
            : 'bg-gradient-to-br from-blue-50 to-sky-50 border-blue-400/60'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600" strokeWidth={2.5} />
            ) : message.type === 'error' ? (
              <XCircle className="w-5 h-5 text-red-600" strokeWidth={2.5} />
            ) : (
              <Info className="w-5 h-5 text-blue-600" strokeWidth={2.5} />
            )}
            <p className={`font-bold ${
              message.type === 'success' ? 'text-green-800' :
              message.type === 'error' ? 'text-red-800' : 'text-blue-800'
            }`}>
              {message.type === 'success' ? 'Success!' : 
                message.type === 'error' ? 'Error' : 'Information'}
            </p>
          </div>
          <p className={`font-medium ml-7 ${
            message.type === 'success' ? 'text-green-700' :
            message.type === 'error' ? 'text-red-700' : 'text-blue-700'
          }`}>
            {message.text}
          </p>
        </div>
      )}
    </div>
  )
}