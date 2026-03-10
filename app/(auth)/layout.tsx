import Navbar from "@/components/layout/Navbar";

// app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        {children}
      </div>
    </>
  );
}
