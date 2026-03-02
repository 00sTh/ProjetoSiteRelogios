/**
 * src/lib/blob.ts — Upload de imagens via Cloudinary
 *
 * Produção: CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET
 * Dev local: salva em public/uploads/ (servido estaticamente)
 */

import fs from "fs/promises";
import path from "path";

export interface UploadResult {
  url: string;
  pathname: string;
}

export async function uploadImage(
  file: Buffer | Blob,
  filename: string
): Promise<UploadResult> {
  // ── Cloudinary (produção) ──────────────────────────────────────────────────
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    const { v2: cloudinary } = await import("cloudinary");

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const buffer =
      file instanceof Buffer ? file : Buffer.from(await (file as Blob).arrayBuffer());

    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "altheia", resource_type: "image" },
          (err, res) => {
            if (err || !res) return reject(err ?? new Error("Cloudinary upload falhou"));
            resolve(res as { secure_url: string; public_id: string });
          }
        );
        stream.end(buffer);
      }
    );

    return { url: result.secure_url, pathname: result.public_id };
  }

  // ── Fallback local: public/uploads/ (apenas dev) ───────────────────────────
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
    const buffer =
      file instanceof Buffer ? file : Buffer.from(await (file as Blob).arrayBuffer());
    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
    await fs.writeFile(path.join(uploadsDir, safe), buffer);
    return { url: `/uploads/${safe}`, pathname: `uploads/${safe}` };
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "EROFS" || code === "EACCES") {
      throw new Error(
        "Configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET para upload em produção."
      );
    }
    throw err;
  }
}

export async function deleteImage(pathname: string): Promise<void> {
  // ── Cloudinary ─────────────────────────────────────────────────────────────
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    const { v2: cloudinary } = await import("cloudinary");
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    if (!pathname.startsWith("/uploads/") && !pathname.startsWith("uploads/")) {
      await cloudinary.uploader.destroy(pathname);
    }
    return;
  }

  // ── Local ──────────────────────────────────────────────────────────────────
  try {
    await fs.unlink(path.join(process.cwd(), "public", pathname));
  } catch {
    // arquivo pode não existir
  }
}
