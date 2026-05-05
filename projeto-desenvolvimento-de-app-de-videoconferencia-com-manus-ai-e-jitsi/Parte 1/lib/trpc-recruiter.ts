/**
 * Cliente tRPC que injeta o token JWT do recrutador no header Authorization.
 * Usado para todas as chamadas de API protegidas do ctBlun.
 */
import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "@/server/routers";
import { getApiBaseUrl } from "@/constants/oauth";
import { getRecruiterToken } from "@/lib/recruiter-auth";

export const trpcRecruiter = createTRPCReact<AppRouter>();

export function createRecruiterTRPCClient() {
  return trpcRecruiter.createClient({
    links: [
      httpBatchLink({
        url: `${getApiBaseUrl()}/api/trpc`,
        transformer: superjson,
        async headers() {
          const token = await getRecruiterToken();
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
        fetch(url, options) {
          return fetch(url, { ...options, credentials: "include" });
        },
      }),
    ],
  });
}
