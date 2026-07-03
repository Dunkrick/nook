# Setup

This guide helps you run Dream Wall locally.

## Prerequisites

- **Node.js** (v22+)
- **PostgreSQL** (running locally)
- **Git**

## 1. Clone the repository

```bash
git clone https://github.com/Dunkrick/dream-wall.git
cd dream-wall
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Configure Environment

Copy the example environment file to create your own local config:

```bash
cp .env.example .env
```

Open the newly created `.env` file in your editor and verify or update your variables. Make sure your `DATABASE_URL` matches your local PostgreSQL credentials:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/dreamwall
PORT=3003
```

## 4. Initialize Database

Generate the Prisma client and push the schema/migrations to your database:

```bash
    npx prisma generate
    npx prisma migrate dev
```

## 5. Start Development Servers

Run the backend in your first terminal:
```bash
npm run dev
```
The backend server will be running at `http://localhost:3003`.

Run the frontend in a second terminal:
```bash
cd dream-wall-frontend
npm run dev
```
The React application will be running at `http://localhost:5173`.