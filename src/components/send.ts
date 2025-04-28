"use client";
import { ScheduleParameters } from "@/components/post";

/**
 * Send a social-media post (immediate or scheduled) to your backend.
 * The backend is responsible for authenticating with Instagram, X, Bluesky,
 * scheduling jobs, etc.
 *
 * @param payload data collected by ScheduledPostModal
 * @param endpoint defaults to '/api/social/post'
 */
export async function postSocial(
  payload: ScheduleParameters,
): Promise<Response> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const endpoint = `${apiUrl}/api/post`;
  // ---------- 1. Build multipart body ----------
  const form = new FormData();

  form.append("text", payload.text);
  form.append("immediate", String(payload.immediate));

  // Date/time only when scheduling
  if (!payload.immediate && payload.dateTime) {
    form.append("schedule", payload.dateTime.toISOString());
    form.append("repeat", payload.repeat);          // daily / weekly / ...
  }

  // Multi-select platforms → comma-separated list (or append each one)
  payload.social.forEach((platform) => form.append("socials[]", platform));

  // Media files (raw bytes)
  payload.assets.forEach((file) => form.append("media", file, file.name));
  form.append("time", new Date().toISOString()); // optional timestamp

  // ---------- 2. Fire the request ----------
  const res = await fetch(endpoint, {
    method: "POST",
    body: form,   // browser sets Content-Type: multipart/form-data; boundary=...
  });

  // ---------- 3. Handle response ----------
  if (!res.ok) {
    // Optional: surface backend message
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`Upload failed (${res.status}): ${msg}`);
  }

  return res; // caller can await res.json() if backend returns JSON
}

export async function fileToBytes(file: File | Blob): Promise<Uint8Array> {
  const buffer = await file.arrayBuffer();
  return new Uint8Array(buffer);
}