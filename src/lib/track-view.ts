import { supabase } from "@/integrations/supabase/client";

const KEY = "ahq_visitor_id";

function visitorId(): string {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}

/** Records one view per post per browser session. */
export async function trackPostView(postId: string) {
  if (typeof window === "undefined") return;
  const sessionKey = `ahq_viewed_${postId}`;
  try {
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, "1");
  } catch {
    /* ignore storage failures */
  }
  await supabase.from("post_views").insert({ post_id: postId, visitor_id: visitorId() } as never);
}
