"use client";

import { useEffect, useState } from "react";
import BrutalButton from "@/components/BrutalButton";

type Props = {
  initialName: string;
  initialEmail: string;
  initialImage: string;
};

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const MIN_AVATAR_SIZE = 128;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ProfileForm({
                                      initialName,
                                      initialEmail,
                                      initialImage,
                                    }: Props) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [image, setImage] = useState(initialImage);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function getImageDimensions(selectedFile: File) {
    const objectUrl = URL.createObjectURL(selectedFile);

    try {
      const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          resolve({ width: img.width, height: img.height });
        };
        img.onerror = () => {
          reject(new Error("Impossible de lire les dimensions de l'image"));
        };
        img.src = objectUrl;
      });

      return dimensions;
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  function clearLocalPreview() {
    setPreviewUrl((currentPreview) => {
      if (currentPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(currentPreview);
      }
      return null;
    });
  }

  async function validateFile(selectedFile: File) {
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      throw new Error("Format invalide. Formats acceptés: JPG, PNG ou WebP");
    }

    if (selectedFile.size > MAX_AVATAR_BYTES) {
      throw new Error("Le fichier est trop lourd (max 2 Mo)");
    }

    const { width, height } = await getImageDimensions(selectedFile);

    if (
      width < MIN_AVATAR_SIZE ||
      height < MIN_AVATAR_SIZE
    ) {
      throw new Error("Image trop petite. Minimum 128px x 128px");
    }
  }

  async function handleFileChange(selectedFile: File | null) {
    setSuccess("");
    setError("");

    if (!selectedFile) {
      setFile(null);
      clearLocalPreview();
      return;
    }

    try {
      await validateFile(selectedFile);
      setFile(selectedFile);
      setPreviewUrl((currentPreview) => {
        if (currentPreview?.startsWith("blob:")) {
          URL.revokeObjectURL(currentPreview);
        }
        return URL.createObjectURL(selectedFile);
      });
    } catch (err) {
      setFile(null);
      clearLocalPreview();
      setError(err instanceof Error ? err.message : "Image invalide");
    }
  }

  async function handleUploadAvatar() {

    if (!file) {
      return image;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/account/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Upload impossible");
      }

      if (typeof data?.url !== "string" || !data.url) {
        throw new Error("Aucune URL renvoyée par le serveur");
      }

      clearLocalPreview();
      setFile(null);
      setImage(data.url);
      return data.url;
    } catch (error) {
      console.error("upload error =", error);
      throw error;
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

  async function handleRemoveImage() {
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const res = await fetch("/api/account/profile/image", {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Impossible de supprimer l'image");
      }

      clearLocalPreview();
      setImage("");
      setFile(null);
      setSuccess("Photo de profil supprimée");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="-mx-4 border-b border-[var(--border)] bg-[var(--card)] px-4 py-10 sm:mx-0 sm:rounded-3xl sm:border sm:p-6 sm:shadow-[var(--shadow)]">
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

          {previewUrl || image ? (
            <div>
              <img
                src={previewUrl ?? image}
                alt="Avatar"
                className="h-20 w-20 rounded-full object-cover border"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-sm underline"
              >
                Supprimer la photo
              </button>
            </div>
          ) : null}

          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              const selectedFile = e.currentTarget.files?.[0] ?? null;
              void handleFileChange(selectedFile);
            }}
          />
          <p className="text-xs text-gray-600">
            JPG/PNG/WebP, max 2 Mo, minimum 128px x 128px.
          </p>
        </div>

        {success ? <p className="text-sm text-green-600">{success}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <BrutalButton
          type="submit"
          disabled={loading || uploading}
          label={loading || uploading ? "Enregistrement..." : "Enregistrer"}
          variant="accent"
        />
      </form>
    </section>
  );
}
