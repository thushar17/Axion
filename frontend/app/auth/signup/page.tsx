"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Zap, AlertCircle, CheckCircle, ImageIcon } from "lucide-react";
import { GoogleLogin } from '@react-oauth/google';

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
    <main
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{ background: "var(--bg-app)" }}
    >
      {/* Radial glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 flex items-center justify-center"
      >
        <div
          style={{
            width: 600,
            height: 600,
            background:
              "radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
      </div>

      {/* Card */}
      <section
        className="relative z-10 w-full max-w-[440px] rounded-2xl border p-8 shadow-2xl"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "var(--accent)" }}
          >
            <Zap size={16} className="text-white" fill="white" />
          </div>
          <span
            className="text-xl font-semibold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Axion
          </span>
        </div>

        <h1
          className="text-2xl font-semibold tracking-tight mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          Create your account
        </h1>
        <p className="text-sm mb-7" style={{ color: "var(--text-muted)" }}>
          Join Axion and start collaborating with your team
        </p>

        {/* Error / Success banner */}
        {message && (
          <div
            className="flex items-start gap-2.5 rounded-xl px-3.5 py-3 mb-5 text-sm"
            style={
              isError
                ? {
                    background: "var(--error-bg)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    color: "var(--error)",
                  }
                : {
                    background: "rgba(34,197,94,0.08)",
                    border: "1px solid rgba(34,197,94,0.2)",
                    color: "#22c55e",
                  }
            }
          >
            {isError ? (
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
            ) : (
              <CheckCircle size={15} className="mt-0.5 shrink-0" />
            )}
            <span>{message}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
              className="axion-input"
            />
          </div>

          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="yourname"
              className="axion-input"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="At least 8 characters"
                className="axion-input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Avatar URL — optional */}
          <div>
            <label
              htmlFor="avatar"
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              <span className="flex items-center gap-1.5">
                <ImageIcon size={13} className="text-[var(--text-muted)]" />
                Avatar URL
                <span
                  className="ml-1 px-1.5 py-0.5 rounded text-[10px]"
                  style={{
                    background: "var(--bg-surface-hover)",
                    color: "var(--text-muted)",
                  }}
                >
                  optional
                </span>
              </span>
            </label>
            <input
              id="avatar"
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://example.com/avatar.png"
              className="axion-input"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-2.5 text-sm font-semibold text-white mt-1 transition-all duration-200 btn-glow disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: loading ? "var(--accent-muted)" : "var(--accent)" }}
          >
            {loading ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Creating account…
              </>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <div className="mt-6 mb-4 flex items-center justify-center space-x-4">
          <div className="flex-1 h-px bg-[var(--border)]"></div>
          <span className="text-sm text-[var(--text-muted)]">or continue with</span>
          <div className="flex-1 h-px bg-[var(--border)]"></div>
        </div>
        
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                const response = await fetch(`${API_URL}/auth/google`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                  body: JSON.stringify({ credential: credentialResponse.credential }),
                });
                const data = await response.json();
                if (response.ok) {
                  router.push("/chat");
                } else {
                  setIsError(true);
                  setMessage(data.message ?? "Google signup failed.");
                }
              } catch {
                setIsError(true);
                setMessage("Could not connect to the server.");
              }
            }}
            onError={() => {
              setIsError(true);
              setMessage("Google signup failed.");
            }}
            theme="filled_black"
            shape="circle"
          />
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium transition-colors"
            style={{ color: "var(--accent-hover)" }}
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
