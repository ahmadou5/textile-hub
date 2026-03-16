// app/(wholesale)/wholesale/layout.tsx
import Navbar from "@/components/layout/Navbar";

export default async function WholesaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ backgroundColor: "var(--bg)" }} className="min-h-screen  ">
      <Navbar />
      <main
        className="flex-1 min-h-screen max-w-5xl mx-auto"
        style={{ backgroundColor: "var(--bg)" }}
      >
        {children}
      </main>
    </div>
  );
}
