import Navbar from "@/components/layout/Navbar";

// app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div
        className="min-h-screen max-w-5xl mx-auto flex items-center justify-center"
        style={{ background: "var(--bg)" }}
      >
        <Navbar />
        {children}
      </div>
    </>
  );
}
