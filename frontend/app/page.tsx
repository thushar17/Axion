import Link from "next/link";
import {
  Zap,
  MessageSquare,
  Users,
  Bell,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Axion — Real-time messaging for teams",
  description:
    "Real-time messaging, presence tracking, and rich collaboration built for high-performance teams.",
};

const features = [
  {
    icon: MessageSquare,
    title: "Real-time messaging",
    description:
      "Instant delivery with Socket.io. Messages appear live — no refresh, no lag, no polling.",
  },
  {
    icon: Users,
    title: "Presence & status",
    description:
      "See who's online, away, or offline at a glance. Status updates propagate instantly across all sessions.",
  },
  {
    icon: Bell,
    title: "Smart notifications",
    description:
      "Unread badges, mute per-channel, reply threads, and message reactions — signal over noise.",
  },
  {
    icon: Zap,
    title: "Built for speed",
    description:
      "Next.js 15 App Router + Tailwind. Zero layout shift, optimistic UI, and sub-100 ms interactions.",
  },
];

export default function LandingPage() {
  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: "var(--bg-app)", color: "var(--text-primary)" }}
    >
      {/* ── Nav ───────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-40 border-b backdrop-blur-xl"
        style={{
          borderColor: "var(--border-subtle)",
          background: "rgba(14,14,16,0.85)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ background: "var(--accent)" }}
            >
              <Zap size={14} className="text-white" fill="white" />
            </div>
            <span className="text-base font-semibold tracking-tight">Axion</span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="px-4 py-1.5 text-sm font-medium rounded-lg transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-1.5 text-sm font-semibold rounded-lg text-white transition-all duration-200 btn-glow"
              style={{ background: "var(--accent)" }}
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-6 py-28 text-center overflow-hidden">
        {/* Background glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div
            style={{
              width: 700,
              height: 700,
              background:
                "radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 65%)",
              borderRadius: "50%",
              transform: "translateY(-80px)",
            }}
          />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-0"
          style={{
            width: 400,
            height: 400,
            background:
              "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium mb-8 border"
          style={{
            background: "var(--accent-muted)",
            borderColor: "rgba(99,102,241,0.35)",
            color: "var(--accent-hover)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full bg-[var(--accent-hover)]"
            aria-hidden
          />
          Now in beta — free for teams
        </div>

        <h1
          className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-tight max-w-3xl"
          style={{ color: "var(--text-primary)" }}
        >
          Real-time messaging,{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, var(--accent-hover) 0%, #c4b5fd 100%)",
            }}
          >
            built for teams
          </span>
        </h1>

        <p
          className="mt-6 text-lg md:text-xl max-w-xl leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Axion delivers instant messaging, live presence, and seamless
          collaboration in a focused, distraction-free workspace.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl btn-glow transition-all duration-200"
            style={{ background: "var(--accent)" }}
          >
            Create account
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl border transition-all duration-200 hover:bg-[var(--bg-surface-hover)]"
            style={{
              color: "var(--text-secondary)",
              borderColor: "var(--border)",
            }}
          >
            Sign in
          </Link>
        </div>

        {/* Social proof / trust */}
        <p className="mt-8 text-xs" style={{ color: "var(--text-muted)" }}>
          No credit card required · Self-hosted ready · MIT licensed
        </p>
      </section>

      {/* ── Feature cards ─────────────────────────────────────── */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border p-5 flex flex-col gap-3 group transition-all duration-200 hover:border-[var(--accent)] hover:bg-[var(--bg-surface-hover)]"
                style={{
                  background: "var(--bg-surface)",
                  borderColor: "var(--border)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors group-hover:bg-[var(--accent-muted)]"
                  style={{ background: "var(--bg-surface-hover)" }}
                >
                  <Icon
                    size={18}
                    className="transition-colors"
                    style={{ color: "var(--text-muted)" }}
                  />
                </div>
                <div>
                  <h3
                    className="text-sm font-semibold tracking-tight mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {title}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer
        className="border-t py-8 px-6"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center"
              style={{ background: "var(--accent)" }}
            >
              <Zap size={10} className="text-white" fill="white" />
            </div>
            <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
              Axion
            </span>
          </div>

          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} Axion. Built with Next.js + Socket.io.
          </p>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[var(--text-primary)]"
              style={{ color: "var(--text-muted)" }}
              aria-label="GitHub"
            >
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
