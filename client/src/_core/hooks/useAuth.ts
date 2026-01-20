import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

// Get cached user from localStorage for initial render (prevents flash)
function getCachedUser() {
  if (typeof window === "undefined") return undefined;
  try {
    const cached = localStorage.getItem("manus-runtime-user-info");
    if (cached && cached !== "null" && cached !== "undefined") {
      return JSON.parse(cached);
    }
  } catch {
    // Ignore parse errors
  }
  return undefined;
}

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: true, // CHANGED: Refetch when tab regains focus (important for mobile)
    staleTime: 1000 * 60 * 5, // 5 minutes - don't refetch if data is fresh
    initialData: getCachedUser(), // Use cached data for initial render
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
      // Clear localStorage on logout
      localStorage.removeItem("manus-runtime-user-info");
    },
  });

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        return;
      }
      throw error;
    } finally {
      utils.auth.me.setData(undefined, null);
      localStorage.removeItem("manus-runtime-user-info");
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  // ADDED: Handle visibility change (critical for mobile)
  // When user switches apps and comes back, revalidate the session
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // App came back to foreground - revalidate auth
        meQuery.refetch();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [meQuery]);

  const state = useMemo(() => {
    // Cache user data to localStorage for next page load
    if (meQuery.data) {
      localStorage.setItem(
        "manus-runtime-user-info",
        JSON.stringify(meQuery.data)
      );
    }
    return {
      user: meQuery.data ?? null,
      loading: meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || logoutMutation.isPending) return;
    // ADDED: Don't redirect if we have cached data and query is still fetching
    if (meQuery.isFetching && getCachedUser()) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath;
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    meQuery.isFetching,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
