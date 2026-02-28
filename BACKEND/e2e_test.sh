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
echo "── STEP 3: Register SHIPPER"
R=$(do_curl POST "$BASE/api/core/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Shipper1","email":"shipper1@test.com","password":"pass123","role":"SHIPPER"}')
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
echo "  Status: $STATUS | Body: $BODY"
check_status "3-Register SHIPPER" "$STATUS" "2xx"

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
echo "── STEP 4c: Login SHIPPER"
R=$(do_curl POST "$BASE/api/core/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"shipper1@test.com","password":"pass123"}')
BODY=$(parse_body "$R"); STATUS=$(parse_status "$R")
echo "  Status: $STATUS | Body: $BODY"
SHIPPER_TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
check_status "4c-Login SHIPPER" "$STATUS" "2xx"
echo "  Token: ${SHIPPER_TOKEN:0:40}..."

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
