import { Link, createFileRoute } from '@tanstack/react-router'
import { forwardRef } from 'react'

import { 
  Database, 
  Users, 
  Globe, 
  BarChart3, 
  FileText, 
  ArrowRight,
  GraduationCap,
  Heart,
  MapPin
} from 'lucide-react' //fixed the invisible typo

const Landing = forwardRef<HTMLDivElement>((_props, ref) => {
  return (
    <div 
      ref={ref}
      // BASE: Cream background to match dashboard
      className="min-h-screen bg-[#FDFBF7] text-[#2d0a0e] selection:bg-red-900/10"
      style={{ 
        fontFamily: '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif',
      }}
    >
      {/* --- Background Accents (The "Red" Feel) --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Top Gradient Curtain - Gives the "Header" feel without a solid block */}
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-[#4a1319]/10 via-[#4a1319]/5 to-transparent" />
        
        {/* Decorative Blobs - Increased opacity for more color */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[80px]" />
        <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-[#8B0000]/10 rounded-full blur-[100px]" />
        
        {/* Texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 relative z-10">
        
        {/* --- Hero Section --- */}
        <div className="text-center mb-24 animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#4a1319]/20 text-[#4a1319] text-xs font-bold tracking-wider mb-8 shadow-sm">
            <Database className="w-3 h-3 text-amber-600" />
            <span>CFO OFFICIAL DATA (1981–2020)</span>
          </div>
          
          {/* Main Title - Using Deep Maroon */}
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-[#2d0a0e] drop-shadow-sm">
            Filipino Emigrants <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4a1319] via-[#8B0000] to-amber-700">
              Dashboard
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-[#4a1319]/70 max-w-2xl mx-auto leading-relaxed mb-10 font-medium">
            A comprehensive visualization of four decades of migration patterns. 
            Exploring the demographics, destinations, and stories of over 2 million Filipinos.
          </p>
          
          <Link to="/">
            {/* Button - Solid Maroon to anchor the page */}
            <button className="group relative px-8 py-4 bg-[#4a1319] hover:bg-[#5a1a23] text-white rounded-full font-semibold transition-all duration-300 shadow-[0_10px_40px_-10px_rgba(74,19,25,0.4)] hover:shadow-[0_20px_40px_-10px_rgba(74,19,25,0.5)] hover:-translate-y-1">
              <span className="flex items-center gap-3">
                Access Statistics
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-amber-400" />
              </span>
            </button>
          </Link>
        </div>

        {/* --- Intro / Context --- */}
        <div className="grid md:grid-cols-2 gap-12 mb-20 items-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
           <div className="space-y-6">
              <h2 className="text-3xl font-bold text-[#2d0a0e] flex items-center gap-3">
                <div className="p-2 bg-[#4a1319]/10 rounded-lg">
                  <FileText className="text-[#4a1319]" />
                </div>
                About the System
              </h2>
              <p className="text-[#2d0a0e]/80 leading-relaxed text-lg">
                Utilizing data from the <span className="text-[#8B0000] font-bold">Commission on Filipinos Overseas (CFO)</span>, this platform transforms complex raw data into actionable insights.
              </p>
              <p className="text-[#2d0a0e]/80 leading-relaxed text-lg">
                From 1981 to 2020, migration has shaped the nation's socio-economic landscape. This dashboard empowers researchers and policymakers to analyze these trends.
              </p>
           </div>
           
           {/* Highlight Box - Added Maroon Border/Accent */}
           <div className="bg-white border border-[#4a1319]/10 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-[#4a1319]" /> {/* Left Accent Bar */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-5xl font-extrabold text-[#4a1319] mb-1">2.1M+</div>
                  <div className="text-xs text-[#4a1319]/60 uppercase tracking-wide font-bold">Total Emigrants</div>
                </div>
                <div>
                  <div className="text-5xl font-extrabold text-[#4a1319] mb-1">40</div>
                  <div className="text-xs text-[#4a1319]/60 uppercase tracking-wide font-bold">Years of Data</div>
                </div>
                <div className="col-span-2 pt-6 border-t border-[#4a1319]/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#4a1319]/70 font-semibold">Top Destination</span>
                    <span className="font-bold text-[#8B0000]">United States (60%)</span>
                  </div>
                  <div className="w-full h-2 bg-[#4a1319]/10 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#4a1319] to-[#8B0000] w-[60%]" />
                  </div>
                </div>
              </div>
           </div>
        </div>

        {/* --- STATS GRID --- */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-[#2d0a0e] mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#8B0000]" /> Data Highlights
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          
          {/* Card 1: Demographics */}
          <StatsCard 
            icon={<Users className="w-5 h-5 text-blue-700" />}
            accentColor="bg-blue-600"
            title="Age Distribution"
            delay="0.2s"
          >
            <div className="space-y-4 pt-2">
              <div className="relative">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#4a1319]/70 font-semibold">Children (0-14)</span>
                  <span className="font-bold text-blue-700">21%</span>
                </div>
                <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 w-[21%]" />
                </div>
              </div>
              <div className="relative">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#4a1319]/70 font-semibold">Young Adults (20-34)</span>
                  <span className="font-bold text-[#8B0000]">33%</span>
                </div>
                <div className="h-2 bg-[#4a1319]/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#8B0000] w-[33%]" />
                </div>
              </div>
            </div>
          </StatsCard>

          {/* Card 2: Global Reach */}
          <StatsCard 
            icon={<Globe className="w-5 h-5 text-emerald-700" />}
            accentColor="bg-emerald-600"
            title="Top Destinations"
            delay="0.3s"
          >
             <div className="flex flex-wrap gap-2 pt-2">
                <CountryPill name="USA" percent="60%" color="bg-blue-50 text-blue-800 border-blue-200" />
                <CountryPill name="Canada" percent="20%" color="bg-red-50 text-red-800 border-red-200" />
                <CountryPill name="Japan" percent="6%" color="bg-gray-50 text-gray-800 border-gray-200" />
                <CountryPill name="Australia" percent="6%" color="bg-amber-50 text-amber-800 border-amber-200" />
             </div>
          </StatsCard>

          {/* Card 3: Education */}
          <StatsCard 
            icon={<GraduationCap className="w-5 h-5 text-amber-700" />}
            accentColor="bg-amber-600"
            title="Education Profile"
            delay="0.4s"
          >
            <div className="flex items-end gap-4 h-24 pt-2 px-2">
               <div className="flex-1 flex flex-col justify-end gap-2 group">
                  <span className="text-center font-bold text-amber-800 text-lg">47%</span>
                  <div className="w-full bg-amber-500/80 h-16 rounded-t-lg" />
                  <span className="text-[10px] text-center text-[#4a1319]/60 font-bold uppercase tracking-wider">College</span>
               </div>
               <div className="flex-1 flex flex-col justify-end gap-2 group">
                  <span className="text-center font-bold text-yellow-700 text-lg">30%</span>
                  <div className="w-full bg-yellow-400/60 h-10 rounded-t-lg" />
                  <span className="text-[10px] text-center text-[#4a1319]/60 font-bold uppercase tracking-wider">High School</span>
               </div>
            </div>
          </StatsCard>

          {/* Card 4: Gender Balance */}
          <StatsCard 
            icon={<Users className="w-5 h-5 text-purple-700" />}
            accentColor="bg-purple-600"
            title="Gender Balance"
            delay="0.5s"
          >
             <div className="flex items-center justify-center gap-6 pt-2">
                <div className="text-center">
                   <div className="relative w-20 h-20 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                         <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-purple-100" />
                         <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="226" strokeDashoffset="90" className="text-pink-600" strokeLinecap="round" />
                      </svg>
                      <span className="absolute text-lg font-bold text-pink-700">60%</span>
                   </div>
                   <span className="text-xs text-[#4a1319]/60 font-bold mt-2 block">Female</span>
                </div>
                <div className="text-center">
                   <div className="relative w-16 h-16 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                         <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-blue-100" />
                         <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="176" strokeDashoffset="105" className="text-blue-600" strokeLinecap="round" />
                      </svg>
                      <span className="absolute text-sm font-bold text-blue-700">40%</span>
                   </div>
                   <span className="text-xs text-[#4a1319]/60 font-bold mt-2 block">Male</span>
                </div>
             </div>
          </StatsCard>

          {/* Card 5: Civil Status */}
          <StatsCard 
            icon={<Heart className="w-5 h-5 text-rose-700" />}
            accentColor="bg-rose-600"
            title="Civil Status"
            delay="0.6s"
          >
             <div className="pt-2 space-y-4">
               <div className="flex items-center gap-3">
                 <div className="w-12 text-xs text-[#4a1319]/70 font-bold">Single</div>
                 <div className="flex-1 h-8 bg-rose-50 rounded-md overflow-hidden relative border border-rose-100">
                    <div className="absolute top-0 left-0 h-full bg-rose-500 w-[52%] flex items-center px-2">
                       <span className="text-xs font-bold text-white">52%</span>
                    </div>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 <div className="w-12 text-xs text-[#4a1319]/70 font-bold">Married</div>
                 <div className="flex-1 h-8 bg-amber-50 rounded-md overflow-hidden relative border border-amber-100">
                    <div className="absolute top-0 left-0 h-full bg-amber-600 w-[43%] flex items-center px-2">
                       <span className="text-xs font-bold text-white">43.5%</span>
                    </div>
                 </div>
               </div>
             </div>
          </StatsCard>

           {/* Card 6: Regional Origins */}
           <StatsCard 
            icon={<MapPin className="w-5 h-5 text-teal-700" />}
            accentColor="bg-teal-600"
            title="Regional Origin"
            delay="0.7s"
          >
             <div className="h-full flex flex-col justify-center text-center">
                <h4 className="text-4xl font-extrabold text-teal-700 mb-1">66%</h4>
                <p className="text-sm text-teal-900/70 px-4 font-semibold">
                  Originate from Major Urban Centers
                </p>
                <div className="flex justify-center gap-2 mt-3 text-[10px] text-[#4a1319]/50 font-bold uppercase">
                  <span>NCR</span> • <span>CALABARZON</span> • <span>Central Luzon</span>
                </div>
             </div>
          </StatsCard>

        </div>

        {/* --- Key Findings (Colored Background) --- */}
        <div className="bg-[#4a1319] text-amber-50 rounded-3xl p-8 md:p-12 animate-fade-in-up shadow-2xl relative overflow-hidden" style={{ animationDelay: '0.8s' }}>
          {/* Subtle pattern overlay on the dark background */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
          
          <h2 className="text-2xl font-bold text-amber-100 mb-8 border-b border-amber-500/30 pb-4 relative z-10">Analytical Summary</h2>
          <div className="grid md:grid-cols-3 gap-8 text-amber-100/80 leading-relaxed text-sm relative z-10">
             <article>
               <h4 className="text-amber-400 font-bold mb-3 uppercase tracking-wide text-xs">Family & Career Drivers</h4>
               <p>Emigration is deeply tied to family formation and career advancement. The data shows a distinct "hump" in migration during the 20s and 30s.</p>
             </article>
             <article>
               <h4 className="text-amber-400 font-bold mb-3 uppercase tracking-wide text-xs">Education Stratification</h4>
               <p>College graduates (47%) primarily access professional streams in North America. Those with basic education often fill temporary labor demands in Asia.</p>
             </article>
             <article>
               <h4 className="text-amber-400 font-bold mb-3 uppercase tracking-wide text-xs">Regional Inequality</h4>
               <p>Migration opportunities are concentrated in urbanized regions (NCR, Region IV-A). Access to migration resources remains unevenly distributed.</p>
             </article>
          </div>
        </div>

        {/* --- Footer --- */}
        <div className="mt-16 text-center animate-fade-in-up" style={{ animationDelay: '1s' }}>
          <p className="text-[#4a1319]/40 text-xs uppercase tracking-widest font-bold">
            Commission on Filipinos Overseas • Stock Estimation of Filipinos Overseas
          </p>
        </div>

      </div>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  )
})

/* --- Stats Card with Colored Top Border --- */
const StatsCard = ({ icon, accentColor, title, children, delay }: any) => (
  <div 
    className={`bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group animate-fade-in-up flex flex-col relative overflow-hidden`}
    style={{ animationDelay: delay }}
  >
    {/* Colored Top Accent Bar */}
    <div className={`absolute top-0 left-0 w-full h-1 ${accentColor}`} />
    
    <div className="flex items-center gap-3 mb-4">
      <div className={`p-2 rounded-lg bg-gray-50 border border-gray-100`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-[#2d0a0e]">{title}</h3>
    </div>
    <div className="flex-1">
      {children}
    </div>
  </div>
)

const CountryPill = ({ name, percent, color }: any) => (
  <div className={`px-3 py-1 rounded-md border text-xs font-bold flex items-center gap-2 ${color}`}>
    <span>{name}</span>
    <span className="opacity-70 border-l border-current pl-2 ml-1">{percent}</span>
  </div>
)

Landing.displayName = 'Landing'

export const Route = createFileRoute('/landing')({
  component: Landing,
})

export default Landing