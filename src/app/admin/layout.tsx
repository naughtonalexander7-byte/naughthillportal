import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import PortalShell from "@/components/PortalShell";

const NAV_ITEMS = [
  { href: "/admin", label: "Clients" },
  { href: "/admin/invoices", label: "All Invoices" },
  { href: "/admin/xero", label: "Xero Connection" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/dashboard");

  return (
    <PortalShell
      navItems={NAV_ITEMS}
      userLabel={profile.full_name || "Admin"}
      roleLabel="Staff"
    >
      {children}
    </PortalShell>
  );
}
