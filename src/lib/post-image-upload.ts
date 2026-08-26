import { supabase } from "@/integrations/supabase/client";

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) return "Please choose an image file";
  if (file.size > MAX_IMAGE_BYTES) return "Image must be smaller than 10MB";
  return null;
}

/**
 * Upload an image to the (public) post-images bucket and return a URL that
 * resolves directly from Supabase Storage — no server-side proxy involved,
 * so it keeps working regardless of which server env vars are configured.
 */
export async function uploadPostImage(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${crypto.randomUUID()}.${ext || "jpg"}`;
  const { error } = await supabase.storage
    .from("post-images")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return supabase.storage.from("post-images").getPublicUrl(path).data.publicUrl;
}
