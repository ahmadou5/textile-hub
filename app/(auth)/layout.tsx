// app/(auth)/layout.tsx
import Navbar from "@/components/layout/Navbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg)" }}
    >
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-10 max-w-5xl">
        {children}
      </main>
    </div>
  );
}
