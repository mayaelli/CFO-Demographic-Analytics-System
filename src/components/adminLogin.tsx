import { useState } from 'react'
import { useAuth } from '../context/authContext'
import { Lock, X } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function AdminLoginModal({ isOpen, onClose }: Props) {
  const { login } = useAuth()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  if (!isOpen) return null

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const success = login(password)
    if (success) {
      onClose()
      setPassword('')
      setError(false)
    } else {
      setError(true)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border-2 border-amber-100 animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-amber-950 flex items-center gap-2">
            <Lock className="text-amber-600" size={20} /> Admin Access
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X /></button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-1">Enter Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="••••••••"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mt-2">Incorrect password.</p>}
          </div>
          <button type="submit" className="w-full py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-colors">
            Unlock Dashboard
          </button>
        </form>
      </div>
    </div>
  )
}