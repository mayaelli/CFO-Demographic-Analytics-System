import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { 
  Users, 
  Heart, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  PersonStanding, 
  Globe2,
  BarChart3
} from 'lucide-react';

// Chart Imports
import AgeCharts from '../components/charts/ageCharts';
import CivilStatusCharts from '../components/charts/civilStatusCharts';
import DestinationCharts from '../components/charts/destinationCharts';
import EducationCharts from '../components/charts/educationCharts';
import OccupationCharts from '../components/charts/occupationCharts';
import SexCharts from '../components/charts/sexCharts';
import OriginCharts from '../components/charts/originCharts';

export const Route = createFileRoute('/')({
  component: DashboardIndex,
});

// --- Configuration ---
// Centralized config makes it easy to reorder or add metadata (icons, descriptions)
const CHART_CONFIG = {
  age: {
    label: 'Age Demographics',
    icon: Users,
    component: <AgeCharts />,
    description: 'Distribution of emigrants by age groups and generational trends.'
  },
  sex: {
    label: 'Sex Distribution',
    icon: PersonStanding,
    component: <SexCharts />,
    description: 'Comparative analysis of male and female migration patterns.'
  },
  civil_status: {
    label: 'Civil Status',
    icon: Heart,
    component: <CivilStatusCharts />,
    description: 'Breakdown of emigrants by marital status at the time of migration.'
  },
  education: {
    label: 'Education Profile',
    icon: GraduationCap,
    component: <EducationCharts />,
    description: 'Educational attainment levels of the emigrant population.'
  },
  occupation: {
    label: 'Occupation',
    icon: Briefcase,
    component: <OccupationCharts />,
    description: 'Professional background and employment sectors of emigrants.'
  },
  origin: {
    label: 'Regional Origin',
    icon: Globe2,
    component: <OriginCharts />,
    description: 'Geographic origins of emigrants within the Philippines.'
  },
  destination: {
    label: 'Destination',
    icon: MapPin,
    component: <DestinationCharts />,
    description: 'Top countries of destination and global distribution.'
  },
};

type ChartKey = keyof typeof CHART_CONFIG;

function DashboardIndex() {
  const [selectedChart, setSelectedChart] = useState<ChartKey>('age');
  
  const ActiveConfig = CHART_CONFIG[selectedChart];

  return (
    <div className="min-h-screen bg-[#FFFBF5] text-slate-800 font-sans selection:bg-amber-200">
      
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-amber-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-orange-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">

        {/* --- Header Section --- */}
        <div className="mb-10 md:mb-14 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
            <BarChart3 size={14} /> CMO Analytics Dashboard
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-amber-950 tracking-tight">
            Emigrant Data Overview
          </h1>
          <p className="text-amber-900/60 text-lg max-w-2xl mx-auto font-medium">
            Comprehensive insights into the demographics, origins, and destinations of Filipino emigrants.
          </p>
        </div>

        {/* --- Navigation Tabs --- */}
        <div className="sticky top-4 z-30 mb-8">
          <div className="bg-white/80 backdrop-blur-md border border-amber-200/60 p-1.5 rounded-2xl shadow-xl shadow-amber-900/5 mx-auto max-w-full overflow-x-auto no-scrollbar">
            <div className="flex items-center justify-start md:justify-center gap-1 min-w-max">
              {(Object.keys(CHART_CONFIG) as ChartKey[]).map((key) => {
                const item = CHART_CONFIG[key];
                const isSelected = selectedChart === key;
                const Icon = item.icon;

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedChart(key)}
                    className={`
                      group relative flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300
                      ${isSelected 
                        ? 'bg-amber-500 text-white shadow-md' 
                        : 'text-amber-900/60 hover:bg-amber-50 hover:text-amber-900'
                      }
                    `}
                  >
                    <Icon size={18} className={isSelected ? 'animate-pulse' : 'opacity-70'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* --- Main Content Area --- */}
        <div className="grid lg:grid-cols-4 gap-8 items-start">
          
          {/* Context Sidebar (Desktop) / Top Info (Mobile) */}
          <div className="lg:col-span-1 order-1 lg:order-2 space-y-6">
            <div className="bg-white/60 backdrop-blur-sm border border-amber-100 p-6 rounded-2xl shadow-sm animate-in slide-in-from-right-4 duration-500">
              <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 w-fit rounded-xl text-white mb-4 shadow-lg shadow-amber-500/30">
                <ActiveConfig.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-amber-950 mb-2">
                {ActiveConfig.label}
              </h3>
              <p className="text-amber-900/70 leading-relaxed text-sm">
                {ActiveConfig.description}
              </p>
            </div>
            
            {/* You could add specific filters or summary stats here in the future */}
            <div className="hidden lg:block bg-amber-50/50 border border-dashed border-amber-200 p-6 rounded-2xl text-center">
              <p className="text-amber-900/40 text-xs font-semibold uppercase">Data Status</p>
              <p className="text-amber-700 font-bold mt-1">Verified & Up to date</p>
            </div>
          </div>

          {/* Chart Container */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-amber-900/10 border border-amber-100 overflow-hidden relative min-h-[500px]">
              
              {/* Header inside card */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-300 via-orange-400 to-amber-300 opacity-80" />
              
              <div className="p-6 md:p-8">
                 {/* Key prop ensures React unmounts/remounts triggering animations if present in children */}
                <div key={selectedChart} className="animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-500">
                  {ActiveConfig.component}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}