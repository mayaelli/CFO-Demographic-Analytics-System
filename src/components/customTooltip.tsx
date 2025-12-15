interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  data: any[]
  colors: string[]
  categoryKey: string
  valueLabel?: string
}

export const CustomTooltip = ({
  active,
  payload,
  data,
  colors,
  categoryKey,
  valueLabel = 'Total Emigrants'
}: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null
  
  const dataPoint = payload[0]
  const index = data.findIndex(item => item[categoryKey] === dataPoint.payload[categoryKey])
  const color = colors[index % colors.length]

  return (
    <div style={{
      backgroundColor: '#dedaccff',
      border: '1px solid ' + color,
      borderRadius: '8px',
      padding: '10px',
      color: '#ffffff',
      fontSize: '14px',
      fontFamily: 'Inter, sans-serif'
    }}>
      <p style={{
        color: color,
        fontWeight: 'bold',
        marginBottom: '8px',
        margin: 0
      }}>
        {dataPoint.payload[categoryKey]}
      </p>
      <p style={{
        color: color,
        fontWeight: 'bold',
        marginTop: '6px'
      }}>
        {valueLabel}: {dataPoint.value?.toLocaleString() || 0}
      </p>
    </div>
  )
}