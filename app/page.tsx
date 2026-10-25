import Hero from "@/components/Hero";
import FeaturedEvents from "@/components/FeaturedEvents";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <FeaturedEvents />
    </main>
  );
}
