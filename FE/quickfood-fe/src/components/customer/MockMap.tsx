'use client'

interface MockMapProps {
  lat: number | null
  lng: number | null
}

export default function MockMap({ lat, lng }: MockMapProps) {
  if (lat === null || lng === null) {
    return (
      <div 
        className="w-full h-32 rounded-lg flex items-center justify-center text-sm"
        style={{ backgroundColor: 'var(--color-qf-border)', color: 'var(--color-qf-muted)' }}
      >
        Chưa có thông tin vị trí shipper
      </div>
    )
  }

  const mapUrl = `https://maps.google.com/?q=${lat},${lng}`

  return (
    <div 
      className="relative w-full h-32 rounded-lg overflow-hidden border flex items-center justify-center isolate"
      style={{
        backgroundColor: '#E6F4EA', // Light green for a map vibe
        borderColor: 'var(--color-qf-border)',
        backgroundImage: `
          linear-gradient(rgba(28, 25, 23, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(28, 25, 23, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
      }}
    >
      {/* Blinking dot representing the shipper */}
      <div className="absolute z-10 flex items-center justify-center">
        <div className="w-5 h-5 bg-qf-primary rounded-full animate-pulse-dot" />
        <div className="absolute w-3 h-3 bg-white rounded-full" />
      </div>

      <div 
        className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-3 py-1.5 rounded-md bg-white/90 backdrop-blur-sm text-xs shadow-sm z-20"
      >
        <span className="font-mono text-qf-secondary font-medium">
          Lat: {lat.toFixed(4)} · Lng: {lng.toFixed(4)}
        </span>
        <a 
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-qf-primary hover:underline font-medium"
        >
          Mở Google Maps
        </a>
      </div>
    </div>
  )
}
