import { Building2, Inbox, LayoutDashboard, Settings, ShieldCheck, UserRound, Users } from "lucide-react";
import { Sidebar, type NavItem } from "@/components/layout/sidebar";
import { requireRole } from "@/lib/auth";

const NAV: NavItem[] = [
  { href: "/dashboard/admin", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/dashboard/admin/properties", label: "Listings", icon: <Building2 className="h-4 w-4" /> },
  { href: "/dashboard/admin/agents", label: "Agents", icon: <Users className="h-4 w-4" /> },
  { href: "/dashboard/admin/buyers", label: "Buyers", icon: <UserRound className="h-4 w-4" /> },
  { href: "/dashboard/admin/inquiries", label: "Inquiries", icon: <Inbox className="h-4 w-4" /> },
  { href: "/dashboard/admin/profile", label: "Profile", icon: <Settings className="h-4 w-4" /> },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireRole("ADMIN");

  return (
    <div className="container-page flex flex-col gap-8 py-8 md:flex-row">
      <Sidebar heading="Admin" items={NAV} />
      <div className="min-w-0 flex-1">
        <p className="mb-4 flex items-center gap-1.5 text-xs text-muted">
          <ShieldCheck className="h-3.5 w-3.5" /> Signed in as {admin.name}
        </p>
        {children}
      </div>
    </div>
  );
}
