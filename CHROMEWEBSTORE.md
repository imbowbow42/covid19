# Chrome Web Store Listing - COVID-19 Tracker

## Store Metadata
- **Extension Name**: COVID-19 Tracker - Thông tin dịch bệnh
- **Short Name**: COVID-19 Tracker
- **Version**: 1.0.0
- **Primary Category**: News & Weather / Productivity
- **Last Updated**: 2026-11-13

## Summary Description (Single Sentence)
Theo dõi số liệu và biểu đồ tình hình COVID-19 tại Việt Nam và trên thế giới theo thời gian thực.

## Detailed Description
COVID-19 Tracker cung cấp thông tin cập nhật, chính xác và trực quan về tình hình dịch bệnh COVID-19 tại Việt Nam và hơn 200 quốc gia, vùng lãnh thổ trên toàn thế giới.

### Tính năng nổi bật:
- **Dữ liệu thời gian thực**: Cập nhật liên tục số ca nhiễm, ca khỏi bệnh, ca tử vong và ca đang điều trị.
- **Bản đồ nhiệt tương tác**: Bản đồ Việt Nam với 63 tỉnh thành và Bản đồ Thế giới với độ phủ hơn 200 quốc gia.
- **Tìm kiếm thông minh**: Tìm kiếm nhanh tên bất kỳ tỉnh thành hoặc quốc gia nào để xem chi tiết số liệu.
- **Biểu đồ trực quan**: Biểu đồ diễn biến dịch bệnh theo thời gian (ca nhiễm mới, tử vong, khỏi bệnh) và so sánh giữa các quốc gia.
- **Giao diện hiện đại**: Hỗ trợ chế độ sáng/tối tự động (Dark mode), tối ưu hiển thị trên cả máy tính và màn hình di động.

## Permissions Justification
- `host_permissions: https://api.apify.com/*`: Cần thiết để lấy dữ liệu số ca bệnh 63 tỉnh thành Việt Nam từ Bộ Y Tế.
- `host_permissions: https://disease.sh/*`: Cần thiết để lấy dữ liệu ca bệnh toàn cầu và lịch sử biểu đồ từ Open Disease Data (WHO / Johns Hopkins CSSE).

## Privacy & Data Use
- Extension không thu thập bất kỳ thông tin cá nhân nào của người dùng.
- Không theo dõi lịch sử duyệt web.
- Dữ liệu hoàn toàn đọc từ các API mở công khai.

## Version History
- **v1.0.0** (2026-11-13): 
  - Khắc phục lỗi kết nối API toàn cầu.
  - Nâng cấp giao diện người dùng hiện đại, bổ sung tính năng tìm kiếm trực tiếp và bản đồ tương tác 63 tỉnh thành.

