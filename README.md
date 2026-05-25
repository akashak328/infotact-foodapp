# 🍔 Infotact Food App

A full-stack food ordering and restaurant management platform built with **React** (frontend) and **Java Spring Boot** (backend), using **MongoDB** as the database.

---

## 📁 Project Structure

```
foodapp/
├── backend/          # Spring Boot REST API
├── frontend/         # React web application
├── seed.js           # MongoDB seed data (demo only)
├── docker-compose.yml
├── .env.example      # ← Copy this to .env and fill in secrets
└── README.md
```

---

## ⚙️ Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, Axios, React Router     |
| Backend   | Java 17, Spring Boot 3, Spring Security, JWT |
| Database  | MongoDB 6.0                       |
| DevOps    | Docker, Docker Compose, GitHub Actions |

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Java 17+
- Node.js 18+
- MongoDB 6.0 (or Docker)
- Maven 3.8+

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/infotact-foodapp.git
cd infotact-foodapp
```

### 2. Set up environment variables
```bash
cp .env.example .env
# Open .env and fill in your values (MongoDB URI, JWT secret, etc.)
```

### 3. Run with Docker (easiest)
```bash
docker-compose up --build
```
- Frontend → http://localhost:3000
- Backend API → http://localhost:8080

### 4. Run manually

**Backend:**
```bash
cd backend
# Set environment variable before running:
export APP_JWT_SECRET=your_strong_secret_here
mvn spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

### 5. Seed demo data (optional)
```bash
mongosh infotact_foodapp seed.js
```
Demo credentials: `customer@demo.com` / `demo123`

---

## 🔐 Security Notes

- **Never** commit `.env` or `application-local.properties` — they are in `.gitignore`
- JWT secret must be at least 32 characters long
- Generate a strong secret: `openssl rand -hex 32`
- Change all demo passwords before deploying to production

---

## 🏗️ GitHub Actions CI/CD

The CI pipeline (`.github/workflows/ci.yml`) runs on every push to `main` or `develop`.

**Required GitHub Secret** (add in repo Settings → Secrets → Actions):
- `APP_JWT_SECRET` — your JWT signing secret

---

## 📄 License

MIT License — feel free to use and modify.
