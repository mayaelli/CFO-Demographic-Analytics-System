import { forwardRef } from 'react'
import { 
  LayoutDashboard, 
  Database, 
  Menu,       
  Hourglass,        // For Age (Time)
  Users,            // For Sex/Gender (Population)
  GraduationCap,    // For Education
  HeartHandshake,   // For Civil Status (Partnership)
  Briefcase         // For Occupation
} from 'lucide-react'
import { useNavBar } from '../context/navBarContext'
import { Link } from '@tanstack/react-router'

const navigationItems = [
  {
    name: 'Age Composition',
    icon: Hourglass,
    path: '/ageCategory',
  },
  {
    name: 'Sex Distribution',
    icon: Users,
    path: '/genderDataCategory',
  },
  {
    name: 'Education Level',
    icon: GraduationCap, 
    path: '/educationDataCategory',
  },
  { 
    name: 'Civil Status',
    icon: HeartHandshake,
    path: '/civilstatusDataCategory',
  },
  {
    name: 'Occupation',
    icon: Briefcase,
    path: '/occupationDataCategory',
  },
  {
    name: 'Origin',
    icon: LayoutDashboard,
    path: '/originDataCategory',
  },
  {
    name: 'Destination',
    icon: LayoutDashboard,
    path: '/destinationDataCategory',
  }
]

const NavBar = forwardRef<HTMLElement>((_props, ref) => {
  const { isHovering, setIsHovering, navBarWidth, isMobile } = useNavBar()
  
  const handleMouseEnter = () => !isMobile && setIsHovering(true)
  const handleMouseLeave = () => !isMobile && setIsHovering(false)

  // Mobile view
  if (isMobile) {
    return (
      <nav 
        ref={ref}
        className="fixed bottom-0 left-0 right-0 z-50 shadow-2xl border-t border-amber-800/30"
        style={{ 
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          background: 'linear-gradient(135deg, #561c24 0%, #6D2932 50%, #561c24 100%)'
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-600/40 to-transparent"></div>
        <div className="flex items-center justify-around h-full px-4 py-3">
          {navigationItems.slice(0, 4).map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.name} to={item.path} className="flex flex-col items-center justify-center gap-2 p-3 hover:bg-amber-950/20 rounded-lg transition-all duration-200 flex-1 hover:cursor-pointer group">
                <div className="p-2 rounded-md bg-amber-900/25 group-hover:bg-amber-900/40 transition-all duration-200">
                  <Icon className="text-amber-200 group-hover:text-amber-100 transition-colors duration-200" size={20} strokeWidth={1.8} />
                </div>
                <span className="text-amber-200 text-xs font-medium group-hover:text-amber-100 transition-colors">{item.name}</span>
              </Link>
            )
          })}
          <Link to="/manageData" className="flex flex-col items-center justify-center gap-2 p-3 hover:bg-amber-950/20 rounded-lg transition-all duration-200 flex-1 hover:cursor-pointer group">
            <div className="p-2 rounded-md bg-amber-900/25 group-hover:bg-amber-900/40 transition-all duration-200">
              <Database className="text-amber-200 group-hover:text-amber-100 transition-colors duration-200" size={20} strokeWidth={1.8} />
            </div>
            <span className="text-amber-200 text-xs font-medium group-hover:text-amber-100 transition-colors">Manage</span>
          </Link>
        </div>
      </nav>
    )
  }

  // Desktop view
  return (
    <>
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <nav 
        ref={ref}
        className={`fixed top-0 left-0 z-100 h-screen transition-all duration-300 ease-in-out shadow-xl border-r border-amber-800/30`}
        style={{ 
          width: navBarWidth, 
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          background: 'linear-gradient(135deg, #561c24 0%, #6D2932 50%, #561c24 100%)'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/10 via-transparent to-red-950/15 pointer-events-none"></div>
        <div className={`absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-600/40 to-transparent transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-60'}`}></div>
        
        <div className="flex flex-col h-full py-8 relative z-10">
          
          {/* --- TOP FIXED SECTION --- */}
          <div className="flex flex-col items-center gap-8 px-3 shrink-0">
            <button 
              onClick={handleMouseEnter} 
              className={`flex items-center gap-4 p-3 w-full transition-all duration-200 ease-in-out group ${isHovering ? 'bg-amber-950/15' : 'hover:bg-amber-950/10'} rounded-lg`}
            >
              <div className={`relative transition-all duration-300 ${isHovering ? 'ml-2' : 'mx-auto'}`}>
                <div className="p-2 rounded-md bg-amber-900/25 group-hover:bg-amber-900/40 transition-all duration-200">
                  <Menu className="text-amber-200 group-hover:text-amber-100 transition-all duration-200" size={20} strokeWidth={1.8} />
                </div>
              </div>
              
              {isHovering && (
                <span className="text-amber-100 text-sm font-medium whitespace-nowrap">Menu</span>
              )}
            </button>
            
            <div className="w-full px-1">
              <div className="h-px bg-gradient-to-r from-transparent via-amber-700/40 to-transparent"></div>
            </div>
          </div>
          
          {/* --- SCROLLABLE SECTION --- */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 w-full px-3 mt-4 no-scrollbar">
            <div className="flex flex-col items-start gap-4 pb-4">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link 
                    key={item.name} 
                    to={item.path} 
                    className={`flex items-center gap-4 p-3 hover:bg-amber-950/15 rounded-lg transition-all duration-200 ease-in-out w-full hover:cursor-pointer group ${isHovering ? 'hover:scale-[1.02]' : ''}`}
                  >
                    <div className={`relative transition-all duration-300 ${isHovering ? 'ml-2' : 'mx-auto'}`}>
                      <div className="p-2 rounded-md bg-amber-900/25 group-hover:bg-amber-900/40 transition-all duration-200">
                        <Icon className="text-amber-200 group-hover:text-amber-100 transition-all duration-200" size={20} strokeWidth={1.8} />
                      </div>
                    </div>
                    
                    {isHovering && (
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-amber-100 text-sm font-medium whitespace-nowrap group-hover:text-amber-50 transition-colors">
                          {item.name}
                        </span>
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>


        </div>
      </nav>
    </>
  )
})

NavBar.displayName = "NavBar"

export default NavBar