export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const getToken = () =>
  typeof window === "undefined" ? null : localStorage.getItem("token");

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || "Something went wrong");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
