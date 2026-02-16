import { useEffect, useState } from "react";

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showRefill, setShowRefill] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [form, setForm] = useState({
    item_name: "",
    category: "",
    quantity: "",
    cost_per_unit: "",
    min_level: "",
  });

  const [refill, setRefill] = useState({
    quantity: "",
    cost_per_unit: "",
  });

  // ---------------- LOAD INVENTORY ----------------
  const loadInventory = () => {
    fetch("http://localhost:5000/api/inventory")
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadInventory();
  }, []);

  // ---------------- ADD ITEM ----------------
  const addItem = (e) => {
    e.preventDefault();

    fetch("http://localhost:5000/api/inventory/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).then(() => {
      setForm({
        item_name: "",
        category: "",
        quantity: "",
        cost_per_unit: "",
        min_level: "",
      });
      setShowAdd(false);
      loadInventory();
    });
  };

  // ---------------- REFILL ITEM ----------------
  const refillItem = (e) => {
    e.preventDefault();

    fetch(
      `http://localhost:5000/api/inventory/${selectedItem.id}/refill`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(refill),
      }
    ).then(() => {
      setRefill({ quantity: "", cost_per_unit: "" });
      setSelectedItem(null);
      setShowRefill(false);
      loadInventory();
    });
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory</h1>

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium"
        >
          + Add Item
        </button>
      </div>

      {/* ADD ITEM FORM */}
      {showAdd && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Add Inventory Item</h2>

          <form
            onSubmit={addItem}
            className="grid grid-cols-5 gap-4"
          >
            <input
              className="border rounded-full px-4 py-2 text-sm"
              placeholder="Item Name"
              value={form.item_name}
              onChange={(e) =>
                setForm({ ...form, item_name: e.target.value })
              }
              required
            />

            <input
              className="border rounded-full px-4 py-2 text-sm"
              placeholder="Category"
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
              required
            />

            <input
              type="number"
              className="border rounded-full px-4 py-2 text-sm"
              placeholder="Quantity"
              value={form.quantity}
              onChange={(e) =>
                setForm({ ...form, quantity: e.target.value })
              }
              required
            />

            <input
              type="number"
              className="border rounded-full px-4 py-2 text-sm"
              placeholder="Cost / Unit"
              value={form.cost_per_unit}
              onChange={(e) =>
                setForm({
                  ...form,
                  cost_per_unit: e.target.value,
                })
              }
              required
            />

            <input
              type="number"
              className="border rounded-full px-4 py-2 text-sm"
              placeholder="Min Level"
              value={form.min_level}
              onChange={(e) =>
                setForm({ ...form, min_level: e.target.value })
              }
            />

            <button className="col-span-5 bg-green-600 hover:bg-green-700 text-white rounded-full py-2">
              Save Item
            </button>
          </form>
        </div>
      )}

      {/* INVENTORY TABLE */}
      <div className="bg-white rounded-xl shadow p-6">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-gray-600">
              <th>Item</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Min Level</th>
              <th>Status</th>
              <th>Cost / Unit</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="py-2 font-medium">
                  {item.item_name}
                </td>
                <td>{item.category}</td>
                <td>{item.quantity}</td>
                <td>{item.min_level}</td>
                <td>
                  {item.low_stock ? (
                    <span className="text-red-600 font-semibold">
                      Low
                    </span>
                  ) : (
                    <span className="text-green-600 font-semibold">
                      OK
                    </span>
                  )}
                </td>
                <td>₹ {item.cost_per_unit}</td>
                <td>
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setShowRefill(true);
                    }}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Refill
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {items.length === 0 && (
          <p className="text-gray-500 mt-4">
            No inventory available
          </p>
        )}
      </div>

      {/* REFILL MODAL */}
      {showRefill && selectedItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">
              Refill: {selectedItem.item_name}
            </h2>

            <form onSubmit={refillItem} className="space-y-4">
              <input
                type="number"
                className="border rounded-full px-4 py-2 w-full text-sm"
                placeholder="Add Quantity"
                value={refill.quantity}
                onChange={(e) =>
                  setRefill({
                    ...refill,
                    quantity: e.target.value,
                  })
                }
                required
              />

              <input
                type="number"
                className="border rounded-full px-4 py-2 w-full text-sm"
                placeholder="New Cost / Unit"
                value={refill.cost_per_unit}
                onChange={(e) =>
                  setRefill({
                    ...refill,
                    cost_per_unit: e.target.value,
                  })
                }
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRefill(false)}
                  className="px-4 py-2 text-sm"
                >
                  Cancel
                </button>

                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-sm">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
