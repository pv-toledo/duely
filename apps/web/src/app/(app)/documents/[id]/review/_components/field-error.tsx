export function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }
  return <p className="min-w-0 text-xs wrap-break-word text-destructive">{message}</p>;
}
