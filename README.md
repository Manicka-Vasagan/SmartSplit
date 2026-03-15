# 💸 SmartSplit – Group Expense Tracker

> **Split expenses smartly** with friends, roommates, and travel buddies. Track debts, calculate balances, and settle up with minimum transactions.

![SmartSplit](https://img.shields.io/badge/Stack-MERN-6366f1?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)

---

## ✨ Features

- 🔐 **JWT Authentication** – Secure register/login with bcrypt hashed passwords
- 👥 **Group Management** – Create groups (Trip, Roommates, Friends, Other) and invite members by email
- 💰 **Smart Expense Splitting** – Equal or custom splits across any members
- 📊 **Balance Calculation** – Real-time per-member balances across all expenses
- 🤝 **Debt Simplification** – Minimum transaction algorithm to settle all debts optimally
- 🌙 **Dark Mode** – System-preference aware with manual toggle and localStorage persistence
- 📱 **Responsive Design** – Mobile-first Tailwind CSS UI with glassmorphism effects

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + React Router |
| Styling | Tailwind CSS (dark mode: class strategy) |
| Charts | Recharts |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Deployment | Vercel (frontend) + Render (backend) |

---

## 📂 Project Structure

```
smartsplit/
├── server/               # Express.js backend
│   ├── config/db.js
│   ├── middleware/authMiddleware.js
│   ├── models/           # User, Group, Expense, Settlement
│   ├── controllers/      # auth, group, expense, settlement
│   ├── routes/
│   ├── utils/splitCalculator.js
│   └── server.js
└── client/               # React + Vite frontend
    └── src/
        ├── components/   # Navbar, GroupCard, ExpenseCard, Modals, etc.
        ├── pages/        # Login, Register, Dashboard, GroupDetail, Profile
        ├── context/AuthContext.jsx
        ├── hooks/useDarkMode.js
        └── utils/api.js
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/smartsplit.git
cd smartsplit
```

### 2. Configure Backend

```bash
cd server
cp .env .env.local
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev
```

### 3. Configure Frontend

```bash
cd client
npm install
npm run dev
```

Visit `http://localhost:5173` 🎉

---

## 🔑 Environment Variables

**server/.env**
```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_super_secret_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## 📡 API Reference

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create account | ❌ |
| POST | `/api/auth/login` | Login | ❌ |
| GET | `/api/auth/me` | Get current user | ✅ |
| GET | `/api/groups` | List user's groups | ✅ |
| POST | `/api/groups` | Create group | ✅ |
| GET | `/api/groups/:id` | Get group details | ✅ |
| POST | `/api/groups/:id/add-member` | Add member by email | ✅ |
| DELETE | `/api/groups/:id` | Delete group | ✅ |
| GET | `/api/expenses/group/:groupId` | List expenses | ✅ |
| POST | `/api/expenses` | Create expense | ✅ |
| PUT | `/api/expenses/:id` | Update expense | ✅ |
| DELETE | `/api/expenses/:id` | Delete expense | ✅ |
| GET | `/api/expenses/balances/:groupId` | Get balances + transactions | ✅ |
| GET | `/api/settlements/group/:groupId` | List settlements | ✅ |
| POST | `/api/settlements` | Record settlement | ✅ |

---

## 🧮 Core Algorithm

The `splitCalculator.js` implements a **greedy debt simplification** algorithm:

1. Compute net balance per user (amount paid − amount owed)
2. Separate into creditors (+) and debtors (-)
3. Greedily match largest creditor with largest debtor
4. Result: **minimum number of transactions** to settle all debts

---

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full Render + Vercel deployment instructions.

---

## 📝 License

MIT © 2025 SmartSplit
