import { storage } from "./appwrite";
import { ID } from "appwrite";

const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID ?? '';

export async function uploadImage(file: File) {
    const created = await storage.createFile(BUCKET_ID, ID.unique(), file);
    return created;
}

export function getFilePreview(bucketId: string, fileId: string) {
    // Returns a URL to the file preview
    return storage.getFilePreview(bucketId, fileId);
}