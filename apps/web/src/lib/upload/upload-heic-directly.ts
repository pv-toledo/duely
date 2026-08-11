import { createClient } from "@/lib/supabase/client";
import { MIME_TO_EXTENSION } from "./constraints";

export type HeicDirectUploadResult = {
  documentId: string;
  storagePath: string;
};

export async function uploadHeicDirectly(file: File): Promise<HeicDirectUploadResult | null> {
  const supabase = createClient();

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claimsData) {
    return null;
  }
  const userId = claimsData.claims.sub;

  const documentId = crypto.randomUUID();
  const extension = MIME_TO_EXTENSION[file.type as keyof typeof MIME_TO_EXTENSION];
  const storagePath = `${userId}/${documentId}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(storagePath, file, { contentType: file.type });

  if (uploadError) {
    return null;
  }

  return { documentId, storagePath };
}
