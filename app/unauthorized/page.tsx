import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-4 p-8">
        <div className="text-6xl">🚫</div>
        <h1 className="text-3xl font-bold text-slate-900">Access Denied</h1>
        <p className="text-slate-500 max-w-sm mx-auto">
          You don&apos;t have permission to view this page. Please contact an
          administrator if you believe this is a mistake.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">Sign in with a different account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
