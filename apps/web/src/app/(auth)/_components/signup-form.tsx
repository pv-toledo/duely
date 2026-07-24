"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { signupSchema, type SignupCredentials, passwordRequirements } from "../schema";
import { signup } from "../actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInput, FormButton } from "@/components/form-controls";
import { Label } from "@/components/ui/label";
import { PasswordField } from "./password-field";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { CircleAlert } from "lucide-react";
import { useState, useTransition } from "react";

export function SignupForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupCredentials>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "" },
  });

  const password = useWatch({ control, name: "password" });
  const passwordValid = passwordRequirements.every((req) => req.test(password ?? ""));

  function onSubmit(data: SignupCredentials) {
    setServerError(null);
    startTransition(async () => {
      const result = await signup(data);
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
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <PasswordField control={control} showRequirements />

      {serverError && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>{serverError}</AlertTitle>
        </Alert>
      )}

      <FormButton type="submit" disabled={isPending || !passwordValid} className="w-full">
        {isPending ? "Creating account…" : "Create account"}
      </FormButton>
    </form>
  );
}
