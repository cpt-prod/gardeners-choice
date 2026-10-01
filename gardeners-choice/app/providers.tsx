"use client";

import { createContext, useContext } from "react";
import { useSession } from "@/hooks/useSession";
import { useTokens } from "@/hooks/useTokens";
import { useThreads } from "@/hooks/useThreads";

interface ProvidersCtx {
  session: ReturnType<typeof useSession>;
  tokens: ReturnType<typeof useTokens>;
  threads: ReturnType<typeof useThreads>;
}

const Ctx = createContext<ProvidersCtx | null>(null);

export default function Providers({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const tokens = useTokens();
  const threads = useThreads();
  return <Ctx.Provider value={{ session, tokens, threads }}>{children}</Ctx.Provider>;
}

export function useProviders(): ProvidersCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useProviders must be used inside <Providers>");
  return v;
}

export function useCtxSession() {
  return useProviders().session;
}
export function useCtxTokens() {
  return useProviders().tokens;
}
export function useCtxThreads() {
  return useProviders().threads;
}
