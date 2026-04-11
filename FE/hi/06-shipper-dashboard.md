# Prompt: Shipper Dashboard — QuickFood

## Mục tiêu
Dashboard dành cho shipper: xem các đơn hàng sẵn sàng giao (WAITING), nhận đơn, cập nhật vị trí GPS, hoàn thành đơn.

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

## Layout Tổng Thể

Shipper thường dùng mobile nhiều hơn → thiết kế mobile-first, desktop vẫn ổn.

```
[Top Bar — compact]
[Status Toggle: Đang online/offline]
[Current Delivery Card — nếu đang giao]
[Available Shipments List]
```

---

## Top Bar

- Logo nhỏ: "QuickFood" text logo
- Tên shipper: lấy từ API `/api/delivery/shippers/me`
- Avatar: initials circle
- Nút đăng xuất: icon nhỏ

---

## Status Banner

Card lớn ở trên cùng, full width:

**Khi Shipper không bận (isBusy = false)**:
```
Background: gradient xanh lá ấm (#ECFDF5 → #D1FAE5)
Icon: 🛵 (lớn, 48px)
Text: "Sẵn sàng nhận đơn"
Sub: "X đơn hàng đang chờ"
```

**Khi Shipper đang giao (isBusy = true)**:
```
Background: gradient cam ấm (--color-accent đậm hơn)
Icon: 📦 đang nhấp nháy
Text: "Đang giao hàng"
Sub: "Hoàn thành đơn hiện tại trước khi nhận đơn mới"
```

---

## Current Delivery Card (chỉ hiện khi isBusy = true)

Card nổi bật, border 2px solid `--color-primary`:

```
┌──────────────────────────────────────┐
│  🔥 Đơn đang giao                    │
│                                      │
│  Đơn #ID                             │
│  📍 [deliveryAddress]                │
│                                      │
│  [Nút cập nhật vị trí]               │
│  [Nút hoàn thành giao hàng ✓]        │
└──────────────────────────────────────┘
```

**Nút "Cập nhật vị trí"**:
- Call `navigator.geolocation.getCurrentPosition()`
- Nếu user cho phép: lấy lat/lng, call API update location
- Loading state: "Đang lấy vị trí..."
- Success: "📍 Đã cập nhật lúc HH:MM"
- Nếu denied: "Vui lòng cho phép truy cập vị trí trong cài đặt trình duyệt"

**Nút "Hoàn thành giao hàng"**:
- Màu xanh lá (green-600)
- Confirm: "Xác nhận đã giao hàng thành công?"
- Sau confirm: call complete API, hiện celebration animation (confetti nhỏ hoặc checkmark lớn)
- Card shipper updated: isBusy = false

---

## Available Shipments Section

Title: "Đơn hàng đang chờ" — Playfair Display, kèm badge số lượng

### Shipment Card

```
┌──────────────────────────────────────┐
│  Đơn #orderId              🕐 Vừa xong│
│                                      │
│  📍 [deliveryAddress]                │
│     [destinationLat, Lng nếu có]     │
│                                      │
│  [              Nhận đơn này →]      │
└──────────────────────────────────────┘
```

**Card Style**:
- Background white, border, radius 12px
- Shadow nhẹ
- Nút "Nhận đơn": full width, background `--color-primary`

**Khi isBusy = true**: tất cả nút "Nhận đơn" bị disabled, có tooltip "Hoàn thành đơn hiện tại trước"

**Empty State**: "Chưa có đơn hàng nào. Chờ một chút nhé! ☕"

---

## Accept Shipment Flow

1. User tap "Nhận đơn"
2. Loading state trên nút (prevent double tap)
3. Call API
4. **Success**: 
   - Xóa khỏi available list
   - Hiện "Current Delivery Card"
   - Toast: "✅ Bạn đã nhận đơn #orderId"
5. **Concurrent conflict** (409 / 500 từ server vì pessimistic lock):
   - Toast error: "❌ Đơn hàng này vừa được shipper khác nhận"
   - Refresh available list

---

## Location Update

Khi call "Cập nhật vị trí":

```typescript
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude: lat, longitude: lng } = position.coords
    // Call API
    PUT /api/delivery/shippers/me/location
    Body: { lat, lng }
  },
  (error) => {
    // Handle: PERMISSION_DENIED, POSITION_UNAVAILABLE, TIMEOUT
  }
)
```

---

## Auto-refresh

- Refresh available shipments mỗi 15 giây khi isBusy = false
- Countdown indicator: "Cập nhật sau Xs"
- Stop refresh khi isBusy = true (không cần xem list)

---

## API

```typescript
// Lấy profile shipper của mình
GET /api/delivery/shippers/me
Headers: Authorization: Bearer {token}

// Lấy đơn available (WAITING)
GET /api/delivery/shipments/available
Headers: Authorization: Bearer {token}

// Nhận đơn
PUT /api/delivery/shipments/{id}/accept
Headers: Authorization: Bearer {token}

// Hoàn thành đơn
PUT /api/delivery/shipments/{id}/complete
Headers: Authorization: Bearer {token}

// Cập nhật vị trí
PUT /api/delivery/shippers/me/location
Headers: Authorization: Bearer {token}, Content-Type: application/json
Body: { lat: number, lng: number }
```

**Lưu ý `isBusy`**: API trả về `busy` (boolean getter). Handle cả 2:
```typescript
const isBusy = shipper.busy ?? shipper.isBusy ?? false
```

---

## Auth Guard

```typescript
const user = JSON.parse(localStorage.getItem('qf_user') || 'null')
if (!user) redirect('/login')
if (user.role !== 'SHIPPER') redirect('/')
```

---

## State

```typescript
interface ShipperState {
  shipper: ShipperProfile | null
  currentShipmentId: number | null  // shipment đang giao
  availableShipments: Shipment[]
}
```

Để tìm "current shipment": query available không thấy → fetch shipments list hoặc lưu ID khi accept.

Giải pháp đơn giản: khi accept thành công, lưu `currentShipmentId` vào localStorage `qf_current_shipment`.

---

## Mobile Optimizations

- Tất cả nút có min-height 48px (touch-friendly)
- Padding rộng hơn
- Font size không nhỏ hơn 14px
- Scroll smooth

---

## File Structure

```
app/
  (shipper)/
    shipper/
      dashboard/
        page.tsx
components/
  shipper/
    ShipperHeader.tsx
    StatusBanner.tsx
    CurrentDeliveryCard.tsx
    AvailableShipmentCard.tsx
    LocationButton.tsx
```
