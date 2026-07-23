import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FormInput({ className, ...props }: React.ComponentProps<typeof Input>) {
  return <Input className={cn("h-11 md:h-9", className)} {...props} />;
}

export function FormButton({ className, ...props }: React.ComponentProps<typeof Button>) {
  return <Button className={cn("h-11 hover:cursor-pointer md:h-9", className)} {...props} />;
}
