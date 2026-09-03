# VKU Food Survey PWA 🍜📋

> **Đồ án Mini-Project Progressive Web App (PWA) - Khảo sát chất lượng món ăn & căng tin sinh viên trường Đại học Công nghệ Thông tin & Truyền thông Việt - Hàn (VKU)**

---

## 📖 1. Giới thiệu dự án (Project Introduction)

**VKU Food Survey PWA** là ứng dụng web cấp tiến (Progressive Web App) dành cho sinh viên và cán bộ giảng viên VKU thực hiện đánh giá, khảo sát trải nghiệm ăn uống tại các căng tin trong trường.

Ứng dụng được thiết kế theo triết lý **Mobile-first** và **Offline-first**:
- Khi có mạng: Gửi khảo sát trực tiếp lên máy chủ **NestJS** và lưu trữ vào cơ sở dữ liệu **MongoDB**.
- Khi mất mạng hoặc mạng chập chờn: Người dùng vẫn mở được app (nhờ App Shell Caching qua **Service Worker**), điền đầy đủ form khảo sát và lưu trữ an toàn trong trình duyệt thông qua **IndexedDB (Dexie.js)**.
- Khi có mạng trở lại: Hệ thống tự động phát hiện kết nối và đồng bộ hóa ngầm toàn bộ dữ liệu đang chờ lên server mà không làm gián đoạn trải nghiệm người dùng, đồng thời cơ chế **UUID clientId** bảo vệ chống trùng lặp dữ liệu (idempotency).

---

## ✨ 2. Tính năng chính (Features)

- 📱 **PWA Chuẩn & Có thể Cài đặt (Installable)**: Cài đặt trực tiếp lên màn hình chính điện thoại (Android / iOS) hoặc máy tính qua Web App Manifest (`manifest.json`) với trải nghiệm như ứng dụng gốc (Standalone).
- 📶 **Chế độ Ngoại tuyến (Offline-First)**:
  - Cache App Shell bằng Service Worker (`Cache First`).
  - Điền form khảo sát ngay cả khi không có kết nối mạng (Network Offline).
  - Lưu trữ bản nháp khảo sát vào cơ sở dữ liệu IndexedDB trên thiết bị.
- 🔄 **Tự động đồng bộ hóa (Automatic Synchronization)**:
  - Tự động kích hoạt đồng bộ khi trình duyệt phát hiện mạng Online (`window.addEventListener('online')`).
  - Hỗ trợ **Background Sync API** (`registration.sync.register('vku-food-sync')`).
  - Hỗ trợ nút **"Đồng bộ ngay" (Manual Sync)** tiện lợi cho việc demo và kiểm thử.
- 🛡️ **Chống trùng lặp dữ liệu (Deduplication / Idempotency)**:
  - Mỗi khảo sát được gán một mã định danh ngẫu nhiên `clientId` (UUID).
  - Backend NestJS và MongoDB đảm bảo unique index trên `clientId`, bỏ qua việc tạo lặp nếu cùng một request được gửi lại nhiều lần.
- 📝 **Form khảo sát 5 tiêu chí chi tiết**:
  - Tên món ăn, địa điểm căng tin (Khu A, Khu V, KTX...), danh mục món.
  - Đánh giá từ 1 đến 5 sao theo 5 tiêu chí: *Hương vị, Giá cả, Vệ sinh, Chất lượng phục vụ, Điểm tổng thể*.
  - Giá món ăn (VNĐ) và nhận xét chi tiết.
- 📊 **Trang Lịch sử (Survey History)**:
  - Xem tất cả khảo sát trên thiết bị với các huy hiệu trực quan:
    - 🟢 **Đã đồng bộ** (Synced)
    - 🟠 **Đang chờ đồng bộ** (Pending)
    - 🔴 **Đồng bộ thất bại** (Failed)
  - Xem chi tiết từng khảo sát và lọc trạng thái.

