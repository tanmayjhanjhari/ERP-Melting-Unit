import { useEffect, useState } from "react";

export default function Purchase() {
  const [purchases, setPurchases] = useState([]);
  const [plants, setPlants] = useState([]);
  const [form, setForm] = useState({
    vendor_name: "",
    plant_id: "",
    amount: "",
    purchase_date: "",
  });
const [openPlantForm, setOpenPlantForm] = useState(false);

  // ---------------- LOAD DATA ----------------
  const loadData = () => {
    fetch("http://localhost:5000/api/purchase")
      .then((res) => res.json())
      .then(setPurchases);

    fetch("http://localhost:5000/api/plants")
      .then((res) => res.json())
      .then(setPlants);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ---------------- ADD PURCHASE ----------------
  const submitPurchase = (e) => {
    e.preventDefault();

    fetch("http://localhost:5000/api/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendor_name: form.vendor_name,
        plant_id: Number(form.plant_id),
        amount: Number(form.amount),
        purchase_date: form.purchase_date,
      }),
    }).then(() => {
      setForm({
        vendor_name: "",
        plant_id: "",
        amount: "",
        purchase_date: "",
      });
      loadData();
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Purchase</h1>

      {/* ADD PURCHASE FORM */}
      <form
        onSubmit={submitPurchase}
        className="bg-white p-4 rounded-xl shadow mb-6 grid grid-cols-5 gap-4"
      >
        <input
          className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Vendor Name"
          value={form.vendor_name}
          onChange={(e) =>
            setForm({ ...form, vendor_name: e.target.value })
          }
          required
        />

        {/* PLANT SELECT (PILL) */}
<div className="relative">
  <button
    type="button"
    onClick={() => setOpenPlantForm(!openPlantForm)}
    className="w-full flex justify-between items-center bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full text-sm"
  >
    {form.plant_id
      ? plants.find((p) => p.id === Number(form.plant_id))?.plant_name
      : "Select Plant"}
    <span>▾</span>
  </button>

  {openPlantForm && (
    <div className="absolute z-10 mt-2 w-full bg-white rounded-xl shadow border">
      {plants.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => {
            setForm({ ...form, plant_id: p.id });
            setOpenPlantForm(false);
          }}
          className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-100"
        >
          {p.plant_name}
        </button>
      ))}
    </div>
  )}
</div>


        <input
          type="number"
          className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) =>
            setForm({ ...form, amount: e.target.value })
          }
          required
        />

        <input
          type="date"
          className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500"
          value={form.purchase_date}
          onChange={(e) =>
            setForm({ ...form, purchase_date: e.target.value })
          }
          required
        />

        <button className="bg-blue-600 text-white rounded">
          Add Purchase
        </button>
      </form>

      {/* PURCHASE TABLE */}
      <div className="bg-white rounded-xl shadow">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-3">Vendor</th>
              <th>Plant</th>
              <th>Date</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="p-3 font-semibold">{p.vendor_name}</td>
                <td>{p.plant_name}</td>
                <td>{p.purchase_date}</td>
                <td className="font-semibold">₹ {p.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {purchases.length === 0 && (
          <p className="p-4 text-gray-500">No purchases recorded yet</p>
        )}
      </div>
    </div>
  );
}
