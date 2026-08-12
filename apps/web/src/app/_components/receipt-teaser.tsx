"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CtaLink } from "./cta-link";

type TeaserState = "idle" | "analyzing" | "done";

const ANALYZE_DELAY_MS = 1400;

export function ReceiptTeaser() {
  const [state, setState] = useState<TeaserState>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleAnalyze() {
    setState("analyzing");
    timeoutRef.current = setTimeout(() => setState("done"), ANALYZE_DELAY_MS);
  }

  return (
    <Card className="w-full max-w-md border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Live preview</CardTitle>
        {state === "done" && (
          <button
            onClick={() => setState("idle")}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCcw className="size-3" />
            Try again
          </button>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">receipt_energy_bill.jpg</span>
            <span className="font-mono text-xs text-muted-foreground">2.1 MB</span>
          </div>
          <div className="space-y-2">
            <div className="h-2 w-3/4 rounded bg-border" />
            <div className="h-2 w-1/2 rounded bg-border" />
            <div className="h-2 w-2/3 rounded bg-border" />
          </div>
        </div>

        {state === "idle" && (
          <Button onClick={handleAnalyze} className="gap-2">
            <Sparkles className="size-4" />
            Analyze this receipt
          </Button>
        )}

        {state === "analyzing" && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="size-4 animate-pulse" />
              Reading document…
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )}

        {state === "done" && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 rounded-lg border border-success/30 bg-success-bg p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Vendor</span>
                <span className="font-medium">Enel Energy</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-mono font-medium">$84.50</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Due date</span>
                <span className="font-medium">Aug 28</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Category</span>
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                  Bills
                </span>
              </div>
            </div>
            <CtaLink href="/demo" variant="outline" className="w-full justify-center">
              See it with real deadlines
            </CtaLink>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
