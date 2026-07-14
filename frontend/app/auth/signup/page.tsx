"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Zap, AlertCircle, CheckCircle, ImageIcon } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleGoogleLogin() {
    window.location.href = `${API_URL}/auth/google`;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, username, password, avatar }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsError(false);
        setMessage(data.message ?? "Account created! Redirecting…");
        setTimeout(() => router.push("/auth/login"), 1500);
      } else {
        setIsError(true);
        setMessage(data.message ?? "Registration failed. Please try again.");
      }
    } catch {
      setIsError(true);
      setMessage("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen w-full font-sans" style={{ background: "var(--surface-0)" }}>
      {/* ── Left Column: Form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-12 w-full lg:max-w-[560px] xl:max-w-[640px] z-10 bg-[var(--surface-0)]">
        <div className="w-full max-w-[400px]">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "var(--accent)" }}
              >
                <Zap size={16} className="text-white" fill="white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                Zync
              </span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2 text-[var(--text-primary)] tracking-tight">
              Create an account
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Join Zync and start collaborating instantly.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full h-10 px-4 text-sm font-medium rounded-md flex items-center justify-center gap-2 border transition-colors duration-[120ms] hover:bg-[var(--surface-2)]"
            style={{
              background: "var(--surface-3)",
              borderColor: "var(--border-default)",
              color: "var(--text-primary)",
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </button>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[var(--border-subtle)]" />
            <span className="text-xs uppercase font-medium tracking-wider text-[var(--text-tertiary)]">
              Or continue with email
            </span>
            <div className="flex-1 h-px bg-[var(--border-subtle)]" />
          </div>

          {message && (
            <div
              className="mb-6 p-3 rounded-md flex items-start gap-2 border text-sm"
              style={{
                background: isError ? "var(--danger-tint)" : "var(--success-tint)",
                borderColor: isError ? "rgba(224, 30, 90, 0.2)" : "rgba(46, 182, 125, 0.2)",
                color: isError ? "var(--danger)" : "var(--success)",
              }}
            >
              {isError ? (
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
              ) : (
                <CheckCircle size={16} className="mt-0.5 shrink-0" />
              )}
              <p>{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-[var(--text-primary)]"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 rounded-md border text-sm transition-shadow duration-[120ms] outline-none"
                style={{
                  background: "var(--surface-3)",
                  borderColor: "var(--border-default)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--accent)";
                  e.target.style.boxShadow = "0 0 0 3px var(--accent-tint)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border-default)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="username"
                className="text-sm font-medium text-[var(--text-primary)]"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                placeholder="e.g. sarah_chen"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-10 px-3 rounded-md border text-sm transition-shadow duration-[120ms] outline-none"
                style={{
                  background: "var(--surface-3)",
                  borderColor: "var(--border-default)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--accent)";
                  e.target.style.boxShadow = "0 0 0 3px var(--accent-tint)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border-default)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-[var(--text-primary)]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 pl-3 pr-10 rounded-md border text-sm transition-shadow duration-[120ms] outline-none"
                  style={{
                    background: "var(--surface-3)",
                    borderColor: "var(--border-default)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--accent)";
                    e.target.style.boxShadow = "0 0 0 3px var(--accent-tint)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--border-default)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-sm opacity-60 hover:opacity-100 transition-opacity"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="avatar"
                className="text-sm font-medium text-[var(--text-primary)]"
              >
                Avatar URL (optional)
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" style={{ color: "var(--text-secondary)" }}>
                  <ImageIcon size={16} />
                </div>
                <input
                  id="avatar"
                  type="url"
                  placeholder="https://example.com/avatar.png"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-md border text-sm transition-shadow duration-[120ms] outline-none"
                  style={{
                    background: "var(--surface-3)",
                    borderColor: "var(--border-default)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--accent)";
                    e.target.style.boxShadow = "0 0 0 3px var(--accent-tint)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--border-default)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 mt-2 text-sm font-medium rounded-md flex items-center justify-center text-white transition-colors duration-[120ms] ease-out disabled:opacity-60"
              style={{ background: "var(--accent)" }}
              onMouseEnter={(e) => {
                if (!loading) (e.currentTarget as HTMLElement).style.background = "var(--accent-hover)";
              }}
              onMouseLeave={(e) => {
                if (!loading) (e.currentTarget as HTMLElement).style.background = "var(--accent)";
              }}
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium hover:underline"
              style={{ color: "var(--accent)" }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right Column: Brand Panel (Hidden on mobile) ── */}
      <div 
        className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden bg-[var(--surface-2)]"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-2)] to-[var(--surface-3)]" />
        
        <div className="relative z-10 max-w-[480px] p-12 text-center flex flex-col items-center">
           <div className="mb-10 w-full rounded-xl overflow-hidden shadow-[var(--elevation-3)] border border-[var(--border-subtle)] bg-[var(--surface-0)] flex flex-col">
              <div className="h-12 border-b border-[var(--border-subtle)] flex items-center px-4 gap-3 bg-[var(--surface-1)]">
                 <div className="w-3 h-3 rounded-full bg-red-400" />
                 <div className="w-3 h-3 rounded-full bg-amber-400" />
                 <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex h-[280px]">
                 <div className="w-[100px] h-full bg-[var(--bg-sidebar)] border-r border-[var(--bg-sidebar-hover)] p-3">
                    <div className="w-full h-4 rounded-sm bg-[var(--bg-sidebar-hover)] mb-2" />
                    <div className="w-3/4 h-4 rounded-sm bg-[var(--bg-sidebar-hover)] mb-2" />
                    <div className="w-5/6 h-4 rounded-sm bg-[var(--bg-sidebar-hover)]" />
                 </div>
                 <div className="flex-1 p-4 flex flex-col justify-end gap-3">
                    <div className="flex gap-2">
                       <div className="w-6 h-6 rounded-md bg-slate-200 shrink-0" />
                       <div className="w-full h-12 rounded-md bg-[var(--surface-1)]" />
                    </div>
                    <div className="flex gap-2">
                       <div className="w-6 h-6 rounded-md bg-slate-300 shrink-0" />
                       <div className="w-3/4 h-8 rounded-md bg-[var(--surface-1)]" />
                    </div>
                 </div>
              </div>
           </div>
           
           <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
             Work moves faster with Zync
           </h2>
           <p className="text-base text-[var(--text-secondary)]">
             A dedicated workspace for your team to communicate, collaborate, and build the future together.
           </p>
        </div>
      </div>
    </main>
  );
}