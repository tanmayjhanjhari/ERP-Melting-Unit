import { useEffect, useState } from "react";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [plants, setPlants] = useState([]);

  const [form, setForm] = useState({
    name: "",
    department: "",
    role: "",
    plant_id: "",
  });

  // dropdown control
  const [openPlantForm, setOpenPlantForm] = useState(false);
  const [openPlantRow, setOpenPlantRow] = useState(null);

  // ---------------- LOAD EMPLOYEES ----------------
  const loadEmployees = () => {
    fetch("http://localhost:5000/api/hr/employees")
      .then((res) => res.json())
      .then(setEmployees);
  };

  // ---------------- LOAD PLANTS ----------------
  const loadPlants = () => {
    fetch("http://localhost:5000/api/plants")
      .then((res) => res.json())
      .then(setPlants);
  };

  useEffect(() => {
    loadEmployees();
    loadPlants();
  }, []);

  // ---------------- ADD EMPLOYEE ----------------
  const submitEmployee = (e) => {
    e.preventDefault();

    fetch("http://localhost:5000/api/hr/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).then(() => {
      setForm({ name: "", department: "", role: "", plant_id: "" });
      setOpenPlantForm(false);
      loadEmployees();
    });
  };

  // ---------------- EXCEL UPLOAD ----------------
  const uploadExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    fetch("http://localhost:5000/api/hr/employees/upload-excel", {
      method: "POST",
      body: formData,
    }).then(loadEmployees);
  };

  // ---------------- STATUS ----------------
  const deactivateEmployee = (id) => {
    if (!window.confirm("Deactivate this employee?")) return;
    fetch(
      `http://localhost:5000/api/hr/employees/${id}/deactivate`,
      { method: "POST" }
    ).then(loadEmployees);
  };

  const activateEmployee = (id) => {
    fetch(
      `http://localhost:5000/api/hr/employees/${id}/activate`,
      { method: "POST" }
    ).then(loadEmployees);
  };

  // ---------------- CHANGE PLANT ----------------
  const changePlant = (empId, plant) => {
    fetch(
      `http://localhost:5000/api/hr/employees/${empId}/change-plant`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plant_id: plant.id }),
      }
    ).then(() => {
      setOpenPlantRow(null);
      loadEmployees();
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Employees</h1>

      {/* UPLOAD */}
      <div className="flex gap-4 mb-6">
        <label className="bg-green-600 text-white px-4 py-2 rounded-lg cursor-pointer">
          Upload Excel
          <input
            type="file"
            accept=".xlsx,.xls"
            hidden
            onChange={uploadExcel}
          />
        </label>
      </div>

      {/* ADD EMPLOYEE */}
      <form
        onSubmit={submitEmployee}
        className="bg-white p-4 rounded-xl shadow mb-6 grid grid-cols-5 gap-4"
      >
        <input
          className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <input
          className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Department"
          value={form.department}
          onChange={(e) =>
            setForm({ ...form, department: e.target.value })
          }
          required
        />

        <input
          className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Role"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
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
              ? plants.find((p) => p.id === Number(form.plant_id))
                  ?.plant_name
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

        <button className="bg-blue-600 text-white rounded-lg">
          Add Employee
        </button>
      </form>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-3">Emp Code</th>
              <th>Name</th>
              <th>Department</th>
              <th>Role</th>
              <th>Plant</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((e) => (
              <tr
                key={e.id}
                className={`border-b ${
                  e.status === "inactive" ? "bg-gray-50" : ""
                }`}
              >
                <td className="p-3 font-semibold">{e.emp_code}</td>
                <td>{e.name}</td>
                <td>{e.department}</td>
                <td>{e.role}</td>

                {/* PLANT CHANGE (PILL) */}
                <td className="relative">
                  <button
                    onClick={() =>
                      setOpenPlantRow(
                        openPlantRow === e.id ? null : e.id
                      )
                    }
                    className="bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full text-sm"
                  >
                    {plants.find((p) => p.id === e.plant_id)
                      ?.plant_name || "-"}{" "}
                    ▾
                  </button>

                  {openPlantRow === e.id && (
                    <div className="absolute z-10 mt-2 w-40 bg-white rounded-xl shadow border">
                      {plants.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => changePlant(e.id, p)}
                          className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 ${
                            e.plant_id === p.id
                              ? "bg-blue-50 text-blue-600 font-semibold"
                              : ""
                          }`}
                        >
                          {p.plant_name}
                        </button>
                      ))}
                    </div>
                  )}
                </td>

                <td
                  className={`font-semibold ${
                    e.status === "active"
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {e.status}
                </td>

                <td>
                  {e.status === "active" ? (
                    <button
                      onClick={() => deactivateEmployee(e.id)}
                      className="text-red-600 hover:underline"
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => activateEmployee(e.id)}
                      className="text-green-600 hover:underline"
                    >
                      Activate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {employees.length === 0 && (
          <p className="p-4 text-gray-500">No employees added yet</p>
        )}
      </div>
    </div>
  );
}
