#!/bin/bash
set -e

BASE="http://165.227.147.13:8080"
PASS="✅ PASS"
FAIL="❌ FAIL"

check_status() {
  local step="$1"
  local status="$2"
  local expected="$3"
  local body="${4:-}"
  if [[ "$status" == "$expected" ]] || [[ "$status" =~ ^2 && "$expected" == "2xx" ]]; then
    echo "$PASS [$step] Status: $status"
  else
    echo "$FAIL [$step] Expected ~$expected, got $status"
    echo "  Body: $body"
  fi
}

do_curl() {
  local method="$1"; local url="$2"; shift 2
  curl -s -w "\n__HTTP_STATUS__%{http_code}" -X "$method" "$url" "$@"
}

parse_body()   { echo "$1" | sed 's|__HTTP_STATUS__[0-9]*||g'; }
parse_status() { echo "$1" | grep -o '__HTTP_STATUS__[0-9]*' | grep -o '[0-9]*'; }

# Unique suffix để tránh conflict khi chạy nhiều lần
SUFFIX=$(date +%s)

echo ""
echo "========================================"
echo " QuickFood E2E Test — $(date)"
echo " Target: $BASE"
echo "========================================"

# ── STEP 0: CORS preflight check ──────────────────────────────────────────────
echo ""
echo "── STEP 0: CORS Preflight OPTIONS check"
R=$(curl -s -o /dev/null -w "%{http_code}" \
  -X OPTIONS "$BASE/api/core/products" \
  -H "Origin: http://165.227.147.13:3000" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization")
if [[ "$R" == "200" || "$R" == "204" ]]; then
  echo "$PASS [0-CORS Preflight] Status: $R"
else
  echo "$FAIL [0-CORS Preflight] Got $R — CORS chưa được fix trên server!"
  echo "  → Cần fix CorsConfig + SecurityConfig trên server rồi redeploy."
fi

# ── STEP 0b: Public products (không cần auth) ─────────────────────────────────
echo ""
echo "── STEP 0b: PUBLIC — GET /api/core/products (không cần login)"
R=$(do_curl GET "$BASE/api/core/products")
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
echo "  Status: $STATUS"
check_status "0b-Public Products" "$STATUS" "2xx"

# ── STEP 1: Register CUSTOMER ──────────────────────────────────────────────────
echo ""
echo "── STEP 1: Register CUSTOMER"
R=$(do_curl POST "$BASE/api/core/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Customer$SUFFIX\",\"email\":\"customer$SUFFIX@test.com\",\"password\":\"pass123\",\"role\":\"CUSTOMER\"}")
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
echo "  Status: $STATUS | Body: $BODY"
check_status "1-Register CUSTOMER" "$STATUS" "2xx"

# ── STEP 2: Register STAFF ────────────────────────────────────────────────────
echo ""
echo "── STEP 2: Register STAFF"
R=$(do_curl POST "$BASE/api/core/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Staff$SUFFIX\",\"email\":\"staff$SUFFIX@test.com\",\"password\":\"pass123\",\"role\":\"STAFF\"}")
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
echo "  Status: $STATUS"
check_status "2-Register STAFF" "$STATUS" "2xx"

# ── STEP 3: Register SHIPPER 1 & 2 ───────────────────────────────────────────
echo ""
echo "── STEP 3: Register SHIPPER 1"
R=$(do_curl POST "$BASE/api/core/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Shipper1_$SUFFIX\",\"email\":\"shipper1_$SUFFIX@test.com\",\"password\":\"pass123\",\"role\":\"SHIPPER\",\"phone\":\"0901234567\"}")
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
echo "  Status: $STATUS"
check_status "3-Register SHIPPER 1" "$STATUS" "2xx"

echo ""
echo "── STEP 3b: Register SHIPPER 2"
R=$(do_curl POST "$BASE/api/core/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Shipper2_$SUFFIX\",\"email\":\"shipper2_$SUFFIX@test.com\",\"password\":\"pass123\",\"role\":\"SHIPPER\",\"phone\":\"0907654321\"}")
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
echo "  Status: $STATUS"
check_status "3b-Register SHIPPER 2" "$STATUS" "2xx"

# ── AGE VALIDATION TESTS ──────────────────────────────────────────────────────
echo ""
echo "── AGE_01: Shipper đúng 18 tuổi (boundary)"
DOB_EXACT=$(date -d "18 years ago" +%Y-%m-%d 2>/dev/null || date -v-18y +%Y-%m-%d 2>/dev/null || echo "2006-04-16")
R=$(do_curl POST "$BASE/api/core/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Shipper18_$SUFFIX\",\"email\":\"shipper18_$SUFFIX@test.com\",\"password\":\"pass123\",\"role\":\"SHIPPER\",\"dateOfBirth\":\"$DOB_EXACT\"}")
STATUS=$(parse_status "$R")
check_status "AGE_01 - Boundary 18 tuổi" "$STATUS" "2xx"

echo ""
echo "── AGE_02: Shipper chưa đủ 18 (thiếu 1 ngày)"
R=$(do_curl POST "$BASE/api/core/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Under18_$SUFFIX\",\"email\":\"under18_$SUFFIX@test.com\",\"password\":\"pass123\",\"role\":\"SHIPPER\",\"dateOfBirth\":\"2008-04-17\"}")
STATUS=$(parse_status "$R")
check_status "AGE_02 - Chưa đủ 18" "$STATUS" "400"

echo ""
echo "── AGE_03: Ngày sinh trong tương lai"
R=$(do_curl POST "$BASE/api/core/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Future_$SUFFIX\",\"email\":\"future_$SUFFIX@test.com\",\"password\":\"pass123\",\"role\":\"CUSTOMER\",\"dateOfBirth\":\"2030-01-01\"}")
STATUS=$(parse_status "$R")
check_status "AGE_03 - Ngày sinh tương lai" "$STATUS" "400"

echo ""
echo "── AGE_04: User dưới 13 tuổi"
R=$(do_curl POST "$BASE/api/core/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Kid_$SUFFIX\",\"email\":\"kid_$SUFFIX@test.com\",\"password\":\"pass123\",\"role\":\"CUSTOMER\",\"dateOfBirth\":\"2020-01-01\"}")
STATUS=$(parse_status "$R")
check_status "AGE_04 - Dưới 13 tuổi" "$STATUS" "400"

echo ""
echo "── AGE_05: Customer 15 tuổi (hợp lệ)"
R=$(do_curl POST "$BASE/api/core/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Teen_$SUFFIX\",\"email\":\"teen_$SUFFIX@test.com\",\"password\":\"pass123\",\"role\":\"CUSTOMER\",\"dateOfBirth\":\"2009-01-01\"}")
STATUS=$(parse_status "$R")
check_status "AGE_05 - Customer 15 tuổi OK" "$STATUS" "2xx"

# ── STEP 4: Login all ─────────────────────────────────────────────────────────
echo ""
echo "── STEP 4a: Login CUSTOMER"
R=$(do_curl POST "$BASE/api/core/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"customer$SUFFIX@test.com\",\"password\":\"pass123\"}")
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
CUSTOMER_TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
check_status "4a-Login CUSTOMER" "$STATUS" "2xx"
echo "  Token: ${CUSTOMER_TOKEN:0:40}..."

echo ""
echo "── STEP 4b: Login STAFF"
R=$(do_curl POST "$BASE/api/core/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"staff$SUFFIX@test.com\",\"password\":\"pass123\"}")
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
STAFF_TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
check_status "4b-Login STAFF" "$STATUS" "2xx"
echo "  Token: ${STAFF_TOKEN:0:40}..."

echo ""
echo "── STEP 4c: Login SHIPPER 1"
R=$(do_curl POST "$BASE/api/core/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"shipper1_$SUFFIX@test.com\",\"password\":\"pass123\"}")
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
SHIPPER1_TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
check_status "4c-Login SHIPPER 1" "$STATUS" "2xx"

echo ""
echo "── STEP 4d: Login SHIPPER 2"
R=$(do_curl POST "$BASE/api/core/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"shipper2_$SUFFIX@test.com\",\"password\":\"pass123\"}")
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
SHIPPER2_TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
check_status "4d-Login SHIPPER 2" "$STATUS" "2xx"

# ── STEP 5: STAFF — Create product ────────────────────────────────────────────
echo ""
echo "── STEP 5: STAFF — Create product"
R=$(do_curl POST "$BASE/api/core/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STAFF_TOKEN" \
  -d "{\"name\":\"Burger_$SUFFIX\",\"price\":9.99,\"stock\":100}")
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
PRODUCT_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
check_status "5-Create Product" "$STATUS" "2xx"
echo "  Product ID: $PRODUCT_ID"

# ── STEP 6: PUBLIC — Get all products ─────────────────────────────────────────
echo ""
echo "── STEP 6: PUBLIC — Get all products (no auth)"
R=$(do_curl GET "$BASE/api/core/products")
STATUS=$(parse_status "$R")
check_status "6-Get Products (public)" "$STATUS" "2xx"

# ── STEP 6b: CUSTOMER thử create product → phải bị 403 ──────────────────────
echo ""
echo "── STEP 6b: CUSTOMER tạo product → phải 403"
R=$(do_curl POST "$BASE/api/core/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d "{\"name\":\"Hack_$SUFFIX\",\"price\":1,\"stock\":1}")
STATUS=$(parse_status "$R")
check_status "6b-CUSTOMER cannot create product" "$STATUS" "403"

# ── STEP 7: CUSTOMER — Place order ───────────────────────────────────────────
echo ""
echo "── STEP 7: CUSTOMER — Place order"
R=$(do_curl POST "$BASE/api/core/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d "{\"items\":[{\"productId\":$PRODUCT_ID,\"quantity\":2}],\"deliveryAddress\":\"123 Main St, Ho Chi Minh City\"}")
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
ORDER_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
check_status "7-Place Order" "$STATUS" "2xx"
echo "  Order ID: $ORDER_ID"

# ── STEP 7b: Order với product không tồn tại → 404 ──────────────────────────
echo ""
echo "── STEP 7b: Order với productId không tồn tại → 404"
R=$(do_curl POST "$BASE/api/core/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d '{"items":[{"productId":99999,"quantity":1}],"deliveryAddress":"Test"}')
STATUS=$(parse_status "$R")
check_status "7b-Invalid product order" "$STATUS" "404"

# ── STEP 7c: SHIPPER tạo order → 403 ─────────────────────────────────────────
echo ""
echo "── STEP 7c: SHIPPER tạo order → phải 403"
R=$(do_curl POST "$BASE/api/core/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHIPPER1_TOKEN" \
  -d "{\"items\":[{\"productId\":$PRODUCT_ID,\"quantity\":1}],\"deliveryAddress\":\"Test\"}")
STATUS=$(parse_status "$R")
check_status "7c-SHIPPER cannot place order" "$STATUS" "403"

# ── STEP 8: CUSTOMER — Get order history ──────────────────────────────────────
echo ""
echo "── STEP 8: CUSTOMER — Get order history"
R=$(do_curl GET "$BASE/api/core/orders" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN")
STATUS=$(parse_status "$R")
check_status "8-Order History" "$STATUS" "2xx"

# ── STEP 9: STAFF — Get pending orders ────────────────────────────────────────
echo ""
echo "── STEP 9: STAFF — Get pending orders"
R=$(do_curl GET "$BASE/api/core/orders/pending" \
  -H "Authorization: Bearer $STAFF_TOKEN")
STATUS=$(parse_status "$R")
check_status "9-Pending Orders" "$STATUS" "2xx"

# ── STEP 9b: CUSTOMER xem pending orders → 403 ───────────────────────────────
echo ""
echo "── STEP 9b: CUSTOMER xem pending orders → phải 403"
R=$(do_curl GET "$BASE/api/core/orders/pending" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN")
STATUS=$(parse_status "$R")
check_status "9b-CUSTOMER cannot see pending" "$STATUS" "403"

# ── STEP 10: STAFF — Mark order READY ────────────────────────────────────────
echo ""
echo "── STEP 10: STAFF — Mark order READY (triggers shipment)"
R=$(do_curl PUT "$BASE/api/core/orders/$ORDER_ID/ready" \
  -H "Authorization: Bearer $STAFF_TOKEN")
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
check_status "10-Order Ready" "$STATUS" "2xx"

echo "  Waiting 2s for shipment creation..."
sleep 2

# ── STEP 11: SHIPPER — Get available shipments ───────────────────────────────
echo ""
echo "── STEP 11: SHIPPER — Get available shipments"
R=$(do_curl GET "$BASE/api/delivery/shipments/available" \
  -H "Authorization: Bearer $SHIPPER1_TOKEN")
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
SHIPMENT_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
check_status "11-Available Shipments" "$STATUS" "2xx"
echo "  Shipment ID: $SHIPMENT_ID"

# ── STEP 11b: CUSTOMER xem available shipments → 403 ─────────────────────────
echo ""
echo "── STEP 11b: CUSTOMER xem available shipments → phải 403"
R=$(do_curl GET "$BASE/api/delivery/shipments/available" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN")
STATUS=$(parse_status "$R")
check_status "11b-CUSTOMER cannot see shipments" "$STATUS" "403"

# ── STEP 12: SHIPPER — Accept shipment ───────────────────────────────────────
echo ""
echo "── STEP 12: SHIPPER 1 — Accept shipment"
R=$(do_curl PUT "$BASE/api/delivery/shipments/$SHIPMENT_ID/accept" \
  -H "Authorization: Bearer $SHIPPER1_TOKEN")
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
check_status "12-Accept Shipment" "$STATUS" "2xx"

# ── STEP 12b: SHIPPER 1 đang busy → không accept shipment khác được ─────────
echo ""
echo "── STEP 12b: SHIPPER 1 bận → không nhận thêm shipment"
# Tạo order 2 + mark ready để có shipment 2
R=$(do_curl POST "$BASE/api/core/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d "{\"items\":[{\"productId\":$PRODUCT_ID,\"quantity\":1}],\"deliveryAddress\":\"456 Second St\"}")
BODY=$(parse_body "$R")
ORDER2_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')

R=$(do_curl PUT "$BASE/api/core/orders/$ORDER2_ID/ready" \
  -H "Authorization: Bearer $STAFF_TOKEN")
sleep 2

R=$(do_curl GET "$BASE/api/delivery/shipments/available" \
  -H "Authorization: Bearer $SHIPPER1_TOKEN")
SHIPMENT2_ID=$(echo "$(parse_body "$R")" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')

if [ -n "$SHIPMENT2_ID" ]; then
  R=$(do_curl PUT "$BASE/api/delivery/shipments/$SHIPMENT2_ID/accept" \
    -H "Authorization: Bearer $SHIPPER1_TOKEN")
  STATUS=$(parse_status "$R")
  check_status "12b-Busy shipper rejected" "$STATUS" "409"
else
  echo "⚠️  [12b] Không tìm được shipment 2 để test — bỏ qua"
fi

# ── STEP 12c: Concurrent accept test ─────────────────────────────────────────
echo ""
echo "── STEP 12c: Concurrent accept — chỉ 1 shipper thắng"
if [ -n "$SHIPMENT2_ID" ]; then
  curl -s -o /tmp/resp1.txt -w "%{http_code}" -X PUT \
    "$BASE/api/delivery/shipments/$SHIPMENT2_ID/accept" \
    -H "Authorization: Bearer $SHIPPER1_TOKEN" > /tmp/status1.txt &
  curl -s -o /tmp/resp2.txt -w "%{http_code}" -X PUT \
    "$BASE/api/delivery/shipments/$SHIPMENT2_ID/accept" \
    -H "Authorization: Bearer $SHIPPER2_TOKEN" > /tmp/status2.txt &
  wait
  S1=$(cat /tmp/status1.txt)
  S2=$(cat /tmp/status2.txt)
  echo "  Shipper 1 Status: $S1"
  echo "  Shipper 2 Status: $S2"
  if [[ ("$S1" =~ ^2 && ! "$S2" =~ ^2) || (! "$S1" =~ ^2 && "$S2" =~ ^2) ]]; then
    echo "$PASS [12c-Concurrent Accept] Đúng: 1 thắng, 1 thua"
  else
    echo "$FAIL [12c-Concurrent Accept] Kết quả không như mong đợi: S1=$S1, S2=$S2"
  fi
else
  echo "⚠️  [12c] Bỏ qua — không có shipment 2"
fi

# ── STEP 13: SHIPPER — Update location ───────────────────────────────────────
echo ""
echo "── STEP 13: SHIPPER — Update location (valid)"
R=$(do_curl PUT "$BASE/api/delivery/shippers/me/location" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHIPPER1_TOKEN" \
  -d '{"lat":10.762622,"lng":106.660172}')
STATUS=$(parse_status "$R")
check_status "13-Update Location" "$STATUS" "2xx"

echo ""
echo "── LOC_01: lat=9999 (invalid)"
R=$(do_curl PUT "$BASE/api/delivery/shippers/me/location" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHIPPER1_TOKEN" \
  -d '{"lat":9999,"lng":106.66}')
STATUS=$(parse_status "$R")
check_status "LOC_01 - lat=9999 invalid" "$STATUS" "400"

echo ""
echo "── LOC_02: lat=-91 (invalid)"
R=$(do_curl PUT "$BASE/api/delivery/shippers/me/location" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHIPPER1_TOKEN" \
  -d '{"lat":-91,"lng":106.66}')
STATUS=$(parse_status "$R")
check_status "LOC_02 - lat=-91 invalid" "$STATUS" "400"

echo ""
echo "── LOC_03: lng=181 (invalid)"
R=$(do_curl PUT "$BASE/api/delivery/shippers/me/location" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHIPPER1_TOKEN" \
  -d '{"lat":10.76,"lng":181}')
STATUS=$(parse_status "$R")
check_status "LOC_03 - lng=181 invalid" "$STATUS" "400"

# ── STEP 14: CUSTOMER — Track order ──────────────────────────────────────────
echo ""
echo "── STEP 14: CUSTOMER — Track order"
R=$(do_curl GET "$BASE/api/core/orders/$ORDER_ID/tracking" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN")
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
echo "  Body: $BODY"
check_status "14-Track Order" "$STATUS" "2xx"

# ── STEP 15: SHIPPER — Complete shipment ──────────────────────────────────────
echo ""
echo "── STEP 15: SHIPPER — Complete shipment 1"
R=$(do_curl PUT "$BASE/api/delivery/shipments/$SHIPMENT_ID/complete" \
  -H "Authorization: Bearer $SHIPPER1_TOKEN")
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
check_status "15-Complete Shipment" "$STATUS" "2xx"

echo "  Waiting 1s for order status propagation..."
sleep 1

# ── STEP 16: Verify DELIVERED status ─────────────────────────────────────────
echo ""
echo "── STEP 16: CUSTOMER — Verify order DELIVERED"
R=$(do_curl GET "$BASE/api/core/orders/$ORDER_ID" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN")
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
ORDER_STATUS=$(echo "$BODY" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
check_status "16-Order Delivered" "$STATUS" "2xx"
if [[ "$ORDER_STATUS" == "DELIVERED" ]]; then
  echo "  $PASS Order status is DELIVERED ✓"
else
  echo "  $FAIL Order status là '$ORDER_STATUS', expected DELIVERED"
fi

echo ""
echo "========================================"
echo " E2E Test Complete — $(date)"
echo "========================================"