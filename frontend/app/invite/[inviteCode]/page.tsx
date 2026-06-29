"use client"

import { useEffect, useRef } from "react";
import axios from "axios";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Zap } from "lucide-react";

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const hasJoined = useRef(false);

  useEffect(() => {
    if (hasJoined.current) return;
    hasJoined.current = true;

    const joinRoom = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await axios.post(
          `${API_URL}/room/join-invite`,
          { inviteCode: params.inviteCode },
          { withCredentials: true }
        );
        if (!response.data.success) {
          console.warn(response.data.message);
        }
        router.push(redirect || "/chat");
      } catch (error: any) {
        if (error.response?.status === 401) {
          router.push(
            `/auth/login?redirect=${encodeURIComponent(
              window.location.pathname + window.location.search
            )}`
          );
          return;
        }
        console.error(error);
        router.push("/chat");
      }
    };

    joinRoom();
  }, []);

  return (
    <main
      className="flex min-h-screen items-center justify-center"
      style={{ background: "var(--bg-app)" }}
    >
      {/* Glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 flex items-center justify-center"
      >
        <div
          style={{
            width: 500,
            height: 500,
            background:
              "radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
      </div>

      <div
        className="relative z-10 flex flex-col items-center gap-5 rounded-2xl border p-10 text-center"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border)",
        }}
      >
        {/* Logo */}
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-2"
          style={{ background: "var(--accent)" }}
        >
          <Zap size={22} className="text-white" fill="white" />
        </div>

        {/* Spinner */}
        <div className="relative w-12 h-12">
          <svg
            className="animate-spin w-12 h-12"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="var(--border)"
              strokeWidth="4"
            />
            <path
              d="M44 24C44 13 35 4 24 4"
              stroke="var(--accent)"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div>
          <h1
            className="text-lg font-semibold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Joining room…
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--text-muted)" }}
          >
            Verifying your invite code and setting things up
          </p>
        </div>
      </div>
    </main>
  );
}