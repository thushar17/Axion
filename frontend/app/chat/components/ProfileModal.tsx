import React, { useState, useRef } from "react";
import { X, Loader2, Camera } from "lucide-react";
import { updateProfile } from "../services/auth.service";
import { Avatar } from "@/src/components/Avatar";

type ProfileModalProps = {
  open: boolean;
  onClose: () => void;
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
};

export function ProfileModal({ open, onClose, user, setUser }: ProfileModalProps) {
  const [username, setUsername] = useState(user?.username || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("username", username);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const response = await updateProfile(formData);
      if (response.data.success) {
        setUser(response.data.user);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop — no blur (spec: no glassmorphism) */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.5)" }}
        onClick={!loading ? onClose : undefined}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-xl border overflow-hidden"
        style={{
          background: "var(--surface-3)",
          borderColor: "var(--border-default)",
          boxShadow: "var(--elevation-3)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <h2
            className="text-base font-semibold"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.01em" }}
          >
            Edit Profile
          </h2>
          <button
            onClick={!loading ? onClose : undefined}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-[120ms] ease-out"
            style={{ color: "var(--text-tertiary)" }}
            disabled={loading}
            onMouseEnter={(e) => {
              if (!loading) {
                (e.currentTarget as HTMLElement).style.background = "var(--surface-4)";
                (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)";
            }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div
              className="p-3 rounded-lg text-sm border"
              style={{
                background: "var(--danger-tint)",
                borderColor: "rgba(240,82,82,0.25)",
                color: "var(--danger)",
              }}
            >
              {error}
            </div>
          )}

          {/* Avatar picker */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group cursor-pointer">
              <div
                className="w-24 h-24 rounded-full overflow-hidden border-4"
                style={{ borderColor: "var(--surface-1)" }}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Avatar username={user?.username || "?"} avatarUrl={user?.avatar} size="xl" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-[120ms] cursor-pointer"
                style={{ background: "rgba(0,0,0,0.45)" }}
                aria-label="Change avatar"
              >
                <Camera size={22} className="text-white" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg, image/png, image/webp"
                className="hidden"
              />
            </div>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              JPG, PNG or WebP. Max 5MB.
            </p>
          </div>

          {/* Username input */}
          <div className="space-y-1.5">
            <label
              className="text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="zync-input"
              placeholder="Enter your username"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-9 px-4 rounded-lg text-sm font-medium transition-colors duration-[120ms] ease-out disabled:opacity-40 border"
              style={{
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--surface-4)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-9 px-4 rounded-lg text-sm font-semibold text-white transition-colors duration-[120ms] ease-out disabled:opacity-40 flex items-center gap-2"
              style={{ background: "var(--accent)" }}
              onMouseEnter={(e) => {
                if (!loading) (e.currentTarget as HTMLElement).style.background = "var(--accent-hover)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--accent)";
              }}
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
