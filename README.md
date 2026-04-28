# Dragon Boba POS & Kiosk 🐉

A full-stack, browser-based Point of Sale system for Dragon Boba tea shop. Built with React and Node.js, backed by a PostgreSQL database on AWS RDS.

---

## Live Demo

**[https://team22-project3-dragon-boba-client.onrender.com/](https://team22-project3-dragon-boba-client.onrender.com/)**

> **Note:** The free-tier backend spins down when idle and may take up to 30 seconds to respond on first load.

| View | URL | Access |
|------|-----|--------|
| Portal | [/](https://team22-project3-dragon-boba-client.onrender.com/) | Public |
| Customer Kiosk | [/customer](https://team22-project3-dragon-boba-client.onrender.com/customer) | Public |
| Digital Menu Board | [/menuboard](https://team22-project3-dragon-boba-client.onrender.com/menuboard) | TV Display |
| Cashier POS | [/cashier](https://team22-project3-dragon-boba-client.onrender.com/cashier) | Employee ID |
| Manager Panel | [/manager](https://team22-project3-dragon-boba-client.onrender.com/manager) | Google OAuth |

---

## Features

### Customer Kiosk (`/customer`)
- Self-serve touch kiosk with category browsing and item customization
- **Drink categories:** Milk Tea, Fruit Tea, Slush, Blended, Classic, Coffee, Creama, Hot Drinks, Seasonal, Special
- **Customization per drink:** Size (Small / Large), Sugar Level (7 levels), Temperature (Cold / Hot), Ice Level (4 levels), Toppings (Boba, Lychee Jelly, Pudding)
- Blended and Slushie drinks automatically hide the Hot temperature option
- Live price updates as options are selected
- Cart with quantity controls, inline editing, and persistent subtotal
- Loyalty points login: earn 100 points per $1 spent, redeem points at checkout
- Checkout via Cash, Credit, or Debit
- SMS order-ready notifications via phone number and carrier input

### Accessibility and Localization
- Font size cycling: Normal / Large / Extra Large
- Live translation into 9 languages via Google Cloud Translate API: English, Spanish, Chinese, Vietnamese, Korean, Hindi, Japanese, Italian, French
- All UI strings and menu item names are translated on demand and cached per session

### Boba Casino
- Mini-games accessible from the kiosk: Blackjack and Dice
- Integrated with the loyalty points system

### Weather Widget
- Displays current local weather in the kiosk header

### AI Chatbot
- Floating chatbot widget powered by Groq, aware of the full menu

### Digital Menu Board (`/menuboard`)
- Infinite-looping masonry grid layout designed for overhead 4K TV displays
- Auto-refreshes menu data

### Cashier POS (`/cashier`)
- Employee-authenticated order entry interface
- Mirrors kiosk customization options for staff-assisted orders

### Manager Panel (`/manager`)
- Menu management: add, update price, and delete items with ingredient recipes
- Inventory tracking and low-stock alerts
- Employee management
- Sales reports and analytics
- Order history

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router, Vanilla CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL on AWS RDS |
| Translation | Google Cloud Translate API |
| Notifications | EmailJS SDK, Nodemailer |
| AI Chatbot | Groq SDK |
| Deployment | Render (Static Site + Web Service) |

---

## Project Structure

```
team22-project3/
├── client/                  # React frontend (Vite)
│   ├── public/
│   │   └── drinks/          # Drink images (slug-named .png files)
│   └── src/
│       ├── components/      # WeatherWidget, ChatbotWidget
│       └── pages/
│           ├── customer/    # Kiosk, Casino, Loyalty, SMS, Accessibility
│           ├── cashier/     # Cashier POS
│           ├── manager/     # Manager dashboard
│           └── menuboard/   # TV display board
│
└── server/                  # Node.js + Express API
    ├── routes/              # menu, orders, inventory, employees, reports, ...
    ├── db.js                # PostgreSQL connection pool
    ├── migrate.js           # Schema migrations and seed data
    └── index.js             # Entry point
```

---

## Local Development

### Prerequisites
- Node.js v18 or higher
- Access to the team PostgreSQL database on AWS RDS

### Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd team22-project3

# 2. Start the backend
cd server
npm install
# Create a .env file in /server with the following:
# DATABASE_URL=postgresql://team22:<password>@team22db...rds.amazonaws.com:5432/postgres
# PORT=3001
npm start

# 3. Start the frontend (separate terminal)
cd client
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`

### Database Migrations

Run the migration script once after cloning to ensure all required columns and seed data are present:

```bash
cd server
node migrate.js
```

This script is idempotent and safe to re-run. It adds any missing schema changes and inserts seed items (Hot Drinks, Blended drinks) only if they do not already exist.

### Adding Drink Images

Images are served from `client/public/drinks/`. The filename must match the drink name converted to lowercase with spaces replaced by hyphens:

```
"Mango Slushie"       ->  drinks/mango-slushie.png
"Brown Sugar Blended" ->  drinks/brown-sugar-blended.png
"Matcha Latte"        ->  drinks/matcha-latte.png
```

If no image file is found, the UI automatically falls back to the category emoji.

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menu` | Fetch all active menu items |
| POST | `/api/menu` | Add a new menu item with recipe |
| PATCH | `/api/menu/:id` | Update item price |
| DELETE | `/api/menu/:id` | Delete item and cascade recipe |
| POST | `/api/orders` | Submit a new order |
| GET | `/api/orders` | Fetch order history |
| GET | `/api/inventory` | Fetch inventory levels |
| GET | `/api/employees` | Fetch employee list |
| GET | `/api/reports` | Sales analytics |
| POST | `/api/translate` | Translate text batch via Google Cloud |
| POST | `/api/email/notify` | Send SMS order-ready notification |

---

## Team 22
CSCE 331 -- Spring 2026
