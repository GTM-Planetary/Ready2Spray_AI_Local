# Task: Setup CI/CD Pipeline

## Priority: P2 - ENHANCEMENT
## Estimated Complexity: Medium
## Files to Create: `.github/workflows/`, deployment configs

---

## Overview

Set up continuous integration and deployment:
- Run tests on pull requests
- Lint and type check
- Build verification
- Automated deployments to staging/production

---

## Requirements

1. CI pipeline for PRs (lint, test, build)
2. Automated deployment to staging
3. Manual approval for production
4. Environment-specific configurations
5. Slack/Discord notifications (optional)

---

## Implementation

### GitHub Actions CI

```yaml
# .github/workflows/ci.yml

name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run TypeScript check
        run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    needs: lint
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build
          path: dist/
          retention-days: 7
```

### Deployment Workflow

```yaml
# .github/workflows/deploy.yml

name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

jobs:
  deploy-staging:
    if: github.ref == 'refs/heads/main' || github.event.inputs.environment == 'staging'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          NODE_ENV: production

      - name: Build Docker image
        run: |
          docker build -t ready2spray:${{ github.sha }} .

      - name: Push to registry
        run: |
          echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
          docker tag ready2spray:${{ github.sha }} ${{ secrets.DOCKER_REGISTRY }}/ready2spray:staging
          docker push ${{ secrets.DOCKER_REGISTRY }}/ready2spray:staging

      - name: Deploy to staging
        run: |
          # Deploy command depends on your infrastructure
          # Examples: kubectl, docker-compose, AWS ECS, etc.
          echo "Deploying to staging..."

      - name: Notify Slack
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}

  deploy-production:
    if: github.event.inputs.environment == 'production'
    runs-on: ubuntu-latest
    environment: production
    needs: deploy-staging
    steps:
      - uses: actions/checkout@v4

      - name: Build and push
        run: |
          docker build -t ready2spray:${{ github.sha }} .
          docker tag ready2spray:${{ github.sha }} ${{ secrets.DOCKER_REGISTRY }}/ready2spray:production
          docker push ${{ secrets.DOCKER_REGISTRY }}/ready2spray:production

      - name: Deploy to production
        run: |
          echo "Deploying to production..."

      - name: Create release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: v${{ github.run_number }}
          release_name: Release v${{ github.run_number }}
          draft: false
          prerelease: false
```

### Package.json Scripts

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "build": "vite build && tsc -p server/tsconfig.json"
  }
}
```

### Branch Protection Rules

Configure in GitHub repository settings:
- Require PR reviews
- Require status checks to pass
- Require branches to be up to date
- No force pushes to main

---

## Environment Secrets

Configure in GitHub repository settings:
- `DATABASE_URL`
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`
- `DOCKER_REGISTRY`
- `SLACK_WEBHOOK`
- All other production secrets

---

## Acceptance Criteria

- [ ] CI runs on all PRs
- [ ] Lint, test, and build checks pass
- [ ] Staging auto-deploys on main merge
- [ ] Production requires manual approval
- [ ] Build artifacts stored
- [ ] Deployment notifications working

---

## Notes for Aider

1. Adjust deployment steps based on actual infrastructure (AWS, GCP, Vercel, etc.)
2. Add database migrations to deployment pipeline
3. Consider adding security scanning (Snyk, CodeQL)
4. Add performance benchmarks if relevant
5. Set up preview deployments for PRs (Vercel, Netlify)
