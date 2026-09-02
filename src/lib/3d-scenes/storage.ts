import { del, get, put } from "@vercel/blob";
import { sceneConfig } from "./config";

const TRUSTED_HOST = /(^|\.)meshy\.ai$/i;

export class SceneStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SceneStorageError";
  }
}

async function downloadBounded(source: string, maxBytes: number) {
  let url = new URL(source);
  for (let redirect = 0; redirect < 4; redirect += 1) {
    if (url.protocol !== "https:" || !TRUSTED_HOST.test(url.hostname)) throw new SceneStorageError("Meshy returned an untrusted asset location.");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45_000);
    try {
      const response = await fetch(url, { redirect: "manual", cache: "no-store", signal: controller.signal });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) throw new SceneStorageError("Meshy returned an invalid asset redirect.");
        url = new URL(location, url);
        continue;
      }
      if (!response.ok || !response.body) throw new SceneStorageError("The generated asset could not be downloaded from Meshy.");
      const declaredSize = Number(response.headers.get("content-length") || 0);
      if (declaredSize > maxBytes) throw new SceneStorageError("The generated asset exceeds the configured file-size limit.");
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > maxBytes) {
          await reader.cancel();
          throw new SceneStorageError("The generated asset exceeds the configured file-size limit.");
        }
        chunks.push(value);
      }
      return { bytes: Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))), contentType: response.headers.get("content-type") || "application/octet-stream" };
    } finally {
      clearTimeout(timeout);
    }
  }
  throw new SceneStorageError("Meshy returned too many asset redirects.");
}

export async function saveSceneAssets(input: { ownerId: string; jobId: string; modelUrl: string; thumbnailUrl?: string }) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new SceneStorageError("Private Blob storage is not configured.");
  const config = sceneConfig();
  const model = await downloadBounded(input.modelUrl, config.maxModelBytes);
  const modelPath = `3d-scenes/${input.ownerId}/${input.jobId}/scene.glb`;
  const savedModel = await put(modelPath, model.bytes, {
    access: "private",
    contentType: "model/gltf-binary",
    allowOverwrite: true,
    addRandomSuffix: false,
  });

  let thumbnailPath: string | undefined;
  let thumbnailMime: string | undefined;
  if (input.thumbnailUrl) {
    const thumbnail = await downloadBounded(input.thumbnailUrl, config.maxThumbnailBytes);
    thumbnailMime = /^image\/(?:png|jpeg|webp)$/i.test(thumbnail.contentType) ? thumbnail.contentType : "image/png";
    const extension = thumbnailMime === "image/jpeg" ? "jpg" : thumbnailMime.split("/")[1];
    thumbnailPath = `3d-scenes/${input.ownerId}/${input.jobId}/thumbnail.${extension}`;
    await put(thumbnailPath, thumbnail.bytes, {
      access: "private",
      contentType: thumbnailMime,
      allowOverwrite: true,
      addRandomSuffix: false,
    });
  }

  return { modelPath: savedModel.pathname, modelSizeBytes: model.bytes.byteLength, thumbnailPath, thumbnailMime };
}

export async function readSceneAsset(pathname: string) {
  const result = await get(pathname, { access: "private" });
  if (!result || result.statusCode !== 200) return undefined;
  return { stream: result.stream, contentType: result.blob.contentType, size: result.blob.size };
}

export async function deleteSceneAssets(paths: Array<string | undefined>) {
  const existing = paths.filter((path): path is string => Boolean(path));
  if (existing.length) await del(existing);
}
