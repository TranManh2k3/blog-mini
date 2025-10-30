// frontend/js/api.js
const BASE_URL = "http://localhost:3000/api";

function getToken() {
  return localStorage.getItem("token") || "";
}
function setToken(t) {
  localStorage.setItem("token", t);
}
function clearToken() {
  localStorage.removeItem("token");
}
function setUser(u) { 
  localStorage.setItem('user', JSON.stringify(u||{})); }
function getUser(){ try { return JSON.parse(localStorage.getItem('user')||'{}'); } catch { return {}; } }

async function api(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) headers["Authorization"] = "Bearer " + getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // trả về JSON hoặc throw để dễ debug
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${msg}`);
  }
  return res.json();
}

// Gắn ra window để các trang HTML gọi được
window.getToken = getToken;
window.setToken = setToken;
window.clearToken = clearToken;
window.api = api;
function getRole() { return localStorage.getItem("role") || ""; }
function setRole(r) { localStorage.setItem("role", r); }
window.getRole = getRole;
window.setRole = setRole;
