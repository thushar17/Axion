"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, username, password, avatar }),
      });

      const data = await response.json();
      setMessage(data.message ?? (response.ok ? "Signup successful" : "Signup failed"));
    } catch {
      setMessage("Could not connect to backend");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 py-10 text-zinc-950">
      <section className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Sign up</h1>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium">
            Email
            <input
              className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-950"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="block text-sm font-medium">
            Username
            <input
              className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-950"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input
              className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-950"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <label className="block text-sm font-medium">
            Avatar URL
            <input
              className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-950"
              value={avatar}
              onChange={(event) => setAvatar(event.target.value)}
            />
          </label>
          <button
            className="w-full rounded-md bg-zinc-950 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
        {message && <p className="mt-4 text-sm text-zinc-700">{message}</p>}
        <p className="mt-5 text-sm text-zinc-600">
          Already have an account?{" "}
          <Link className="font-medium text-zinc-950 underline" href="/LogIn">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
