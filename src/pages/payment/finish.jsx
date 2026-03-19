// pages/payment/finish.jsx — Next.js Pages Router
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";

function resolveStatus(transactionStatus, statusCode) {
  if (!transactionStatus) return "loading";
  const s = transactionStatus.toLowerCase();
  if (["settlement", "capture"].includes(s)) return "success";
  if (["pending", "authorize"].includes(s)) return "pending";
  if (["deny", "cancel", "expire", "failure"].includes(s)) return "failed";
  if (statusCode === "407") return "fraud";
  return "unknown";
}

const STATUS_CONFIG = {
  success: {
    icon: "✓",
    iconBg: "#12B981",
    title: "Pendanaan berhasil!",
    desc: "Dana kamu sudah masuk ke escrow FondoFund dan sedang diproses.",
    badge: "Sukses",
    badgeColor: "#12B981",
  },
  pending: {
    icon: "⏳",
    iconBg: "#F59E0B",
    title: "Menunggu pembayaran",
    desc: "Selesaikan pembayaran sebelum batas waktu. Status akan diperbarui otomatis.",
    badge: "Pending",
    badgeColor: "#F59E0B",
  },
  failed: {
    icon: "✕",
    iconBg: "#EF4444",
    title: "Pembayaran gagal",
    desc: "Transaksi dibatalkan atau kadaluarsa. Kamu bisa mencoba kembali.",
    badge: "Gagal",
    badgeColor: "#EF4444",
  },
  fraud: {
    icon: "⚠",
    iconBg: "#EF4444",
    title: "Transaksi ditolak",
    desc: "Transaksi terdeteksi mencurigakan oleh sistem keamanan.",
    badge: "Ditolak",
    badgeColor: "#EF4444",
  },
  unknown: {
    icon: "?",
    iconBg: "#94A3B8",
    title: "Status tidak diketahui",
    desc: "Silakan cek riwayat transaksi kamu atau hubungi tim kami.",
    badge: "Unknown",
    badgeColor: "#94A3B8",
  },
  loading: {
    icon: "…",
    iconBg: "#0B2A3A",
    title: "Memuat status…",
    desc: "",
    badge: "",
    badgeColor: "#0B2A3A",
  },
};

const BRAND = { primary: "#0B2A3A", accent: "#12B981", soft: "#F3F7FA" };

export default function PaymentFinishPage() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  // ✅ Tunggu router.isReady — di Pages Router, query kosong saat SSR pertama
  const { order_id, transaction_status, status_code, fraud_status } =
    router.isReady ? router.query : {};

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const status = resolveStatus(transaction_status, status_code);
  const cfg = STATUS_CONFIG[status];

  const isSuccess = status === "success";
  const isFailed = ["failed", "fraud"].includes(status);
  const isPending = status === "pending";

  // ✅ Title sebagai string biasa — tidak pakai expression/array
  const pageTitle = "Status Pembayaran — FondoFund";

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          background: BRAND.soft,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 24,
            border: "1px solid rgba(0,0,0,0.08)",
            padding: "40px 36px",
            maxWidth: 480,
            width: "100%",
            textAlign: "center",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.4s ease, transform 0.4s ease",
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: cfg.iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: 28,
              color: "#fff",
              fontWeight: 900,
              transition: "background 0.3s",
            }}
          >
            {cfg.icon}
          </div>

          {/* Badge */}
          {cfg.badge && (
            <div
              style={{
                display: "inline-block",
                borderRadius: 999,
                padding: "3px 12px",
                fontSize: 11,
                fontWeight: 800,
                marginBottom: 12,
                background: `${cfg.badgeColor}18`,
                color: cfg.badgeColor,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {cfg.badge}
            </div>
          )}

          {/* Title */}
          <h1
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: BRAND.primary,
              margin: "0 0 8px",
              lineHeight: 1.3,
            }}
          >
            {cfg.title}
          </h1>

          {/* Description */}
          {cfg.desc && (
            <p
              style={{
                fontSize: 14,
                color: "#64748B",
                fontWeight: 500,
                margin: "0 0 28px",
                lineHeight: 1.6,
              }}
            >
              {cfg.desc}
            </p>
          )}

          {/* Detail rows */}
          {order_id && (
            <div
              style={{
                background: BRAND.soft,
                borderRadius: 14,
                padding: "14px 16px",
                marginBottom: 24,
                textAlign: "left",
              }}
            >
              <DetailRow label="Order ID" value={order_id} mono />
              {transaction_status && (
                <DetailRow label="Status transaksi" value={transaction_status} />
              )}
              {status_code && (
                <DetailRow label="Kode status" value={status_code} />
              )}
              {fraud_status && fraud_status !== "accept" && (
                <DetailRow label="Fraud status" value={fraud_status} warn />
              )}
            </div>
          )}

          {/* CTA buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {isSuccess && (
              <>
                <Link href="/dashboard/portfolio" legacyBehavior>
                  <a style={btnStyle(BRAND.primary, "#fff")}>
                    Lihat portofolio saya →
                  </a>
                </Link>
                <Link href="/listing" legacyBehavior>
                  <a style={btnStyle("transparent", BRAND.primary, true)}>
                    Jelajahi listing lain
                  </a>
                </Link>
              </>
            )}
            {isPending && (
              <>
                <Link href="/dashboard/transactions" legacyBehavior>
                  <a style={btnStyle(BRAND.primary, "#fff")}>
                    Cek status transaksi
                  </a>
                </Link>
                <Link href="/" legacyBehavior>
                  <a style={btnStyle("transparent", BRAND.primary, true)}>
                    Kembali ke beranda
                  </a>
                </Link>
              </>
            )}
            {isFailed && (
              <>
                <Link href="/listing" legacyBehavior>
                  <a style={btnStyle(BRAND.accent, "#fff")}>Coba lagi</a>
                </Link>
                <Link href="/dashboard/transactions" legacyBehavior>
                  <a style={btnStyle("transparent", BRAND.primary, true)}>
                    Riwayat transaksi
                  </a>
                </Link>
              </>
            )}
            {status === "unknown" && (
              <Link href="/dashboard/transactions" legacyBehavior>
                <a style={btnStyle(BRAND.primary, "#fff")}>
                  Cek riwayat transaksi
                </a>
              </Link>
            )}
          </div>
        </div>

        <p
          style={{
            marginTop: 20,
            fontSize: 12,
            color: "#94A3B8",
            fontWeight: 500,
            opacity: visible ? 1 : 0,
            transition: "opacity 0.5s ease 0.2s",
          }}
        >
          Ada masalah?{" "}
          <a
            href="mailto:support@fondofund.com"
            style={{ color: BRAND.accent, textDecoration: "none" }}
          >
            Hubungi support
          </a>
        </p>
      </div>
    </>
  );
}

function DetailRow({ label, value, mono, warn }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "5px 0",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
        gap: 8,
      }}
    >
      <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600 }}>
        {label}
      </span>
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: warn ? "#EF4444" : "#0B2A3A",
          fontFamily: mono ? "monospace" : "inherit",
          wordBreak: "break-all",
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function btnStyle(bg, color, outline = false) {
  return {
    display: "block",
    width: "100%",
    padding: "13px 0",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 800,
    textAlign: "center",
    textDecoration: "none",
    cursor: "pointer",
    background: bg,
    color,
    border: outline ? "1.5px solid rgba(11,42,58,0.15)" : "none",
    transition: "opacity 0.15s",
  };
}