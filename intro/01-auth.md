# Prompt: Trang Login / Register — QuickFood

## Mục tiêu
Xây dựng trang xác thực (Login + Register) cho ứng dụng QuickFood — một nền tảng đặt đồ ăn nhanh.

---

## Design Direction

**Aesthetic**: Warm editorial — cảm giác như một tờ menu nhà hàng độc lập được thiết kế bởi một studio cao cấp. Không phải startup tech thông thường.

**Màu sắc (Design Tokens — dùng CSS variables / Tailwind config)**:
```
--color-bg: #FAF7F2          (kem trắng ấm, nền chính)
--color-surface: #FFFFFF
--color-primary: #E8521A     (cam đất — màu chủ đạo, CTA)
--color-primary-hover: #C94412
--color-secondary: #1C1917   (nâu đen, text chính)
--color-muted: #78716C       (text phụ, placeholder)
--color-border: #E7E0D8
--color-accent: #F5E6D3      (cam nhạt, highlight nhẹ)
```

**Typography**:
- Display/heading: `Playfair Display` (Google Fonts) — sang trọng, có cá tính
- Body/input/button: `DM Sans` (Google Fonts) — hiện đại, dễ đọc
- Cặp font này tạo contrast giữa editorial và functional

**Feeling**: Người dùng cảm thấy như đang vào một quán ăn chất lượng, không phải một app giao đồ ăn generic.

---

## Kỹ thuật

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS v3
- **Component**: Single file `app/(auth)/page.tsx` hoặc `components/AuthPage.tsx`
- Import Google Fonts qua `next/font/google`
- Không dùng UI library (shadcn, chakra...) — tự viết tất cả
- Responsive: mobile-first

---

## Layout & Nội dung

### Cấu trúc trang (desktop: 2 cột, mobile: 1 cột full)

**Cột trái (40% width desktop)**:
- Background màu `--color-primary` (#E8521A)
- Logo "QuickFood" dùng Playfair Display, màu white, cỡ lớn
- Tagline ngắn: *"Đặt nhanh. Giao nhanh. Ăn ngon."*
- Một illustration đơn giản: SVG inline — gợi ý vẽ một chiếc bowl ramen hoặc burger theo style line art, màu white/kem, không cần phức tạp
- Ở dưới cùng: text nhỏ *"Trusted by 10,000+ customers in Vietnam"*

**Cột phải (60% width desktop)**:
- Background `--color-bg` (#FAF7F2)
- Form container căn giữa theo chiều dọc
- Padding rộng rãi

### Tab Switch (Login / Register)
- Hai tab nằm ngang, không dùng border-radius bo tròn hoàn toàn — dùng style underline active
- Active tab: text màu `--color-primary`, underline 2px solid
- Transition mượt khi chuyển tab (opacity + translateY nhẹ)

### Form Login
Fields:
1. Email — label float hoặc label trên, placeholder "your@email.com"
2. Password — có toggle show/hide icon (Eye/EyeOff từ lucide-react)

Button "Đăng nhập":
- Full width
- Background `--color-primary`, text white, font DM Sans 500
- Hover: `--color-primary-hover`
- Có loading spinner state khi submit (dùng useState)

Link "Quên mật khẩu?" — text nhỏ, align right, màu muted

### Form Register
Fields:
1. Họ và tên
2. Email
3. Mật khẩu
4. Vai trò (Role) — custom select styled đẹp:
   - CUSTOMER: icon 🛍 "Khách hàng"
   - STAFF: icon 👨‍🍳 "Nhân viên"
   - SHIPPER: icon 🛵 "Shipper"
5. Số điện thoại (optional, hiện khi chọn SHIPPER)
6. Ngày sinh (date picker native, hiện khi chọn SHIPPER)

Button "Đăng ký": cùng style button Login

### Sau form
- Text nhỏ ở dưới: *"Bằng cách đăng ký, bạn đồng ý với Điều khoản sử dụng"*

---

## State Management & API

```typescript
// Base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// Login
POST /api/core/auth/login
Body: { email: string, password: string }
Response: { token: string, type: string, id: number, email: string, role: string }

// Register  
POST /api/core/auth/register
Body: { name: string, email: string, password: string, role: 'CUSTOMER'|'STAFF'|'SHIPPER', phone?: string, dateOfBirth?: string }
Response: { id: number, name: string, email: string, role: string }
```

Sau login thành công:
- Lưu token vào `localStorage` với key `qf_token`
- Lưu user info vào `localStorage` với key `qf_user` (JSON string)
- Redirect dựa trên role:
  - `CUSTOMER` → `/` (trang home)
  - `STAFF` → `/staff/dashboard`
  - `SHIPPER` → `/shipper/dashboard`

---

## Error Handling

- Hiển thị error message dưới form, không dùng alert()
- Style error: text màu đỏ nhẹ (#DC2626), có icon ⚠️
- Trường hợp:
  - Email đã tồn tại → "Email này đã được sử dụng"
  - Sai email/password → "Email hoặc mật khẩu không đúng"
  - Tuổi không hợp lệ → hiển thị message từ server

---

## Animation & Polish

- Form fields: focus ring màu `--color-primary` với opacity nhẹ
- Button: scale(0.98) khi press (active state)
- Tab switch: content fade + slide up nhẹ
- Input shake animation khi có lỗi

---

## File Structure gợi ý

```
app/
  (auth)/
    login/
      page.tsx
components/
  auth/
    LoginForm.tsx
    RegisterForm.tsx
    AuthLayout.tsx
lib/
  api.ts        (fetch helpers)
  auth.ts       (token helpers)
```

---

## Lưu ý quan trọng

- Không dùng `<form>` tag submit thông thường — dùng `onSubmit` với `e.preventDefault()`
- Tất cả fetch phải có `Content-Type: application/json` header
- Loading state phải disable button để tránh double submit
- Mobile: cột trái ẩn đi, chỉ hiện logo nhỏ ở top, form chiếm full screen
