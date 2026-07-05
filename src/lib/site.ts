export const SITE_URL = "https://blog.academiahq.pro";
export const SITE_NAME = "Academia HQ Blog";
export const DEFAULT_OG_IMAGE =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/UCEUWB4fREROdv3cHjTf37JARfp2/social-images/social-1783150740275-Academia_HQ.webp";

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
