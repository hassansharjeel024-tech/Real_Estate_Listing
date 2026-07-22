"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    fetchAgents();
  }, []);

  async function fetchAgents() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        const onlyAgents = data.filter(
          (user: any) => user.role === "AGENT"
        );

        setAgents(onlyAgents);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">

      <AdminSidebar />

      <div className="flex-1 p-8">

        <AdminTopbar />

        <div className="flex justify-between items-center mt-8 mb-6">
          <h1 className="text-3xl font-bold">
            All Agents
          </h1>

          <Link
            href="/admin"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg"
          >
            Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">

          <table className="w-full">

            <thead className="bg-green-600 text-white">
              <tr>
                <th className="p-4 text-left">ID</th>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Role</th>
              </tr>
            </thead>

            <tbody>

              {agents.map((agent) => (

                <tr
                  key={agent.id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-4">{agent.id}</td>
                  <td className="p-4">{agent.name}</td>
                  <td className="p-4">{agent.email}</td>

                  <td className="p-4">
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                      {agent.role}
                    </span>
                  </td>
                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}