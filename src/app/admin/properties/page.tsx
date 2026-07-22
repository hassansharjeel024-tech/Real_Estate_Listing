"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    fetchProperties();
  }, []);

  async function fetchProperties() {
    try {
      const res = await fetch("/api/properties");
      const data = await res.json();
      setProperties(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteProperty(id: number) {
    const confirmDelete = confirm(
      "Are you sure you want to delete this property?"
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        fetchProperties();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">

      <AdminSidebar />

      <div className="flex-1 p-8">

        <AdminTopbar />

        <div className="flex justify-between items-center mt-8 mb-6">
          <h1 className="text-3xl font-bold">
            All Properties
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

            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Title</th>
                <th className="p-4">City</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>

              {properties.map((property) => (

                <tr
                  key={property.id}
                  className="border-b text-center hover:bg-gray-50"
                >
                  <td className="p-4">{property.id}</td>

                  <td className="p-4">
                    {property.title}
                  </td>

                  <td className="p-4">
                    {property.city}
                  </td>

                  <td className="p-4">
                    PKR {property.price}
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-white text-sm ${
                        property.status === "AVAILABLE"
                          ? "bg-green-600"
                          : "bg-red-600"
                      }`}
                    >
                      {property.status}
                    </span>
                  </td>

                  <td className="p-4 flex justify-center gap-3">

                    <Link
                      href={`/agent/edit-property/${property.id}`}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => deleteProperty(property.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg"
                    >
                      Delete
                    </button>

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