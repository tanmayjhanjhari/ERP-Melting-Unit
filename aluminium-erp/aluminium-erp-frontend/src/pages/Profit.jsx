import { useEffect, useState } from "react";

export default function Profit() {
  const [plants, setPlants] = useState([]);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({
    plant_id: "",
    month: "",
  });
const [openPlantForm, setOpenPlantForm] = useState(false);
  useEffect(() => {
    fetch("http://localhost:5000/api/plants")
      .then(res => res.json())
      .then(setPlants);
  }, []);

  const generateProfit = (e) => {
    e.preventDefault();

    const [year, month] = form.month.split("-");

    fetch("http://localhost:5000/api/accounts/profit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plant_id: Number(form.plant_id),
        month,
        year: Number(year),
      }),
    })
      .then(res => res.json())
      .then(setResult);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Profit / Loss</h1>

      {/* FILTER */}
      <form
        onSubmit={generateProfit}
        className="bg-white p-4 rounded-xl shadow mb-6 grid grid-cols-3 gap-4"
      >
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
          type="month"
          className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500"
          value={form.month}
          onChange={(e) =>
            setForm({ ...form, month: e.target.value })
          }
          required
        />

        <button className="bg-blue-600 text-white rounded">
          Generate
        </button>
      </form>

      {/* RESULT */}
      {result && (
        <div className="grid grid-cols-4 gap-6">
          <Card title="Sales" value={result.sales} />
          <Card title="Purchases" value={result.purchases} />
          <Card title="Payroll" value={result.payroll} />
          <Card
            title="Net Profit"
            value={result.profit}
            highlight
          />
        </div>
      )}
    </div>
  );
}

function Card({ title, value, highlight }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <p
        className={`text-3xl font-bold mt-2 ${
          highlight
            ? value >= 0
              ? "text-green-600"
              : "text-red-600"
            : ""
        }`}
      >
        ₹ {value}
      </p>
    </div>
  );
}
