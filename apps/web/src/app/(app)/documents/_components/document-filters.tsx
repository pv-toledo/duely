"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { DocumentCategory } from "@duely/shared";
import { CATEGORY_LABELS } from "../labels";

export type CategoryFilterValue = DocumentCategory | "all";

const CATEGORY_FILTER_OPTIONS: { value: CategoryFilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "vehicle", label: CATEGORY_LABELS.vehicle },
  { value: "health", label: CATEGORY_LABELS.health },
  { value: "bills", label: CATEGORY_LABELS.bills },
];

function isCategoryFilterValue(value: string): value is CategoryFilterValue {
  return CATEGORY_FILTER_OPTIONS.some((option) => option.value === value);
}

export function DocumentFilters({
  searchQuery,
  onSearchQueryChange,
  categoryFilter,
  onCategoryFilterChange,
}: {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  categoryFilter: CategoryFilterValue;
  onCategoryFilterChange: (value: CategoryFilterValue) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <ToggleGroup
        aria-label="Filter by category"
        variant="outline"
        value={[categoryFilter]}
        onValueChange={(value: string[]) => {
          const next = value[0];
          if (next && isCategoryFilterValue(next)) {
            onCategoryFilterChange(next);
          }
        }}
      >
        {CATEGORY_FILTER_OPTIONS.map((option) => (
          <ToggleGroupItem key={option.value} value={option.value} aria-label={option.label}>
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          className="pl-8 text-sm"
        />
      </div>
    </div>
  );
}
