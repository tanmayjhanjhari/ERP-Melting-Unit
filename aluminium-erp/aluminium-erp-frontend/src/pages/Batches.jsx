import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [openShift, setOpenShift] = useState(false);


  const [form, setForm] = useState({
    batch_name: "",
    batch_date: "",
    shift: "",
    materials: {}, // { inventoryId: quantity }
  });

  // ---------------- LOAD DATA ----------------
  const loadData = () => {
    Promise.all([
      fetch("http://localhost:5000/api/batches").then(r => r.json()),
      fetch("http://localhost:5000/api/inventory").then(r => r.json()),
    ])
      .then(([batchesData, inventoryData]) => {
        setBatches(batchesData || []);
        setInventory(inventoryData || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // ---------------- MATERIAL CHANGE ----------------
  const updateMaterial = (id, qty) => {
    setForm(prev => ({
      ...prev,
      materials: {
        ...prev.materials,
        [id]: qty,
      },
    }));
  };

  // ---------------- CREATE BATCH ----------------
  const submitBatch = (e) => {
    e.preventDefault();

    const body = new URLSearchParams({
      batch_name: form.batch_name,
      batch_date: form.batch_date,
      shift: form.shift,
    });

    Object.entries(form.materials).forEach(([id, qty]) => {
      if (qty > 0) body.append(`material_${id}`, qty);
    });

    fetch("http://localhost:5000/batch", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    })
      .then(() => {
        setForm({ batch_name: "", batch_date: "", shift: "", materials: {} });
        setShowCreate(false);
        loadData();
      })
      .catch(console.error);
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Loading batches...</div>;
  }

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Production Batches</h1>

        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm"
        >
          {showCreate ? "Close" : "Create Batch"}
        </button>
      </div>

      {/* CREATE BATCH */}
      {showCreate && (
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Create New Batch</h2>

          <form onSubmit={submitBatch} className="space-y-6">
            {/* BASIC INFO */}
            <div className="grid grid-cols-4 gap-4">
              <input
                className="bg-slate-100 px-4 py-2 rounded-full outline-none"
                placeholder="Batch Name"
                value={form.batch_name}
                onChange={e => setForm({ ...form, batch_name: e.target.value })}
                required
              />

              <input
                type="date"
                className="bg-slate-100 px-4 py-2 rounded-full outline-none"
                value={form.batch_date}
                onChange={e => setForm({ ...form, batch_date: e.target.value })}
              />

              {/* SHIFT DROPDOWN (PILL STYLE) */}
<div className="relative">
  <button
    type="button"
    onClick={() => setOpenShift(!openShift)}
    className="w-full flex justify-between items-center bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full text-sm"
  >
    {form.shift || "Shift"}
    <span>▾</span>
  </button>

  {openShift && (
    <div className="absolute z-10 mt-2 w-full bg-white rounded-xl shadow border">
      {["Shift A", "Shift B", "Shift C"].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => {
            setForm({ ...form, shift: s });
            setOpenShift(false);
          }}
          className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-100"
        >
          {s}
        </button>
      ))}
    </div>
  )}
</div>


              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white rounded-full"
              >
                Save Batch
              </button>
            </div>

            {/* MATERIALS */}
            <div>
              <h3 className="font-semibold mb-3">Materials Used</h3>

              <div className="grid grid-cols-2 gap-4">
                {inventory.map(item => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center bg-slate-50 rounded-xl px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">{item.item_name}</p>
                      <p className="text-xs text-gray-500">
                        Available: {item.quantity}
                      </p>
                    </div>

                    <input
                      type="number"
                      min="0"
                      max={item.quantity}
                      placeholder="Qty"
                      className="w-24 bg-white border rounded-full px-3 py-1 text-sm"
                      onChange={e =>
                        updateMaterial(item.id, Number(e.target.value))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>
      )}

      {/* BATCH LIST */}
      <div className="bg-white rounded-xl shadow p-6">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-gray-600">
              <th>Batch</th>
              <th>Date</th>
              <th>Shift</th>
              <th>Status</th>
              <th className="text-right">Cost</th>
            </tr>
          </thead>
          <tbody>
            {batches.map(b => (
              <tr key={b.id} className="border-b last:border-0">
                <td className="py-3 text-blue-600 font-medium">
                  <Link to={`/batches/${b.id}`} className="hover:underline">
                    {b.batch_name}
                  </Link>
                </td>
                <td>{b.batch_date || "-"}</td>
                <td>{b.shift || "-"}</td>
                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      b.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="text-right font-semibold">
                  ₹ {Number(b.material_cost || 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {batches.length === 0 && (
          <p className="text-center text-gray-500 py-6">
            No batches created yet
          </p>
        )}
      </div>
    </div>
  );
}
