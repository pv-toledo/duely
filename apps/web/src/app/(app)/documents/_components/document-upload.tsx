"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { FormButton } from "@/components/form-controls";
import { Camera, CircleAlert, CircleCheck, Upload } from "lucide-react";
import { uploadDocumentAction, type UploadFailureReason } from "../actions";
import { ALLOWED_MIME_TYPES, MAX_UPLOAD_SIZE_BYTES } from "@/lib/upload/constraints";
import { checkImageResolution } from "@/lib/upload/check-image-resolution";
import { compressImageToWebp, withExtension } from "@/lib/upload/compress-image";
import { getRawInputSizeCeiling, validateFileTypeAndSize } from "@/lib/upload/validate-file";

type ClientFailureReason = UploadFailureReason | "compression_failed";

const ERROR_MESSAGES: Record<ClientFailureReason, string> = {
  not_authenticated: "Your session expired. Please sign in again.",
  invalid_type: "This file type isn't supported. Use JPEG, PNG, HEIC, WebP or PDF.",
  file_too_large: "This file is too large. Try a smaller PDF or photo.",
  image_too_small: "This doesn't look like a photo of a document. Try a different file.",
  unreadable_image: "We couldn't read this file. Try a different one.",
  upload_failed: "Upload failed. Check your connection and try again.",
  insert_failed: "Something went wrong saving your document. Try again.",
  compression_failed:
    "We couldn't prepare this photo for upload. Try a different photo or a smaller file.",
};

const SUCCESS_FLASH_DURATION_MS = 3000;

export function DocumentUpload() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isBusy = isProcessing || isPending;

  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isSuccess) return;
    const timeout = setTimeout(() => setIsSuccess(false), SUCCESS_FLASH_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [isSuccess]);

  async function handleFile(file: File) {
    setErrorMessage(null);
    setIsSuccess(false);
    setIsProcessing(true);

    try {
      const rawValidation = validateFileTypeAndSize(file, getRawInputSizeCeiling(file));
      if (!rawValidation.valid) {
        setErrorMessage(ERROR_MESSAGES[rawValidation.reason]);
        return;
      }

      let uploadFile: File = file;

      if (file.type.startsWith("image/")) {
        const resolution = await checkImageResolution(file);

        if (resolution.checked && !resolution.meetsMinimum) {
          setErrorMessage(ERROR_MESSAGES.image_too_small);
          return;
        }

        if (resolution.checked) {
          const compressed = await compressImageToWebp(file);
          if (compressed.converted) {
            uploadFile = new File([compressed.blob], withExtension(file.name, "webp"), {
              type: "image/webp",
            });
          }
        }

        const finalValidation = validateFileTypeAndSize(uploadFile, MAX_UPLOAD_SIZE_BYTES);
        if (!finalValidation.valid) {
          setErrorMessage(ERROR_MESSAGES.compression_failed);
          return;
        }
      }

      startTransition(async () => {
        const result = await uploadDocumentAction(uploadFile);
        if (!result.success) {
          setErrorMessage(ERROR_MESSAGES[result.reason]);
          return;
        }
        setIsSuccess(true);
      });
    } finally {
      setIsProcessing(false);
    }
  }

  function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (isBusy) return;
    const file = event.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleFileInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) handleFile(file);
  }

  return (
    <div className="flex flex-col gap-4">
      <label
        onDragOver={(event) => {
          event.preventDefault();
          if (!isBusy) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex min-h-36 flex-col items-center justify-center gap-3 rounded-lg border p-8 text-center ${
          isBusy ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        } ${
          isSuccess
            ? "border-success bg-success-bg"
            : isDragging
              ? "border-dashed border-primary"
              : "border-dashed border-input"
        }`}
      >
        {isSuccess ? (
          <>
            <CircleCheck className="text-success" size={28} />
            <p className="text-sm font-medium text-success">
              Document uploaded and queued for review
            </p>
          </>
        ) : (
          <>
            <Upload className="text-muted-foreground" size={28} />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">
                {isProcessing
                  ? "Preparing…"
                  : isPending
                    ? "Uploading…"
                    : "Drag and drop a document, or click to browse"}
              </p>
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, HEIC, WebP or PDF — photos are optimized automatically; PDFs up to 4MB
              </p>
            </div>
          </>
        )}
        <input
          type="file"
          accept={ALLOWED_MIME_TYPES.join(",")}
          onChange={handleFileInputChange}
          disabled={isBusy}
          className="sr-only"
        />
      </label>

      <FormButton
        type="button"
        onClick={() => cameraInputRef.current?.click()}
        disabled={isBusy}
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
        disabled={isBusy}
        className="hidden"
      />

      {errorMessage && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>{errorMessage}</AlertTitle>
        </Alert>
      )}
    </div>
  );
}