---

## 🛠️ 3. Tech Stack

| Thành phần | Công nghệ | Mô tả |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 14** (App Router), **TypeScript**, **Tailwind CSS** | Giao diện mobile-first, hiện đại, tối ưu hiệu năng |
| **Icons & UI** | **Lucide React** | Bộ icon trực quan, sinh động |
| **Local Storage** | **IndexedDB** qua **Dexie.js** | Lưu trữ cấu trúc offline dữ liệu khảo sát trên client |
| **PWA Core** | **Service Worker**, **Cache API**, **Web App Manifest** | Quản lý vòng đời install, activate, fetch cache và background sync |
| **Backend** | **NestJS 10**, **TypeScript** | Framework Node.js kiến trúc module chuẩn mực |
| **Database** | **MongoDB** & **Mongoose** | Cơ sở dữ liệu NoSQL lưu trữ khảo sát |
| **Validation** | **class-validator**, **class-transformer** | Kiểm tra ràng buộc dữ liệu DTO |

---

## 📁 4. Cấu trúc thư mục (Folder Structure)

```text
VKU-Food-Survey/
├── frontend/                     # Ứng dụng Next.js PWA
│   ├── app/
│   │   ├── layout.tsx            # Layout tổng thể (Navbar, BottomNav, PWA Meta)
│   │   ├── page.tsx              # Trang chủ (Trạng thái mạng, Thống kê, Sync CTA)
│   │   ├── survey/page.tsx       # Form điền khảo sát 5 tiêu chí
│   │   ├── history/page.tsx      # Lịch sử khảo sát & Quản lý đồng bộ
│   │   └── globals.css           # Cấu hình Tailwind CSS
│   ├── components/
│   │   ├── Navbar.tsx            # Thanh điều hướng trên
│   │   ├── BottomNav.tsx         # Thanh điều hướng dưới chuẩn mobile
│   │   ├── NetworkStatus.tsx     # Huy hiệu trạng thái kết nối mạng
│   │   ├── StarRating.tsx        # Component đánh giá sao 1-5
│   │   ├── PwaInstallPrompt.tsx  # Nút bấm cài đặt PWA
│   │   └── ServiceWorkerRegister.tsx # Khởi chạy Service Worker & Auto-Sync
│   ├── lib/
│   │   ├── db.ts                 # Cấu hình Dexie IndexedDB (surveyDB)
│   │   └── types.ts              # Định nghĩa Interface TypeScript
│   ├── services/
│   │   ├── api.ts                # Giao tiếp HTTP với Backend NestJS
│   │   └── sync.ts               # Bộ quản lý tự động đồng bộ khi Online
│   ├── public/
│   │   ├── manifest.json         # Khai báo Web App Manifest
│   │   ├── sw.js                 # Service Worker (Cache First App Shell)
│   │   └── icons/                # Icon PWA (icon-192, icon-512)
│   ├── package.json
│   └── tailwind.config.ts
│
├── backend/                      # Máy chủ API NestJS
│   ├── src/
│   │   ├── survey/
│   │   │   ├── dto/
│   │   │   │   └── create-survey.dto.ts # DTO kiểm tra dữ liệu khảo sát
│   │   │   ├── survey.schema.ts         # Mongoose Schema (unique clientId)
│   │   │   ├── survey.service.ts        # Nghiệp vụ lưu & chống duplicate
│   │   │   ├── survey.controller.ts     # REST API /surveys
│   │   │   └── survey.module.ts
│   │   ├── app.module.ts         # Module gốc cấu hình Mongoose & Config
│   │   └── main.ts               # Khởi tạo cổng 3001, CORS & ValidationPipe
│   ├── package.json
│   └── tsconfig.json
│
└── README.md                     # Tài liệu hướng dẫn sử dụng
```

---

## 💻 5. Cài đặt & Khởi chạy (Installation & Run)

