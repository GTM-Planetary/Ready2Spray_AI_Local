# Task: Setup Error Tracking (Sentry)

## Priority: P1 - HIGH
## Estimated Complexity: Medium
## Files to Modify: `client/src/main.tsx`, `server/index.ts`, config files

---

## Problem

The application has no error tracking or monitoring. Production issues:
- Go unnoticed until users report them
- Are difficult to debug without context
- Have no performance baseline

---

## Requirements

1. Set up Sentry for error tracking
2. Configure for both client and server
3. Add source maps for readable stack traces
4. Set up performance monitoring
5. Configure alerting

---

## Implementation

### Step 1: Install Sentry packages

```bash
# Client
npm install @sentry/react

# Server
npm install @sentry/node @sentry/profiling-node
```

### Step 2: Configure Sentry for React client

```typescript
// client/src/lib/sentry.ts

import * as Sentry from '@sentry/react';

export function initSentry() {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    console.log('Sentry DSN not configured, skipping initialization');
    return;
  }

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION || '1.0.0',

    // Performance Monitoring
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,

    // Session Replay (optional)
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],

    // Filter out noisy errors
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Non-Error promise rejection captured',
    ],

    // Add user context
    beforeSend(event) {
      // Don't send events in development
      if (import.meta.env.MODE === 'development') {
        console.log('Sentry event (dev mode):', event);
        return null;
      }
      return event;
    },
  });
}

// Helper to set user context after login
export function setSentryUser(user: { id: string; email: string; orgId?: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    orgId: user.orgId,
  });
}

// Helper to clear user context on logout
export function clearSentryUser() {
  Sentry.setUser(null);
}
```

### Step 3: Initialize in main.tsx

```typescript
// client/src/main.tsx

import { initSentry } from './lib/sentry';

// Initialize Sentry before React
initSentry();

// Rest of React initialization...
```

### Step 4: Add Error Boundary

```typescript
// client/src/components/ErrorBoundary.tsx

import * as Sentry from '@sentry/react';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  eventId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, eventId: null };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true, eventId: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.withScope((scope) => {
      scope.setExtras({ componentStack: errorInfo.componentStack });
      const eventId = Sentry.captureException(error);
      this.setState({ eventId });
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-4">
              We've been notified and are working on a fix.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
            {this.state.eventId && (
              <p className="text-sm text-gray-500 mt-4">
                Error ID: {this.state.eventId}
              </p>
            )}
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Also export the Sentry HOC version
export const withErrorBoundary = Sentry.withErrorBoundary;
```

### Step 5: Configure Sentry for Node.js server

```typescript
// server/lib/sentry.ts

import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

export function initSentry() {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    console.log('Sentry DSN not configured, skipping initialization');
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.APP_VERSION || '1.0.0',

    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Profiling
    profilesSampleRate: 0.1,

    integrations: [
      new ProfilingIntegration(),
    ],
  });

  console.log('Sentry initialized for server');
}

// Express error handler
export function sentryErrorHandler() {
  return Sentry.Handlers.errorHandler();
}

// Express request handler (adds transaction)
export function sentryRequestHandler() {
  return Sentry.Handlers.requestHandler();
}
```

### Step 6: Add to Express server

```typescript
// server/index.ts

import { initSentry, sentryRequestHandler, sentryErrorHandler } from './lib/sentry';

// Initialize Sentry first
initSentry();

const app = express();

// Add Sentry request handler as first middleware
app.use(sentryRequestHandler());

// ... other middleware and routes ...

// Add Sentry error handler before other error handlers
app.use(sentryErrorHandler());

// Your error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});
```

### Step 7: Add environment variables

```bash
# .env.example additions

# Sentry Error Tracking
SENTRY_DSN=https://xxxx@xxx.ingest.sentry.io/xxxx
VITE_SENTRY_DSN=https://xxxx@xxx.ingest.sentry.io/xxxx
VITE_APP_VERSION=1.0.0
```

### Step 8: Add source map upload (Vite config)

```typescript
// vite.config.ts

import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
  build: {
    sourcemap: true, // Required for Sentry
  },
  plugins: [
    // ... other plugins
    sentryVitePlugin({
      org: 'your-org',
      project: 'ready2spray',
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
});
```

---

## Acceptance Criteria

- [ ] Sentry SDK installed for client and server
- [ ] Client errors captured with user context
- [ ] Server errors captured with request context
- [ ] Error boundary displays user-friendly error page
- [ ] Source maps uploaded for readable stack traces
- [ ] Performance monitoring enabled
- [ ] Environment separation (dev/staging/prod)

---

## Notes for Aider

1. Get Sentry DSN from https://sentry.io (or ask user)
2. Check existing error handling to ensure Sentry doesn't conflict
3. Add source map configuration to the build process
4. Test error capture in development before deploying
5. Consider adding custom tags for organization/user context
