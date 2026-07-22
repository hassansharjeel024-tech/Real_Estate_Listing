"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminTopbar() {
  const router = useRouter();

  function handleLogout() {
    // Remove JWT token
    localStorage.removeItem("token");

    // Show success message
    toast.success("Logged out successfully!");

    // Redirect immediately to login page
    window.location.href = "/login";
  }

  return (
    <div className="flex justify-between items-center bg-white p-5 rounded-xl shadow-lg">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Admin Dashboard
        </h1>

        <p className="text-gray-500 mt-1">
          Welcome back, Admin
        </p>
      </div>

      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition duration-300"
      >
        Logout
      </button>
    </div>
  );
}