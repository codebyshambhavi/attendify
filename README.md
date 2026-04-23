# Attendify — Modern Attendance Management System

<div align="center">

**A full-stack attendance tracking platform with QR scanning, real-time dashboards, and role-based access control**

[Features](#features) • [Quick Start](#quick-start) • [Architecture](#architecture) • [API](#api-documentation) • [Deployment](#deployment) • [Testing](#testing)

</div>

---

## ✨ Features

### Core Functionality
- ✅ **User Authentication** — JWT-based auth with bcrypt password hashing
- ✅ **Role-Based Access Control** — Separate admin and student dashboards
- ✅ **Manual Attendance Marking** — Students mark present/absent/late per subject
- ✅ **QR Code Scanning** — Admin generates time-limited QR codes for class attendance
- ✅ **Attendance History** — Month-by-month view with search & filters
- ✅ **Dashboard Analytics** — Real-time stats, charts, and attendance trends
- ✅ **CSV & PDF Export** — Download attendance reports for any date range

### Admin Features
- 👥 **User Management** — Create, edit, deactivate users with search & role filters
- 📊 **Bulk Operations** — Mark multiple students present/absent at once
- 🔍 **Advanced Filtering** — Filter attendance by user, date, month, subject, status
- 📈 **System Stats** — Total users, today's attendance, monthly rates

### Technical Highlights
- 🎨 **Modern UI** — Clean, responsive design with Tailwind CSS + Framer Motion
- 🌙 **Dark Mode** — System-aware theme with manual toggle
- 🔒 **Security** — Helmet.js, rate limiting, input validation, CORS protection
- ⚡ **Performance** — Optimized queries, pagination, lazy loading
- 🧪 **Tested** — 60%+ test coverage with Jest (backend) and Vitest (frontend)
- 🐳 **Docker Ready** — Full Docker Compose setup for local development
- 🚀 **CI/CD** — GitHub Actions pipeline with automated testing

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB (Atlas or local)
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/attendify.git
cd attendify

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Frontend setup
cd ../frontend
npm install
cp .env.example .env
# Edit .env with your API URL

# Seed database
cd ../backend
npm run seed

# Run dev servers (2 terminals)
npm run dev          # Backend on :5000
cd ../frontend && npm run dev  # Frontend on :5173
```

Open http://localhost:5173

**Demo accounts**:
- Admin: `admin@attendify.com` / `Admin@123`
- Student: `alice@attendify.com` / `Student@123`

---

## 📁 Project Structure

```
attendify/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # Express routes
│   │   ├── middleware/   # Auth, validation
│   │   └── utils/        # Helpers, PDF export
│   ├── tests/            # Jest tests (60%+ coverage)
│   └── server.js
│
├── frontend/             # React + Vite
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # 12 route pages
│   │   ├── context/      # Auth, theme
│   │   ├── hooks/        # Custom hooks
│   │   └── services/     # API client
│   └── tests/            # Vitest tests
│
├── docker-compose.yml
├── .github/workflows/ci.yml
└── DEPLOYMENT.md
```

---

## 🔌 API Endpoints

### Auth
- `POST /api/auth/signup` — Register
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user

### Attendance (Student)
- `POST /api/attendance/mark` — Mark attendance
- `GET /api/attendance/my` — Get history + stats
- `GET /api/attendance/today` — Today's status

### Admin
- `GET /api/admin/users` — List users
- `PUT /api/admin/users/:id` — Update user
- `DELETE /api/admin/users/:id` — Delete user
- `POST /api/admin/attendance/bulk-mark` — Bulk mark
- `GET /api/admin/export/csv` — CSV export
- `GET /api/admin/export/pdf` — PDF export

### QR Codes
- `POST /api/qr/generate` — Generate QR (admin)
- `POST /api/qr/scan/:token` — Scan QR (student)

---

## 🧪 Testing

```bash
# Backend (Jest)
cd backend
npm test
npm run test:coverage

# Frontend (Vitest)
cd frontend
npm test
npm run test:coverage
```

---

## 🚢 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for full guides.

**Quick deploy**:
1. Backend → Render.com (free tier)
2. Frontend → Vercel
3. Database → MongoDB Atlas (free tier)

---

## 🔐 Security

- Bcrypt password hashing (12 rounds)
- JWT authentication
- Rate limiting (100 req/15min)
- Input validation
- CORS protection
- Helmet security headers

---

## 📄 License

MIT License — see LICENSE for details.

---

**Built with React, Node.js, MongoDB, and Tailwind CSS**
