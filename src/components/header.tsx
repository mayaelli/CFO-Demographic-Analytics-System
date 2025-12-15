import { forwardRef, useState, useEffect, useRef } from 'react'
import { Database, Bell, Search, LayoutDashboard, Home, PlusCircle, LogIn, LogOut, User, X, ChevronRight, Check, Trash2, Info, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react'
import { useNotifications } from '../context/notificationContext' // Ensure path is correct
import { Link, useLocation, useNavigate } from '@tanstack/react-router' 
import { useAuth } from '../context/authContext'

const Header = forwardRef<HTMLElement>((_props, ref) => {
  const [showNotifications, setShowNotifications] = useState(false)
  
  // 1. Get Notification Data
  // Note: Ensure your Context exports 'markAllAsRead' or 'markAllRead' (matching your context file)
  const { notifications, unreadCount, markAllAsRead, clearAll } = useNotifications(); 

  // --- NEW: Search State ---
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  // 2. Get Auth State
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  // Use location to highlight active link
  const location = useLocation()
  const currentPath = location.pathname

  // Helper for notification icons
  const getIcon = (type: string) => {
    switch(type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default: return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true
    if (path !== '/' && currentPath.startsWith(path)) return true
    return false
  }

  // 3. Define Links
  const allNavLinks = [
    { name: 'Home', path: '/landing', icon: Home, restricted: false, keywords: ['landing', 'start', 'welcome'] },
    { name: 'Analytics', path: '/', icon: LayoutDashboard, restricted: false, keywords: ['charts', 'graphs', 'dashboard', 'forecast', 'gender', 'civil'] },
    { name: 'Manage Data', path: '/manageData', icon: Database, restricted: true, keywords: ['admin', 'edit', 'delete', 'rows'] },
    { name: 'Upload Data', path: '/uploadData', icon: PlusCircle, restricted: true, keywords: ['import', 'csv', 'file', 'add'] },
  ]

  // 4. Filter links based on authentication
  const visibleNavLinks = allNavLinks.filter(link => 
    !link.restricted || isAuthenticated
  )

  // --- Search Logic ---
  const searchResults = allNavLinks.filter(link => {
    if (link.restricted && !isAuthenticated) return false;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      link.name.toLowerCase().includes(lowerQuery) || 
      link.keywords?.some(k => k.toLowerCase().includes(lowerQuery))
    );
  });

  // Focus input when search opens
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [showSearch]);

  const handleLogout = () => {
    logout()
    navigate({ to: '/' })
  }

  const handleSearchResultClick = (path: string) => {
    navigate({ to: path })
    setShowSearch(false)
    setSearchQuery('')
  }

  return (
    <header 
      ref={ref}
      className="relative flex justify-between items-center px-6 md:px-12 py-3 sticky top-0 z-40 border-b border-amber-900/30 shadow-2xl backdrop-blur-md"
      style={{ 
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        background: 'linear-gradient(135deg, #561c24 0%, #6D2932 50%, #561c24 100%)'
      }}
    >
      {/* Ambient glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-900/8 via-rose-900/12 to-red-900/8 pointer-events-none" />
      
      {/* LEFT: Title / Brand */}
      <div className="relative flex flex-col gap-0.5 z-10 shrink-0">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-1 h-6 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 rounded-full shadow-lg shadow-amber-500/50 group-hover:shadow-amber-400/80 transition-shadow" />
          <h1 className="text-lg md:text-xl font-semibold bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-50 bg-clip-text text-transparent tracking-tight hidden md:block">
            CFO Dashboard
          </h1>
          <h1 className="text-lg font-semibold text-amber-100 md:hidden">CFO</h1>
        </Link>
      </div>

      {/* CENTER: Global Navigation */}
      <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 bg-black/20 p-1 rounded-xl border border-white/5 backdrop-blur-sm shadow-inner transition-all duration-300">
        {visibleNavLinks.map((link) => {
          const active = isActive(link.path)
          const Icon = link.icon
          return (
            <Link 
              key={link.path}
              to={link.path}
              className={`
                flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300
                ${active 
                  ? 'bg-amber-600/90 text-white shadow-lg shadow-amber-900/20 ring-1 ring-white/10' 
                  : 'text-amber-200/70 hover:text-amber-100 hover:bg-white/5'
                }
              `}
            >
              <Icon size={14} className={active ? 'text-amber-100' : 'opacity-70'} />
              {link.name}
            </Link>
          )
        })}
      </nav>

      {/* RIGHT: Utilities & Profile */}
      <div className="relative flex items-center gap-3 z-10">
        
        {/* --- Search Dropdown --- */}
        <div className="relative">
          <button 
            onClick={() => { setShowSearch(!showSearch); setShowNotifications(false); }}
            className={`p-2 rounded-lg border transition-all duration-300 group ${showSearch ? 'bg-amber-900/60 border-amber-600/50 text-amber-100' : 'bg-amber-950/30 border-amber-700/30 text-amber-200 hover:bg-amber-900/40 hover:border-amber-600/50'}`}
          >
            {showSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4 group-hover:text-amber-100" />}
          </button>

          {showSearch && (
             <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[#561c24] border border-amber-700/30 shadow-2xl shadow-black/50 backdrop-blur-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Search Input Area */}
                <div className="p-3 border-b border-amber-800/30">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-amber-400/50" />
                    <input 
                      ref={searchInputRef}
                      type="text" 
                      placeholder="Jump to page..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-black/20 border border-amber-800/30 rounded-lg text-sm text-amber-100 placeholder-amber-200/30 focus:outline-none focus:border-amber-500/50 focus:bg-black/30 transition-all"
                    />
                  </div>
                </div>
                
                {/* Results List */}
                <div className="max-h-60 overflow-y-auto py-2">
                  {searchResults.length > 0 ? (
                    searchResults.map((item) => (
                      <button
                        key={item.path}
                        onClick={() => handleSearchResultClick(item.path)}
                        className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center justify-between group transition-colors border-l-2 border-transparent hover:border-amber-500"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-amber-900/40 rounded text-amber-200 group-hover:text-amber-100 group-hover:bg-amber-800/50 transition-colors">
                            <item.icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium text-amber-100 text-sm">{item.name}</p>
                            <p className="text-[10px] text-amber-200/40 uppercase tracking-wider">{item.keywords?.[0] || 'View'}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-3 h-3 text-amber-500/50 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                      </button>
                    ))
                  ) : (
                    <div className="p-6 text-center text-amber-200/30 text-xs">
                      No matching pages found.
                    </div>
                  )}
                </div>
             </div>
          )}
        </div>

        {/* --- DYNAMIC NOTIFICATIONS START --- */}
        <div className="relative">
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowSearch(false); }}
            className="relative p-2 rounded-lg bg-amber-950/30 hover:bg-amber-900/40 border border-amber-700/30 hover:border-amber-600/50 transition-all duration-300 group"
          >
            {/* Animate bell if unread > 0 */}
            <Bell className={`w-4 h-4 transition-colors ${unreadCount > 0 ? 'text-amber-100 animate-pulse' : 'text-amber-200'}`} />
            
            {/* Dynamic Badge */}
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#561c24] flex items-center justify-center">
                <span className="text-[9px] text-white font-bold">{unreadCount}</span>
              </div>
            )}
          </button>

           {/* Notification dropdown */}
           {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[#561c24] border border-amber-700/30 shadow-2xl shadow-black/50 backdrop-blur-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
               
               {/* Dropdown Header */}
               <div className="p-3 border-b border-amber-800/30 bg-gradient-to-br from-amber-900/15 to-red-900/15 flex justify-between items-center">
                 <h3 className="text-sm font-semibold text-amber-100">Notifications</h3>
                 <div className="flex gap-2">
                    {/* Only show Mark Read if there are unread items */}
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="p-1 hover:bg-white/10 rounded text-amber-200/70 hover:text-amber-100" title="Mark all read">
                        <Check className="w-3 h-3" />
                      </button>
                    )}
                    {/* Only show Clear if there are notifications */}
                    {notifications.length > 0 && (
                      <button onClick={clearAll} className="p-1 hover:bg-white/10 rounded text-amber-200/70 hover:text-red-300" title="Clear all">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                 </div>
               </div>

               {/* Notification List */}
               <div className="max-h-80 overflow-y-auto">
                 {notifications.length === 0 ? (
                   // EMPTY STATE
                   <div className="p-8 text-amber-200/50 text-xs text-center flex flex-col items-center gap-2">
                     <Bell size={24} className="opacity-20" />
                     No new notifications
                   </div>
                 ) : (
                   // LIST STATE
                   notifications.map((note) => (
                     <div 
                        key={note.id} 
                        className={`p-4 border-b border-amber-800/20 hover:bg-white/5 transition-colors ${note.read ? 'opacity-60' : 'bg-amber-900/20'}`}
                     >
                       <div className="flex gap-3">
                         <div className="mt-0.5 shrink-0">
                           {getIcon(note.type)}
                         </div>
                         <div className="flex-1">
                           <h4 className={`text-xs font-semibold ${note.read ? 'text-amber-200/70' : 'text-amber-100'}`}>
                             {note.title}
                           </h4>
                           <p className="text-[11px] text-amber-200/60 mt-0.5 leading-tight">
                             {note.message}
                           </p>
                           <p className="text-[9px] text-amber-200/30 mt-2 text-right">
                             {new Date(note.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                           </p>
                         </div>
                       </div>
                     </div>
                   ))
                 )}
               </div>
            </div>
          )}
        </div>
        {/* --- DYNAMIC NOTIFICATIONS END --- */}

        {/* Separator */}
        <div className="w-px h-6 bg-amber-200/20 mx-1" />

        {/* AUTH ACTION BUTTON */}
        {isAuthenticated ? (
          <button 
            onClick={handleLogout}
            title="Logout Admin"
            className="flex items-center gap-2 pl-3 pr-4 py-1.5 rounded-lg bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 hover:border-red-400/50 transition-all duration-300 group"
          >
            <LogOut className="w-3.5 h-3.5 text-red-200 group-hover:text-red-100" />
            <span className="text-xs font-semibold text-red-100 group-hover:text-white">Exit</span>
          </button>
        ) : (
          <Link 
            to="/login"
            className="flex items-center gap-2 pl-3 pr-4 py-1.5 rounded-lg bg-amber-100/10 hover:bg-amber-100/20 border border-amber-200/20 hover:border-amber-200/40 transition-all duration-300 group"
          >
            <User className="w-3.5 h-3.5 text-amber-200 group-hover:text-amber-100" />
            <span className="text-xs font-semibold text-amber-100 group-hover:text-white">Admin</span>
          </Link>
        )}

      </div>
    </header>
  )
})

Header.displayName = 'Header'
export default Header