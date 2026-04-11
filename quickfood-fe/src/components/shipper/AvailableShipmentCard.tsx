'use client'

import { useState } from 'react'
import { MapPin, Clock, ArrowRight, Loader2 } from 'lucide-react'
import { ShipmentItem } from './CurrentDeliveryCard'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

interface AvailableShipmentCardProps {
  shipment: ShipmentItem & { readyAt?: string } // Optional property to show how long it's been waiting
  onAccept: (id: number) => Promise<void>
  disabled: boolean
}

export default function AvailableShipmentCard({ shipment, onAccept, disabled }: AvailableShipmentCardProps) {
  const [loading, setLoading] = useState(false)

  const handleAccept = async () => {
    setLoading(true)
    try {
      await onAccept(shipment.id)
    } catch {
      setLoading(false)
    }
  }

  const timeAgo = shipment.readyAt 
    ? formatDistanceToNow(new Date(shipment.readyAt), { addSuffix: true, locale: vi }) 
    : 'Vừa xong'

  return (
    <div className="bg-white border border-qf-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-qf-border/50">
        <h3 className="font-semibold text-qf-secondary text-base">Đơn #{shipment.orderId}</h3>
        <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
          <Clock size={13} />
          {timeAgo}
        </div>
      </div>

      {/* Address */}
      <div className="flex items-start gap-2.5 text-sm text-qf-secondary mb-5">
        <MapPin size={16} className="text-qf-muted shrink-0 mt-0.5" />
        <div>
          <span className="font-medium line-clamp-2 leading-snug">{shipment.deliveryAddress}</span>
          {(shipment.destinationLat && shipment.destinationLng) && (
            <span className="block mt-1 text-xs text-qf-muted font-mono">
              {shipment.destinationLat.toFixed(4)}, {shipment.destinationLng.toFixed(4)}
            </span>
          )}
        </div>
      </div>

      {/* Action */}
      <button
        onClick={handleAccept}
        disabled={disabled || loading}
        title={disabled ? "Hoàn thành đơn hiện tại trước khi nhận tiếp" : ""}
        className="w-full min-h-[48px] qf-btn-primary flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-transparent disabled:border-qf-border disabled:!bg-qf-bg disabled:!text-qf-muted"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <>
            Nhận đơn này
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>
    </div>
  )
}
