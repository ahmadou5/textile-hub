// components/Navbar.tsx  ← stays a Server Component
import { auth } from "@/lib/auth";
import NavbarClient from "@/components/NavbarClient";

export default async function Navbar() {
  const session = await auth();
  return <NavbarClient session={session} />;
}
