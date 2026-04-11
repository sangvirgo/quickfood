# Prompt: Staff Dashboard — QuickFood

## Mục tiêu
Dashboard dành cho nhân viên (STAFF). Xem và quản lý đơn hàng đang chờ, duyệt đơn chuyển sang READY để kích hoạt giao hàng.

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

```
[Sidebar Navigation]  [Main Content Area]
```

- Sidebar: fixed bên trái, width 240px
- Main: phần còn lại
- Mobile: sidebar ẩn, hamburger menu

---

## Sidebar

Background: `--color-secondary` (#1C1917) — tối, tương phản

Logo: "QuickFood" — Playfair Display, màu `--color-primary` (#E8521A)

Menu items (DM Sans, text white):
```
📋  Đơn hàng chờ          ← active state
📦  Quản lý sản phẩm      ← link sang /staff/products
```

Active state: background `--color-primary` với opacity 20%, left border 3px solid `--color-primary`

Bottom của sidebar:
```
[Avatar initials]  [Tên Staff]
                   [Nút đăng xuất nhỏ]
```

---

## Header (Main Area)

- Title: "Dashboard" — Playfair Display 28px
- Ngày giờ hiện tại: "Thứ X, DD/MM/YYYY" — DM Sans, màu muted
- Nút refresh: icon ↻, khi click fetch lại pending orders

---

## Stats Cards (hàng trên cùng)

4 cards ngang, mỗi card có:

```
[Icon]
[Số lớn]
[Label]
```

1. **Đang chờ xử lý** — số đơn PENDING (màu amber)
2. **Đã sẵn sàng** — đơn READY hôm nay (màu blue)
3. **Đã giao** — đơn DELIVERED hôm nay (màu green)
4. **Tổng sản phẩm** — từ products API (màu primary)

Card style:
- Background: `--color-surface`
- Border: `1px solid var(--color-border)`
- Border-radius: 12px
- Icon: 40x40px circle, màu tương ứng với opacity 15% background

*Lưu ý: Chỉ có API pending orders thực, các số khác có thể mock hoặc tính từ data có sẵn*

---

## Pending Orders Section

Title: "Đơn hàng cần xử lý" + badge số lượng (đỏ)

### Order Cards (dạng list, không phải grid)

Mỗi order card:
```
┌─────────────────────────────────────────────────┐
│ Đơn #ID                    ⏰ Thứ X, HH:MM      │
│                                                   │
│  🛍 Burger x2               19.98đ               │
│     Coca Cola x1             5.00đ               │
│                                                   │
│  📍 123 Đường ABC, Quận 1                        │
│  👤 Customer #3                                   │
│                             [Duyệt - Sẵn sàng →] │
└─────────────────────────────────────────────────┘
```

**Card styles**:
- Background white, border, border-radius 12px
- Left accent bar: 4px `--color-primary` (mới vào, highlight)
- Shadow nhẹ

**Nút "Duyệt - Sẵn sàng"**:
- Background `--color-primary`, text white
- Icon: checkmark từ lucide
- Loading state khi đang call API
- Sau khi thành công: card slide-out animation, toast "✅ Đơn #ID đã sẵn sàng giao"
- Optimistic UI: xóa card ngay, revert nếu lỗi

### Empty State

Khi không có pending orders:
- Illustration: một chiếc bàn trống hoặc checkmark lớn
- Text: "Tất cả đơn đã được xử lý! 🎉"
- Background card xanh lá nhạt

---

## Real-time Feel

- Auto-refresh mỗi 30 giây (với countdown nhỏ)
- Hiện "Cập nhật lúc HH:MM:SS"
- Nếu có đơn mới so với lần trước: hiện notification banner "🔔 Có X đơn hàng mới"

---

## API

```typescript
// Lấy đơn hàng PENDING
GET /api/core/orders/pending
Headers: Authorization: Bearer {token}

// Duyệt đơn → READY (trigger tạo shipment)
PUT /api/core/orders/{id}/ready
Headers: Authorization: Bearer {token}
```

---

## Auth Guard

```typescript
const user = JSON.parse(localStorage.getItem('qf_user') || 'null')
if (!user) redirect('/login')
if (user.role !== 'STAFF') redirect('/')
```

---

## File Structure

```
app/
  (staff)/
    staff/
      dashboard/
        page.tsx
      products/
        page.tsx        ← separate prompt file
      layout.tsx        ← sidebar layout
components/
  staff/
    StaffSidebar.tsx
    PendingOrderCard.tsx
    StatsCard.tsx
```

---

## Lưu ý

- Sidebar layout dùng chung cho cả dashboard và products page
- Format tiền VNĐ
- Date/time tiếng Việt
- Confirm dialog trước khi duyệt (optional, nhưng tốt hơn): "Xác nhận duyệt đơn #ID?"
