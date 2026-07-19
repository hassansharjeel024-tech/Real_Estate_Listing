import { Building2, Inbox, LayoutDashboard, PlusCircle, UserRound } from "lucide-react";
import { Sidebar, type NavItem } from "@/components/layout/sidebar";
import { requireRole } from "@/lib/auth";

const NAV: NavItem[] = [
  { href: "/dashboard/agent", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/dashboard/agent/properties/new", label: "Add property", icon: <PlusCircle className="h-4 w-4" /> },
  { href: "/dashboard/agent/inquiries", label: "Inquiries", icon: <Inbox className="h-4 w-4" /> },
  { href: "/dashboard/agent/profile", label: "Profile", icon: <UserRound className="h-4 w-4" /> },
];
export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  // Middleware already checked the JWT; this re-check catches deactivated accounts.
  const agent = await requireRole("AGENT");

  return (
    <div className="container-page flex flex-col gap-8 py-8 md:flex-row">
      <Sidebar heading="Agent" items={NAV} />
      <div className="min-w-0 flex-1">
        <p className="mb-4 flex items-center gap-1.5 text-xs text-muted">
          <Building2 className="h-3.5 w-3.5" /> Signed in as {agent.name}
        </p>
        {children}
      </div>
    </div>
  );
}
