"use client";

import { Controller, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import { Credentials, credentialsSchema } from "../schema";
import { login } from "../actions";

export function LoginForm() {
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
      const result = await login(data);
      if (result.error) {
        setServerError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Controller
        name="email"
        control={control}
        render={({ field }) => <Input {...field} type="email" placeholder="Email" />}
      />
      {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}

      <Controller
        name="password"
        control={control}
        render={({ field }) => <Input {...field} type="password" placeholder="Password" />}
      />
      {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}

      {serverError && <p className="text-sm text-red-500">{serverError}</p>}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
