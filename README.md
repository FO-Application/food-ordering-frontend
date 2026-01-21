# 🍔 Fast Bite - Food Ordering Frontend

A modern **Micro-Frontend** application for food ordering, built with React + TypeScript + Vite.

## 📦 Project Structure

This monorepo contains 3 independent applications for different user roles:

```
food-ordering-frontend/
├── apps/
│   ├── customer/       # 🧑 Customer App (Port 3000)
│   ├── admin/          # 👨‍💼 System Admin App (Port 3001)
│   └── partner/        # 🍳 Restaurant Owner App (Port 3002)
├── package.json        # Root orchestration
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.19.0 or >= 22.12.0
- npm >= 10.0.0

### Installation

```bash
# Install all dependencies (root + all apps)
npm run install:all
```

### Development

```bash
# Run all 3 apps simultaneously
npm run dev

# Or run individual apps
npm run dev:customer   # http://localhost:3000
npm run dev:admin      # http://localhost:3001
npm run dev:partner    # http://localhost:3002
```

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI Framework |
| **TypeScript** | Type Safety |
| **Vite 7** | Build Tool & Dev Server |
| **React Router 7** | Client-side Routing |
| **Axios** | HTTP Client |
| **i18next** | Internationalization (EN/VI) |
| **Firebase** | Social Authentication |

## 📱 Applications

### Customer App (`apps/customer`)
- Browse restaurants and cuisines
- Search by location (GPS/Address autocomplete)
- Add items to cart and place orders
- Track order delivery status

### Admin App (`apps/admin`)
- Manage system-wide settings
- Monitor all restaurants and orders
- User management and analytics

### Partner App (`apps/partner`)
- Restaurant owner dashboard
- Menu and product management
- Order processing and analytics

## 🔗 Backend Integration

The frontend connects to the backend via API Gateway. Configure the backend URL in `apps/*/vite.config.ts`:

```typescript
proxy: {
  '/api/v1': {
    target: 'YOUR_BACKEND_URL',
    changeOrigin: true,
  },
}
```

## 📄 License

This project is part of a Final Year Project (Đồ án tốt nghiệp).

---

Made with ❤️ by Fast Bite Team
