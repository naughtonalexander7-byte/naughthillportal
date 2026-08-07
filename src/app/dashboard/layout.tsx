import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import PortalShell from "@/components/PortalShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  return (
    <PortalShell
      navItems={[{ href: "/dashboard", label: "Invoices" }]}
      userLabel={profile.company_name || profile.full_name || "Client"}
      roleLabel="Client"
    >
      {children}
    </PortalShell>
  );
}
