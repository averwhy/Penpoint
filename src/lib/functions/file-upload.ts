import path from "path";
import { writeFile } from "fs/promises";
import { fail, type ActionFailure } from "@sveltejs/kit";

const uploadDir = path.join(process.cwd(), "uploads");

const ALLOWED_TYPES = ["image/png", "image/jpg", "image/jpeg"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

function getFileExtension(mimeType: string): string {
    const extensions: Record<string, string> = {
        "image/png": ".png",
        "image/jpg": ".jpg",
        "image/jpeg": ".jpeg",
    };
    return extensions[mimeType] ?? ".bin";
}

export async function uploadFile(file: File | null, objectId: string, dirType: "clubs" | "events"): Promise<string | ActionFailure<object>> {
    // Validate file
    if (!file || file.size === 0) {
        return fail(400, { message: "Please upload a flyer for the event" });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
        return fail(400, {
            message: "Invalid flyer file type. Please upload a PNG, JPG, or JPEG image.",
        });
    }

    if (file.size > MAX_SIZE_BYTES) {
        return fail(400, {
            message: "Flyer file size exceeds the maximum limit of 5MB.",
        });
    }

    // Save file with proper extension
    const extension = getFileExtension(file.type);
    const filename = `${objectId}${extension}`;
    const filepath = path.join(uploadDir, dirType, filename);

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filepath, buffer);
    } catch (e) {
        console.error("Failed to save flyer file:", e);
        return fail(500, { message: "Failed to save flyer file" });
    }
    return filename;
}