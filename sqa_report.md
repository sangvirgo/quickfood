## Testcases - Phân tích giá trị biên (Boundary Value Analysis)

### 1. Age Validation (Đăng ký Shipper)

| ID | Tên | Input | Expected | Kỹ thuật |
|---|---|---|---|---|
| TC_AGE_01 | Đúng ngày sinh nhật 18 tuổi | dateOfBirth = hôm nay - 18 năm | 201 Created | Boundary Value |
| TC_AGE_02 | 1 ngày chưa đủ 18 tuổi | dateOfBirth = hôm nay - 18 năm + 1 ngày | 400 Bad Request | Boundary Value |
| TC_AGE_03 | Ngày sinh tương lai | dateOfBirth = 2030-01-01 | 400 Bad Request | Negative |
| TC_AGE_04 | Dưới 13 tuổi (CUSTOMER) | dateOfBirth → age=12 | 400 Bad Request | Equivalence Partitioning |
| TC_AGE_05 | 15 tuổi đăng ký CUSTOMER | dateOfBirth → age=15 | 201 Created | Equivalence Partitioning |

### 2. Location Validation (Cập nhật vị trí Shipper)

| ID | Tên | Input | Expected | Kỹ thuật |
|---|---|---|---|---|
| TC_LOC_01 | Location hợp lệ | lat=10.76, lng=106.66 | 200 OK | Positive |
| TC_LOC_02 | Tracking khi chưa cập nhật | GET tracking sau khi tạo shipment | 200, lat/lng=null | Positive |
| TC_LOC_03 | lat biên trên vượt | lat=91 | 400 Bad Request | Boundary Value |
| TC_LOC_04 | lat biên dưới vượt | lat=-91 | 400 Bad Request | Boundary Value |
| TC_LOC_05 | lng biên phải vượt | lng=181 | 400 Bad Request | Boundary Value |
| TC_LOC_06 | lng biên trái vượt | lng=-181 | 400 Bad Request | Boundary Value |

### 3. Concurrent Accept (Kiểm thử xung đột)

| ID | Tên | Input | Expected | Kỹ thuật |
|---|---|---|---|---|
| TC_ACC_01 | Shipper rảnh accept bình thường | Shipper accept shipment WAITING | 200, status=DELIVERING | Positive |
| TC_ACC_02 | Shipper đang bận accept tiếp | Shipper busy accept shipment khác | 400/500 | Negative |
| TC_ACC_03 | 2 shipper cùng accept 1 shipment | 2 request đồng thời | 1 success (2xx), 1 fail (4xx/5xx) | State Transition |
