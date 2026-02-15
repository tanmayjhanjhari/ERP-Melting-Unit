import { useEffect, useState } from "react";

export default function Plants() {
  const [plants, setPlants] = useState([]);
  const [form, setForm] = useState({
    plant_code: "",
    plant_name: "",
    location: "",
  });

  // ---------------- LOAD PLANTS ----------------
  const loadPlants = () => {
    fetch("http://localhost:5000/api/plants")
      .then((res) => res.json())
      .then((data) => setPlants(data));
  };

  useEffect(() => {
    loadPlants();
  }, []);

  // ---------------- ADD PLANT ----------------
  const submitPlant = (e) => {
    e.preventDefault();

    fetch("http://localhost:5000/api/plants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).then(() => {
      setForm({ plant_code: "", plant_name: "", location: "" });
      loadPlants();
    });
  };

  // ---------------- DEACTIVATE ----------------
  const deactivatePlant = (id) => {
    if (!window.confirm("Deactivate this plant?")) return;

    fetch(`http://localhost:5000/api/plants/${id}/deactivate`, {
      method: "POST",
    }).then(() => loadPlants());
  };

  // ---------------- ACTIVATE ----------------
  const activatePlant = (id) => {
    fetch(`http://localhost:5000/api/plants/${id}/activate`, {
      method: "POST",
    }).then(() => loadPlants());
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Plants / Units</h1>

      {/* ADD PLANT */}
      <form
        onSubmit={submitPlant}
        className="bg-white p-4 rounded-xl shadow mb-6 grid grid-cols-4 gap-4"
      >
        <input
          className="border p-2 rounded"
          placeholder="Plant Code"
          value={form.plant_code}
          onChange={(e) =>
            setForm({ ...form, plant_code: e.target.value })
          }
          required
        />

        <input
          className="border p-2 rounded"
          placeholder="Plant Name"
          value={form.plant_name}
          onChange={(e) =>
            setForm({ ...form, plant_name: e.target.value })
          }
          required
        />

        <input
          className="border p-2 rounded"
          placeholder="Location"
          value={form.location}
          onChange={(e) =>
            setForm({ ...form, location: e.target.value })
          }
          required
        />

        <button className="bg-blue-600 text-white rounded">
          Add Plant
        </button>
      </form>

      {/* PLANTS TABLE */}
      <div className="bg-white rounded-xl shadow">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-3">Code</th>
              <th>Name</th>
              <th>Location</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {plants.map((p) => (
              <tr
                key={p.id}
                className={`border-b last:border-0 ${
                  p.status === "inactive" ? "bg-gray-100" : ""
                }`}
              >
                <td className="p-3 font-semibold">{p.plant_code}</td>
                <td>{p.plant_name}</td>
                <td>{p.location}</td>

                <td
                  className={`font-semibold ${
                    p.status === "active"
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {p.status}
                </td>

                <td>
                  {p.status === "active" ? (
                    <button
                      onClick={() => deactivatePlant(p.id)}
                      className="text-red-600 font-semibold hover:underline"
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => activatePlant(p.id)}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      Activate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {plants.length === 0 && (
          <p className="p-4 text-gray-500">No plants added yet</p>
        )}
      </div>
    </div>
  );
}
