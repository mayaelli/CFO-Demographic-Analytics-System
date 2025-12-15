import { ResponsiveTreeMap } from '@nivo/treemap'

interface TreemapNivoProps {
  data: {
    name: string
    value: number
  }[]
  occupationLabelMap: Record<string, string>
}

const TreemapNivo = ({ data, occupationLabelMap }: TreemapNivoProps) => {
  
  // A curated palette that harmonizes with your Amber/Orange dashboard 
  // but provides enough contrast for distinct categories.
  const colors = [
    '#9a3412', // Deep Orange
    '#7c2d12', // Dark Oak
    '#0f766e', // Muted Teal (Contrast)
    '#b45309', // Amber 700
    '#be185d', // Deep Pink/Magenta
    '#4338ca', // Indigo (Cool contrast)
    '#a16207', // Yellow Brown
    '#881337', // Deep Rose
    '#1e3a8a', // Dark Blue
    '#ea580c', // Vibrant Orange
    '#374151', // Dark Gray
    '#047857', // Emerald
  ]

  // Calculate total for percentage calculation
  const total = data.reduce((sum, item) => sum + item.value, 0)

  // Transform data to Nivo format
  const nivoData = {
    name: 'occupations',
    color: '#ffffff',
    children: data.map((item, index) => ({
      name: item.name,
      fullName: occupationLabelMap[item.name] || item.name,
      value: item.value,
      color: colors[index % colors.length],
    })),
  }

  return (
    // height: 100% allows the parent container to control the size
    <div style={{ height: '100%', width: '100%', minHeight: '400px' }}>
      <ResponsiveTreeMap
        data={nivoData}
        identity="name"
        value="value"
        valueFormat=".0s"
        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        
        // --- VISUAL STYLE ---
        labelSkipSize={12}
        labelTextColor="#ffffff"
        innerPadding={3} // Adds gaps between boxes
        outerPadding={3}
        colors={(node: any) => node.data.color}
        borderWidth={0} // Clean look (no borders, just padding gap)
        
        // --- LABEL LOGIC ---
        label={(node: any) => {
          const value = node.value
          const percentage = ((value / total) * 100).toFixed(1)
          const name = node.data?.name || ''
          const fullName = node.data?.fullName || ''
          
          if (!name) return ''
          
          const width = node.width
          const height = node.height
          const area = width * height
          
          // Logic: 
          // 1. Huge Box: Full Name + Count + %
          // 2. Large Box: Full Name + %
          // 3. Medium Box: Short Name + %
          // 4. Small Box: % only
          
          if (area > 20000 && width > 160 && height > 100) {
             return `${fullName}\n${percentage}%`
          } 
          else if (area > 8000 && width > 100) {
            // Truncate name if too long
            const display = fullName.length > 15 ? name : fullName
            return `${display}\n${percentage}%`
          } 
          else if (area > 3000 && width > 60) {
            return `${percentage}%`
          } 
          else {
            return ''
          }
        }}
        orientLabel={false} // Keep labels horizontal
        enableParentLabel={false}
        
        // --- ANIMATION ---
        animate={true}
        motionConfig="gentle"
        
        // --- TOOLTIP STYLE (Matches Dashboard) ---
        tooltip={({ node }: any) => {
          const fullName = node.data.fullName
          const value = node.value
          const percentage = ((value / total) * 100).toFixed(2)
          const color = node.data.color
          
          return (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                padding: '12px 16px',
                border: `1px solid ${color}`,
                borderLeft: `6px solid ${color}`, // Colored accent bar
                borderRadius: '8px',
                color: '#333',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{ fontWeight: '800', color: '#111', marginBottom: '4px', textTransform: 'capitalize' }}>
                {fullName}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
                <span>Count:</span>
                <strong>{value.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
                <span>Share:</span>
                <strong>{percentage}%</strong>
              </div>
            </div>
          )
        }}
        
        // --- TEXT THEME ---
        theme={{
          labels: {
            text: {
              fontSize: 13,
              fontWeight: 800,
              fill: '#ffffff',
              fontFamily: 'Inter, sans-serif',
              textShadow: '0px 1px 3px rgba(0,0,0,0.6)', // Ensures text pops on any color
            },
          },
        }}
      />
    </div>
  )
}

export default TreemapNivo