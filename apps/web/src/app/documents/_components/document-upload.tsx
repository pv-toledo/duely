"use client";

import { useRef, useState, useTransition } from "react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { FormButton } from "@/components/form-controls";
import { Camera, CircleAlert, CircleCheck, Upload } from "lucide-react";
import { uploadDocumentAction, type UploadFailureReason } from "../actions";
import { ALLOWED_MIME_TYPES } from "@/lib/upload/constraints";
import { checkImageResolution } from "@/lib/upload/check-image-resolution";
import { validateFileTypeAndSize } from "@/lib/upload/validate-file";

const ERROR_MESSAGES: Record<UploadFailureReason, string> = {
  not_authenticated: "Your session expired. Please sign in again.",
  invalid_type: "This file type isn't supported. Use JPEG, PNG, HEIC, WebP or PDF.",
  file_too_large: "This file is too large. Maximum size is 15MB.",
  image_too_small: "This photo's resolution is too low. Try a clearer, closer photo.",
  unreadable_image: "We couldn't read this file. Try a different one.",
  upload_failed: "Upload failed. Check your connection and try again.",
  insert_failed: "Something went wrong saving your document. Try again.",
};

export function DocumentUpload() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();

  const cameraInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setErrorMessage(null);
    setIsSuccess(false);

    const typeAndSize = validateFileTypeAndSize(file);
    if (!typeAndSize.valid) {
      setErrorMessage(ERROR_MESSAGES[typeAndSize.reason]);
      return;
    }

    const resolution = await checkImageResolution(file);
    if (resolution.checked && !resolution.meetsMinimum) {
      setErrorMessage(ERROR_MESSAGES.image_too_small);
      return;
    }

    startTransition(async () => {
      const result = await uploadDocumentAction(file);
      if (!result.success) {
        setErrorMessage(ERROR_MESSAGES[result.reason]);
        return;
      }
      setIsSuccess(true);
    });
  }

  function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (isPending) return;
    const file = event.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleFileInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) handleFile(file);
  }

  function reset() {
    setErrorMessage(null);
    setIsSuccess(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <label
        onDragOver={(event) => {
          event.preventDefault();
          if (!isPending) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-10 text-center ${
          isPending ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        } ${isDragging ? "border-primary" : "border-input"}`}
      >
        <Upload className="text-muted-foreground" size={28} />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">
            {isPending ? "Uploading…" : "Drag and drop a document, or click to browse"}
          </p>
          <p className="text-xs text-muted-foreground">JPEG, PNG, HEIC, WebP or PDF, up to 15MB</p>
        </div>
        <input
          type="file"
          accept={ALLOWED_MIME_TYPES.join(",")}
          onChange={handleFileInputChange}
          disabled={isPending}
          className="sr-only"
        />
      </label>

      <FormButton
        type="button"
        onClick={() => cameraInputRef.current?.click()}
        disabled={isPending}
        className="w-full lg:hidden"
      >
        <Camera /> Take a photo
      </FormButton>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileInputChange}
        disabled={isPending}
        className="hidden"
      />

      {errorMessage && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>{errorMessage}</AlertTitle>
        </Alert>
      )}

      {isSuccess && (
        <>
          <Alert>
            <CircleCheck />
            <AlertTitle>Document uploaded and queued for review.</AlertTitle>
          </Alert>
          <button
            type="button"
            onClick={reset}
            className="self-start text-sm underline underline-offset-2"
          >
            Upload another
          </button>
        </>
      )}
    </div>
  );
}
