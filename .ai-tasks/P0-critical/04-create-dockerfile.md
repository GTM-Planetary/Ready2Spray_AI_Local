# Task: Create Dockerfile

## Priority: P0 - CRITICAL
## Estimated Complexity: Medium
## Files to Create: `Dockerfile`, `.dockerignore`
## Files to Reference: `package.json`, `vite.config.ts`, `server/`

---

## Problem

The project cannot be deployed to production without containerization. A Dockerfile is required for consistent deployments across environments.

---

## Project Structure Context

Based on analysis:
- **Frontend:** React + Vite (builds to `dist/`)
- **Backend:** Node.js + Express + tRPC
- **Package Manager:** npm (based on package-lock.json presence)
- **Build Output:** Vite builds client, server runs with tsx/node

---

## Implementation

### Step 1: Create .dockerignore

```dockerignore
# Dependencies
node_modules
*/node_modules

# Build outputs (will be built in container)
dist
build
.vite

# Development files
.git
.gitignore
*.md
.ai-tasks

# Environment files
.env
.env.*
**/.env

# IDE
.vscode
.idea
*.swp
*.swo

# Logs
*.log
npm-debug.log*

# Test files
**/*.test.ts
**/*.spec.ts
coverage
.nyc_output
```

### Step 2: Create Dockerfile

```dockerfile
# ================================================
# Ready2Spray AI - Production Dockerfile
# ================================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
COPY shared/package*.json ./shared/

RUN npm ci --include=dev

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared

# Set ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
ENV NODE_ENV=production
CMD ["node", "server/index.js"]
```

### Step 3: Create docker-compose.yml (optional but helpful)

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY}
      - MAILGUN_API_KEY=${MAILGUN_API_KEY}
      - MAILGUN_DOMAIN=${MAILGUN_DOMAIN}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

---

## Acceptance Criteria

- [ ] `Dockerfile` exists and builds successfully
- [ ] `.dockerignore` excludes unnecessary files
- [ ] Multi-stage build for smaller image size
- [ ] Runs as non-root user
- [ ] Health check configured
- [ ] Production dependencies only in final image

---

## Testing

After creating the files, test with:

```bash
docker build -t ready2spray .
docker run -p 3000:3000 --env-file .env ready2spray
```

---

## Notes for Aider

1. First check `package.json` for the actual build and start scripts
2. Adjust the Dockerfile if the project uses a different build process
3. The server entry point might be `server/index.ts` compiled to JS, or run with tsx - adjust accordingly
4. Check if there's a monorepo structure (workspaces) that needs special handling
