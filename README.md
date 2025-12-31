# QuickAI - Quick Windows Setup Guide

## Prerequisites

- Node.js (v18+): https://nodejs.org/
- PostgreSQL (v14+): https://www.postgresql.org/download/windows/

## Setup Steps

### 1. Create Database

In pgAdmin or psql, run:

```sql
CREATE DATABASE quickai;
```

Then import `server/schema.sql` into the database.

### 2. Create Environment File

Create `server/.env`:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/quickai
JWT_SECRET=any_random_string
PORT=5000
```

### 3. Install Dependencies

```cmd
cd server && npm install
cd ../client && npm install
```

## Run Application

**Terminal 1 (Backend):**

```cmd
cd server
npm run server
```

**Terminal 2 (Frontend):**

```cmd
cd client
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:5173

## Quick Fixes

- **DB error?** Check PostgreSQL service is running
- **Port in use?** Change PORT in .env
- **NPM errors?** Delete node_modules and reinstall
