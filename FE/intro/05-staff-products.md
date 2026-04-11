# Prompt: Staff — Quản Lý Sản Phẩm

## Mục tiêu
Trang `/staff/products` — CRUD sản phẩm cho nhân viên. Xem danh sách, thêm mới, sửa, xóa (soft delete) sản phẩm.

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

Dùng chung sidebar layout với Staff Dashboard (từ `layout.tsx`).

Main content:
```
[Page Header + Nút "Thêm sản phẩm"]
[Search + Filter bar]
[Products Table]
[Modal: Add/Edit]
```

---

## Page Header

- Title: "Quản lý sản phẩm" — Playfair Display 28px
- Nút "＋ Thêm sản phẩm" — góc phải, background `--color-primary`, text white, icon Plus từ lucide

---

## Search & Filter Bar

- Input search: "Tìm theo tên sản phẩm..."
- Filter: tất cả / còn hàng / hết hàng (3 pill buttons)
- Client-side filtering — không call API khi search

---

## Products Table

Desktop: dạng table
Mobile: dạng card list

### Table Columns

| # | Hình ảnh | Tên sản phẩm | Giá | Tồn kho | Trạng thái | Thao tác |
|---|----------|--------------|-----|---------|------------|---------|

**Hình ảnh**: 48x48px, object-cover, border-radius 8px. Nếu không có: placeholder với emoji 🍜

**Giá**: format VNĐ, màu `--color-primary`

**Tồn kho**: 
- > 10: text xanh + icon ✓
- 1–10: text amber "Sắp hết" + icon ⚠️
- 0: text đỏ "Hết hàng" + badge đỏ

**Trạng thái**: pill badge
- Đang bán: xanh lá
- Đã ẩn (soft deleted): xám

**Thao tác**: 2 icon buttons
- ✏️ Edit — mở modal edit
- 🗑️ Delete — confirm dialog → soft delete

### Table Styles
- Header row: background `--color-accent`, text `--color-secondary`
- Row hover: background `#FAF7F2`
- Row border-bottom: `1px solid var(--color-border)`
- Alternating rows: không cần

---

## Add/Edit Modal

Modal overlay (backdrop blur + dark overlay):

```
┌─────────────────────────────────┐
│ Thêm sản phẩm mới           ✕  │
├─────────────────────────────────┤
│                                 │
│  [Image Preview Area]           │
│  URL hình ảnh: [input]          │
│                                 │
│  Tên sản phẩm *                 │
│  [text input]                   │
│                                 │
│  Giá (đ) *                      │
│  [number input]                 │
│                                 │
│  Số lượng tồn kho *             │
│  [number input, min=0]          │
│                                 │
│  [Hủy]        [Lưu sản phẩm]   │
└─────────────────────────────────┘
```

**Image Preview**:
- Khi nhập URL hình ảnh: hiện preview thumbnail 120x120px (dùng `<img>` thường, không phải next/image vì URL dynamic)
- Nếu URL lỗi: fallback placeholder

**Validation (client-side)**:
- Tên: không được trống
- Giá: phải > 0
- Tồn kho: phải >= 0

**Form submit**:
- Loading state trên nút Lưu
- Success: đóng modal, refresh list, toast "✅ Sản phẩm đã được lưu"
- Error: hiện message lỗi trong modal

**Modal animation**: fade in + scale từ 0.95 → 1 (200ms ease-out)

---

## Delete Confirmation

Không dùng `window.confirm()`. Thay bằng:
- Inline confirm state trên row: khi click delete, row highlight đỏ nhạt, hiện 2 nút nhỏ "Xác nhận" và "Hủy"
- Sau xác nhận: row fade out animation rồi xóa khỏi list

---

## API

```typescript
// Lấy tất cả sản phẩm (bao gồm cả unavailable cho staff)
GET /api/core/products
Headers: Authorization: Bearer {token}

// Tạo mới
POST /api/core/products
Headers: Authorization: Bearer {token}, Content-Type: application/json
Body: {
  name: string,
  price: number,
  stock: number,
  imageUrl: string | null
}

// Cập nhật
PUT /api/core/products/{id}
Headers: Authorization: Bearer {token}, Content-Type: application/json
Body: {
  name: string,
  price: number,
  stock: number,
  imageUrl: string | null
}

// Xóa (soft delete)
DELETE /api/core/products/{id}
Headers: Authorization: Bearer {token}
Response: 204 No Content
```

**Lưu ý quan trọng về `available`/`isAvailable`**:
API trả về field tên là `available` (không phải `isAvailable` do Jackson serialization của boolean getter). Cần handle cả 2 trường hợp:
```typescript
const isAvailable = product.available ?? product.isAvailable ?? true
```

---

## Optimistic Updates

Khi xóa sản phẩm:
1. Xóa khỏi local state ngay lập tức (optimistic)
2. Call API
3. Nếu API lỗi: restore lại state + hiện error toast

---

## Empty State

Khi không có sản phẩm nào (sau filter):
- Text: "Không tìm thấy sản phẩm nào"
- Nếu filter = "tất cả" và rỗng: text + nút "Thêm sản phẩm đầu tiên"

---

## File Structure

```
app/
  (staff)/
    staff/
      products/
        page.tsx
components/
  staff/
    ProductTable.tsx
    ProductRow.tsx
    ProductModal.tsx
    DeleteConfirm.tsx
```
