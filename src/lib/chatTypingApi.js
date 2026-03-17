// ===============================================
// FILE: src/lib/chatTypingApi.js
// (buat baru / sesuaikan dengan endpoint backend kamu)
// ===============================================
"use client";

const BASE_URL = "https://live-chat.uiii.ac.id";

const API_KEY = process.env.NEXT_PUBLIC_KEY || process.env.NEXT_PUBLIC_API_KEY || "";

function withKey(headers = {}) {
  return { ...(API_KEY ? { key: API_KEY } : {}), ...headers };
}

async function http(path, { method = "GET", token = "", body } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: withKey({
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Content-Type": "application/json",
    }),
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `HTTP ${res.status}`);
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return { ok: true };
}

/**
 * POST /chat/typing
 * body: { thread_id, is_typing }
 */
export async function setTyping({ token, thread_id, is_typing }) {
  if (!thread_id) return { ok: false };
  return http(`/chat/typing`, {
    method: "POST",
    token,
    body: { thread_id, is_typing: !!is_typing },
  });
}

/**
 * GET /chat/typing?thread_id=xxx
 * resp: { typing: [{ email, role, ts }] }
 */
export async function getTyping({ token, thread_id }) {
  if (!thread_id) return { typing: [] };
  const q = encodeURIComponent(thread_id);
  return http(`/chat/typing?thread_id=${q}`, { method: "GET", token });
}
