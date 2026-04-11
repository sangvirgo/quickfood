'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import ShipperHeader from '@/components/shipper/ShipperHeader'
import StatusBanner from '@/components/shipper/StatusBanner'
import CurrentDeliveryCard, { ShipmentItem } from '@/components/shipper/CurrentDeliveryCard'
import AvailableShipmentCard from '@/components/shipper/AvailableShipmentCard'
import { useToast } from '@/components/shared/Toast'
import { getUser, getToken } from '@/lib/auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// Install dependencies: `npm install date-fns date-fns-tz`
// Already using standard date-fns in available card.

interface ShipperProfile {
  name?: string
  busy?: boolean
  isBusy?: boolean
  // other fields mock or ignore
}

export default function ShipperDashboardPage() {
  const router = useRouter()
  const toast = useToast()

  const [authChecked, setAuthChecked] = useState(false)
  const [shipper, setShipper] = useState<ShipperProfile | null>(null)
  
  const [currentShipment, setCurrentShipment] = useState<ShipmentItem | null>(null)
  const [availableShipments, setAvailableShipments] = useState<ShipmentItem[]>([])
  const [loadingInitial, setLoadingInitial] = useState(true)
  
  const [refreshCountdown, setRefreshCountdown] = useState(15)

  const isBusy = shipper?.busy ?? shipper?.isBusy ?? false

  useEffect(() => {
    const user = getUser()
    if (!user) {
      router.replace('/login')
    } else if (user.role !== 'SHIPPER') {
      router.replace('/')
    } else {
      setAuthChecked(true)
    }
  }, [router])

  const fetchAvailableShipments = useCallback(async () => {
    try {
      const token = getToken()
      const res = await fetch(`${API_BASE}/api/delivery/shipments/available`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setAvailableShipments(data)
      }
    } catch {
      console.error('Lỗi khi tải đơn hàng available')
    }
  }, [])

  // Identify current shipment from localStorage if we are busy
  const resolveCurrentShipment = useCallback(async () => {
    const savedIdStr = localStorage.getItem('qf_current_shipment')
    if (!savedIdStr) return null

    // For a real app, you would fetch the SPECIFIC shipment by ID: GET /api/delivery/shipments/{id}
    // But per spec, we're just restoring it if we can
    // Mocking finding it or relying on backend if available endpoint works.
    // If backend returns the shipment profile directly, better. Let's just assume we restore what we saved locally for simplicity since the prompt didn't specify an endpoint to fetch a single ticket.
    try {
      const parsed = JSON.parse(savedIdStr)
      return parsed as ShipmentItem
    } catch {
      return null
    }
  }, [])

  const initialLoad = useCallback(async () => {
    try {
      const token = getToken()
      
      // Fetch Shipper Profile to determine isBusy
      const profileRes = await fetch(`${API_BASE}/api/delivery/shippers/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (profileRes.ok) {
        const profileData: ShipperProfile = await profileRes.json()
        setShipper(profileData)
        
        const busy = profileData.busy ?? profileData.isBusy ?? false

        if (busy) {
          const current = await resolveCurrentShipment()
          setCurrentShipment(current)
          setAvailableShipments([]) // don't care about available right now
        } else {
          await fetchAvailableShipments()
          setCurrentShipment(null)
          localStorage.removeItem('qf_current_shipment')
        }
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra khi tải dữ liệu shipper')
    } finally {
      setLoadingInitial(false)
    }
  }, [fetchAvailableShipments, resolveCurrentShipment, toast])

  useEffect(() => {
    if (authChecked) {
      initialLoad()
    }
  }, [authChecked, initialLoad])

  // Polling for available shipments every 15s if NOT busy
  useEffect(() => {
    if (!authChecked || isBusy || loadingInitial) return

    const interval = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          fetchAvailableShipments()
          return 15
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [authChecked, isBusy, loadingInitial, fetchAvailableShipments])

  // Actions
  const handleAcceptShipment = async (id: number) => {
    try {
      const token = getToken()
      const res = await fetch(`${API_BASE}/api/delivery/shipments/${id}/accept`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        const shipmentData = availableShipments.find(s => s.id === id)
        if (shipmentData) {
          setCurrentShipment(shipmentData)
          setShipper(prev => prev ? { ...prev, busy: true, isBusy: true } : null)
          localStorage.setItem('qf_current_shipment', JSON.stringify(shipmentData))
          setAvailableShipments([]) // Clear available list since busy now
          toast.success(`✅ Bạn đã nhận đơn #${shipmentData.orderId}`)
        }
      } else {
        // Handle concurrent conflict (409)
        toast.error('❌ Đơn hàng này vừa được shipper khác nhận')
        fetchAvailableShipments()
      }
    } catch (err) {
      toast.error('Có lỗi từ hệ thống, vui lòng thử lại sau')
      fetchAvailableShipments()
    }
  }

  const handleUpdateLocation = async (lat: number, lng: number) => {
    const token = getToken()
    const res = await fetch(`${API_BASE}/api/delivery/shippers/me/location`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ lat, lng })
    })

    if (!res.ok) {
        throw new Error('Lỗi cập nhật vị trí')
    }
  }

  const handleCompleteDelivery = async (id: number) => {
    const token = getToken()
    const res = await fetch(`${API_BASE}/api/delivery/shipments/${id}/complete`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (!res.ok) {
      toast.error('Lỗi khi hoàn thành giao hàng')
      throw new Error('Complete failed')
    }

    toast.success('🎉 Giao hàng thành công! Cảm ơn bạn.')
    setShipper(prev => prev ? { ...prev, busy: false, isBusy: false } : null)
    setCurrentShipment(null)
    localStorage.removeItem('qf_current_shipment')
    
    // Fetch available again
    setRefreshCountdown(15)
    fetchAvailableShipments()
  }

  if (!authChecked) return null

  return (
    <div className="bg-qf-bg min-h-screen flex flex-col pb-10">
      <ShipperHeader shipperName={shipper?.name} />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 pt-6">
        {/* Top Banner */}
        <div className="mb-8">
          <StatusBanner isBusy={isBusy} availableCount={availableShipments.length} />
        </div>

        {loadingInitial ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 rounded-full border-4 border-qf-border border-t-qf-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Current Delivery Section */}
            {isBusy && currentShipment && (
              <section className="animate-scale-in">
                <CurrentDeliveryCard 
                  shipment={currentShipment}
                  onUpdateLocation={handleUpdateLocation}
                  onComplete={handleCompleteDelivery}
                />
              </section>
            )}

            {/* Available Shipments Section */}
            <section className={isBusy ? 'opacity-60 pointer-events-none' : 'animate-fade-in'}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold font-display text-qf-secondary">
                  Đơn hàng đang chờ
                  <span className="ml-2 inline-flex items-center justify-center bg-qf-border/50 text-qf-secondary font-sans text-xs w-6 h-6 rounded-full">
                    {availableShipments.length}
                  </span>
                </h2>
                {!isBusy && (
                  <span className="text-xs font-medium text-qf-muted">
                    Cập nhật sau {refreshCountdown}s
                  </span>
                )}
              </div>

              {availableShipments.length === 0 ? (
                <div className="bg-white border border-qf-border rounded-xl p-8 text-center shadow-sm">
                  <div className="text-4xl mb-3 opacity-80">☕</div>
                  <p className="font-semibold text-qf-secondary mb-1">Chưa có đơn hàng nào</p>
                  <p className="text-sm text-qf-muted">Hãy nghỉ ngơi một chút chờ đơn mới nhé!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableShipments.map(shipment => (
                    <AvailableShipmentCard
                      key={shipment.id}
                      shipment={shipment}
                      onAccept={handleAcceptShipment}
                      disabled={isBusy}
                    />
                  ))}
                </div>
              )}
            </section>

          </div>
        )}
      </main>
    </div>
  )
}
