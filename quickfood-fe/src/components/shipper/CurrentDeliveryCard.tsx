'use client'

import { useState } from 'react'
import { MapPin, Navigation, CheckCircle, Loader2 } from 'lucide-react'
import { useToast } from '@/components/shared/Toast'

export interface ShipmentItem {
  id: number
  orderId: number
  deliveryAddress: string
  destinationLat?: number | null
  destinationLng?: number | null
  status: string
}

interface CurrentDeliveryCardProps {
  shipment: ShipmentItem
  onComplete: (id: number) => Promise<void>
  onUpdateLocation: (lat: number, lng: number) => Promise<void>
}

export default function CurrentDeliveryCard({ shipment, onComplete, onUpdateLocation }: CurrentDeliveryCardProps) {
  const toast = useToast()
  const [updatingLoc, setUpdatingLoc] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const handleUpdateLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt không hỗ trợ Geolocation')
      return
    }

    setUpdatingLoc(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          await onUpdateLocation(latitude, longitude)
          const time = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date())
          setLastUpdated(time)
          toast.success(`📍 Đã cập nhật lúc ${time}`)
        } catch (err) {
          toast.error('Lỗi khi cập nhật vị trí lên hệ thống')
        } finally {
          setUpdatingLoc(false)
        }
      },
      (error) => {
        console.error(error)
        toast.error('Vui lòng cho phép truy cập vị trí trong cài đặt trình duyệt')
        setUpdatingLoc(false)
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  const handleComplete = async () => {
    if (!window.confirm('Xác nhận đã giao hàng thành công?')) return
    setCompleting(true)
    try {
      await onComplete(shipment.id)
    } catch {
      setCompleting(false)
    }
  }

  return (
    <div className="bg-white border-2 rounded-2xl p-5 shadow-md relative overflow-hidden" style={{ borderColor: 'var(--color-qf-primary)' }}>
      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-qf-accent rounded-bl-full -z-0 opacity-50" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🔥</span>
          <h3 className="text-lg font-bold font-display text-qf-secondary">Đơn đang giao</h3>
        </div>

        <div className="mb-2">
          <span className="text-sm font-semibold text-qf-secondary">Đơn #{shipment.orderId}</span>
        </div>
        
        <div className="flex items-start gap-2 text-sm text-qf-muted mb-6 bg-qf-bg p-3 rounded-lg border border-qf-border">
          <MapPin size={18} className="text-qf-primary shrink-0 mt-0.5" />
          <span className="leading-snug">{shipment.deliveryAddress}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleUpdateLocation}
            disabled={updatingLoc}
            className="flex-1 flex items-center justify-center gap-2 min-h-[48px] px-4 rounded-xl font-medium border border-qf-border bg-white text-qf-secondary hover:bg-qf-bg transition-colors disabled:opacity-70 text-sm shadow-sm"
          >
            {updatingLoc ? (
              <Loader2 size={18} className="animate-spin text-qf-primary" />
            ) : (
              <Navigation size={18} className="text-qf-primary" />
            )}
            {updatingLoc ? 'Đang lấy vị trí...' : (lastUpdated ? `Cập nhật (Lần cuối: ${lastUpdated})` : 'Cập nhật vị trí GPS')}
          </button>

          <button
            onClick={handleComplete}
            disabled={completing}
            className="flex-1 flex items-center justify-center gap-2 min-h-[48px] px-4 rounded-xl font-medium bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-70 text-sm shadow-sm"
          >
            {completing ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <CheckCircle size={18} />
            )}
            {completing ? 'Đang xác nhận...' : 'Hoàn thành giao hàng ✓'}
          </button>
        </div>
      </div>
    </div>
  )
}
