import { useEffect, useState } from "react";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/dashboard")
      .then((res) => res.json())
      .then((result) => setData(result))
      .catch((err) => console.error(err));
  }, []);

  if (!data) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

      {/* STATS CARDS */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <Card title="Inventory Items" value={data.inventory_count} />
        <Card title="Active Batches" value={data.active_batches} />
        <Card title="Low Stock Items" value={data.low_stock} />
        <Card title="Employees" value={data.employee_count} />
      </div>

      {/* RECENT BATCHES */}
      <div className="bg-white rounded-xl p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Recent Batches</h2>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">Batch</th>
              <th>Date</th>
              <th>Shift</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            {data.recent_batches.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-4 text-gray-500">
                  No recent batches
                </td>
              </tr>
            ) : (
              data.recent_batches.map((b, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2">{b.batch_name}</td>
                  <td>{b.batch_date || "-"}</td>
                  <td>{b.shift || "-"}</td>
                  <td>₹ {b.material_cost}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}
