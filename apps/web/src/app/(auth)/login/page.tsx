import { LoginForm } from "../_components/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-semibold">Sign in</h1>
        <LoginForm />
      </div>
    </main>
  );
}
