"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import StatsSection from "@/components/admin/StatsSection";
import DashboardChart from "@/components/admin/DashboardChart";
import RecentUsers from "@/components/admin/RecentUsers";
import RecentProperties from "@/components/admin/RecentProperties";

export default function AdminDashboard() {
  const router = useRouter();

  const [users, setUsers] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    fetchUsers();
    fetchProperties();
  }, []);

  async function fetchUsers() {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      const res = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      console.log("Users API:", data);

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        router.replace("/login");
        return;
      }

      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error(data.message);
        setUsers([]);
      }
    } catch (error) {
      console.error(error);
      setUsers([]);
    }
  }

  async function fetchProperties() {
    try {
      const res = await fetch("/api/properties");

      const data = await res.json();

      console.log("Properties API:", data);

      if (Array.isArray(data)) {
        setProperties(data);
      } else {
        setProperties([]);
      }
    } catch (error) {
      console.error(error);
      setProperties([]);
    }
  }

  const totalAgents = users.filter(
    (user) => user.role === "AGENT"
  ).length;

  const availableProperties = properties.filter(
    (property) => property.status === "AVAILABLE"
  ).length;

  return (
    <div className="flex min-h-screen bg-gray-100">

      <AdminSidebar />

      <div className="flex-1 p-8">

        <AdminTopbar />

        <div className="mt-8">

          <StatsSection
            totalUsers={users.length}
            totalProperties={properties.length}
            totalAgents={totalAgents}
            availableProperties={availableProperties}
          />

        </div>

        <div className="grid lg:grid-cols-2 gap-8 mt-10">

          <DashboardChart />

          <RecentUsers users={users} />

        </div>

        <div className="mt-8">

          <RecentProperties properties={properties} />

        </div>

      </div>

    </div>
  );
}