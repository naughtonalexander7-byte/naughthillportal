"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export type ActionState = { error?: string; success?: string };

export async function inviteClient(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const email = String(formData.get("email") ?? "").trim();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const companyName = String(formData.get("company_name") ?? "").trim();

  if (!email) return { error: "Email is required." };

  const admin = createAdminClient();
  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`;

  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName || null, company_name: companyName || null },
    redirectTo,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");
  return { success: `Invited ${email}.` };
}

export async function updateClient(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const xeroContactId = String(formData.get("xero_contact_id") ?? "");
  const role = String(formData.get("role") ?? "client");

  if (!id) return { error: "Missing client id." };
  if (!["client", "admin"].includes(role)) return { error: "Invalid role." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({
      xero_contact_id: xeroContactId || null,
      role,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/clients/${id}`);
  return { success: "Saved." };
}
