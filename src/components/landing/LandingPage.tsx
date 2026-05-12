"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Truck,
  Route,
  FileCheck,
  Wallet,
  BarChart3,
  Shield,
  ArrowRight,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

// ── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

// ── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How it Works", href: "#how-it-works" },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-card/80 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
            <Truck size={18} strokeWidth={2.5} />
          </div>
          <span className="text-lg font-black tracking-tight text-foreground">
            FLOW
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
            >
              Log In
            </Link>
            <Link
              href="/role-selection"
              className="btn btn-primary rounded-lg px-5 py-2 text-sm shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-muted-foreground hover:text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-border bg-card/95 backdrop-blur-xl px-6 pb-6 pt-2 md:hidden"
        >
          <div className="flex flex-col gap-4">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-bold text-muted-foreground"
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-bold text-muted-foreground"
            >
              Log In
            </Link>
            <Link
              href="/role-selection"
              onClick={() => setMobileOpen(false)}
              className="btn btn-primary w-full text-center text-sm"
            >
              Get Started
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-32">
      {/* Subtle background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-indigo/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl px-6 text-center">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          <motion.div variants={fadeUp} custom={0} className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Now in Open Beta
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="max-w-4xl text-4xl font-black leading-[1.1] tracking-tight text-foreground md:text-6xl lg:text-7xl"
          >
            Freight &amp; Fleet.{" "}
            <span className="text-accent">Simplified.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="mt-6 max-w-2xl text-base font-medium leading-relaxed text-muted md:text-lg"
          >
            The AI-powered logistics platform that connects brokers, carriers,
            and drivers — automating matching, tracking, and payments in one
            seamless flow.
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={3}
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
          >
            <Link
              href="/role-selection"
              className="btn btn-primary flex h-12 items-center gap-2 rounded-xl px-8 text-sm font-black uppercase tracking-widest shadow-lg shadow-accent/20"
            >
              Get Started Free
              <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
            <a
              href="#features"
              className="btn btn-secondary flex h-12 items-center gap-2 rounded-xl px-8 text-sm font-black uppercase tracking-widest"
            >
              Learn More
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Stats ────────────────────────────────────────────────────────────────────
function Stats() {
  const items = [
    { value: "10K+", label: "Loads Moved" },
    { value: "$2.4M", label: "Payments Processed" },
    { value: "99.8%", label: "On-Time Delivery" },
  ];

  return (
    <section className="border-y border-border bg-card/40 py-12 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 gap-8 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0"
        >
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              variants={fadeUp}
              custom={i}
              className="flex flex-col items-center py-4 sm:py-0"
            >
              <span className="text-3xl font-black text-foreground md:text-4xl">
                {item.value}
              </span>
              <span className="mt-1 text-sm font-bold uppercase tracking-widest text-muted">
                {item.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── Features ─────────────────────────────────────────────────────────────────
function Features() {
  const features = [
    {
      icon: Route,
      title: "Smart Load Matching",
      desc: "AI-driven algorithms pair loads with the right carriers based on lane preferences, capacity, and historical performance.",
    },
    {
      icon: BarChart3,
      title: "Real-Time Tracking",
      desc: "Monitor every shipment with GPS tracking, automated status updates, and instant notifications to all parties.",
    },
    {
      icon: FileCheck,
      title: "Automated Documentation",
      desc: "Generate, store, and share BOLs, PODs, and rate confirmations with automatic audit trails and e-signatures.",
    },
    {
      icon: Wallet,
      title: "Instant Payments",
      desc: "Streamlined invoicing and payment processing with transparent rate confirmation and quick-pay options.",
    },
    {
      icon: Shield,
      title: "Compliance & Safety",
      desc: "Built-in identity verification, insurance checks, and DOT monitoring to keep your fleet compliant.",
    },
    {
      icon: Truck,
      title: "Fleet Management",
      desc: "Manage drivers, vehicles, and equipment in one place with maintenance reminders and utilization analytics.",
    },
  ];

  return (
    <section id="features" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center"
        >
          <motion.span
            variants={fadeUp}
            custom={0}
            className="text-xs font-black uppercase tracking-widest text-accent"
          >
            Features
          </motion.span>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="mt-3 text-3xl font-black tracking-tight text-foreground md:text-4xl"
          >
            Everything you need to move freight
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={2}
            className="mx-auto mt-4 max-w-xl text-base font-medium text-muted"
          >
            From posting loads to final payment, FLOW handles the heavy lifting
            so you can focus on growing your business.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              custom={i}
              className="group rounded-2xl border border-border bg-card p-7 transition-all hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-light text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                <f.icon size={22} strokeWidth={2} />
              </div>
              <h3 className="mt-5 text-base font-black text-foreground">
                {f.title}
              </h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-muted">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── How It Works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Post or Search Loads",
      desc: "Brokers post freight in seconds. Carriers and drivers browse matched loads tailored to their lanes and equipment.",
    },
    {
      step: "02",
      title: "Get Matched Instantly",
      desc: "Our AI engine ranks the best matches by rate, reliability, and proximity — cutting booking time from hours to minutes.",
    },
    {
      step: "03",
      title: "Track & Get Paid",
      desc: "Real-time GPS tracking keeps everyone informed. Documents are auto-generated, and payments flow on delivery confirmation.",
    },
  ];

  return (
    <section id="how-it-works" className="border-t border-border bg-card/30 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center"
        >
          <motion.span
            variants={fadeUp}
            custom={0}
            className="text-xs font-black uppercase tracking-widest text-accent"
          >
            How it Works
          </motion.span>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="mt-3 text-3xl font-black tracking-tight text-foreground md:text-4xl"
          >
            Three steps to seamless logistics
          </motion.h2>
        </motion.div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              variants={fadeUp}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="relative"
            >
              <span className="text-5xl font-black text-border md:text-6xl">
                {s.step}
              </span>
              <h3 className="mt-4 text-lg font-black text-foreground">
                {s.title}
              </h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-muted">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA ──────────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 text-center md:p-16"
        >
          {/* Background glow */}
          <div className="pointer-events-none absolute inset-0 -z-0">
            <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
              Ready to move faster?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base font-medium text-muted">
              Join thousands of brokers, carriers, and drivers already using
              FLOW to streamline their logistics operations.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/role-selection"
                className="btn btn-primary flex h-12 items-center gap-2 rounded-xl px-8 text-sm font-black uppercase tracking-widest shadow-lg shadow-accent/20"
              >
                Create Free Account
                <ArrowRight size={16} strokeWidth={2.5} />
              </Link>
              <Link
                href="/login"
                className="btn btn-secondary flex h-12 items-center gap-2 rounded-xl px-8 text-sm font-black uppercase tracking-widest"
              >
                Log In
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const links = [
    { label: "Log In", href: "/login" },
    { label: "Sign Up", href: "/role-selection" },
  ];

  return (
    <footer className="border-t border-border bg-card/40 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-white">
            <Truck size={14} strokeWidth={2.5} />
          </div>
          <span className="text-sm font-black tracking-tight text-foreground">
            FLOW
          </span>
        </div>

        <nav className="flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <p className="text-xs font-bold text-muted-foreground">
          &copy; {new Date().getFullYear()} FLOW Logistics. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

// ── Exported Landing Page ────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
