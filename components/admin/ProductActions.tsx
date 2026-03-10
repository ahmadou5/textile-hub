// components/admin/ProductActions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ProductActions({ productId }: { productId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);

    const res = await fetch(`/api/products/${productId}`, {
      method: "DELETE",
    });

    setDeleting(false);

    if (!res.ok) {
      setError("Failed to delete. Try again.");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {/* Edit — wired to edit page (build later) */}
      <Link href={`/admin/products/${productId}/edit`}>
        <Button
          variant="ghost"
          size="sm"
          className="
            h-8 w-8 p-0 rounded-lg text-slate-400
            hover:text-[#D4A853] hover:bg-[#D4A853]/10
            transition-[color,background] duration-150
            focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#D4A853]
          "
        >
          <Pencil size={14} />
          <span className="sr-only">Edit</span>
        </Button>
      </Link>

      {/* Delete with confirmation dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="
              h-8 w-8 p-0 rounded-lg text-slate-400
              hover:text-red-500 hover:bg-red-50
              transition-[color,background] duration-150
              focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-red-400
            "
          >
            <Trash2 size={14} />
            <span className="sr-only">Delete</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle
              className="text-slate-800"
              style={{ fontFamily: "var(--font-playfair, serif)" }}
            >
              Delete Product?
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-sm leading-relaxed">
              This action is permanent and cannot be undone. Any inquiries or
              orders linked to this product will also be removed.
            </DialogDescription>
          </DialogHeader>

          {error && <p className="text-xs text-red-500 px-1">{error}</p>}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={deleting}
              className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="
                rounded-xl bg-red-500 text-white
                hover:bg-red-600 active:bg-red-700
                shadow-[0_2px_8px_rgba(239,68,68,0.25)]
                transition-[background,box-shadow] duration-150
                disabled:opacity-50
              "
            >
              {deleting ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={13} className="animate-spin" />
                  Deleting…
                </span>
              ) : (
                "Delete Product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
