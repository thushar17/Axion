import Link from "next/link";
import Image from "next/image";
import { Zap, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zync — Real-time messaging for teams",
  description:
    "Real-time messaging, presence tracking, and rich collaboration built for high-performance teams.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--surface-app)] text-[var(--text-primary)] flex flex-col font-sans">
      {/* ── Navbar ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 shrink-0"
        style={{
          height: "56px",
          background: "var(--surface-1)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
            style={{ background: "var(--accent)" }}
          >
            <Zap size={12} className="text-white" fill="white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Zync</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/auth/login"
            className="h-9 px-4 text-sm font-medium rounded-md flex items-center transition-colors duration-[120ms] ease-out hover:bg-[var(--surface-2)]"
            style={{ color: "var(--text-secondary)" }}
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            className="h-9 px-4 text-sm font-medium rounded-md flex items-center text-white transition-colors duration-[120ms] ease-out bg-[var(--accent)] hover:bg-[var(--accent-hover)]"
          >
            Get started
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col pt-[56px]">
        {/* ── Hero Section ── */}
        <section className="px-6 py-16 md:py-24 max-w-[1280px] mx-auto w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1 max-w-[720px] flex flex-col gap-6 text-left">
            <h1
              className="font-semibold tracking-tight"
              style={{ fontSize: "clamp(36px, 5vw, 48px)", lineHeight: "1.1" }}
            >
              Real-time messaging, built for teams.
            </h1>
            <p
              className="text-lg max-w-[560px]"
              style={{ color: "var(--text-secondary)" }}
            >
              Zync delivers instant messaging, live presence, and seamless collaboration in a focused, distraction-free workspace. Professional-grade chat without the visual noise.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/auth/signup"
                className="h-10 px-6 text-sm font-medium rounded-md flex items-center gap-2 text-white transition-colors duration-[120ms] ease-out bg-[var(--accent)] hover:bg-[var(--accent-hover)]"
              >
                Create workspace <ArrowRight size={16} />
              </Link>
              <Link
                href="/auth/login"
                className="h-10 px-6 text-sm font-medium rounded-md flex items-center transition-colors duration-[120ms] ease-out hover:bg-[var(--surface-2)]"
                style={{ color: "var(--text-secondary)" }}
              >
                Sign in
              </Link>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-[800px] lg:max-w-none lg:w-auto mt-8 lg:mt-0">
            {/* The actual static mockup image */}
            <div 
              className="rounded-xl overflow-hidden shadow-[var(--elevation-2)] border"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <Image 
                src="/mockup-hero.png" 
                alt="Zync interface mockup"
                width={800}
                height={500}
                className="w-full h-auto block"
                priority
              />
            </div>
          </div>
        </section>

        {/* ── Feature Sections ── */}
        <section className="px-6 py-24 max-w-[1120px] mx-auto w-full flex flex-col gap-32">
          
          {/* Feature 1 */}
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 flex flex-col gap-4">
              <h2 className="text-2xl font-bold">Organized channels</h2>
              <p className="text-base" style={{ color: "var(--text-secondary)" }}>
                Keep conversations focused. Create channels for projects, teams, or topics. Everything is searchable, and you only get notified for what matters.
              </p>
            </div>
            <div className="flex-1 w-full flex justify-center md:justify-end">
              {/* CSS UI Mockup - Sidebar fragment */}
              <div 
                className="w-full max-w-[320px] rounded-xl border overflow-hidden shadow-[var(--elevation-1)] p-4 flex flex-col gap-1"
                style={{ background: "var(--bg-sidebar)", borderColor: "var(--bg-sidebar-hover)" }}
              >
                <div className="px-2 py-1"><span className="text-xs font-semibold uppercase tracking-[0.04em]" style={{ color: "var(--sidebar-text-secondary)" }}>Channels</span></div>
                <div className="flex items-center gap-2 px-2 h-8 rounded-md" style={{ background: "var(--bg-sidebar-hover)", color: "var(--sidebar-text-primary)" }}>
                  <span className="opacity-80">#</span> <span className="text-sm font-medium">engineering</span>
                </div>
                <div className="flex items-center gap-2 px-2 h-8 rounded-md" style={{ color: "var(--sidebar-text-secondary)" }}>
                  <span className="opacity-80">#</span> <span className="text-sm">marketing</span>
                </div>
                <div className="flex items-center gap-2 px-2 h-8 rounded-md" style={{ color: "var(--sidebar-text-secondary)" }}>
                  <span className="opacity-80">#</span> <span className="text-sm">general</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 (Reversed) */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-16">
            <div className="flex-1 flex flex-col gap-4">
              <h2 className="text-2xl font-bold">Real-time presence</h2>
              <p className="text-base" style={{ color: "var(--text-secondary)" }}>
                Know when your team is around. Status indicators sync instantly, and typing indicators let you know when a reply is being drafted.
              </p>
            </div>
            <div className="flex-1 w-full flex justify-center md:justify-start">
               {/* CSS UI Mockup - Member list fragment */}
               <div 
                className="w-full max-w-[320px] rounded-xl border overflow-hidden shadow-[var(--elevation-1)] p-4 flex flex-col gap-4"
                style={{ background: "var(--surface-1)", borderColor: "var(--border-subtle)" }}
              >
                <div className="flex flex-col gap-3">
                   <div className="flex items-center gap-3">
                     <div className="relative">
                       <div className="w-8 h-8 rounded-full bg-slate-300" />
                       <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2" style={{ background: "var(--status-online)", borderColor: "var(--surface-1)" }} />
                     </div>
                     <span className="text-sm font-medium">Sarah Chen</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="relative">
                       <div className="w-8 h-8 rounded-full bg-slate-400" />
                       <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2" style={{ background: "var(--status-idle)", borderColor: "var(--surface-1)" }} />
                     </div>
                     <span className="text-sm font-medium">Alex Rivera <span style={{ color: "var(--text-tertiary)" }} className="text-xs font-normal ml-1">— In a meeting</span></span>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 flex flex-col gap-4">
              <h2 className="text-2xl font-bold">Rich messaging</h2>
              <p className="text-base" style={{ color: "var(--text-secondary)" }}>
                Share code snippets, file attachments, and format your text with markdown. Express yourself clearly with emoji reactions and threaded replies.
              </p>
            </div>
            <div className="flex-1 w-full flex justify-center md:justify-end">
               {/* CSS UI Mockup - Message fragment */}
               <div 
                className="w-full max-w-[380px] rounded-xl border overflow-hidden shadow-[var(--elevation-1)] p-4 flex flex-col gap-1"
                style={{ background: "var(--surface-0)", borderColor: "var(--border-subtle)" }}
              >
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-300 shrink-0 mt-1" />
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-2">
                      <span className="text-md font-semibold">David Kim</span>
                      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>10:42 AM</span>
                    </div>
                    <p className="text-base leading-relaxed text-left">
                      I just deployed the new API endpoints. Can someone on the frontend team take a look?
                    </p>
                    <div className="flex gap-1 mt-2">
                      <div className="flex items-center gap-1 h-6 px-2 rounded-full border" style={{ background: "var(--surface-3)", borderColor: "var(--border-subtle)" }}>
                         <span className="text-xs">🚀</span><span className="text-xs font-medium">3</span>
                      </div>
                      <div className="flex items-center gap-1 h-6 px-2 rounded-full border" style={{ background: "var(--accent-tint)", borderColor: "var(--accent)", color: "var(--accent)" }}>
                         <span className="text-xs">👀</span><span className="text-xs font-medium">1</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </section>
      </main>

      {/* ── Footer ── */}
      <footer
        className="mt-12 py-8 px-6 text-center border-t flex flex-col sm:flex-row items-center justify-between max-w-[1120px] mx-auto w-full"
        style={{
          background: "var(--surface-1)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div className="flex items-center gap-2 mb-4 sm:mb-0">
          <div
            className="w-5 h-5 rounded flex items-center justify-center"
            style={{ background: "var(--text-tertiary)" }}
          >
            <Zap size={10} className="text-white" fill="white" />
          </div>
          <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
            Zync © {new Date().getFullYear()}
          </span>
        </div>
        <div className="flex gap-4">
          <a href="#" className="text-xs hover:underline" style={{ color: "var(--text-secondary)" }}>Privacy</a>
          <a href="#" className="text-xs hover:underline" style={{ color: "var(--text-secondary)" }}>Terms</a>
          <a href="https://github.com/your-repo/axion" target="_blank" rel="noopener noreferrer" className="text-xs hover:underline" style={{ color: "var(--text-secondary)" }}>
            Source
          </a>
        </div>
      </footer>
    </div>
  );
}