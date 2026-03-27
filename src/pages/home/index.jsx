// pages/home/HomeSection.jsx
import React, { useMemo } from "react";
import Head from "next/head";

import TopNav      from "./sections/TopNav";
import Hero        from "./sections/Hero";
import FlowPreview from "./sections/FlowPreview";
import Features    from "./sections/Features";
// import WhyFondoFund from "./sections/WhyFondoFund";
import FAQ         from "./sections/FAQ";
// import CTA         from "./sections/CTA";
import Footer      from "./sections/Footer";
import Testimonials from "./sections/Testimonial";
const BRAND = {
  name:    "FondoFund",
  domain:  "fondofund.com",
  primary: "#0B2A3A",
  accent:  "#12B981",
  soft:    "#F3F7FA",
};

export default function HomeSection() {

  const features = useMemo(
    () => [
      { icon: "shield",    title: "Compliance-First Verification", desc: "FondoFund memastikan verifikasi sesuai SOP: identitas, bisnis, dan risiko." },
      { icon: "workflow",  title: "Workflow Terstruktur",          desc: "Status jelas (Approve/Revision/Reject), assignment reviewer, dan SLA internal." },
      { icon: "doc",       title: "Manajemen Dokumen Rapi",        desc: "Upload, versioning, catatan reviewer, dan bukti verifikasi tersimpan." },
      { icon: "radar",     title: "Risk & Fraud Screening",        desc: "Scoring, red-flag, dan pemeriksaan anomali agar investor lebih aman." },
      { icon: "link",      title: "Bridge Customer ↔ Investor",    desc: "Listing yang tampil ke investor hanya yang sudah melewati verifikasi FondoFund." },
      { icon: "chart",     title: "Dashboard & Insight",           desc: "Pantau funnel verifikasi, bottleneck, dan performa tim." },
    ],
    []
  );

  const faq = useMemo(
    () => [
      {
        q: "FondoFund ini P2P lending atau verifikator?",
        a: "FondoFund berperan sebagai verifikator/jembatan: memverifikasi investee dan membantu listing yang siap ditampilkan ke investor.",
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
        <Hero />
        <FlowPreview />
        <Features brand={BRAND} features={features} />
        <Testimonials brand={BRAND} features={features} />
        {/* <WhyFondoFund brand={BRAND} /> */}
        <FAQ brand={BRAND} items={faq} />
        {/* <CTA brand={BRAND} /> */}
        <Footer brand={BRAND} />
      </div>
    </>
  );
}