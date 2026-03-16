import Navbar from "@/components/layout/Navbar";

// app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="min-h-screen " style={{ background: "var(--bg)" }}>
        <Navbar />
        {children}
      </div>
    </>
  );
}
