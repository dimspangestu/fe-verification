// src/components/pd/pdStore.js
// LocalStorage-based store (demo). Admin bisa lihat list penerima + investor
// SELAMA masih di browser yang sama.
//
// Keys:
// - auth_session        : session user login
// - pd_projects         : pengajuan/project penerima dana
// - pd_users            : user registry (penerima + investor)
// - pd_verify_queue     : antrian verifikasi admin (penerima + investor)

export const PD_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "ongoing", label: "On Going (After Submit)" },
  { value: "accepted", label: "Accepted" },
  { value: "negosiasi", label: "Negosiasi" },
  { value: "reject", label: "Reject" },
  { value: "final_project", label: "Final Project (Deal Investor)" },
  { value: "closed", label: "Closed" },
];

export const EDITABLE_STATUSES = new Set(["draft", "ongoing"]);

const KEY_PROJECTS = "pd_projects";
const KEY_SESSION = "auth_session";
const KEY_USERS = "pd_users";
const KEY_VERIFY = "pd_verify_queue";

// =========================
// UTIL
// =========================
function safeJSONParse(s, fallback) {
  try {
    return JSON.parse(s);
  } catch {
    return fallback;
  }
}

function nowISO() {
  return new Date().toISOString();
}

function uid(prefix = "u") {
  return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`;
}

export function rupiah(n) {
  const num = Number(n || 0);
  if (Number.isNaN(num)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
}

// =========================
// SESSION
// =========================
export function readSession() {
  if (typeof window === "undefined") return null;
  return safeJSONParse(localStorage.getItem(KEY_SESSION) || "null", null);
}

export function writeSession(data) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_SESSION, JSON.stringify(data));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY_SESSION);
}

// =========================
// USERS (PENERIMA + INVESTOR)
// =========================
// user schema:
// {
//   id, role: "admin" | "penerima" | "investor",
//   email, name, companyName,
//   verified: boolean,
//   createdAt
// }
export function readUsers() {
  if (typeof window === "undefined") return [];
  return safeJSONParse(localStorage.getItem(KEY_USERS) || "[]", []);
}

export function writeUsers(arr) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_USERS, JSON.stringify(arr || []));
}

export function upsertUser(user) {
  const list = readUsers();
  const email = String(user?.email || "").toLowerCase();
  const idx = list.findIndex((u) => String(u.email || "").toLowerCase() === email);

  const next = {
    id: user?.id || (idx >= 0 ? list[idx].id : uid("u")),
    role: user?.role || (idx >= 0 ? list[idx].role : "penerima"),
    email: user?.email,
    name: user?.name || user?.companyName || "User",
    companyName: user?.companyName || "",
    verified: Boolean(user?.verified ?? (idx >= 0 ? list[idx].verified : false)),
    createdAt: user?.createdAt || (idx >= 0 ? list[idx].createdAt : nowISO()),
    updatedAt: nowISO(),
  };

  if (idx >= 0) list[idx] = { ...list[idx], ...next };
  else list.push(next);

  writeUsers(list);
  return next;
}

export function findUserByEmail(email) {
  const list = readUsers();
  const e = String(email || "").toLowerCase();
  return list.find((u) => String(u.email || "").toLowerCase() === e) || null;
}

export function setUserVerified(userId, verified) {
  const list = readUsers();
  const idx = list.findIndex((u) => u.id === userId);
  if (idx < 0) return null;
  list[idx] = { ...list[idx], verified: Boolean(verified), updatedAt: nowISO() };
  writeUsers(list);
  return list[idx];
}

// =========================
// VERIFY QUEUE (ADMIN)
// =========================
// item schema:
// {
//   id, type: "penerima" | "investor",
//   userId, email, name, companyName,
//   status: "pending" | "approved" | "rejected",
//   note, createdAt, updatedAt
// }
export function readVerifyQueue() {
  if (typeof window === "undefined") return [];
  return safeJSONParse(localStorage.getItem(KEY_VERIFY) || "[]", []);
}

export function writeVerifyQueue(arr) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_VERIFY, JSON.stringify(arr || []));
}

export function pushVerifyRequest({ type, user }) {
  const q = readVerifyQueue();
  const item = {
    id: uid("ver"),
    type: type === "investor" ? "investor" : "penerima",
    userId: user?.id,
    email: user?.email,
    name: user?.name || user?.companyName || "User",
    companyName: user?.companyName || "",
    status: "pending",
    note: "",
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  q.unshift(item);
  writeVerifyQueue(q);
  return item;
}

export function approveVerifyRequest(verifyId, note = "") {
  const q = readVerifyQueue();
  const idx = q.findIndex((x) => x.id === verifyId);
  if (idx < 0) return null;

  const item = q[idx];
  q[idx] = { ...item, status: "approved", note, updatedAt: nowISO() };
  writeVerifyQueue(q);

  // set user verified
  if (item.userId) setUserVerified(item.userId, true);

  return q[idx];
}

export function rejectVerifyRequest(verifyId, note = "") {
  const q = readVerifyQueue();
  const idx = q.findIndex((x) => x.id === verifyId);
  if (idx < 0) return null;

  const item = q[idx];
  q[idx] = { ...item, status: "rejected", note, updatedAt: nowISO() };
  writeVerifyQueue(q);

  // user tetap ada, tapi verified false
  if (item.userId) setUserVerified(item.userId, false);

  return q[idx];
}

export function getPendingVerifyList(type /* "penerima" | "investor" | "all" */ = "all") {
  const q = readVerifyQueue();
  const t = String(type || "all");
  return q.filter((x) => {
    const okType = t === "all" ? true : x.type === t;
    return okType && x.status === "pending";
  });
}

// =========================
// PROJECTS (PENERIMA DANA)
// =========================
export function readProjects() {
  if (typeof window === "undefined") return [];
  return safeJSONParse(localStorage.getItem(KEY_PROJECTS) || "[]", []);
}

export function writeProjects(arr) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_PROJECTS, JSON.stringify(arr || []));
}

export function getStatusLabel(status) {
  return PD_STATUSES.find((s) => s.value === status)?.label || status;
}

// =========================
// SEED DUMMY DATA (optional)
// =========================
export function seedIfEmpty(user) {
  if (typeof window === "undefined") return;

  // seed users minimal (admin + demo penerima + demo investor)
  const users = readUsers();
  if (users.length === 0) {
    const admin = upsertUser({
      id: "admin-001",
      role: "admin",
      email: "admin@demo.com",
      name: "Admin",
      companyName: "Admin Panel",
      verified: true,
    });

    const penerima = upsertUser({
      id: "pd-001",
      role: "penerima",
      email: user?.email || "penerima@demo.com",
      name: user?.companyName || "Penerima Dana Demo",
      companyName: user?.companyName || "PT Penerima Dana Sejahtera",
      verified: false,
    });

    const investor = upsertUser({
      id: "inv-001",
      role: "investor",
      email: "investor@demo.com",
      name: "Investor Demo",
      companyName: "PT Investor Makmur",
      verified: false,
    });

    // masuk queue verifikasi
    const q = readVerifyQueue();
    if (q.length === 0) {
      pushVerifyRequest({ type: "penerima", user: penerima });
      pushVerifyRequest({ type: "investor", user: investor });
    }

    // biar ga unused
    void admin;
  }

  // seed projects
  const existing = readProjects();
  if (existing.length > 0) return;

  const uidUser = user?.id || "pd-001";
  const email = user?.email || "penerima@demo.com";
  const company = user?.companyName || "PT Penerima Dana Sejahtera";

  const now = new Date();
  const mkISO = (y, m, d) => new Date(y, m, d, 10, 0, 0).toISOString();

  const seed = [
    {
      project: {
        id: "prj-seed-001",
        projectNameOrCode: "PROJ-001",
        recipientName: company,
        projectType: "infrastruktur",
        projectTypeOther: "",
        dealingStatus: "sudah_kesepakatan_awal",
        fundingNeeded: 2500000000,
        tenorMonths: 12,
        fixedReturnPct: 18,
        submittedAt: mkISO(now.getFullYear(), now.getMonth() - 3, 8),
        createdBy: { userId: uidUser, email, companyName: company },
      },
      documents: [
        { type: "proposal", fileName: "proposal.pdf", mime: "application/pdf", size: 351020 },
        { type: "rab", fileName: "rab.xlsx", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 812331 },
      ],
      investorOffers: [],
      status: "final_project",
      statusHistory: [
        { at: mkISO(now.getFullYear(), now.getMonth() - 3, 8), status: "ongoing", note: "Submitted" },
        { at: mkISO(now.getFullYear(), now.getMonth() - 2, 2), status: "accepted", note: "Approved by admin" },
        { at: mkISO(now.getFullYear(), now.getMonth() - 1, 15), status: "final_project", note: "Deal with investor" },
      ],
    },
    {
      project: {
        id: "prj-seed-002",
        projectNameOrCode: "PROJ-002",
        recipientName: company,
        projectType: "umkm",
        projectTypeOther: "",
        dealingStatus: "sudah_kesepakatan_awal",
        fundingNeeded: 450000000,
        tenorMonths: 6,
        fixedReturnPct: 12,
        submittedAt: mkISO(now.getFullYear(), now.getMonth() - 1, 20),
        createdBy: { userId: uidUser, email, companyName: company },
      },
      documents: [
        { type: "proposal", fileName: "ringkasan.docx", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 120220 },
        { type: "rab", fileName: "rab.pdf", mime: "application/pdf", size: 502001 },
      ],
      investorOffers: [],
      status: "ongoing",
      statusHistory: [{ at: mkISO(now.getFullYear(), now.getMonth() - 1, 20), status: "ongoing", note: "Submitted" }],
    },
    {
      project: {
        id: "prj-seed-003",
        projectNameOrCode: "PROJ-003",
        recipientName: company,
        projectType: "properti",
        projectTypeOther: "",
        dealingStatus: "sudah_kesepakatan_awal",
        fundingNeeded: 1800000000,
        tenorMonths: 10,
        fixedReturnPct: 16,
        submittedAt: null,
        createdBy: { userId: uidUser, email, companyName: company },
      },
      documents: [],
      investorOffers: [],
      status: "draft",
      statusHistory: [{ at: mkISO(now.getFullYear(), now.getMonth(), 1), status: "draft", note: "Draft created" }],
    },
  ];

  writeProjects(seed);
}

// =========================
// CHART AGGREGATION
// =========================
export function getFinalProjectHistory(projects) {
  const map = new Map(); // key: YYYY-MM
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    map.set(key, 0);
  }

  (projects || []).forEach((p) => {
    if (p?.status !== "final_project") return;
    const at = p?.project?.submittedAt ? new Date(p.project.submittedAt) : null;
    if (!at || Number.isNaN(at.getTime())) return;
    const key = `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, "0")}`;
    if (map.has(key)) map.set(key, map.get(key) + 1);
  });

  return Array.from(map.entries()).map(([month, value]) => ({ month, value }));
}

// ============================
// INVESTOR OFFERS (ke project)
// ============================
// offer: { investorId, investorName, investorEmail, amount, note, at }
export function addInvestorOffer(projectId, offer, { autoNegosiasi = true } = {}) {
  const list = readProjects();
  const idx = list.findIndex((x) => x?.project?.id === projectId);
  if (idx < 0) throw new Error("Project not found");

  const row = list[idx];
  const offers = Array.isArray(row.investorOffers) ? [...row.investorOffers] : [];

  const existingIdx = offers.findIndex((o) => o?.investorId && o.investorId === offer.investorId);
  if (existingIdx >= 0) offers[existingIdx] = { ...offers[existingIdx], ...offer };
  else offers.push(offer);

  let nextStatus = row.status || "ongoing";
  const shouldMove =
    autoNegosiasi &&
    (nextStatus === "draft" || nextStatus === "ongoing" || nextStatus === "accepted");

  if (shouldMove) nextStatus = "negosiasi";

  list[idx] = {
    ...row,
    status: nextStatus,
    investorOffers: offers,
    statusHistory: [
      ...(row.statusHistory || []),
      ...(shouldMove ? [{ at: offer.at, status: "negosiasi", note: "Auto: investor offer received" }] : []),
      { at: offer.at, status: nextStatus, note: `Investor offer: Rp ${Number(offer.amount || 0)}` },
    ],
  };

  writeProjects(list);
  return list[idx];
}

export function getInvestorOffer(projectRow, investorId) {
  const offers = Array.isArray(projectRow?.investorOffers) ? projectRow.investorOffers : [];
  return offers.find((o) => o?.investorId === investorId) || null;
}

export function getAllInvestorOffers(projectRow) {
  return Array.isArray(projectRow?.investorOffers) ? projectRow.investorOffers : [];
}