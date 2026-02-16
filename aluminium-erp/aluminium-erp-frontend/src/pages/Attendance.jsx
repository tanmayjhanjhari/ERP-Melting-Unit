import { useEffect, useState } from "react";

export default function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({
    employee_id: "",
    date: "",
    status: "Present",
  });
  const [openEmployeeForm, setOpenEmployeeForm] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);


  // Load employees
  const loadEmployees = () => {
    fetch("http://localhost:5000/api/hr/employees")
      .then((res) => res.json())
      .then((data) => setEmployees(data.filter(e => e.status === "active")));
  };

  // Load attendance
  const loadAttendance = () => {
    fetch("http://localhost:5000/api/hr/attendance")
      .then((res) => res.json())
      .then((data) => setRecords(data));
  };

  useEffect(() => {
    loadEmployees();
    loadAttendance();
  }, []);

  // Submit attendance
  const submitAttendance = (e) => {
    e.preventDefault();

    fetch("http://localhost:5000/api/hr/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).then(() => {
      setForm({ employee_id: "", date: "", status: "Present" });
      loadAttendance();
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Attendance</h1>

      {/* UPLOAD ATTENDANCE EXCEL */}
<div className="mb-6">
  <label className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg cursor-pointer text-sm font-medium">
    Upload Attendance Excel
    <input
      type="file"
      accept=".xlsx,.xls"
      hidden
      onChange={(e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        fetch("http://localhost:5000/api/hr/attendance/upload-excel", {
          method: "POST",
          body: formData,
        })
          .then((res) => res.json())
          .then(() => {
            alert("Attendance uploaded successfully");
            loadAttendance(); // ⚠️ must exist
          });
      }}
    />
  </label>
</div>


      {/* ADD ATTENDANCE */}
      <form
        onSubmit={submitAttendance}
        className="bg-white p-4 rounded-xl shadow mb-6 grid grid-cols-4 gap-4"
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
          type="date"
          className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500"
          value={form.date}
          onChange={(e) =>
            setForm({ ...form, date: e.target.value })
          }
          required
        />

        {/* STATUS SELECT (PILL) */}
<div className="relative">
  <button
    type="button"
    onClick={() => setOpenStatus(!openStatus)}
    className="w-full flex justify-between items-center bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full text-sm"
  >
    {form.status || "Select Status"}
    <span>▾</span>
  </button>

  {openStatus && (
    <div className="absolute z-10 mt-2 w-full bg-white rounded-xl shadow border">
      {["Present", "Absent", "Half-day"].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => {
            setForm({ ...form, status: s });
            setOpenStatus(false);
          }}
          className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-100"
        >
          {s}
        </button>
      ))}
    </div>
  )}
</div>


        <button className="bg-blue-600 text-white rounded">
          Mark Attendance
        </button>
      </form>

      {/* ATTENDANCE TABLE */}
      <div className="bg-white rounded-xl shadow">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-3">Date</th>
              <th>Emp Code</th>
              <th>Name</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="p-3">{r.date}</td>
                <td>{r.emp_code}</td>
                <td>{r.name}</td>
                <td
                  className={`font-semibold ${
                    r.status === "Present"
                      ? "text-green-600"
                      : r.status === "Half-day"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {r.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {records.length === 0 && (
          <p className="p-4 text-gray-500">No attendance marked yet</p>
        )}
      </div>
    </div>
  );
}