### Yêu cầu môi trường
- **Node.js**: >= 18.x (Đã kiểm thử hoạt động tốt trên Node v20 & v22)
- **npm** hoặc **yarn** / **pnpm**
- **MongoDB**: Đang chạy cục bộ (port 27017) hoặc sử dụng kết nối đám mây **MongoDB Atlas** (miễn phí).

---

### Bước 1: Cài đặt Backend NestJS

1. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```
2. Cài đặt các gói thư viện:
   ```bash
   npm install
   ```
3. Cấu hình file môi trường `.env`:
   Tạo file `.env` (hoặc sao chép từ `.env.example`):
   ```env
   PORT=3001
   MONGODB_URI=mongodb://127.0.0.1:27017/vku_food_survey
   FRONTEND_URL=http://localhost:3000
   ```
   *(Nếu dùng MongoDB Atlas, thay `MONGODB_URI` bằng chuỗi kết nối mongodb+srv:// của bạn)*.

4. Khởi chạy máy chủ Backend:
   ```bash
   npm run start:dev
   ```
   API sẽ hoạt động tại: `http://localhost:3001` (Endpoint khảo sát: `http://localhost:3001/surveys`).

---

### Bước 2: Cài đặt Frontend Next.js PWA

1. Mở một terminal mới và di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```
2. Cài đặt các gói thư viện:
   ```bash
   npm install
   ```
3. Cấu hình file môi trường `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```
4. Khởi chạy Frontend:
   ```bash
   npm run dev
   ```
5. Mở trình duyệt truy cập: `http://localhost:3000`

---

## 🗄️ 6. Hướng dẫn thiết lập MongoDB

### Cách 1: Sử dụng MongoDB chạy tại máy (Local)
Nếu bạn đã cài MongoDB Community Server trên máy tính:
- Đảm bảo service MongoDB đang chạy ở cổng `27017`.
- Chuỗi kết nối trong `backend/.env`:
  ```env
  MONGODB_URI=mongodb://127.0.0.1:27017/vku_food_survey
  ```

