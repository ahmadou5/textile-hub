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
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ background: "var(--bg)" }}
      >
        <Navbar />
        {children}
      </div>
    </>
  );
}
