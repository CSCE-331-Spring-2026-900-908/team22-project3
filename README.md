A modern, browser-based Point of Sale system for Dragon Boba tea shop. Built with React and Node.js, connecting to a PostgreSQL database hosted on AWS RDS.

## Live Demo

**[https://team22-project3-dragon-boba-client.onrender.com/](https://team22-project3-dragon-boba-client.onrender.com/)**

| View | URL | Access |
|------|-----|--------|
| Portal | [/](https://team22-project3-dragon-boba-client.onrender.com/) | Public |
| Customer Kiosk | [/customer](https://team22-project3-dragon-boba-client.onrender.com/customer) | Public |
| Cashier POS | [/cashier](https://team22-project3-dragon-boba-client.onrender.com/cashier) | Employee ID |
| Manager Panel | [/manager](https://team22-project3-dragon-boba-client.onrender.com/manager) | Manager ID |

> **Note:** The free-tier backend may take ~30 seconds to wake up on first load.

## Tech Stack

- **Frontend:** React (Vite), React Router, Vanilla CSS
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL on AWS RDS
- **Deployment:** Render (Static Site + Web Service)


## Local Development

### Prerequisites
- Node.js (v18+)
- Access to the team PostgreSQL database

### Setup

```bash
# Backend
cd server
npm install
# Create server/.env with: DATABASE_URL=postgresql://...
npm start

# Frontend (separate terminal)
cd client
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and the backend at `http://localhost:3001`.

## Team 22

CSCE 331 — Spring 2026
