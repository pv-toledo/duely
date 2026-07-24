"use client";

import { useState } from "react";
import { Controller, type Control, type Path } from "react-hook-form";
import { Eye, EyeOff, CircleCheck, CircleX } from "lucide-react";
import { FormInput } from "@/components/form-controls";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { passwordRequirements } from "@/app/(auth)/schema";

export function PasswordField<T extends { password: string }>({
  control,
  showRequirements = false,
}: {
  control: Control<T>;
  showRequirements?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <Controller
      name={"password" as Path<T>}
      control={control}
      render={({ field }) => {
        const value = (field.value as string) ?? "";
        return (
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <FormInput
                {...field}
                id="password"
                type={visible ? "text" : "password"}
                placeholder="Password"
                required
                className="pr-9"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex items-center px-2.5 text-muted-foreground hover:text-foreground"
              >
                {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            {showRequirements && (
              <ul className="flex flex-col gap-1">
                {passwordRequirements.map((req) => {
                  const met = req.test(value);
                  return (
                    <li
                      key={req.key}
                      className={cn(
                        "flex items-center gap-1.5 text-xs",
                        met ? "text-success" : "text-destructive"
                      )}
                    >
                      {met ? (
                        <CircleCheck className="size-3.5" />
                      ) : (
                        <CircleX className="size-3.5" />
                      )}
                      {req.label}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      }}
    />
  );
}
