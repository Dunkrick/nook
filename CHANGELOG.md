# Changelog

## v2.5.0

### Added

- Prisma ORM
- Validation middleware
- Global error middleware

### Changed

- Migrated JavaScript to TypeScript
- Replaced raw SQL with Prisma

### Removed

- Raw PostgreSQL client
- Duplicate validation logic

# v3.0.0 (In Progress)

## Added

### Authentication

- User registration
- User login
- Password hashing with bcrypt
- JWT authentication
- Authentication middleware

### Authorization

- User-owned dreams
- Protected CRUD operations
- Route protection using middleware

### Architecture

- Authentication service
- Authentication validation
- Shared authentication types
- Express request extension