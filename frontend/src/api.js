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
