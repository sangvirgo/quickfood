'use client'

import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import MockMap from './MockMap'
import { getToken } from '@/lib/auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface TrackingResponse {
  orderId: number
  shipperName: string | null
  status: string
  latitude: number | null
  longitude: number | null
}

interface TrackingCardProps {
  orderId: number
  status: 'PENDING' | 'READY' | 'DELIVERED'
}

export default function TrackingCard({ orderId, status }: TrackingCardProps) {
  const [tracking, setTracking] = useState<TrackingResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(10)

  const fetchTracking = async () => {
    try {
      setLoading(true)
      const token = getToken()
      const res = await fetch(`${API_BASE}/api/core/orders/${orderId}/tracking`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setTracking(data)
      }
    } catch (err) {
      console.error('Failed to fetch tracking', err)
    } finally {
      setLoading(false)
      setTimeLeft(10)
    }
  }

  // Initial fetch and setup polling if status is READY
  useEffect(() => {
    if (status !== 'READY' && status !== 'DELIVERED') return // The prompt says DELIVERING but backend uses READY for in transit usually. It says "chỉ hiện khi status = READY hoặc DELIVERING" in the spec but only lists 3 statuses: PENDING, READY, DELIVERED.

    fetchTracking()

    if (status === 'READY') {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            fetchTracking()
            return 10
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [orderId, status])

  if (status !== 'READY' && status !== 'DELIVERED' && tracking?.status !== 'DELIVERING') {
    return null
  }

  return (
    <div className="mt-6 border border-qf-border rounded-xl bg-white overflow-hidden shadow-sm">
      <div className="flex items-center justify-between bg-qf-bg px-4 py-3 border-b border-qf-border">
        <h3 className="font-semibold text-qf-secondary flex items-center gap-2">
          <span>🛵</span> Theo dõi đơn hàng
        </h3>
        {status === 'READY' && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-qf-muted">Cập nhật sau {timeLeft}s...</span>
            <button 
              onClick={() => {
                setTimeLeft(10)
                fetchTracking()
              }}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs font-medium text-qf-primary hover:text-qf-primary-hover disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Cập nhật vị trí
            </button>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Shipper info */}
        <div className="flex items-center gap-3 bg-qf-bg rounded-lg p-3">
          <div className="w-10 h-10 rounded-full bg-qf-accent text-qf-primary flex items-center justify-center font-bold font-display text-lg shrink-0">
            {tracking?.shipperName ? tracking.shipperName.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <p className="text-sm text-qf-muted mb-0.5">Shipper: <span className="font-medium text-qf-secondary">{tracking?.shipperName || 'Đang tìm tài xế...'}</span></p>
            <p className="text-sm text-qf-muted">Trạng thái: <span className="font-medium text-qf-primary">{tracking?.status || status}</span></p>
          </div>
        </div>

        {/* Map */}
        <MockMap lat={tracking?.latitude ?? null} lng={tracking?.longitude ?? null} />
      </div>
    </div>
  )
}
