"use client";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Props {
  users: User[];
}

export default function RecentUsers({ users }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 h-[400px] overflow-auto">

      <h2 className="text-2xl font-bold mb-6">
        Recent Users
      </h2>

      <table className="w-full">

        <thead>

          <tr className="border-b">

            <th className="text-left py-3">Name</th>

            <th className="text-left py-3">Email</th>

            <th className="text-left py-3">Role</th>

          </tr>

        </thead>

        <tbody>

          {users.map((user) => (

            <tr
              key={user.id}
              className="border-b hover:bg-gray-50 transition"
            >

              <td className="py-4 font-medium">
                {user.name}
              </td>

              <td>{user.email}</td>

              <td>

                <span
                  className={`px-3 py-1 rounded-full text-white text-sm

                  ${
                    user.role === "ADMIN"
                      ? "bg-red-500"
                      : user.role === "AGENT"
                      ? "bg-green-600"
                      : "bg-blue-600"
                  }`}
                >
                  {user.role}
                </span>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}