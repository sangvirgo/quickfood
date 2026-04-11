# Prompt: Trang Lịch Sử Đơn Hàng + Tracking — Customer

## Mục tiêu
Trang `/orders` dành cho customer: xem tất cả đơn hàng đã đặt, chi tiết từng đơn, và theo dõi shipment realtime (vị trí shipper).

---

## Design Tokens (đồng bộ)

```css
--color-bg: #FAF7F2
--color-surface: #FFFFFF
--color-primary: #E8521A
--color-primary-hover: #C94412
--color-secondary: #1C1917
--color-muted: #78716C
--color-border: #E7E0D8
--color-accent: #F5E6D3
```

**Fonts**: `Playfair Display` (headings), `DM Sans` (body)

---

## Layout

```
[Header — same as home page]
[Page Title]
[Order List (left) + Order Detail Panel (right)]
```

Desktop: 2 cột — List (40%) | Detail (60%)
Mobile: 1 cột — List → tap → Detail page/modal

---

## Page Header

- Title: "Đơn hàng của tôi" — Playfair Display 28px
- Subtitle: "X đơn hàng" — DM Sans, màu muted

---

## Order List (cột trái)

Mỗi order card:
```
[Status Badge]  [Ngày đặt]
Đơn #ID
X món · XXX.XXX đ
[Preview tên món đầu tiên, ...]
```

**Status Badge Colors**:
```
PENDING   → background: #FEF3C7, text: #92400E, icon: ⏳
READY     → background: #DBEAFE, text: #1E40AF, icon: 🔔
DELIVERED → background: #D1FAE5, text: #065F46, icon: ✅
```

- Card selected: border-left 3px solid `--color-primary`, background nhạt
- Hover: cursor pointer, background `--color-accent`
- Sort: mới nhất trên cùng (theo `createdAt` desc)

---

## Order Detail Panel (cột phải)

### Header của panel
- "Chi tiết đơn #ID" — Playfair Display
- Status badge lớn hơn

### Thông tin đơn
```
Ngày đặt: [datetime formatted]
Địa chỉ giao: [deliveryAddress]
```

### Danh sách sản phẩm
Table/list đơn giản:
```
[Tên sản phẩm]     [SL]  [Đơn giá]  [Thành tiền]
Burger             x2    9.99đ      19.98đ
──────────────────────────────────────────
                   TỔNG CỘNG:       19.98đ
```

Tổng cộng: text lớn hơn, màu `--color-primary`

### Tracking Section (chỉ hiện khi status = READY hoặc DELIVERING)

**Title**: "🛵 Theo dõi đơn hàng"

**Shipper Info Box**:
```
[Avatar placeholder — initials]  Shipper: [shipperName]
                                  Trạng thái: Đang giao hàng
```

**Simplified Map Placeholder**:
- Không dùng Google Maps thật (cần API key)
- Thay bằng một "mock map card" đẹp:
  - Background: gradient xanh lá nhạt gợi ý bản đồ
  - Grid lines nhẹ giống map tiles
  - Một dot nhấp nháy animation (shipper location)
  - Text: "Lat: {lat} · Lng: {lng}"
  - Link nhỏ: "Mở Google Maps" → href `https://maps.google.com/?q={lat},{lng}` target blank

- Nếu lat/lng là null: hiện "Chưa có vị trí shipper"

**Refresh Button**: "↻ Cập nhật vị trí" — call lại API tracking, có loading state

---

## Empty State

Khi không có đơn hàng nào:
- SVG illustration đơn giản: một chiếc hộp trống
- Text: "Bạn chưa có đơn hàng nào"
- Button: "Đặt ngay" → link về trang chủ `/`

---

## Mobile: Detail Modal

Khi tap vào một order card trên mobile → mở bottom sheet / full-screen modal từ dưới trượt lên, không navigate sang trang mới.

---

## API

```typescript
// Lấy tất cả đơn hàng của customer
GET /api/core/orders
Headers: Authorization: Bearer {token}

Response: Array<{
  id: number,
  customerId: number,
  totalPrice: number,
  status: 'PENDING' | 'READY' | 'DELIVERED',
  createdAt: string,
  items: Array<{
    id: number,
    productId: number,
    productName: string,
    quantity: number,
    unitPrice: number,
    subtotal: number
  }>
}>

// Lấy tracking
GET /api/core/orders/{id}/tracking
Headers: Authorization: Bearer {token}

Response: {
  orderId: number,
  shipperName: string | null,
  status: string,
  latitude: number | null,
  longitude: number | null
}
```

---

## Format Ngày

```typescript
// Dùng Intl.DateTimeFormat
const formatDate = (iso: string) => 
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(iso))
```

---

## Auto-refresh Tracking

Khi đơn hàng đang ở status `READY`:
- Poll tracking API mỗi 10 giây (dùng `setInterval` trong `useEffect`)
- Hiện countdown: "Cập nhật sau 8s..."
- Cleanup interval khi component unmount hoặc status = DELIVERED

---

## File Structure

```
app/
  (customer)/
    orders/
      page.tsx
components/
  customer/
    OrderList.tsx
    OrderCard.tsx
    OrderDetailPanel.tsx
    TrackingCard.tsx
    MockMap.tsx
```

---

## Lưu ý

- Ngày giờ format tiếng Việt
- Giá tiền format: `toLocaleString('vi-VN') + ' đ'`
- Loading skeleton cho order list khi fetch
- Handle error 401 → redirect về login
