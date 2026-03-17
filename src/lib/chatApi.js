const BASE_URL = "https://live-chat.uiii.ac.id";

const API_KEY =
  process.env.NEXT_PUBLIC_API_KEY ||
  process.env.NEXT_PUBLIC_KEY ||
  process.env.NEXT_PUBLIC_CLIENT_KEY ||
  "";

// helper: semua request bawa header key (kalau ada)
export function withKey(headers = {}) {
  return API_KEY ? { key: API_KEY, ...headers } : { ...headers };
}

export function getBaseUrl() {
  return BASE_URL;
}

export function getApiKey() {
  return API_KEY;
}

export async function getGeo() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    return {
      ip: data.ip,
      country: data.country_name || data.country || "",
      countryCode: data.country_code || "",
    };
  } catch {
    return { ip: "", country: "", countryCode: "" };
  }
}

export async function authGuestLogin(email) {
  const geo = await getGeo();
  const res = await fetch(`${BASE_URL}/auth/guest`, {
    method: "POST",
    headers: withKey({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      email: (email || "").trim(),
      ip: geo.ip,
      country: geo.country,
    }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.detail || body.message || "Login failed");
  return body; // { access_token: "..." }
}

// ✅ FIX: jangan silent fail, lempar error biar controller bisa tampilkan pesan
export async function fetchTypes(accessToken, { signal } = {}) {
  const res = await fetch(`${BASE_URL}/chat/types`, {
    signal,
    headers: withKey({ Authorization: `Bearer ${accessToken}` }),
  });

  const j = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(j.detail || j.message || `Failed to load categories (${res.status})`);
  }
  return j.types || [];
}

export async function fetchDefaultQuestions(category, { signal } = {}) {
  const res = await fetch(
    `${BASE_URL}/chat/default-question?category=${encodeURIComponent(category)}`,
    { signal, headers: withKey() }
  );
  const j = await res.json().catch(() => ({}));
  return j.questions || [];
}

export async function fetchChatHistory(accessToken, { signal } = {}) {
  const res = await fetch(`${BASE_URL}/chat/history`, {
    signal,
    headers: withKey({ Authorization: `Bearer ${accessToken}` }),
  });

  if (!res.ok) return null;
  return await res.json().catch(() => null);
}

export async function sendChatMessage(accessToken, payload, { signal } = {}) {
  const res = await fetch(`${BASE_URL}/chat/send`, {
    method: "POST",
    signal,
    headers: withKey({
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    }),
    body: JSON.stringify(payload),
  });

  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.detail || j.message || "Failed to send message");
  return j;
}

export async function fetchFeedbackStatus(accessToken, { signal } = {}) {
  try {
    const res = await fetch(`${BASE_URL}/chat/feedback/status`, {
      signal,
      headers: withKey({ Authorization: `Bearer ${accessToken}` }),
    });
    if (!res.ok) return false;
    const j = await res.json().catch(() => ({}));
    return !!j.submitted;
  } catch {
    return false;
  }
}

export async function submitFeedbackApi(accessToken, rating, description, { signal } = {}) {
  const res = await fetch(`${BASE_URL}/chat/feedback`, {
    method: "POST",
    signal,
    headers: withKey({
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    }),
    body: JSON.stringify({
      rating,
      description: (description || "").trim() || null,
    }),
  });

  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.detail || j.message || "Failed to submit feedback");
  return j;
}
