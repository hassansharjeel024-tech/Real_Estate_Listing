"use client";

import {
  Users,
  Building2,
  UserCog,
  Home,
} from "lucide-react";

import StatsCard from "./StatsCard";

interface Props {
  totalUsers: number;
  totalProperties: number;
  totalAgents: number;
  availableProperties: number;
}

export default function StatsSection({
  totalUsers,
  totalProperties,
  totalAgents,
  availableProperties,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

      <StatsCard
        title="Total Users"
        value={totalUsers}
        icon={<Users size={32} className="text-white" />}
        color="bg-blue-600"
      />

      <StatsCard
        title="Total Properties"
        value={totalProperties}
        icon={<Building2 size={32} className="text-white" />}
        color="bg-green-600"
      />

      <StatsCard
        title="Total Agents"
        value={totalAgents}
        icon={<UserCog size={32} className="text-white" />}
        color="bg-purple-600"
      />

      <StatsCard
        title="Available Properties"
        value={availableProperties}
        icon={<Home size={32} className="text-white" />}
        color="bg-orange-500"
      />

    </div>
  );
}