import { NavLink, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

export default function DashboardLayout() {
  const [openHR, setOpenHR] = useState(true);
  const [openAccounts, setOpenAccounts] = useState(true);
  const [openProfile, setOpenProfile] = useState(false);
  const [openPlant, setOpenPlant] = useState(false);

  const [plants, setPlants] = useState([]);
  const [activePlant, setActivePlant] = useState(null);

  // ---------------- LOAD PLANTS ----------------
  useEffect(() => {
    fetch("http://localhost:5000/api/plants")
      .then((res) => res.json())
      .then((data) => {
        setPlants(data);
        const stored = localStorage.getItem("activePlant");
        if (stored) {
          setActivePlant(JSON.parse(stored));
        } else if (data.length > 0) {
          setActivePlant(data[0]);
          localStorage.setItem("activePlant", JSON.stringify(data[0]));
        }
      });
  }, []);

  const changePlant = (plant) => {
    setActivePlant(plant);
    localStorage.setItem("activePlant", JSON.stringify(plant));
    setOpenPlant(false);
  };

  const linkClass = ({ isActive }) =>
    `flex items-center px-4 py-2 rounded-lg transition-all ${
      isActive
        ? "bg-blue-600/20 text-blue-400"
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-950 text-white flex flex-col shadow-xl">
        <div className="px-6 py-4 text-xl font-bold border-b border-slate-700">
          ERP Melting Unit
        </div>

        <nav className="flex-1 px-3 py-4 space-y-6 text-sm">
          {/* OPERATIONS */}
          <div>
            <p className="px-4 mb-2 text-xs uppercase tracking-wider text-slate-400">
              Operations
            </p>

            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/inventory" className={linkClass}>
              Inventory
            </NavLink>
            <NavLink to="/batches" className={linkClass}>
              Batches
            </NavLink>
            <NavLink to="/plants" className={linkClass}>
              Plants / Units
            </NavLink>
          </div>

          {/* HR */}
          <div>
            <button
              onClick={() => setOpenHR(!openHR)}
              className="w-full flex justify-between items-center px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
            >
              <span>HR</span>
              <span>{openHR ? "▾" : "▸"}</span>
            </button>

            {openHR && (
              <div className="ml-3 mt-2 space-y-1">
                <NavLink to="/hr/employees" className={linkClass}>
                  Employees
                </NavLink>
                <NavLink to="/hr/attendance" className={linkClass}>
                  Attendance
                </NavLink>
                <NavLink to="/hr/payroll" className={linkClass}>
                  Payroll
                </NavLink>
              </div>
            )}
          </div>

          {/* ACCOUNTS */}
          <div>
            <button
              onClick={() => setOpenAccounts(!openAccounts)}
              className="w-full flex justify-between items-center px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
            >
              <span>Accounts</span>
              <span>{openAccounts ? "▾" : "▸"}</span>
            </button>

            {openAccounts && (
              <div className="ml-3 mt-2 space-y-1">
                <NavLink to="/accounts/sales" className={linkClass}>
                  Sales
                </NavLink>
                <NavLink to="/accounts/purchase" className={linkClass}>
                  Purchase
                </NavLink>
                <NavLink to="/accounts/reports" className={linkClass}>
                  Profit / Loss
                </NavLink>
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <div className="bg-white px-6 py-3 shadow flex justify-end items-center gap-4">
          {/* ACTIVE PLANT */}
          <div className="relative">
            <button
              onClick={() => setOpenPlant(!openPlant)}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-1.5 rounded-full text-sm font-medium"
            >
              <span className="text-gray-500">Active Plant ·</span>
              <span className="text-slate-900">
                {activePlant?.plant_name || "-"}
              </span>
              <span className="text-gray-400">▾</span>
            </button>

            {openPlant && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow border">
                {plants.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => changePlant(p)}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 ${
                      activePlant?.id === p.id
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : ""
                    }`}
                  >
                    {p.plant_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PROFILE */}
          <div className="relative">
            <button
              onClick={() => setOpenProfile(!openProfile)}
              className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold"
            >
              M
            </button>

            {openProfile && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow border">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  Manager
                </div>
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => {
                    localStorage.removeItem("loggedIn");
                    localStorage.removeItem("activePlant");
                    window.location.href = "/";
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
