import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function BatchDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/batch/${id}`)
      .then((res) => res.json())
      .then((res) => setData(res))
      .catch((err) => console.error(err));
  }, [id]);

  if (!data) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Batch: {data.batch.batch_name}
      </h1>

      <div className="mb-6">
        <p><b>Date:</b> {data.batch.batch_date}</p>
        <p><b>Shift:</b> {data.batch.shift}</p>
        <p><b>Status:</b> {data.batch.status}</p>
        <p><b>Total Cost:</b> ₹ {data.batch.material_cost}</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Materials Used</h2>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">Material</th>
              <th>Quantity Used</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            {data.materials.map((m, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="py-2">{m.item_name}</td>
                <td>{m.quantity_used}</td>
                <td>₹ {m.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
