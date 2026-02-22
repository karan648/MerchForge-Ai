# MerchForge AI

Production-oriented full-stack SaaS built with Next.js App Router, Supabase Auth, and Prisma.

## Current Scope Implemented

- Landing, auth, onboarding, and dashboard route structure
- Shared dashboard shell + responsive navigation
- Framer Motion entry animations for auth and dashboard modules
- Supabase email/password auth APIs
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
- Route protection via `proxy.ts` for `/dashboard/*` and `/onboarding/*`
- Full Prisma data model for core SaaS entities:
  - `User`, `Design`, `Generation`, `Mockup`, `Template`, `TemplatePurchase`, `StoreProduct`, `Order`,
    `Subscription`, `CreditUsage`, `AffiliateReferral`, `Payout`, `BrandKit`, `Review`

## Tech Stack

- Next.js 16 App Router
- React 19 + TypeScript (strict)
- Tailwind CSS 4
- Framer Motion
- Supabase Auth
- Prisma ORM (v7)
- PostgreSQL

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env.local
```

Use a pooled connection for `DATABASE_URL` and a direct connection for `DIRECT_URL` when running migrations (Supabase-recommended setup).

3. Generate Prisma client:

```bash
npm run prisma:generate
```

4. Apply schema to database:

```bash
npm run prisma:push
# or
npm run prisma:migrate
```

5. Optional seed:

```bash
npm run db:seed
```

6. Run app:

```bash
npm run dev
```

## Useful Scripts

- `npm run lint`
- `npm run build -- --webpack`
- `npm run prisma:studio`
- `npm run prisma:generate`
- `npm run prisma:push`
- `npm run prisma:migrate`
- `npm run db:seed`

## Auth API Contracts

### Register

`POST /api/auth/register`

```json
{
  "fullName": "Alex Rivera",
  "email": "alex@example.com",
  "password": "strongpassword"
}
```

### Login

`POST /api/auth/login`

```json
{
  "email": "alex@example.com",
  "password": "strongpassword"
}
```

### Logout

`POST /api/auth/logout`

No request body required.
