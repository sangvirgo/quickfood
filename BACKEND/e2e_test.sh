#!/bin/bash
set -e

BASE="http://localhost:8080"
PASS="✅ PASS"
FAIL="❌ FAIL"

check_status() {
  local step="$1"
  local status="$2"
  local expected="$3"
  local body="$4"
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

echo ""
echo "========================================"
echo " QuickFood E2E Test — $(date)"
echo "========================================"

# ── STEP 1: Register CUSTOMER ──────────────────────────────────────────────────
echo ""
echo "── STEP 1: Register CUSTOMER"
R=$(do_curl POST "$BASE/api/core/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Customer1","email":"customer1@test.com","password":"pass123","role":"CUSTOMER"}')
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
echo "  Status: $STATUS | Body: $BODY"
check_status "1-Register CUSTOMER" "$STATUS" "2xx"

# ── STEP 2: Register STAFF ────────────────────────────────────────────────────
echo ""
echo "── STEP 2: Register STAFF"
R=$(do_curl POST "$BASE/api/core/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Staff1","email":"staff1@test.com","password":"pass123","role":"STAFF"}')
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
echo "  Status: $STATUS | Body: $BODY"
check_status "2-Register STAFF" "$STATUS" "2xx"

# ── STEP 3: Register SHIPPER ──────────────────────────────────────────────────
echo ""
echo "── STEP 3: Register SHIPPER 1"
R=$(do_curl POST "$BASE/api/core/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Shipper1","email":"shipper1@test.com","password":"pass123","role":"SHIPPER"}')
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
echo "  Status: $STATUS | Body: $BODY"
check_status "3-Register SHIPPER 1" "$STATUS" "2xx"

echo ""
echo "── STEP 3b: Register SHIPPER 2"
R=$(do_curl POST "$BASE/api/core/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Shipper2","email":"shipper2@test.com","password":"pass123","role":"SHIPPER"}')
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
echo "  Status: $STATUS | Body: $BODY"
check_status "3b-Register SHIPPER 2" "$STATUS" "2xx"

# ── AGE VALIDATION TESTS ──────────────────────────────────────────────────────
echo ""
echo "── STEP AGE_01: Shipper đúng ngày sinh nhật đủ 18 tuổi (boundary)"
DOB_EXACT=$(date -d "18 years ago" +%Y-%m-%d 2>/dev/null || date -v-18y +%Y-%m-%d)
R=$(do_curl POST "$BASE/api/core/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Shipper18\",\"email\":\"shipper18@test.com\",\"password\":\"pass123\",\"role\":\"SHIPPER\",\"dateOfBirth\":\"$DOB_EXACT\"}")
STATUS=$(parse_status "$R")
check_status "AGE_01 - Boundary 18 tuổi tròn" "$STATUS" "2xx"

echo ""
echo "── STEP AGE_02: Shipper chưa đủ 18 (1 ngày thiếu - boundary)"
DOB_UNDER=$(date -d "18 years ago + 1 day" +%Y-%m-%d 2>/dev/null || date -v-18y -v+1d +%Y-%m-%d)
R=$(do_curl POST "$BASE/api/core/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"ShipperUnder\",\"email\":\"shipperyoung@test.com\",\"password\":\"pass123\",\"role\":\"SHIPPER\",\"dateOfBirth\":\"$DOB_UNDER\"}")
STATUS=$(parse_status "$R")
check_status "AGE_02 - 1 ngày chưa đủ 18" "$STATUS" "400"

echo ""
echo "── STEP AGE_03: Ngày sinh trong tương lai"
R=$(do_curl POST "$BASE/api/core/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Future","email":"future@test.com","password":"pass123","role":"CUSTOMER","dateOfBirth":"2030-01-01"}')
STATUS=$(parse_status "$R")
check_status "AGE_03 - Ngày sinh tương lai" "$STATUS" "400"

echo ""
echo "── STEP AGE_04: User dưới 13 tuổi"
R=$(do_curl POST "$BASE/api/core/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Kid","email":"kid@test.com","password":"pass123","role":"CUSTOMER","dateOfBirth":"2020-01-01"}')
STATUS=$(parse_status "$R")
check_status "AGE_04 - User dưới 13 tuổi" "$STATUS" "400"

echo ""
echo "── STEP AGE_05: Customer 15 tuổi (hợp lệ cho CUSTOMER)"
R=$(do_curl POST "$BASE/api/core/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Teen","email":"teen@test.com","password":"pass123","role":"CUSTOMER","dateOfBirth":"2009-01-01"}')
STATUS=$(parse_status "$R")
check_status "AGE_05 - Customer 15 tuổi OK" "$STATUS" "2xx"

# ── STEP 4: Login all 3 ───────────────────────────────────────────────────────
echo ""
echo "── STEP 4a: Login CUSTOMER"
R=$(do_curl POST "$BASE/api/core/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"customer1@test.com","password":"pass123"}')
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
echo "  Status: $STATUS | Body: $BODY"
CUSTOMER_TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
check_status "4a-Login CUSTOMER" "$STATUS" "2xx"
echo "  Token: ${CUSTOMER_TOKEN:0:40}..."

echo ""
echo "── STEP 4b: Login STAFF"
R=$(do_curl POST "$BASE/api/core/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"staff1@test.com","password":"pass123"}')
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
echo "  Status: $STATUS | Body: $BODY"
STAFF_TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
check_status "4b-Login STAFF" "$STATUS" "2xx"
echo "  Token: ${STAFF_TOKEN:0:40}..."

echo ""
echo "── STEP 4c: Login SHIPPER 1"
R=$(do_curl POST "$BASE/api/core/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"shipper1@test.com","password":"pass123"}')
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
echo "  Status: $STATUS | Body: $BODY"
SHIPPER_TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
SHIPPER1_TOKEN=$SHIPPER_TOKEN
check_status "4c-Login SHIPPER 1" "$STATUS" "2xx"
echo "  Token: ${SHIPPER_TOKEN:0:40}..."

echo ""
echo "── STEP 4d: Login SHIPPER 2"
R=$(do_curl POST "$BASE/api/core/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"shipper2@test.com","password":"pass123"}')
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
echo "  Status: $STATUS | Body: $BODY"
SHIPPER2_TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
check_status "4d-Login SHIPPER 2" "$STATUS" "2xx"
echo "  Token: ${SHIPPER2_TOKEN:0:40}..."

# ── STEP 5: STAFF — Create product ────────────────────────────────────────────
echo ""
echo "── STEP 5: STAFF — Create product"
R=$(do_curl POST "$BASE/api/core/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STAFF_TOKEN" \
  -d '{"name":"Burger","description":"Delicious beef burger","price":9.99,"stock":100,"category":"FOOD"}')
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
echo "  Status: $STATUS | Body: $BODY"
PRODUCT_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
check_status "5-Create Product" "$STATUS" "2xx"
echo "  Product ID: $PRODUCT_ID"

# ── STEP 6: PUBLIC — Get all products ─────────────────────────────────────────
echo ""
echo "── STEP 6: PUBLIC — Get all products"
R=$(do_curl GET "$BASE/api/core/products")
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
echo "  Status: $STATUS | Body: $BODY"
check_status "6-Get Products" "$STATUS" "2xx"

# ── STEP 7: CUSTOMER — Place order ───────────────────────────────────────────
echo ""
echo "── STEP 7: CUSTOMER — Place order"
R=$(do_curl POST "$BASE/api/core/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d "{\"items\":[{\"productId\":$PRODUCT_ID,\"quantity\":2}],\"deliveryAddress\":\"123 Main St, Ho Chi Minh City\"}")
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
echo "  Status: $STATUS | Body: $BODY"
ORDER_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
check_status "7-Place Order" "$STATUS" "2xx"
echo "  Order ID: $ORDER_ID"

# ── STEP 8: CUSTOMER — Get order history ──────────────────────────────────────
echo ""
echo "── STEP 8: CUSTOMER — Get order history"
R=$(do_curl GET "$BASE/api/core/orders" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN")
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
echo "  Status: $STATUS | Body: $BODY"
check_status "8-Order History" "$STATUS" "2xx"

# ── STEP 9: STAFF — Get pending orders ────────────────────────────────────────
echo ""
echo "── STEP 9: STAFF — Get pending orders"
R=$(do_curl GET "$BASE/api/core/orders/pending" \
  -H "Authorization: Bearer $STAFF_TOKEN")
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
echo "  Status: $STATUS | Body: $BODY"
check_status "9-Pending Orders" "$STATUS" "2xx"

# ── STEP 10: STAFF — Mark order READY ────────────────────────────────────────
echo ""
echo "── STEP 10: STAFF — Mark order READY (triggers shipment)"
R=$(do_curl PUT "$BASE/api/core/orders/$ORDER_ID/ready" \
  -H "Authorization: Bearer $STAFF_TOKEN")
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
echo "  Status: $STATUS | Body: $BODY"
check_status "10-Order Ready" "$STATUS" "2xx"

echo ""
echo "  Waiting 2s for shipment to be created..."
sleep 2

# ── STEP 11: SHIPPER — Get available shipments ───────────────────────────────
echo ""
echo "── STEP 11: SHIPPER — Get available shipments"
R=$(do_curl GET "$BASE/api/delivery/shipments/available" \
  -H "Authorization: Bearer $SHIPPER_TOKEN")
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
echo "  Status: $STATUS | Body: $BODY"
SHIPMENT_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
check_status "11-Available Shipments" "$STATUS" "2xx"
echo "  Shipment ID: $SHIPMENT_ID"

# ── STEP 12: SHIPPER — Accept shipment ───────────────────────────────────────
echo ""
echo "── STEP 12: SHIPPER — Accept shipment (pessimistic lock test)"
R=$(do_curl PUT "$BASE/api/delivery/shipments/$SHIPMENT_ID/accept" \
  -H "Authorization: Bearer $SHIPPER_TOKEN")
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
echo "  Status: $STATUS | Body: $BODY"
check_status "12-Accept Shipment" "$STATUS" "2xx"

echo ""
echo "── STEP 12b: Test concurrent accept (chỉ 1 shipper thắng)"
# Tạo shipment thứ 2 trước
R=$(do_curl POST "$BASE/api/core/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d "{\"items\":[{\"productId\":$PRODUCT_ID,\"quantity\":1}],\"deliveryAddress\":\"456 Second St\"}")
ORDER2_ID=$(echo "$(parse_body "$R")" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')

R=$(do_curl PUT "$BASE/api/core/orders/$ORDER2_ID/ready" \
  -H "Authorization: Bearer $STAFF_TOKEN")
sleep 2

# Lấy ID của shipment 2
R=$(do_curl GET "$BASE/api/delivery/shipments/available" \
  -H "Authorization: Bearer $SHIPPER1_TOKEN")
SHIPMENT2_ID=$(echo "$(parse_body "$R")" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')

if [ -z "$SHIPMENT2_ID" ]; then
    SHIPMENT2_ID=2 # Fallback
fi

# Rồi gửi 2 request cùng lúc
curl -s -o /tmp/resp1.txt -w "%{http_code}" -X PUT "$BASE/api/delivery/shipments/$SHIPMENT2_ID/accept" \
  -H "Authorization: Bearer $SHIPPER1_TOKEN" > /tmp/status1.txt &
curl -s -o /tmp/resp2.txt -w "%{http_code}" -X PUT "$BASE/api/delivery/shipments/$SHIPMENT2_ID/accept" \
  -H "Authorization: Bearer $SHIPPER2_TOKEN" > /tmp/status2.txt &
wait

S1=$(cat /tmp/status1.txt)
S2=$(cat /tmp/status2.txt)
echo "  Shipper 1 Status: $S1"
echo "  Shipper 2 Status: $S2"

if [[ ("$S1" =~ ^2 && "$S2" =~ ^[45]) || ("$S2" =~ ^2 && "$S1" =~ ^[45]) ]]; then
  echo "$PASS [12b-Concurrent Accept] Test passed (One 2xx and one 4xx/5xx)"
else
  echo "$FAIL [12b-Concurrent Accept] Expected one 2xx and one 4xx/5xx, got S1=$S1, S2=$S2"
  exit 1
fi

# ── STEP 13: SHIPPER — Update location ───────────────────────────────────────
echo ""
echo "── STEP 13: SHIPPER — Update location"
R=$(do_curl PUT "$BASE/api/delivery/shippers/me/location" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHIPPER_TOKEN" \
  -d '{"lat":10.762622,"lng":106.660172}')
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
echo "  Status: $STATUS | Body: $BODY"
check_status "13-Update Location" "$STATUS" "2xx"

echo ""
echo "── STEP X: Negative — Invalid location"
R=$(do_curl PUT "$BASE/api/delivery/shippers/me/location" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHIPPER_TOKEN" \
  -d '{"lat":9999,"lng":99999}')
STATUS=$(parse_status "$R")
check_status "X-Invalid Location" "$STATUS" "400"

echo ""
echo "── STEP LOC_02: Lat âm ngoài biên (-91)"
R=$(do_curl PUT "$BASE/api/delivery/shippers/me/location" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHIPPER_TOKEN" \
  -d '{"lat":-91,"lng":106.66}')
STATUS=$(parse_status "$R")
check_status "LOC_02 - lat=-91 invalid" "$STATUS" "400"

echo ""
echo "── STEP LOC_03: Lng ngoài biên (181)"
R=$(do_curl PUT "$BASE/api/delivery/shippers/me/location" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHIPPER_TOKEN" \
  -d '{"lat":10.76,"lng":181}')
STATUS=$(parse_status "$R")
check_status "LOC_03 - lng=181 invalid" "$STATUS" "400"

echo ""
echo "── STEP LOC_04: Lng âm ngoài biên (-181)"
R=$(do_curl PUT "$BASE/api/delivery/shippers/me/location" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHIPPER_TOKEN" \
  -d '{"lat":10.76,"lng":-181}')
STATUS=$(parse_status "$R")
check_status "LOC_04 - lng=-181 invalid" "$STATUS" "400"

echo ""
echo "── STEP LOC_05: Tracking khi shipper chưa cập nhật location (null)"
R=$(do_curl GET "$BASE/api/core/orders/$ORDER_ID/tracking" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN")
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
echo "  Body: $BODY"
check_status "LOC_05 - Tracking với null location" "$STATUS" "2xx"

# ── STEP 14: CUSTOMER — Track order ──────────────────────────────────────────
echo ""
echo "── STEP 14: CUSTOMER — Track order"
R=$(do_curl GET "$BASE/api/core/orders/$ORDER_ID/tracking" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN")
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
echo "  Status: $STATUS | Body: $BODY"
check_status "14-Track Order" "$STATUS" "2xx"

# ── STEP 15: SHIPPER — Complete shipment ──────────────────────────────────────
echo ""
echo "── STEP 15: SHIPPER — Complete shipment"
R=$(do_curl PUT "$BASE/api/delivery/shipments/$SHIPMENT_ID/complete" \
  -H "Authorization: Bearer $SHIPPER_TOKEN")
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
echo "  Status: $STATUS | Body: $BODY"
check_status "15-Complete Shipment" "$STATUS" "2xx"

echo ""
echo "  Waiting 1s for order status propagation..."
sleep 1

# ── STEP 16: CUSTOMER — Verify DELIVERED status ───────────────────────────────
echo ""
echo "── STEP 16: CUSTOMER — Verify order is DELIVERED"
R=$(do_curl GET "$BASE/api/core/orders/$ORDER_ID" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN")
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
echo "  Status: $STATUS | Body: $BODY"
ORDER_STATUS=$(echo "$BODY" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
check_status "16-Order Delivered" "$STATUS" "2xx"
if [[ "$ORDER_STATUS" == "DELIVERED" ]]; then
  echo "  $PASS Order status is DELIVERED ✓"
else
  echo "  $FAIL Order status is '$ORDER_STATUS', expected DELIVERED"
fi

echo ""
echo "========================================"
echo " E2E Test Complete"
echo "========================================"
