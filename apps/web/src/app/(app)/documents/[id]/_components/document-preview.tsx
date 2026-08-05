import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DocumentPreview({
  mimeType,
  originalFilename,
  signedUrl,
}: {
  mimeType: string;
  originalFilename: string;
  signedUrl: string | null;
}) {
  if (!signedUrl) {
    return <p className="text-sm text-muted-foreground">Couldn&apos;t load the document image.</p>;
  }

  if (mimeType === "application/pdf") {
    return (
      <>
        <iframe
          src={signedUrl}
          title={originalFilename}
          className="hidden h-[75vh] w-full rounded-lg border-none lg:block"
        />

        <a
          href={signedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "outline" }), "lg:hidden")}
        >
          Open PDF
        </a>
      </>
    );
  }

  return (
    <div className="flex h-[75vh] w-full items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={signedUrl} alt={originalFilename} className="h-full w-full object-contain" />
    </div>
  );
}
