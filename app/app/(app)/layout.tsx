"use client";

import { Providers } from "@/components/providers";
import { Header } from "@/components/header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Header />
      <main>{children}</main>
    </Providers>
  );
}
