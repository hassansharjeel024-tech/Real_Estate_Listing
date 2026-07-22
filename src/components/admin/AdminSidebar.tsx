"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  UserCog,
  LogOut,
  House,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const menu = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      href: "/admin",
    },
    {
      title: "Properties",
      icon: <Building2 size={20} />,
      href: "/properties",
    },
    {
      title: "Users",
      icon: <Users size={20} />,
      href: "/admin/users",
    },
    {
      title: "Agents",
      icon: <UserCog size={20} />,
      href: "/admin/agents",
    },
  ];

  return (
    <aside className="w-72 bg-slate-900 text-white min-h-screen flex flex-col">

      {/* Logo */}

      <div className="p-6 border-b border-slate-700">

        <div className="flex items-center gap-3">

          <House size={32} className="text-blue-400" />

          <div>

            <h1 className="text-2xl font-bold">
              EstatePro
            </h1>

            <p className="text-sm text-gray-400">
              Admin Panel
            </p>

          </div>

        </div>

      </div>

      {/* Menu */}

      <div className="flex-1 p-5">

        {menu.map((item) => (

          <Link
            key={item.title}
            href={item.href}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl mb-3 transition

            ${
              pathname === item.href
                ? "bg-blue-600"
                : "hover:bg-slate-800"
            }`}
          >
            {item.icon}

            <span>{item.title}</span>

          </Link>

        ))}

      </div>

      {/* Logout */}

      <div className="p-5 border-t border-slate-700">

        <button
          className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 py-3 rounded-xl"
        >
          <LogOut size={18} />

          Logout

        </button>

      </div>

    </aside>
  );
}