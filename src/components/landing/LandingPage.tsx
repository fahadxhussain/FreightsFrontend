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
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Product", href: "#features" },
    { label: "How it Works", href: "#how-it-works" },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-canvas/90 backdrop-blur-md border-b border-hairline"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 h-16">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Truck size={18} strokeWidth={2} />
          </div>
          <span className="text-lg font-semibold tracking-tight text-ink">
            FLOW
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted transition-colors hover:text-ink px-4 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/role-selection"
              className="inline-flex items-center justify-center h-10 px-5 text-sm font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary-active transition-colors"
            >
              Sign up free
            </Link>
          </div>
        </nav>

        <button
          className="md:hidden text-muted hover:text-ink"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-hairline bg-canvas px-6 pb-6 pt-2 md:hidden"
        >
          <div className="flex flex-col gap-4">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-muted"
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-muted"
            >
              Sign in
            </Link>
            <Link
              href="/role-selection"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center justify-center h-10 text-sm font-semibold rounded-md bg-primary text-primary-foreground text-center"
            >
              Sign up free
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24 bg-canvas">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-center">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7"
          >
            <motion.div variants={fadeUp} custom={0} className="mb-6">
              <span className="badge-pill badge-pill-default">
                Now in Open Beta
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl font-semibold leading-[1.05] tracking-tight text-ink md:text-5xl lg:text-[56px]"
              style={{ letterSpacing: "-0.04em" }}
            >
              Freight &amp; Fleet.{" "}
              <span className="text-muted">Simplified.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-6 max-w-lg text-base leading-relaxed text-body-text"
            >
              The AI-powered logistics platform that connects brokers, carriers,
              and drivers — automating matching, tracking, and payments in one
              seamless flow.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="mt-8 flex flex-col items-start gap-3 sm:flex-row"
            >
              <Link
                href="/role-selection"
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary-active transition-colors"
              >
                Get Started Free
                <ArrowRight size={16} strokeWidth={2} />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-semibold rounded-md border border-hairline bg-canvas text-ink hover:bg-surface-soft transition-colors"
              >
                Learn More
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="lg:col-span-5"
          >
            <div className="rounded-2xl border border-hairline bg-canvas p-1 shadow-sm">
              <div className="rounded-xl border border-hairline bg-surface-soft p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">Load #2847</span>
                  <span className="badge-pill badge-pill-emerald">Matched</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-body-text">
                    <MapPin size={16} className="text-muted" />
                    <span>Chicago, IL → Dallas, TX</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-body-text">
                    <Calendar size={16} className="text-muted" />
                    <span>May 15 — May 18</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-body-text">
                    <Clock size={16} className="text-muted" />
                    <span>1,200 mi · 48 ft Dry Van</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-hairline flex items-center justify-between">
                  <span className="text-lg font-semibold text-ink">$3,450</span>
                  <span className="text-sm text-muted">$2.88/mi</span>
                </div>
                <button className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-active transition-colors">
                  Book Load
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const items = [
    { value: "10K+", label: "Loads Moved" },
    { value: "$2.4M", label: "Payments Processed" },
    { value: "99.8%", label: "On-Time Delivery" },
  ];

  return (
    <section className="border-y border-hairline bg-surface-soft py-10">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 gap-6 divide-y divide-hairline sm:grid-cols-3 sm:divide-x sm:divide-y-0"
        >
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              variants={fadeUp}
              custom={i}
              className="flex flex-col items-center py-4 sm:py-0"
            >
              <span className="text-3xl font-semibold text-ink md:text-4xl tracking-tight">
                {item.value}
              </span>
              <span className="mt-1 text-sm text-muted">
                {item.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

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
    <section id="features" className="py-24 md:py-32 bg-canvas">
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
            className="text-sm font-medium text-muted"
          >
            Features
          </motion.span>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="mt-3 text-3xl font-semibold tracking-tight text-ink md:text-4xl"
            style={{ letterSpacing: "-0.03em" }}
          >
            Everything you need to move freight
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={2}
            className="mx-auto mt-4 max-w-xl text-base text-body-text"
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
              className="rounded-xl bg-surface-card p-8 transition-colors hover:bg-surface-soft"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-soft text-ink">
                <f.icon size={20} strokeWidth={2} />
              </div>
              <h3 className="mt-5 text-base font-semibold text-ink">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-body-text">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

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
    <section id="how-it-works" className="border-t border-hairline bg-surface-soft py-24 md:py-32">
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
            className="text-sm font-medium text-muted"
          >
            How it Works
          </motion.span>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="mt-3 text-3xl font-semibold tracking-tight text-ink md:text-4xl"
            style={{ letterSpacing: "-0.03em" }}
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
              <span className="text-5xl font-semibold text-hairline md:text-6xl tracking-tight">
                {s.step}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-ink">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-body-text">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-24 md:py-32 bg-canvas">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-xl bg-surface-card p-10 text-center md:p-16"
        >
          <h2
            className="text-3xl font-semibold tracking-tight text-ink md:text-4xl"
            style={{ letterSpacing: "-0.03em" }}
          >
            Ready to move faster?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-body-text">
            Join thousands of brokers, carriers, and drivers already using
            FLOW to streamline their logistics operations.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/role-selection"
              className="inline-flex items-center gap-2 h-11 px-8 text-sm font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary-active transition-colors"
            >
              Create Free Account
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 h-11 px-8 text-sm font-semibold rounded-md border border-hairline bg-canvas text-ink hover:bg-surface-soft transition-colors"
            >
              Log In
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  const columns = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "How it Works", href: "#how-it-works" },
        { label: "Pricing", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Contact", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy", href: "#" },
        { label: "Terms", href: "#" },
      ],
    },
  ];

  return (
    <footer className="bg-surface-dark text-on-dark-soft">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-foreground text-primary">
                <Truck size={14} strokeWidth={2} />
              </div>
              <span className="text-sm font-semibold tracking-tight text-white">
                FLOW
              </span>
            </div>
            <p className="text-sm text-on-dark-soft">
              AI-powered logistics platform for the modern supply chain.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white mb-4">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-on-dark-soft hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-on-dark-soft">
            &copy; {new Date().getFullYear()} FLOW Logistics. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-xs text-on-dark-soft hover:text-white transition-colors">
              Sign in
            </Link>
            <Link href="/role-selection" className="text-xs text-on-dark-soft hover:text-white transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas">
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
