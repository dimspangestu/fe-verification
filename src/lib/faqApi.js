// src/lib/faqApi.js
"use client";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const API_KEY =
  process.env.NEXT_PUBLIC_API_KEY ||
  process.env.NEXT_PUBLIC_KEY ||
  process.env.NEXT_PUBLIC_CLIENT_KEY ||
  "";

export function withKey(headers = {}) {
  return API_KEY ? { key: API_KEY, ...headers } : { ...headers };
}

async function safeJson(res) {
  const txt = await res.text().catch(() => "");
  try {
    return txt ? JSON.parse(txt) : {};
  } catch {
    return { raw: txt };
  }
}

function errFrom(res, data) {
  const msg =
    data?.detail ||
    data?.message ||
    (typeof data?.raw === "string" ? data.raw : "") ||
    `HTTP ${res.status}`;
  const e = new Error(msg);
  e.status = res.status;
  e.data = data;
  return e;
}

// ======== FAQ APIs ========

// GET /faq/categories
export async function fetchFaqCategories({ signal } = {}) {
  const res = await fetch(`${BASE_URL}/faq/categories`, {
    method: "GET",
    headers: { ...withKey(), Accept: "application/json" },
    signal,
  });
  const j = await safeJson(res);
  if (!res.ok) throw errFrom(res, j);
  return Array.isArray(j.categories) ? j.categories : [];
}

// GET /faq/?category=Admissions
export async function fetchFaqList({ category, signal } = {}) {
  const url = category
    ? `${BASE_URL}/faq/?category=${encodeURIComponent(category)}`
    : `${BASE_URL}/faq/`;

  const res = await fetch(url, {
    method: "GET",
    headers: { ...withKey(), Accept: "application/json" },
    signal,
  });

  const j = await safeJson(res);
  if (!res.ok) throw errFrom(res, j);
  return Array.isArray(j) ? j : [];
}

// POST /faq/
export async function createFaq({ token, payload, signal } = {}) {
  const res = await fetch(`${BASE_URL}/faq/`, {
    method: "POST",
    headers: {
      ...withKey(),
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload || {}),
    signal,
  });

  const j = await safeJson(res);
  if (!res.ok) throw errFrom(res, j);
  return j;
}

// PUT /faq/{id}
export async function updateFaq({ token, id, payload, signal } = {}) {
  const res = await fetch(`${BASE_URL}/faq/${id}`, {
    method: "PUT",
    headers: {
      ...withKey(),
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload || {}),
    signal,
  });

  const j = await safeJson(res);
  if (!res.ok) throw errFrom(res, j);
  return j;
}

// DELETE /faq/{id}
export async function deleteFaq({ token, id, signal } = {}) {
  const res = await fetch(`${BASE_URL}/faq/${id}`, {
    method: "DELETE",
    headers: {
      ...withKey(),
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal,
  });

  const j = await safeJson(res);
  if (!res.ok) throw errFrom(res, j);
  return j;
}
