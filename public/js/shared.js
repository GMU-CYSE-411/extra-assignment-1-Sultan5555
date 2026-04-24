let csrfToken = null;

async function getCsrfToken() {
  if (csrfToken) {
    return csrfToken;
  }

  const response = await fetch("/api/csrf-token", {
    credentials: "same-origin"
  });
  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  csrfToken = data.csrfToken;
  return csrfToken;
}
async function api(path, options = {}) {
  const method = options.method || "GET";
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (method !== "GET") {
    const token = await getCsrfToken();
    if (token) {
      headers["X-CSRF-Token"] = token;
    }
  }

  const response = await fetch(path, {
    headers,
    credentials: "same-origin",
    ...options
  });
  const isJson = (response.headers.get("content-type") || "").includes("application/json");
  const body = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof body === "object" && body && body.error ? body.error : response.statusText;
    throw new Error(message);
  }
  return body;
}

async function loadCurrentUser() {
  const data = await api("/api/me");
  return data.user;
}

function writeJson(elementId, value) {
  const target = document.getElementById(elementId);
  if (target) {
    target.textContent = JSON.stringify(value, null, 2);
  }
}
