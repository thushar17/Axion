import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zync — Real-time messaging for teams",
  description:
    "Zync is a premium real-time chat platform built for high-performance teams. Instant messaging, presence tracking, and rich collaboration — all in one focused workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" style={{ background: "var(--surface-0)", color: "var(--text-primary)" }}>
        {children}
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "var(--surface-3)",
              border: "1px solid var(--border-default)",
              color: "var(--text-primary)",
              fontSize: "13px",
              borderRadius: "8px",
              boxShadow: "var(--elevation-3)",
              width: "360px",
            },
          }}
        />
      </body>
    </html>
  );
}