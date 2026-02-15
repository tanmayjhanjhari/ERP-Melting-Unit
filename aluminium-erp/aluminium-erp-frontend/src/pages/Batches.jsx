import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/batches")
      .then((res) => res.json())
      .then((data) => {
        setBatches(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching batches:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-gray-600">
        Loading production batches...
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Production Batches</h1>

      <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="py-3">Batch</th>
              <th>Date</th>
              <th>Shift</th>
              <th>Status</th>
              <th className="text-right">Material Cost</th>
            </tr>
          </thead>

          <tbody>
            {batches.length === 0 && (
              <tr>
                <td colSpan="5" className="py-6 text-center text-gray-500">
                  No batches created yet
                </td>
              </tr>
            )}

            {batches.map((b) => (
              <tr
                key={b.id}
                className="border-b last:border-0 hover:bg-gray-50"
              >
                <td className="py-3 font-medium text-blue-600">
                  <Link
                    to={`/batches/${b.id}`}
                    className="hover:underline"
                  >
                    {b.batch_name}
                  </Link>
                </td>

                <td>{b.batch_date || "-"}</td>
                <td>{b.shift || "-"}</td>

                <td>
                  {b.status === "completed" ? (
                    <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-700 font-semibold">
                      Completed
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-700 font-semibold">
                      Cancelled
                    </span>
                  )}
                </td>

                <td className="text-right font-semibold">
                  ₹ {Number(b.material_cost).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
