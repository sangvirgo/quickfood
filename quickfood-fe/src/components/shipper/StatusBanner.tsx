'use client'

interface StatusBannerProps {
  isBusy: boolean
  availableCount: number
}

export default function StatusBanner({ isBusy, availableCount }: StatusBannerProps) {
  if (isBusy) {
    return (
      <div 
        className="w-full rounded-2xl p-6 flex items-center shadow-sm"
        style={{ background: 'linear-gradient(to right, var(--color-qf-accent), #FCD3A1)' }}
      >
        <div className="text-5xl mr-5 animate-pulse">📦</div>
        <div>
          <h2 className="text-xl font-bold font-display" style={{ color: 'var(--color-qf-primary-hover)' }}>
            Đang giao hàng
          </h2>
          <p className="text-sm mt-1 text-[#9A3412]">
            Hoàn thành đơn hiện tại trước khi nhận đơn mới
          </p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="w-full rounded-2xl p-6 flex items-center shadow-sm"
      style={{ background: 'linear-gradient(to right, #ECFDF5, #D1FAE5)' }}
    >
      <div className="text-5xl mr-5">🛵</div>
      <div>
        <h2 className="text-xl font-bold font-display text-[#065F46]">
          Sẵn sàng nhận đơn
        </h2>
        <p className="text-sm mt-1 text-[#047857] font-medium">
          {availableCount} đơn hàng đang chờ
        </p>
      </div>
    </div>
  )
}
