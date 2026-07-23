"use client";

import { Controller, useForm } from "react-hook-form";
import { credentialsSchema, type Credentials } from "../schema";
import { signup } from "../actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInput, FormButton } from "@/components/form-controls";
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
  } = useForm<Credentials>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(data: Credentials) {
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
        <Controller
          name="email"
          control={control}
          render={({ field }) => <FormInput {...field} type="email" placeholder="Email" />}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Controller
          name="password"
          control={control}
          render={({ field }) => <FormInput {...field} type="password" placeholder="Password" />}
        />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      {serverError && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>{serverError}</AlertTitle>
        </Alert>
      )}

      <FormButton type="submit" disabled={isPending} className="w-full">
        {isPending ? "Creating account…" : "Create account"}
      </FormButton>
    </form>
  );
}
