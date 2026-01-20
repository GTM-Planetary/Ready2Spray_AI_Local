# Task: Create README.md

## Priority: P0 - CRITICAL
## Estimated Complexity: Medium
## Files to Create: `README.md`
## Files to Reference: `package.json`, `.env.example`, `Dockerfile`

---

## Problem

The project has no documentation. New developers cannot understand, set up, or contribute to the project without extensive code exploration.

---

## Requirements

Create a comprehensive README.md that includes:

1. Project overview and purpose
2. Technology stack
3. Prerequisites
4. Installation instructions
5. Environment configuration
6. Development workflow
7. Deployment instructions
8. Project structure
9. API overview
10. Contributing guidelines

---

## Template

```markdown
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
| AI | Anthropic Claude, OpenAI |
| Payments | Stripe |
| Email | Mailgun |
| Storage | AWS S3 |
| Auth | OAuth + JWT |

## Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- PostgreSQL database (or Supabase account)
- Stripe account (for payments)
- Mailgun account (for email)
- AWS account (for S3 storage)
- Anthropic API key (for AI features)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Ready2Spray_AI_Local
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173` (client) and `http://localhost:3000` (API).

## Environment Variables

See `.env.example` for all required environment variables. Key configurations:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for JWT token signing |
| `STRIPE_SECRET_KEY` | Stripe API key |
| `MAILGUN_API_KEY` | Mailgun API key |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key |

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run test` | Run tests |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Drizzle Studio |

### Project Structure

```
Ready2Spray_AI_Local/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Route pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities
│   └── public/            # Static assets
├── server/                 # Node.js backend
│   ├── routers.ts         # tRPC API routes
│   ├── db.ts              # Database connection
│   └── schema.ts          # Drizzle schema
├── shared/                 # Shared types/utilities
└── .ai-tasks/             # Development task tracking
```

## Deployment

### Using Docker

```bash
docker build -t ready2spray .
docker run -p 3000:3000 --env-file .env ready2spray
```

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Set production environment variables

3. Start the server:
   ```bash
   NODE_ENV=production npm run start
   ```

## API Documentation

The API uses tRPC. Key endpoints:

- `/api/trpc/jobs.*` - Job management
- `/api/trpc/customers.*` - Customer management
- `/api/trpc/personnel.*` - Personnel management
- `/api/trpc/equipment.*` - Equipment tracking
- `/api/trpc/products.*` - Chemical products
- `/api/trpc/ai.*` - AI assistant

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm run test`
4. Submit a pull request

## License

Proprietary - GTM Planetary

## Support

For support, contact GTM Planetary.
```

---

## Acceptance Criteria

- [ ] README.md exists at project root
- [ ] Includes all sections listed above
- [ ] Installation instructions are accurate and tested
- [ ] Environment variables match `.env.example`
- [ ] Project structure reflects actual codebase

---

## Notes for Aider

1. Read `package.json` to get accurate script names
2. Verify the project structure matches the README
3. Check if there are any additional setup steps (database migrations, etc.)
4. Adjust technology versions to match actual `package.json` dependencies
