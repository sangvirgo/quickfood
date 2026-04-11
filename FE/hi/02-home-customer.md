# Prompt: Trang Chủ Customer — QuickFood

## Mục tiêu
Trang chủ dành cho khách hàng đã đăng nhập. Hiển thị danh sách món ăn, cho phép thêm vào giỏ hàng, có header và navigation.

---

## Design Tokens (đồng bộ toàn app)

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

**Fonts**: `Playfair Display` (headings), `DM Sans` (body/UI)

---

## Layout Tổng Thể

```
[Header sticky]
[Hero Banner nhỏ]
[Product Grid]
[Cart Sidebar / Bottom Sheet]
```

---

## Header (Sticky, height ~64px)

- Background: `#FFFFFF` với box-shadow nhẹ `0 1px 0 var(--color-border)`
- **Logo** bên trái: "QuickFood" — Playfair Display, màu `--color-primary`
- **Center**: Search bar nhỏ — placeholder "Tìm món ăn...", icon search lucide
- **Right side**:
  - Avatar/tên user (lấy từ localStorage `qf_user`)
  - Cart icon với badge số lượng (màu `--color-primary`)
  - Dropdown logout

### Cart Badge
- Badge số lượng: background `--color-primary`, text white, border-radius full
- Khi số lượng thay đổi: scale animation nhỏ (1 → 1.2 → 1)

---

## Hero Banner (height ~160px desktop, 120px mobile)

- Background: gradient từ `--color-accent` (#F5E6D3) sang `--color-bg`
- Heading: "Hôm nay ăn gì?" — Playfair Display, 36px desktop / 24px mobile
- Sub-text: "Đặt ngay, giao trong 30 phút" — DM Sans, màu `--color-muted`
- Không có hình ảnh lớn — giữ clean, editorial

---

## Product Grid

### Section Header
- Text "Thực Đơn Hôm Nay" — Playfair Display medium
- Số lượng món: "(12 món)" — DM Sans, màu muted
- Sorting/filter nhỏ: không cần phức tạp

### Grid Layout
- Desktop: 3 cột, 24px gap
- Tablet: 2 cột
- Mobile: 1 cột (card full width horizontal)

### Product Card
```
[Image 16:9 ratio]
[Padding 16px]
  [Name — DM Sans 500 16px]
  [Price — Playfair Display, màu primary, 18px]
  [Stock badge: "Còn X phần" — pill nhỏ]
  [Nút "+ Thêm vào giỏ"]
```

**Card Styles**:
- Background: `--color-surface` (#FFFFFF)
- Border: `1px solid var(--color-border)`
- Border-radius: 12px
- Box-shadow: `0 2px 8px rgba(28, 25, 23, 0.06)`
- Hover: shadow tăng, translateY(-2px) — transition 200ms

**Product Image**:
- Dùng `next/image`
- Fallback nếu không có ảnh: background `--color-accent` với emoji 🍜 centered

**Nút "+ Thêm"**:
- Background `--color-primary`, text white, border-radius 8px
- Full width trong card
- Khi đã thêm vào giỏ: hiện counter inline (- 1 +) thay thế nút
- Counter: border `--color-primary`, text `--color-primary`

**Out of stock** (stock === 0):
- Card opacity 0.6
- Nút disabled, text "Hết hàng"

---

## Cart Sidebar (Desktop)

Desktop: fixed panel bên phải, width 360px, slide in từ phải khi có item

- Header: "Giỏ hàng của bạn" + badge số lượng
- Danh sách items: tên, số lượng (- +), giá
- Subtotal section
- Input "Địa chỉ giao hàng" — required
- Button "Đặt hàng" — full width, primary color

**Empty state**: illustration SVG nhỏ + text "Giỏ hàng trống"

## Cart Bottom Sheet (Mobile)

- Sticky bar ở bottom: "🛒 X món · XXX.XXX đ → Xem giỏ hàng"
- Tap để mở bottom sheet (modal full screen từ dưới lên)

---

## State Management

Dùng React Context hoặc Zustand (nếu đã cài) cho cart state:

```typescript
interface CartItem {
  productId: number
  name: string
  price: number
  quantity: number
  imageUrl?: string
}

interface CartState {
  items: CartItem[]
  deliveryAddress: string
  addItem: (product: Product) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, qty: number) => void
  clearCart: () => void
}
```

---

## API

```typescript
// Lấy danh sách sản phẩm (public, không cần token)
GET /api/core/products
Headers: Authorization: Bearer {token}  // optional, nếu có
Response: Array<{
  id: number,
  name: string,
  price: number,
  stock: number,
  imageUrl: string | null,
  isAvailable: boolean  // hoặc "available"
}>
```

Filter client-side: chỉ hiện sản phẩm có `isAvailable === true` hoặc `available === true`

---

## Đặt Hàng

Khi bấm "Đặt hàng":

```typescript
POST /api/core/orders
Headers: Authorization: Bearer {token}
Body: {
  deliveryAddress: string,
  items: Array<{ productId: number, quantity: number }>
}
```

Sau khi thành công:
- Clear cart
- Hiện toast/notification: "✅ Đặt hàng thành công! Đơn #ID đang được chuẩn bị"
- Redirect sau 2 giây → `/orders`

---

## Loading States

- Product grid: skeleton cards (3 cards placeholder với animate-pulse)
- Skeleton: background `--color-border`, border-radius match card

---

## Auth Guard

File này cần check auth:
```typescript
// Ở đầu component hoặc middleware
const user = JSON.parse(localStorage.getItem('qf_user') || 'null')
if (!user) redirect('/login')
if (user.role !== 'CUSTOMER') redirect('/[role-dashboard]')
```

---

## Toast Notification

Tự build toast đơn giản (không dùng library):
- Position: top-right
- Types: success (xanh lá), error (đỏ), info (cam)
- Auto dismiss sau 3 giây
- Animation: slide in từ phải + fade out

---

## File Structure

```
app/
  (customer)/
    page.tsx              ← trang chủ
    orders/
      page.tsx
components/
  customer/
    ProductCard.tsx
    ProductGrid.tsx
    CartSidebar.tsx
    CartBottomSheet.tsx
    Header.tsx
  shared/
    Toast.tsx
lib/
  cart-context.tsx
  api.ts
```

---

## Lưu ý

- Format giá tiền VNĐ: `price.toLocaleString('vi-VN') + ' đ'`
- Tất cả text button và label dùng tiếng Việt
- Không hardcode data, tất cả lấy từ API
