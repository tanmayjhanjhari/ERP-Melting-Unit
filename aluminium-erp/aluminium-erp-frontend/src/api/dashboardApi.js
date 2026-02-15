const BASE_URL = "http://127.0.0.1:5000";

export async function fetchInventoryCount() {
  const res = await fetch(`${BASE_URL}/api/inventory`);
  const data = await res.json();
  return data.length;
}

export async function fetchBatchCount() {
  const res = await fetch(`${BASE_URL}/api/batches`);
  const data = await res.json();
  return data.length;
}

export async function fetchPlantCount() {
  const res = await fetch(`${BASE_URL}/api/plants`);
  const data = await res.json();
  return data.length;
}
