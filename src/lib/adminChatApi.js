"use client";

/* ================== CONFIG ================== */
export const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_CHAT_BASE_URL ||
  "https://live-chat.uiii.ac.id";

export const AUTH_API_BASE = "https://api-live.uiii.ac.id/api";

export const API_KEY =
  process.env.NEXT_PUBLIC_API_KEY ||
  process.env.NEXT_PUBLIC_KEY ||
  process.env.NEXT_PUBLIC_CLIENT_KEY ||
  "";

/** only attach "key" header if exists */
export function withKey(headers = {}) {
  return API_KEY ? { key: API_KEY, ...headers } : { ...headers };
}

/* ================== COOKIE HELPERS ================== */
export function getCookie(name) {
  if (typeof document === "undefined") return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift() || "";
  return "";
}

/* ================== AUTH API SERVICE ================== */
export async function apiService(method, endpoint, { data, headers = {}, signal } = {}) {
  const url = `${AUTH_API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const config = {
    method,
    signal,
    headers: {
      "Content-Type": "application/json",
      ...withKey({}),
      ...headers,
    },
  };

  if (data) config.body = JSON.stringify(data);

  const response = await fetch(url, config);
  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    const msg = responseData.message || responseData.detail || "API request failed";
    const e = new Error(msg);
    e.status = response.status;
    throw e;
  }
  return responseData;
}

/* ================== AUTH: PROFILE ================== */
export async function fetchAdminProfile(token) {
  return apiService("GET", "/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/* ================== CHAT APIs ================== */
export async function fetchClients(token, { signal } = {}) {
  const res = await fetch(`${BASE_URL}/chat/clients`, {
    signal,
    headers: withKey({ Authorization: `Bearer ${token}` }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err.detail || err.message || "Failed to fetch clients";
    const e = new Error(msg);
    e.status = res.status;
    throw e;
  }

  const data = await res.json().catch(() => []);
  return (data || []).map((c) => ({
    ...c,
    thread_id: c.thread_id || c.threadId || "",
    unread_count: c.unread_count ?? c.unreadCount ?? 0,
    lastMessage: c.lastMessage ?? c.last_message ?? "",
    lastMessageTime: c.lastMessageTime ?? c.last_message_time ?? "",
  }));
}

export async function fetchHistory(
  token,
  { user2, thread_id, limit = 80, before_id, after_id, signal } = {}
) {
  const params = new URLSearchParams();

  if (user2) params.set("user2", user2);
  if (thread_id) params.set("thread_id", thread_id);

  if (limit) params.set("limit", String(limit));
  if (before_id) params.set("before_id", before_id);
  if (after_id) params.set("after_id", after_id);

  const res = await fetch(`${BASE_URL}/chat/history?${params.toString()}`, {
    signal,
    headers: withKey({ Authorization: `Bearer ${token}` }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err.detail || err.message || "Failed to fetch history";
    const e = new Error(msg);
    e.status = res.status;
    throw e;
  }

  return await res.json().catch(() => []);
}

export async function markRead(token, senderEmail) {
  const res = await fetch(`${BASE_URL}/chat/mark-read`, {
    method: "POST",
    headers: withKey({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    body: JSON.stringify({ senderEmail }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err.detail || err.message || "Failed to mark read";
    const e = new Error(msg);
    e.status = res.status;
    throw e;
  }

  return await res.json().catch(() => ({}));
}

export async function sendAdminMessage(token, recipient_email, text, thread_id = "") {
  const res = await fetch(`${BASE_URL}/chat/send`, {
    method: "POST",
    headers: withKey({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    body: JSON.stringify({
      recipient_email,
      text,
      mode: "admin",
      thread_id: thread_id || null,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err.detail || err.message || "Failed to send message";
    const e = new Error(msg);
    e.status = res.status;
    throw e;
  }

  return await res.json().catch(() => ({}));
}

export async function deleteClientHistory(token, email) {
  const res = await fetch(`${BASE_URL}/chat/clients/${encodeURIComponent(email)}`, {
    method: "DELETE",
    headers: withKey({ Authorization: `Bearer ${token}` }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err.detail || err.message || "Failed to delete client";
    const e = new Error(msg);
    e.status = res.status;
    throw e;
  }

  return await res.json().catch(() => ({}));
}
