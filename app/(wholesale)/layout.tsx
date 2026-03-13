// app/(wholesale)/wholesale/layout.tsx
import Navbar from "@/components/layout/Navbar";

export default async function WholesaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main
        className="flex-1 min-h-screen"
        style={{ backgroundColor: "var(--bg)" }}
      >
        {children}
      </main>
    </div>
  );
}
