import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/session";

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const safePath = pathname.replace(/[^a-zA-Z0-9._/-]/g, "");

        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
          maximumSizeInBytes: 4 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            userId: session.user.id,
            folder: "avatars",
            pathname: safePath,
          }),
        };
      },
      onUploadCompleted: async () => {
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Upload impossible" },
      { status: 400 }
    );
  }
}
