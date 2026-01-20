# Task: Implement WebSocket Real-Time Updates

## Priority: P2 - ENHANCEMENT
## Estimated Complexity: High
## Files to Modify: Server setup, client providers, components

---

## Overview

Add WebSocket support for real-time updates without polling:
- Job status changes
- New notifications
- Live dashboard updates
- Team member activity

---

## Requirements

1. WebSocket server alongside Express
2. Authentication for WebSocket connections
3. Room-based subscriptions (per organization)
4. Broadcast events for entity changes
5. Automatic reconnection on client
6. Fallback to polling for unsupported clients

---

## Implementation Outline

### Packages

```bash
npm install socket.io
npm install socket.io-client
```

### Server Setup

```typescript
// server/websocket.ts

import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyToken } from './auth';

export function setupWebSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const user = await verifyToken(token);
      socket.data.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { user } = socket.data;

    // Join organization room
    socket.join(`org:${user.orgId}`);

    // Join user-specific room
    socket.join(`user:${user.id}`);

    socket.on('disconnect', () => {
      console.log(`User ${user.id} disconnected`);
    });
  });

  return io;
}

// Event emitter helper
export function emitToOrg(io: Server, orgId: string, event: string, data: any) {
  io.to(`org:${orgId}`).emit(event, data);
}
```

### Event Types

```typescript
// shared/types/events.ts

export type WebSocketEvent =
  | { type: 'job:created'; data: Job }
  | { type: 'job:updated'; data: Job }
  | { type: 'job:deleted'; data: { id: string } }
  | { type: 'notification:new'; data: Notification }
  | { type: 'user:online'; data: { userId: string } }
  | { type: 'user:offline'; data: { userId: string } };
```

### Client Hook

```typescript
// client/src/hooks/useWebSocket.ts

import { useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

let socket: Socket | null = null;

export function useWebSocket() {
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3000', {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    return () => {
      socket?.disconnect();
    };
  }, [token]);

  const subscribe = useCallback((event: string, callback: (data: any) => void) => {
    socket?.on(event, callback);
    return () => socket?.off(event, callback);
  }, []);

  return { subscribe, socket };
}
```

---

## Acceptance Criteria

- [ ] WebSocket server running alongside HTTP
- [ ] Authenticated connections only
- [ ] Organization-scoped rooms
- [ ] Job updates broadcast in real-time
- [ ] Client auto-reconnects on disconnect
- [ ] Dashboard updates without refresh

---

## Notes for Aider

Consider using existing tRPC subscription features if available. Socket.io provides good fallback support and room management out of the box.
