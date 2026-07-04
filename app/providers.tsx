"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { CurrentUserProvider } from "@/lib/current-user-context";
import { LocaleProvider } from "@/lib/i18n/context";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <CurrentUserProvider>{children}</CurrentUserProvider>
      </LocaleProvider>
    </QueryClientProvider>
  );
}
