/**
 * Provider tRPC para o cliente do recrutador.
 * Inicializa o cliente com o token JWT após o login.
 */
import React, { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "@/server/routers";
import { getApiBaseUrl } from "@/constants/oauth";
import { useRecruiter } from "./recruiter-context";
import { trpcRecruiter } from "./trpc-recruiter";

// Cria um único QueryClient para toda a app
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutos
    },
  },
});

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const { token } = useRecruiter();

  // Cria o cliente tRPC com o token do recrutador
  const trpcClient = useMemo(() => {
    return trpcRecruiter.createClient({
      links: [
        httpBatchLink({
          url: `${getApiBaseUrl()}/api/trpc`,
          transformer: superjson,
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: "include",
            });
          },
        }),
      ],
    });
  }, [token]);

  return (
    <trpcRecruiter.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpcRecruiter.Provider>
  );
}
