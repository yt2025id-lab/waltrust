import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { HomeContent } from "@/components/home-content";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <Providers>
      <Header />
      <HomeContent />
    </Providers>
  );
}
