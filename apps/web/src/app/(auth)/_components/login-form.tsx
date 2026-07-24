"use client";

import { Controller, useForm } from "react-hook-form";
import { type LoginCredentials } from "../schema";
import { login } from "../actions";
import { FormInput, FormButton } from "@/components/form-controls";
import { Label } from "@/components/ui/label";
import { PasswordField } from "./password-field";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { CircleAlert } from "lucide-react";
import { useState, useTransition } from "react";

export function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit } = useForm<LoginCredentials>({
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(data: LoginCredentials) {
    setServerError(null);
    startTransition(async () => {
      const result = await login(data);
      if (result.error) {
        setServerError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <FormInput {...field} id="email" type="email" placeholder="you@example.com" required />
          )}
        />
      </div>

      <PasswordField control={control} />

      {serverError && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>{serverError}</AlertTitle>
        </Alert>
      )}

      <FormButton type="submit" disabled={isPending} className="w-full">
        {isPending ? "Signing in…" : "Sign in"}
      </FormButton>
    </form>
  );
}
