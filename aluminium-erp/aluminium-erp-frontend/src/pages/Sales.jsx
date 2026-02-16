import { useEffect, useState } from "react";


export default function Sales() {
  const [sales, setSales] = useState([]);
  const [plants, setPlants] = useState([]);
  const [form, setForm] = useState({
    customer_name: "",
    plant_id: "",
    amount: "",
    sale_date: "",
  });
  const [openPlantForm, setOpenPlantForm] = useState(false);


  // ---------------- LOAD DATA ----------------
  const loadData = () => {
    fetch("http://localhost:5000/api/sales")
      .then((res) => res.json())
      .then(setSales);

    fetch("http://localhost:5000/api/plants")
      .then((res) => res.json())
      .then(setPlants);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ---------------- ADD SALE ----------------
  const submitSale = (e) => {
    e.preventDefault();

    fetch("http://localhost:5000/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_name: form.customer_name,
        plant_id: Number(form.plant_id),
        amount: Number(form.amount),
        sale_date: form.sale_date,
      }),
    }).then(() => {
      setForm({
        customer_name: "",
        plant_id: "",
        amount: "",
        sale_date: "",
      });
      loadData();
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Sales</h1>

      
      {/* ADD SALE FORM */}
      <form
        onSubmit={submitSale}
        className="bg-white p-4 rounded-xl shadow mb-6 grid grid-cols-5 gap-4"
      >
        <input
          className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Customer Name"
          value={form.customer_name}
          onChange={(e) =>
            setForm({ ...form, customer_name: e.target.value })
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
          value={form.sale_date}
          onChange={(e) =>
            setForm({ ...form, sale_date: e.target.value })
          }
          required
        />

        <button className="bg-blue-600 text-white rounded">
          Add Sale
        </button>
      </form>

      {/* SALES TABLE */}
      <div className="bg-white rounded-xl shadow">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-3">Invoice</th>
              <th>Customer</th>
              <th>Plant</th>
              <th>Date</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id} className="border-b last:border-0">
                <td className="p-3 font-semibold">{s.invoice_no}</td>
                <td>{s.customer_name}</td>
                <td>{s.plant_name}</td>
                <td>{s.sale_date}</td>
                <td className="font-semibold">₹ {s.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {sales.length === 0 && (
          <p className="p-4 text-gray-500">No sales recorded yet</p>
        )}
      </div>
    </div>
  );
}
