import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DemoCreateDeadlineButton() {
  return (
    <span title="Sign up to create your own deadlines">
      <Button disabled className="pointer-events-none opacity-60">
        <Plus className="size-4" />
        Add deadline
      </Button>
    </span>
  );
}
