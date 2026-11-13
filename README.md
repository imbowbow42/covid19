# 🦠 COVID-19 Tracker - Thông Tin Dịch Bệnh

Ứng dụng theo dõi thông tin, số liệu thống kê và biểu đồ diễn biến đại dịch COVID-19 tại Việt Nam và trên toàn thế giới theo thời gian thực.

🌐 **Trực tiếp tại**: [Thông tin | COVID-19 Tracker](https://covid.jettpham.cloud/)

---

## ✨ Tính năng nổi bật (Features)

- 📊 **Số liệu thời gian thực**: Cập nhật ca nhiễm, ca tử vong, ca hồi phục, ca đang điều trị và tỷ lệ tử vong cho cả Toàn cầu và Việt Nam.
- 🗺️ **Bản đồ nhiệt tương tác (Interactive Maps)**:
  - Bản đồ Việt Nam với đầy đủ 63 tỉnh/thành phố và bảng phân bố ca bệnh theo từng địa phương.
  - Bản đồ Thế giới với hơn 200 quốc gia và vùng lãnh thổ.
- 🔍 **Tìm kiếm tức thì (Live Search Filter)**: Tìm kiếm nhanh chóng tên quốc gia hoặc tỉnh thành trên các bảng thống kê chi tiết.
- 📈 **Biểu đồ xu hướng trực quan (Charts)**:
  - Diễn biến dịch bệnh toàn cầu trong 30 ngày qua.
  - So sánh tốc độ lây nhiễm giữa các quốc gia tiêu biểu (Hoa Kỳ, Ấn Độ, Brazil, Pháp, Nga).
  - Xu hướng 7 ngày gần nhất tại Việt Nam.
- 🌓 **Chuyển đổi giao diện Sáng / Tối (Dark / Bright Mode)**:
  - Mặc định là chế độ Sáng (Bright Mode).
  - Hỗ trợ lưu tùy chọn vào `localStorage` và xử lý chống chớp màn hình (FOUC prevention).
- 🧩 **Hỗ trợ Chrome Extension (Manifest V3)**: Có thể tải dưới dạng tiện ích mở rộng (Unpacked Extension) trên Chrome và Edge.

---

## 📡 Nguồn dữ liệu (Data Sources)

Dữ liệu được cập nhật tự động từ các nguồn chính thống:
- **Việt Nam**: Bộ Y Tế Việt Nam (đồng bộ thông qua Apify Datasets).
- **Toàn cầu**: Open Disease Data ([disease.sh](https://disease.sh/)) tích hợp từ:
  - Tổ chức Y tế Thế giới (**WHO**)
  - Đại học Johns Hopkins (**JHU CSSE**)
  - **Worldometers**

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

- **Frontend**: HTML5, Modern CSS3 (CSS Variables, Flexbox/Grid), JavaScript (ES6+ async/await)
- **UI Framework & Icons**: Bootstrap 4, Font Awesome
- **Visualization**: Chart.js v4, SimpleMaps Vector Maps (Raphaël SVG)
- **APIs**: disease.sh REST API, Apify Key-Value Store API

---

## 🚀 Cài đặt & Chạy cục bộ (Local Development)

Bạn có thể chạy dự án cục bộ bằng bất kỳ máy chủ tĩnh nào:

```bash
# Clone repository
git clone https://github.com/imbowbow42/covid19.git
cd covid19

# Khởi chạy máy chủ cục bộ bằng Node.js
node server.mjs
```

Sau đó truy cập trình duyệt tại: `http://localhost:3000/`

---

## 📦 Cài đặt dưới dạng Chrome Extension

1. Mở Google Chrome hoặc Microsoft Edge và truy cập `chrome://extensions/`.
2. Bật công tắc **Chế độ dành cho nhà phát triển (Developer mode)** ở góc trên bên phải.
3. Nhấp vào nút **Tải tiện ích đã giải nén (Load unpacked)**.
4. Chọn thư mục dự án `covid19`.

---

## 📄 Bản quyền (License)

Dự án phục vụ mục đích tham khảo, theo dõi cộng đồng phi thương mại.
Mọi đóng góp hoặc phản hồi vui lòng tạo Issue hoặc Pull Request trên GitHub.
