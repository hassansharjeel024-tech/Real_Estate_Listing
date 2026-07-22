"use client";

interface Property {
  id: number;
  title: string;
  city: string;
  price: number;
  status: string;
}

interface Props {
  properties: Property[];
}

export default function RecentProperties({
  properties,
}: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">

      <h2 className="text-2xl font-bold mb-6">
        Recent Properties
      </h2>

      <div className="space-y-4">

        {properties.map((property) => (

          <div
            key={property.id}
            className="flex items-center justify-between border rounded-xl p-4 hover:bg-gray-50 transition"
          >

            {/* Left */}

            <div className="flex items-center gap-4">

              <img
                src="/images/house1.jpg"
                alt={property.title}
                className="w-20 h-20 rounded-lg object-cover"
              />

              <div>

                <h3 className="font-bold text-lg">
                  {property.title}
                </h3>

                <p className="text-gray-500">
                  📍 {property.city}
                </p>

                <p className="text-blue-600 font-semibold">
                  PKR {Number(property.price).toLocaleString()}
                </p>

              </div>

            </div>

            {/* Status */}

            <span
              className={`px-4 py-2 rounded-full text-white text-sm font-semibold

              ${
                property.status === "AVAILABLE"
                  ? "bg-green-600"
                  : property.status === "SOLD"
                  ? "bg-red-600"
                  : "bg-yellow-500"
              }`}
            >
              {property.status}
            </span>

          </div>

        ))}

      </div>

    </div>
  );
}