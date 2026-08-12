// apps/web/src/app/demo/_components/demo-review-dialog.tsx
"use client";

import { FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ReviewForm,
  type ReviewConfirmPayload,
} from "@/app/(app)/documents/[id]/review/_components/review-form";
import { DEMO_REVIEW_DEFAULTS } from "@/lib/demo/mock-data";
import { useDemoStore } from "@/lib/demo/demo-store";

export function DemoReviewDialog({
  documentId,
  originalFilename,
  open,
  onOpenChange,
}: {
  documentId: string;
  originalFilename: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { confirmReview } = useDemoStore();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* max-h/overflow/max-w are functional, not decorative — no preset
       * scale covers "90% of viewport height" or "wide enough for a
       * two-column form" for a dialog this content-heavy. */}
      <DialogContent className="max-h-[90vh] w-full max-w-2xl overflow-y-auto sm:max-w-3xl lg:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Review document</DialogTitle>
          <DialogDescription>
            This is what Duely extracted. Confirm or edit any field before it&apos;s saved.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-w-0 flex-col gap-6 lg:flex-row">
          <div className="min-w-0 lg:w-1/3">
            {/* Compact strip on mobile — a full-page-aspect box there is
             * mostly empty space above the fold. Full aspect ratio only
             * once it sits beside the form as a real side column. */}
            <div className="flex h-20 items-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 px-4 text-left lg:aspect-3/4 lg:h-auto lg:flex-col lg:items-center lg:justify-center lg:gap-2 lg:px-4 lg:text-center">
              <FileText className="size-6 shrink-0 text-muted-foreground lg:size-8" />
              <span className="min-w-0 truncate font-mono text-xs text-muted-foreground">
                {originalFilename}
              </span>
            </div>
          </div>
          <div className="min-w-0 lg:w-2/3">
            <ReviewForm
              documentId={documentId}
              defaultValues={DEMO_REVIEW_DEFAULTS}
              onConfirmOverride={async (id: string, payload: ReviewConfirmPayload) =>
                confirmReview(id, payload)
              }
              onSuccessOverride={() => onOpenChange(false)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
