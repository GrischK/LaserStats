import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { getAuthSession } from "@/lib/session";

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("avatar");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Fichier avatar manquant" }, { status: 400 });
    }

    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!allowedTypes.has(file.type)) {
      return NextResponse.json(
        { message: "Format invalide. Formats acceptés: JPG, PNG ou WebP" },
        { status: 400 }
      );
    }

    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return NextResponse.json({ message: "Le fichier est trop lourd (max 2 Mo)" }, { status: 400 });
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(inputBuffer).metadata();

    if (
      !metadata.width ||
      !metadata.height ||
      metadata.width < 64 ||
      metadata.height < 64
    ) {
      return NextResponse.json(
        { message: "Image trop petite. Minimum 64px x 64px" },
        { status: 400 }
      );
    }

    const outputBuffer = await sharp(inputBuffer)
      .rotate()
      .resize(512, 512, { fit: "cover", position: "center" })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();

    const pathname = `avatars/user-${session.user.id}-${Date.now()}.webp`;

    const blob = await put(pathname, outputBuffer, {
      access: "public",
      contentType: "image/webp",
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Upload impossible",
      },
      { status: 400 }
    );
  }
}
