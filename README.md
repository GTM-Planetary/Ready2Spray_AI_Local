# Ready2Spray AI

A comprehensive SaaS platform for agricultural aerial application and pest control operations management.

## Overview

Ready2Spray helps spray operation companies manage:
- **Jobs** - Scheduling, tracking, and completion of spray operations
- **Customers** - Client management and service history
- **Personnel** - Team members, certifications, and licensing
- **Equipment** - Aircraft, vehicles, and spray rigs with maintenance tracking
- **Sites** - GPS coordinates, boundary mapping (KML/GPX/GeoJSON)
- **Chemical Products** - EPA registration, active ingredients, REI/PHI compliance
- **AI Assistant** - Claude-powered chat for querying and managing data

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 7, TypeScript 5.9, Tailwind CSS 4 |
| Backend | Node.js, Express, tRPC 11, Drizzle ORM |
| Database | PostgreSQL (Supabase) |
| AI | Anthropic Claude |
| Payments | Stripe |
| Email | Mailgun |
| Storage | AWS S3 |
| Auth | OAuth + JWT |

## Prerequisites

- Node.js 20.x or higher
- pnpm 10.x or higher
- PostgreSQL database (or Supabase account)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Ready2Spray_AI_Local
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   pnpm db:push
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

The application will be available at `http://localhost:5173`.

## Environment Variables

See `.env.example` for all required environment variables.

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for JWT token signing (min 32 chars) |
| `STRIPE_SECRET_KEY` | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `MAILGUN_API_KEY` | Mailgun API key |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm test` | Run unit tests |
| `pnpm test:e2e` | Run E2E tests |
| `pnpm db:push` | Push schema to database |

## Project Structure

```
Ready2Spray_AI_Local/
├── client/              # React frontend
│   └── src/
│       ├── components/  # UI components
│       ├── pages/       # Route pages
│       └── hooks/       # Custom React hooks
├── server/              # Node.js backend
│   ├── _core/           # Core server setup
│   ├── routers.ts       # tRPC API routes
│   ├── db.ts            # Database connection
│   └── schema.ts        # Drizzle schema
├── shared/              # Shared types/utilities
├── e2e/                 # E2E tests (Playwright)
└── docs/                # Documentation
```

## Deployment

### Using Docker

```bash
docker build -t ready2spray .
docker run -p 3000:3000 --env-file .env ready2spray
```

### Using Docker Compose

```bash
docker-compose up -d
```

## API Documentation

See [docs/API.md](docs/API.md) for comprehensive API documentation.

## License

Proprietary - GTM Planetary
