import { apiRequest } from "./api";

export async function deleteFromImageKit(fileId: string): Promise<void> {
  try {
    await apiRequest(`/delete/${fileId}`, { method: "DELETE" });
  } catch (err) {
    console.error("Failed to delete file from ImageKit:", err);
    throw err;
  }
}

export async function uploadToImageKit(
  file: File,
  previousFileId?: string
): Promise<{ url: string; fileId: string }> {
  // If a previous file ID is passed, delete it before uploading the new one
  if (previousFileId) {
    try {
      await deleteFromImageKit(previousFileId);
    } catch (err) {
      // Log but don't block the new upload if deletion fails
      console.warn("Attempt to delete old file failed, proceeding with upload:", err);
    }
  }

  // Fetch authentication credentials from the backend
  const authData = await apiRequest("/imageKitAuth");
  const { signature, expire, token, publicKey } = authData;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", file.name);
  formData.append("publicKey", publicKey);
  formData.append("signature", signature);
  formData.append("expire", expire);
  formData.append("token", token);

  const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to upload file to ImageKit");
  }

  const uploadData = await response.json();
  return { url: uploadData.url, fileId: uploadData.fileId };
}
