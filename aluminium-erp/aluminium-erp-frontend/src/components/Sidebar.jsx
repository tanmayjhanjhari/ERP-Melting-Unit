import { NavLink } from "react-router-dom";

const linkClass =
  "block px-4 py-2 rounded-md transition hover:bg-blue-600";

const activeClass =
  "bg-blue-600 font-semibold";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white p-5">
      <h1 className="text-xl font-bold mb-8">Aluminium ERP</h1>

      <nav className="space-y-2 text-sm">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/inventory"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          Inventory
        </NavLink>

        <NavLink
          to="/batches"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          Batches
        </NavLink>

        <div className="mt-6 text-gray-400 text-xs uppercase">Modules</div>

        <div className="px-4 py-2 text-gray-500">Plants / Units</div>
        <div className="px-4 py-2 text-gray-500">HR</div>
        <div className="px-4 py-2 text-gray-500">Accounts</div>
        <div className="px-4 py-2 text-gray-500">Sales</div>
        <div className="px-4 py-2 text-gray-500">Purchase</div>
      </nav>
    </aside>
  );
}
