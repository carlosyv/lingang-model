const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`Request to ${path} failed: ${res.status}`);
  }
  return res.json();
}

export function getCountries() {
  return request("/countries");
}

export function getCountryMatches(countryId) {
  return request(`/countries/${countryId}/matches`);
}

export async function addCountry(name, region) {
  const res = await fetch(`${API_BASE}/countries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, region }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request to /countries failed: ${res.status}`);
  }
  return res.json();
}
