import { createClient } from "./supabase/client";

export const logAdminAction = async (action: string, category: string = "General") => {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase.from("audit_logs").insert({
      action,
      admin_id: user.id,
      admin_email: user.email,
      details: { category }
    });
  } catch (error) {
    console.error("Failed to log admin action:", error);
  }
};
