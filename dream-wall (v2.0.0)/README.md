# Dream Wall

Welcome to **Dream Wall**! I originally built this project as a personal space to learn and understand how full-stack development works from the ground up. Beyond just being a learning experience, it has become a simple, cozy little corner of the web where you can pin your dreams, aspirations, and fleeting midnight thoughts. 

Built with Node.js, Express, and SQLite, it's a lightweight app ready to store everything you hope to achieve (or just whatever weird stuff you dreamed about last night!).

## What is it?

Dream Wall is a full-stack web app that gives you a digital wall to:
- **Save** your dreams 
- **View** all the dreams you've pinned to the wall
- **Remove** dreams once they've come true (or if you change your mind)

## How it works

Under the hood, we've upgraded the stack to be robust and type-safe:
- **Frontend:** Vanilla HTML, CSS, and JavaScript. No heavy frameworks, just pure web magic.
- **Backend:** An Express.js API handling all the requests, written in TypeScript.
- **Database:** PostgreSQL for reliable data storage, with Prisma acting as our modern, type-safe ORM.

## Project Architecture

The codebase follows a clean, modular structure emphasizing separation of concerns:

- `src/server.ts`: The entry point for the Express application.
- `src/routes/`: HTTP layer. Defines API endpoints and handles request/response formatting.
- `src/services/`: Business logic layer. Handles database queries and core application rules, isolated from HTTP context.
- `src/validation/`: Input validation to ensure clean data before processing.
- `src/lib/`: Shared utilities, such as standardized error handling.
- `src/prisma.ts` & `src/postgres.ts`: Database configuration and ORM initialization.
- `prisma/`: Database schema definitions and migrations.
- `docs/`: Learning journals and architectural decisions.

## Current Roadmap
- [x] Migrate from SQLite to PostgreSQL
- [x] Integrate Prisma ORM for type-safe database queries
- [x] Refactor into a 3-tier architecture (Routes, Services, Data)
- [ ] **Next:** Build out the frontend UI to consume the new REST API
- [ ] Implement comprehensive error logging
- [ ] Add unit and integration tests for services and routes

---

*"A dream you dream alone is only a dream. A dream you dream together is reality."* - Yoko Ono

Go ahead, add your first dream to the wall!
