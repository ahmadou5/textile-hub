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

    const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });

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
      {/* Edit */}
      <Link href={`/admin/products/${productId}/edit`}>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-lg transition-[color,background] duration-150
            focus-visible:outline-2 focus-visible:outline-offset-1"
          style={{
            color: "var(--text-faint)",
            outlineColor: "var(--brand-hex)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--brand-hex)";
            e.currentTarget.style.background = "var(--bg-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-faint)";
            e.currentTarget.style.background = "transparent";
          }}
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
            className="h-8 w-8 p-0 rounded-lg transition-[color,background] duration-150
              focus-visible:outline-2 focus-visible:outline-offset-1"
            style={{
              color: "var(--text-faint)",
              outlineColor: "var(--status-cancelled)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--status-cancelled)";
              e.currentTarget.style.background = "rgba(220,38,38,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-faint)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <Trash2 size={14} />
            <span className="sr-only">Delete</span>
          </Button>
        </DialogTrigger>

        <DialogContent
          className="max-w-sm rounded-2xl"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          <DialogHeader>
            <DialogTitle
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-syne, sans-serif)",
              }}
            >
              Delete Product?
            </DialogTitle>
            <DialogDescription
              className="text-sm leading-relaxed"
              style={{ color: "var(--text-muted)" }}
            >
              This action is permanent and cannot be undone. Any inquiries or
              orders linked to this product will also be removed.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <p
              className="text-xs px-1"
              style={{ color: "var(--status-cancelled)" }}
            >
              {error}
            </p>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            {/* Cancel */}
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={deleting}
              className="rounded-xl transition-[background,color] duration-150"
              style={{
                background: "var(--bg-subtle)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--bg-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--bg-subtle)")
              }
            >
              Cancel
            </Button>

            {/* Confirm delete */}
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl text-white transition-[background] duration-150 disabled:opacity-50"
              style={{
                background: "var(--status-cancelled)",
                boxShadow: "0 2px 8px rgba(220,38,38,0.25)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.filter = "brightness(1.1)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
            >
              {deleting ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={13} className="animate-spin" />
                  Deleting...
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
