This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database Setup

This project uses [Drizzle ORM](https://orm.drizzle.team/) with Supabase Postgres.

### Prerequisites

1. Set up your Supabase project at [supabase.com](https://supabase.com)
2. Create a `.env.local` file in the project root with the following variables:

```env
# Supabase 프로젝트 URL (Project Settings > API > Project URL)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Supabase Anon Key (Project Settings > API > Project API keys > anon/public)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Database Connection String (Project Settings > Database > Connection string > Connection pooling)
# Connection Pooling URL 사용 권장 (포트 6543)
DATABASE_URL=postgresql://postgres.your-project-id:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
```

### Connection Test

연결 상태를 확인하려면:

```bash
pnpm test:db
```

### Drizzle Commands

```bash
# Generate migration files from schema
pnpm drizzle-kit generate

# Apply migrations to database
pnpm drizzle-kit push

# Pull schema from database
pnpm drizzle-kit pull

# Check for migration conflicts
pnpm drizzle-kit check

# Upgrade migration snapshots
pnpm drizzle-kit up

# Open Drizzle Studio (database GUI)
pnpm drizzle-kit studio
```

## Testing

Run tests with:

```bash
pnpm test          # Run all tests once
pnpm test:watch    # Run tests in watch mode
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
