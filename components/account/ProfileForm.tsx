"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import BrutalButton from "@/components/BrutalButton";

type Props = {
  initialName: string;
  initialEmail: string;
  initialImage: string;
};

export default function ProfileForm({
                                      initialName,
                                      initialEmail,
                                      initialImage,
                                    }: Props) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [image, setImage] = useState(initialImage);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleUploadAvatar() {
    if (!file) return image;

    setUploading(true);

    try {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const pathname = `avatars/avatar-${Date.now()}.${extension}`;

      const blob = await upload(pathname, file, {
        access: "public",
        handleUploadUrl: "/api/account/avatar",
      });

      setImage(blob.url);
      return blob.url;
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const uploadedImageUrl = await handleUploadAvatar();

      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          image: uploadedImageUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Impossible de mettre à jour le profil");
      }

      setSuccess("Profil mis à jour");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow)]">
      <h2 className="text-xl font-semibold">Profil</h2>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Nom</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl border px-3 py-2"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Photo de profil</label>

          {image ? (
            <img
              src={image}
              alt="Avatar"
              className="h-20 w-20 rounded-full object-cover border"
            />
          ) : null}

          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full rounded-2xl border px-3 py-2"
          />
        </div>

        {success ? <p className="text-sm text-green-600">{success}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <BrutalButton
          type="submit"
          disabled={loading || uploading}
          label={loading || uploading ? "Enregistrement..." : "Enregistrer"}
        />
      </form>
    </section>
  );
}
