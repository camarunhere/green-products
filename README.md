# Green Products – Sustainable E-Commerce Platform
**MSc Project | Student: Gopalakrishna Balaboina (A00046745) | Supervisor: Rabail Tahir**

## Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on port 27017

### 1. Seed the database
```bash
cd backend
node seed.js
```

### 2. Start both servers
Double-click `start.bat` OR run manually:

**Terminal 1 – Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 – Frontend:**
```bash
cd frontend
npm run dev
```

### 3. Open the app
http://localhost:5173

## Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| User | user@greenproducts.com | user123 |
| Admin | admin@greenproducts.com | admin123 |

## Features
- 🌿 Product listing with Eco Scores (0–100)
- ✅ Verified eco product badges
- 🛒 Full shopping cart & checkout flow
- 🔐 JWT Auth (register/login)
- 📦 Order management
- ⭐ Product reviews
- 🔍 Search + filter by category, price, verified status
- 📱 Fully responsive design

## Tech Stack
- **Frontend:** React 18, TailwindCSS, React Router, Framer Motion
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Auth:** JWT (30-day tokens)
- **Tools:** Vite, Axios
