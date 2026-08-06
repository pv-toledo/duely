import { Label } from "@/components/ui/label";

export function FieldLabel({
  htmlFor,
  optional,
  children,
}: {
  htmlFor: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Label htmlFor={htmlFor}>
      {children}
      {optional && <span className="font-normal text-muted-foreground"> (optional)</span>}
    </Label>
  );
}
