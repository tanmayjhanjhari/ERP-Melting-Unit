import { useEffect, useState } from "react";

export default function Payroll() {
  const [employees, setEmployees] = useState([]);
  const [plants, setPlants] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState("all");
   const [openEmployeeForm, setOpenEmployeeForm] = useState(false);

  const [form, setForm] = useState({
    emp_id: "",
    month: "", // YYYY-MM
    basic_salary: "",
    deductions: "",
  });

  // ---------------- LOAD DATA ----------------
  const loadData = () => {
    fetch("http://localhost:5000/api/hr/employees")
      .then((res) => res.json())
      .then(setEmployees);

    fetch("http://localhost:5000/api/payroll")
      .then((res) => res.json())
      .then(setPayroll)
      .catch(() => setPayroll([]));

    fetch("http://localhost:5000/api/plants")
      .then((res) => res.json())
      .then(setPlants);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ---------------- GENERATE PAYROLL ----------------
  const submitPayroll = (e) => {
    e.preventDefault();

    const [year, month] = form.month.split("-");

    fetch("http://localhost:5000/api/payroll/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emp_id: Number(form.emp_id),
        month: month,
        year: Number(year),
        basic_salary: Number(form.basic_salary),
        deductions: Number(form.deductions || 0),
      }),
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          alert("ERROR: " + (data.error || "Unknown error"));
          return;
        }

        alert(
          `Payroll generated successfully\n\nPayable days: ${data.payable_days}\nNet Salary: ₹${data.net_salary}`
        );

        setForm({
          emp_id: "",
          month: "",
          basic_salary: "",
          deductions: "",
        });

        loadData();
      })
      .catch(() => {
        alert("Server error. Check backend.");
      });
  };

  // ---------------- FILTER BY PLANT ----------------
  const filteredPayroll =
    selectedPlant === "all"
      ? payroll
      : payroll.filter((p) => p.plant_id == selectedPlant);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Payroll</h1>

      {/* GENERATE PAYROLL */}
      <form
        onSubmit={submitPayroll}
        className="bg-white p-4 rounded-xl shadow mb-6 grid grid-cols-5 gap-4"
      >
         {/* EMPLOYEE SELECT (PILL) */}
<div className="relative">
  <button
    type="button"
    onClick={() => setOpenEmployeeForm(!openEmployeeForm)}
    className="w-full flex justify-between items-center bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full text-sm"
  >
    {form.employee_id
      ? employees.find(e => e.id === Number(form.employee_id))
          ?.name
      : "Select Employee"}
    <span>▾</span>
  </button>

  {openEmployeeForm && (
    <div className="absolute z-10 mt-2 w-full bg-white rounded-xl shadow border">
      {employees.map((e) => (
        <button
          key={e.id}
          type="button"
          onClick={() => {
            setForm({ ...form, employee_id: e.id });
            setOpenEmployeeForm(false);
          }}
          className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-100"
        >
          {e.emp_code} – {e.name}
        </button>
      ))}
    </div>
  )}
</div>

        <input
          type="month"
          className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500"
          value={form.month}
          onChange={(e) => setForm({ ...form, month: e.target.value })}
          required
        />

        <input
          type="number"
          className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Basic Salary"
          value={form.basic_salary}
          onChange={(e) =>
            setForm({ ...form, basic_salary: e.target.value })
          }
          required
        />

        <input
          type="number"
          className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Deductions"
          value={form.deductions}
          onChange={(e) =>
            setForm({ ...form, deductions: e.target.value })
          }
        />

        <button className="bg-blue-600 text-white rounded">
          Generate
        </button>
      </form>

      {/* PLANT FILTER */}
      <div className="mb-4">
        <select
          className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedPlant}
          onChange={(e) => setSelectedPlant(e.target.value)}
        >
          <option value="all">All Plants</option>
          {plants.map((p) => (
            <option key={p.id} value={p.id}>
              {p.plant_name}
            </option>
          ))}
        </select>
      </div>

      {/* PAYROLL TABLE */}
      <div className="bg-white rounded-xl shadow">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-3">Emp</th>
              <th>Month</th>
              <th>Payable Days</th>
              <th>Basic</th>
              <th>Deductions</th>
              <th>Net Pay</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayroll.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="p-3 font-semibold">{p.emp_code}</td>
                <td>{p.month}-{p.year}</td>
                <td>{p.payable_days}</td>
                <td>₹{p.basic_salary}</td>
                <td>₹{p.deductions}</td>
                <td className="font-bold">₹{p.net_salary}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPayroll.length === 0 && (
          <p className="p-4 text-gray-500">No payroll found</p>
        )}
      </div>
    </div>
  );
}
