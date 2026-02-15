import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState,  } from "react";

import Login from "./auth/Login";
import DashboardLayout from "./layouts/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Batches from "./pages/Batches";
import BatchDetails from "./pages/BatchDetails";
import Employees from "./pages/Employees";
import Plants from "./pages/Plants";
import Attendance from "./pages/Attendance";
import Payroll from "./pages/Payroll";
import Sales from "./pages/Sales";
import Purchase from "./pages/Purchase";
import Profit from "./pages/Profit";





function App() {
   const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("loggedIn") === "true";
  });

  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login
                onLogin={() => {
                  localStorage.setItem("loggedIn", "true");
                  setIsLoggedIn(true);
                }}
              />
            )
          }
        />

        {/* PROTECTED ERP LAYOUT */}
        <Route
          element={
            isLoggedIn ? <DashboardLayout /> : <Navigate to="/" />
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/batches" element={<Batches />} />
          <Route path="/batches/:id" element={<BatchDetails />} />
          <Route path="/hr/employees" element={<Employees />} />
          <Route path="/plants" element={<Plants />} />
          <Route path="/hr/attendance" element={<Attendance />} />
          <Route path="/hr/payroll" element={<Payroll />} />
          <Route path="/accounts/sales" element={<Sales />} />
          <Route path="/accounts/purchase" element={<Purchase />} />
          <Route path="/accounts/reports" element={<Profit />} />



        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