### Cách 2: Sử dụng MongoDB Atlas (Cloud - Miễn phí)
1. Đăng ký tài khoản tại [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Tạo 1 cụm miễn phí (M0 Sandbox).
3. Vào mục **Network Access** -> Thêm IP `0.0.0.0/0` (cho phép truy cập từ mọi nơi).
4. Vào mục **Database Access** -> Tạo User và Password (ví dụ: `vku_admin` / `matkhau123`).
5. Bấm **Connect** -> Chọn **Drivers** -> Sao chép chuỗi kết nối dán vào `backend/.env`:
  ```env
  MONGODB_URI=mongodb+srv://vku_admin:matkhau123@cluster0.abcde.mongodb.net/vku_food_survey?retryWrites=true&w=majority
  ```

---

## 🧪 7. Hướng dẫn kiểm thử Ngoại tuyến (Offline Test)

Thực hiện theo các bước sau trên trình duyệt Google Chrome hoặc Microsoft Edge để kiểm chứng tính năng Offline của PWA:

1. Mở `http://localhost:3000` trên trình duyệt.
2. Nhấn phím `F12` để mở **Developer Tools (DevTools)**.
3. Chuyển sang biểu tượng thiết bị di động (Toggle Device Toolbar: `Ctrl + Shift + M`) và chọn mô phỏng màn hình **iPhone 12/14/Pixel**.
4. Vào tab **Application**:
   - Mục **Manifest**: Kiểm tra Name, Short name, Icons hiển thị chuẩn.
   - Mục **Service Workers**: Kiểm tra trạng thái `Activated and is running`.
5. Vào tab **Network** trên DevTools:
   - Tại dropdown tốc độ mạng (mặc định là *No throttling*), chọn sang **Offline**.
6. Thao tác trên giao diện app:
   - Huy hiệu kết nối chuyển ngay sang **🟠 Offline**.
   - Tải lại trang (`F5`): Trang web **vẫn mở bình thường**, không bị lỗi màn hình khủng long nhờ Service Worker Cache.
7. Vào mục **Khảo sát ngay**:
   - Điền tên món: *"Cơm tấm sườn nướng Khu A"*.
   - Đánh giá các mục 5 sao.
   - Nhập giá tiền: `25000`.
   - Nhấn **Gửi khảo sát ngay**.
8. Kết quả kiểm tra:
   - Màn hình xuất hiện thông báo màu vàng: *"Đã lưu khảo sát trên thiết bị. Khảo sát sẽ được đồng bộ khi có mạng."*
   - Vào tab **Application > IndexedDB > surveyDB > surveys**: Bạn sẽ thấy 1 bản ghi với `status: "pending"` và mã `clientId` dạng UUID.

---

## 🔄 8. Hướng dẫn kiểm thử Tự động Đồng bộ (Sync Test)

Tiếp tục từ bước trên khi đang có khảo sát chờ ở trạng thái Offline:

1. Chuyển lại tab **Network** trong DevTools từ **Offline** về **No throttling** (bật lại Internet).
2. Quan sát giao diện:
   - Huy hiệu chuyển sang **🟢 Online** rồi chớp trạng thái **🔄 Đang đồng bộ...**
   - Hệ thống tự động đọc các bản ghi `pending` từ IndexedDB và gửi request `POST /surveys` lên NestJS.
   - Xuất hiện thông báo toast: *"✅ Đã đồng bộ thành công 1/1 khảo sát!"*
3. Kiểm tra trang **Lịch sử**:
   - Bản ghi vừa gửi đã tự động đổi trạng thái từ *Đang chờ* sang **✅ Đã đồng bộ**.
4. Kiểm tra Backend & MongoDB:
   - Terminal backend NestJS thông báo: `Tạo mới survey thành công cho món: Cơm tấm sườn nướng Khu A`.
   - Trong MongoDB database `vku_food_survey`, collection `surveys` đã lưu đầy đủ thông tin khảo sát với `clientId` chính xác.
5. Kiểm tra tính năng chống trùng lặp (Deduplication):
   - Nhấn nút **Đồng bộ** lại nhiều lần trong trang Lịch sử.
   - Backend nhận diện `clientId` đã có trong database và trả về thông báo bỏ qua tạo lặp, đảm bảo không bị nhân đôi bản ghi.

---

## 🚀 9. Hướng dẫn Deploy

### Frontend (Deploy lên Vercel)
1. Đẩy mã nguồn lên repository GitHub.
2. Truy cập [vercel.com](https://vercel.com) và import repository của bạn.
3. Cấu hình **Root Directory**: `frontend`
4. Cấu hình **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: URL Backend trên Render/Railway (ví dụ `https://vku-survey-api.onrender.com`).
5. Nhấn **Deploy**. Sau khi deploy, Vercel cung cấp HTTPS miễn phí để cài đặt PWA!

### Backend (Deploy lên Render hoặc Railway)
1. Đăng ký tài khoản tại [render.com](https://render.com).
2. Tạo **New Web Service**, liên kết với repo GitHub.
3. Cấu hình:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
4. Khai báo **Environment Variables**:
   - `MONGODB_URI`: Chuỗi kết nối MongoDB Atlas của bạn.
   - `PORT`: `10000` (hoặc biến môi trường Render cung cấp).
   - `FRONTEND_URL`: URL trang web Vercel vừa deploy.
5. Nhấn **Create Web Service**.

---

## 👨‍🎓 Tác giả
- Sinh viên thực hiện: Sinh viên Khoa Khoa học Máy tính - Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn (VKU).
- Bài tập môn: Phát triển Ứng dụng Di động Đa nền tảng (Cross-Platform Mobile App Development) - Chuyên đề Progressive Web Apps (PWA).

