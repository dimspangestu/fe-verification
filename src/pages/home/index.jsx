// pages/home/HomeSection.jsx
import React, { useMemo } from "react";
import Head from "next/head";

import TopNav from "./sections/TopNav";
import Hero from "./sections/Hero";
import Trust from "./sections/Trust";
import Flow from "./sections/Flow";
import Features from "./sections/Features";
import WhyFondoFund from "./sections/WhyFondoFund";
import Pricing from "./sections/Pricing";
import FAQ from "./sections/FAQ";
import CTA from "./sections/CTA";
import Footer from "./sections/Footer";

const BRAND = {
  name: "FondoFund",
  domain: "fondofund.com",
  primary: "#0B2A3A",
  accent: "#12B981",
  soft: "#F3F7FA",
};

export default function HomeSection() {
  const stats = useMemo(
    () => [
      { k: "3 Pihak Terhubung", v: "Customer • Verifikator • Investor", note: "alur end-to-end" },
      { k: "Audit Trail", v: "100%", note: "aksi & keputusan tercatat" },
      { k: "Status Verifikasi", v: "Approve / Revision / Reject", note: "transparan" },
    ],
    []
  );

  const flowSteps = useMemo(
    () => ({
      customer: [
        { t: "Daftar & Isi Profil Bisnis", d: "Lengkapi profil usaha untuk listing pendanaan." },
        { t: "Submit Dokumen Usaha", d: "KTP, selfie, legalitas, laporan usaha, dll." },
        { t: "KYC & Listing Review", d: "Masuk antrian verifikasi FondoFund." },
      ],
      verifikator: [
        { t: "Identity Check", d: "KTP • Selfie • NPWP (opsional)." },
        { t: "Business Review", d: "Legalitas • Laporan Usaha • Validasi data." },
        { t: "Risk Assessment", d: "Scoring & Fraud Check." },
      ],
      investor: [
        { t: "Daftar & Top Up Saldo", d: "KYC wallet + funding balance." },
        { t: "Pilih & Danai Customer", d: "Pilih listing yang sudah lolos verifikasi." },
        { t: "KYC & Wallet Review", d: "Review kepatuhan + transaksi." },
      ],
    }),
    []
  );

  const features = useMemo(
    () => [
      { icon: "shield", title: "Compliance-First Verification", desc: "FondoFund memastikan verifikasi sesuai SOP: identitas, bisnis, dan risiko." },
      { icon: "workflow", title: "Workflow Terstruktur", desc: "Status jelas (Approve/Revision/Reject), assignment reviewer, dan SLA internal." },
      { icon: "doc", title: "Manajemen Dokumen Rapi", desc: "Upload, versioning, catatan reviewer, dan bukti verifikasi tersimpan." },
      { icon: "radar", title: "Risk & Fraud Screening", desc: "Scoring, red-flag, dan pemeriksaan anomali agar investor lebih aman." },
      { icon: "link", title: "Bridge Customer ↔ Investor", desc: "Listing yang tampil ke investor hanya yang sudah melewati verifikasi FondoFund." },
      { icon: "chart", title: "Dashboard & Insight", desc: "Pantau funnel verifikasi, bottleneck, dan performa tim." },
    ],
    []
  );

  const pricing = useMemo(
    () => [
      {
        name: "Starter",
        price: "Rp 0",
        period: "/bulan",
        desc: "Untuk uji coba MVP.",
        items: ["1 workspace", "1 admin", "Flow dasar verifikasi", "Riwayat pengajuan"],
        cta: "Mulai Gratis",
        highlight: false,
      },
      {
        name: "Pro",
        price: "Custom",
        period: "",
        desc: "Operasional tim verifikasi & listing.",
        items: ["Multi admin/reviewer", "Role & permission", "SLA + notifikasi", "Export laporan", "API integration"],
        cta: "Request Demo",
        highlight: true,
      },
      {
        name: "Enterprise",
        price: "Custom",
        period: "",
        desc: "Skala besar + compliance ketat.",
        items: ["SSO/SAML", "Audit log advanced", "Custom workflow", "On-prem/VPC option", "Support prioritas"],
        cta: "Hubungi Kami",
        highlight: false,
      },
    ],
    []
  );

  const faq = useMemo(
    () => [
      {
        q: "FondoFund ini P2P lending atau verifikator?",
        a: "FondoFund berperan sebagai verifikator/jembatan: memverifikasi penerima dana dan membantu listing yang siap ditampilkan ke investor.",
      },
      {
        q: "Apa yang diverifikasi?",
        a: "Identity check (KTP/selfie/NPWP), business review (legalitas & laporan), dan risk assessment (scoring & fraud check).",
      },
      {
        q: "Bagaimana hasil verifikasi ditampilkan?",
        a: "Tiga status utama: Approve, Revision Needed, atau Rejected/Blocked. Investor hanya melihat listing yang sudah approve.",
      },
      {
        q: "Bisa integrasi dengan sistem wallet/invoicing saya?",
        a: "Bisa. FondoFund siap integrasi via API. Untuk enterprise bisa SSO/SAML dan penyesuaian workflow.",
      },
    ],
    []
  );

  return (
    <>
      <Head>
        <title>{BRAND.domain} — Verifikator Penerima Dana & Investor</title>
        <meta
          name="description"
          content="FondoFund adalah verifikator (jembatan) antara penerima dana dan investor: identity check, business review, risk assessment, dan listing yang layak didanai."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-white text-slate-900">
        <TopNav brand={BRAND} />
        <Hero brand={BRAND} stats={stats} />
        <Trust brand={BRAND} />
        <Flow brand={BRAND} flowSteps={flowSteps} />
        <Features brand={BRAND} features={features} />
        <WhyFondoFund brand={BRAND} />
        <Pricing brand={BRAND} pricing={pricing} />
        <FAQ brand={BRAND} items={faq} />
        <CTA brand={BRAND} />
        <Footer brand={BRAND} />
      </div>
    </>
  );
}