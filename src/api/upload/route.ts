import { VercelRequest, VercelResponse } from "@vercel/node";
import { handleUpload } from "@vercel/blob/client";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only POST is valid
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Fail fast if env var missing
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({
      error: "Missing BLOB_READ_WRITE_TOKEN. Add it in Vercel env vars and .env.local.",
    });
  }

  try {
    const jsonResponse = await handleUpload({
      body: req.body,          // JSON body from client SDK
      request: req as any,     // handleUpload expects a Request-like object
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/*"],
        maximumSizeInBytes: 10 * 1024 * 1024, // 10MB
        tokenPayload: JSON.stringify({ purpose: "editorjs-image" }),
      }),
      onUploadCompleted: async () => {
        // Optional: store metadata in DB
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? "Upload init failed" });
  }
}
