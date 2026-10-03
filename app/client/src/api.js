let token = "";
export function setToken(value) {
  token = value ?? "";
}
export async function api(path, method = "GET", body) {
  const response = await fetch(`/api${path}`, {
    method,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) {
    const error = new Error(data.error ?? "Request failed");
    error.status = response.status;
    throw error;
  }
  return data;
}
