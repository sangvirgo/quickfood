# Báo cáo SQA - Testcases cho Validation và Concurrent Accept

Dưới đây là bảng testcase được thiết kế theo mẫu slide 05:

| ID | Tên | Mô tả | Input | Expected | Kỹ thuật |
| --- | --- | --- | --- | --- | --- |
| TC_LOC_01 | Update location hợp lệ | Shipper cập nhật vị trí | lat:10.76, lng:106.66 | 200, tọa độ lưu đúng | Positive |
| TC_LOC_02 | Location null | Shipper chưa cập nhật | GET tracking | 200, lat/lng = null | Positive |
| TC_LOC_03 | Lat ngoài biên | Cập nhật lat vượt quá giới hạn | lat=91 | 400 Bad Request | Boundary Value |
| TC_ACC_01 | Accept bình thường | Shipper rảnh accept | - | 200, status=DELIVERING | Positive |
| TC_ACC_02 | Accept khi đang bận | Shipper busy accept | - | 400/500 | Negative |
| TC_ACC_03 | 2 shipper cùng accept | Kiểm tra xử lý concurrent (Race condition) | 2 shipper accept cùng lúc (Concurrent) | 1 thành công (200), 1 thất bại (4xx/5xx) | State Transition |
