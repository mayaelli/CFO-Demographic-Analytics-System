import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '../context/authContext' // Update path if needed
import { Lock } from 'lucide-react'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const success = login(password)
    if (success) {
      // Redirect to the upload page (or dashboard) immediately after login
      navigate({ to: '/uploadData' }) 
    } else {
      setError(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFBF5]">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-amber-100">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-amber-100 text-amber-600 rounded-xl mb-4">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-amber-900">Admin Login</h1>
          <p className="text-slate-500 text-sm">Enter your secure password to manage data.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
            {error && <p className="text-red-500 text-xs mt-2 ml-1">Incorrect password.</p>}
          </div>
          
          <button
            type="submit"
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors"
          >
            Unlock Dashboard
          </button>
        </form>
      </div>
    </div>
  )
}