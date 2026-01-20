# Task: Fix Mobile Authentication Loop

## Priority: P0 - CRITICAL
## Estimated Complexity: High
## Files to Modify: Auth-related client files, token refresh logic
## Files to Reference: `todo.md`, `client/src/` auth components

---

## Problem

From the project's `todo.md`:
> Fix persistent login loop issue - auth refresh not working properly on mobile

Users on mobile devices are experiencing an infinite login loop where:
1. They log in successfully
2. The page refreshes or they navigate
3. They're logged out and redirected to login
4. Repeat

---

## Likely Causes

1. **Token storage issues** - Mobile browsers handle localStorage/cookies differently
2. **Token refresh timing** - Refresh happens too late or fails silently
3. **Cookie settings** - SameSite/Secure flags incompatible with mobile
4. **OAuth redirect issues** - Callback URL handling on mobile
5. **Race condition** - Auth state checked before tokens are restored

---

## Investigation Steps

### Step 1: Find auth implementation

Search for:
- Token storage (localStorage, sessionStorage, cookies)
- Auth context/provider
- Token refresh logic
- OAuth callback handling

### Step 2: Check token storage mechanism

```typescript
// Common issues to look for:

// BAD: localStorage may not persist on some mobile browsers
localStorage.setItem('token', token);

// BETTER: Use cookies with proper flags
document.cookie = `token=${token}; path=/; secure; samesite=strict; max-age=${60*60*24*7}`;

// BEST: Use httpOnly cookies set by server
```

### Step 3: Check token refresh logic

```typescript
// Common issues:

// BAD: No error handling on refresh
const refreshToken = async () => {
  const response = await fetch('/api/refresh');
  const { token } = await response.json();
  setToken(token);
};

// GOOD: Proper error handling with fallback
const refreshToken = async () => {
  try {
    const response = await fetch('/api/refresh', {
      credentials: 'include', // Important for cookies
    });

    if (!response.ok) {
      // Token refresh failed, redirect to login
      clearAuth();
      return false;
    }

    const { token, expiresIn } = await response.json();
    setToken(token);
    scheduleRefresh(expiresIn);
    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    clearAuth();
    return false;
  }
};
```

---

## Implementation Fixes

### Fix 1: Add auth state persistence check on mount

```typescript
// In AuthProvider or main App component

useEffect(() => {
  const initAuth = async () => {
    setIsLoading(true);

    try {
      // Check for existing session
      const token = getStoredToken();

      if (token) {
        // Validate token is not expired
        if (isTokenExpired(token)) {
          // Try to refresh
          const refreshed = await refreshToken();
          if (!refreshed) {
            clearAuth();
          }
        } else {
          // Token is valid, restore session
          setUser(decodeToken(token));
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  initAuth();
}, []);

// Don't render protected routes until auth is initialized
if (isLoading) {
  return <LoadingSpinner />;
}
```

### Fix 2: Use credentials: 'include' for all auth requests

```typescript
// Ensure all fetch calls to auth endpoints include credentials
fetch('/api/auth/refresh', {
  method: 'POST',
  credentials: 'include', // This is crucial for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Fix 3: Add token refresh before expiration

```typescript
// Schedule refresh before token expires
function scheduleTokenRefresh(expiresIn: number) {
  // Refresh 5 minutes before expiration
  const refreshTime = (expiresIn - 300) * 1000;

  if (refreshTime > 0) {
    setTimeout(async () => {
      await refreshToken();
    }, refreshTime);
  }
}
```

### Fix 4: Handle OAuth callback properly

```typescript
// In OAuth callback handler

useEffect(() => {
  const handleCallback = async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code) {
      try {
        // Exchange code for tokens
        const response = await fetch('/api/auth/callback', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, state }),
        });

        if (response.ok) {
          const { user } = await response.json();
          setUser(user);

          // Clear URL params after successful auth
          window.history.replaceState({}, '', '/dashboard');
        } else {
          throw new Error('Auth callback failed');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate('/login?error=callback_failed');
      }
    }
  };

  handleCallback();
}, []);
```

### Fix 5: Add visibility change handler

```typescript
// Re-validate auth when app comes back to foreground (mobile)
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // Check if token is still valid
      validateSession();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);
```

---

## Acceptance Criteria

- [ ] Users stay logged in on mobile after page refresh
- [ ] Users stay logged in when navigating between pages
- [ ] Token refresh works silently before expiration
- [ ] OAuth callback works correctly on mobile
- [ ] App handles coming back from background correctly
- [ ] Clear error messages when auth fails

---

## Testing

1. **Mobile Safari:** Login, close browser, reopen - should stay logged in
2. **Mobile Chrome:** Login, switch to another app, come back - should stay logged in
3. **Page refresh:** Login, refresh page - should stay logged in
4. **Navigation:** Login, navigate to different pages - should stay logged in
5. **Token expiry:** Wait for token to near expiry - should refresh automatically

---

## Notes for Aider

1. Search for all auth-related files: `grep -r "auth" client/src/`
2. Look for AuthContext, AuthProvider, useAuth hooks
3. Check how tokens are stored and retrieved
4. Look at the OAuth callback route handler
5. This is a complex issue - make incremental changes and test each one
