"use client";

import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

const queryClient = new QueryClient();

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ProgressBar
          height="2px"
          color="black"
          options={{ showSpinner: false }}
          shallowRouting
        />
        {children}
        <Toaster />
      </QueryClientProvider>
    </SessionProvider>
  );
}
