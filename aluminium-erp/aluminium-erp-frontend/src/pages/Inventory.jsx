import { useEffect, useState } from "react";

export default function Inventory() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/inventory")
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Inventory</h1>

      <div className="bg-white rounded-xl shadow p-6">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">Item</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Min Level</th>
              <th>Status</th>
              <th>Cost / Unit</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="py-2">{item.item_name}</td>
                <td>{item.category}</td>
                <td>{item.quantity}</td>
                <td>{item.min_level}</td>
                <td>
                  {item.low_stock ? (
                    <span className="text-red-600 font-semibold">
                      Low Stock
                    </span>
                  ) : (
                    <span className="text-green-600 font-semibold">OK</span>
                  )}
                </td>
                <td>₹ {item.cost_per_unit}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {items.length === 0 && (
          <p className="text-gray-500 mt-4">No inventory available</p>
        )}
      </div>
    </div>
  );
}
