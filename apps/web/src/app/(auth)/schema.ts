import { z } from "zod";

export const passwordRequirements = [
  { key: "length", label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { key: "uppercase", label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { key: "number", label: "One number", test: (v: string) => /\d/.test(v) },
  {
    key: "symbol",
    label: "One symbol (e.g. @, #, !)",
    test: (v: string) => /[^a-zA-Z0-9]/.test(v),
  },
] as const;

const password = passwordRequirements.reduce(
  (schema, req) => schema.refine(req.test, { message: req.label }),
  z.string()
);

export const signupSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password,
});

export const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export type SignupCredentials = z.infer<typeof signupSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;
