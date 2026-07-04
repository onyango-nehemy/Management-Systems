# Biggie Chill Spot Wines & Spirits POS System

A custom-built Point of Sale (POS) and inventory management system for **Biggie Chill Spot**, Rongo, Migori — Kenya. Built around real shop operations: retail and wholesale sales, M-Pesa and cash payments, barcode-driven stock control, and role-based access for owners, admins, and staff.

Full project documentation (client-facing) is available in [`docs/BiggieChillSpot-Documentation.pdf`](./docs/BiggieChillSpot-Documentation.pdf).

**Live demo:** https://biggie-swart.vercel.app
**LOGIN details for DEMO:admin@biggiechillspot.co.ke  // admin123


## What the System Does

- **Point of Sale** — fast, touch-friendly checkout with product search, barcode scanning, retail/wholesale price toggling, M-Pesa and cash payment recording, and instant thermal-style receipt printing.
- **Stock Management** — full product CRUD, barcode-assisted stock take mode, low-stock thresholds, category and stock-level filtering.
- **Low Stock Alerts** — continuous monitoring of stock levels with direct "Restock" action from the alerts screen.
- **Dashboard** — live daily snapshot: revenue, transaction count, payment method split, retail vs wholesale performance, 7-day revenue trend, best-sellers.
- **Reports** (Owner & Admin) — daily/weekly/monthly revenue and profit views, full transaction history, payment/sale-type breakdowns.
- **User & Role Management** (Owner & Admin) — create, edit, deactivate staff accounts with role-based permissions.

## User Roles

| Role  | Access |
|-------|--------|
| Owner | Full access, including Reports and User Management |
| Admin | Everything except owner-only settings |
| Staff | Point of Sale, Stock (view & adjust), Low Stock Alerts |

## Tech Stack

| Layer          | Technology |
|----------------|------------|
| Frontend       | React + Vite, Tailwind CSS |
| Backend        | Node.js + Express |
| Database       | PostgreSQL, managed via Prisma ORM |
| Authentication | JWT-based, bcrypt-hashed passwords |
| Hosting        | Frontend on Vercel · Backend + Database on Render |

## Project Structure

```
wines-and-spirits/
├── frontend/          React + Vite client
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── utils/
│   └── ...
├── server/            Express API
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── index.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── ...
└── docs/
    └── BiggieChillSpot-Documentation.pdf


## Local Development

**Backend**
-bash
cd server
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

**Frontend**
-bash
cd frontend
npm install
npm run dev


The frontend expects a running API. Set `VITE_API_URL` in a local `.env` file if not using the default `http://localhost:5000/api`.

## Environment Variables

**`server/.env`**

DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your_secret_here
CLIENT_URL=http://localhost:5173

**`frontend/.env`** (optional for local dev — defaults to `http://localhost:5000/api`)

VITE_API_URL=http://localhost:5000/api


## Deployment

- **Backend** deployed on [Render](https://render.com) as a Web Service, with a managed Render PostgreSQL instance. Root directory: `wines-and-spirits/server`.
- **Frontend** deployed on [Vercel](https://vercel.com). Root directory: `wines-and-spirits/frontend`.
- Environment variables (`DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`, `VITE_API_URL`) are configured per-platform, not committed to the repo.

**Developed by:** Nehemiah Onyango Mbani
**Contact:** 0707877483
**Email**:**mbaninehemy@gmail.com