"use client";
import React, { useState, useEffect } from "react";

// Interface for integration secrets
export interface IntegrationSecrets {
    x_consumer_key: string; // Twitter Consumer Key
    x_consumer_secret: string; // Twitter Consumer Secret
    x_access_token: string; // Twitter Access Token
    x_access_secret: string; // Twitter Access Secret
    x_bearer_token: string; // Twitter Bearer Token
    instagram_username: string; // Instagram Username
    instagram_password: string; // Instagram Password
    bsky_handle: string; // Bluesky Handle
    bsky_app_password: string; // Bluesky App Password
    created_at?: string; // Optional timestamp for when the secrets were created
}

// Fetch the latest integration secrets from the backend
export async function getIntegrationSecrets(): Promise<IntegrationSecrets | null> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const response = await fetch(`${apiUrl}/api/secrets`, { method: "GET" });
    if (!response.ok) return null;
    const data = await response.json();
    return data as IntegrationSecrets;
}

// Create new integration secrets in the backend
export async function createIntegrationSecrets(
    secrets: IntegrationSecrets
): Promise<void> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const response = await fetch(`${apiUrl}/api/secrets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(secrets),
    });
    if (!response.ok) {
        const msg = await response.text().catch(() => response.statusText);
        throw new Error(
            `Failed to create secrets (${response.status}): ${msg}`
        );
    }
}

// Delete integration secrets from the backend
export async function deleteIntegrationSecrets(id?: string): Promise<void> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const url = apiUrl + id ? `/api/secrets?id=${id}` : "/api/secrets";
    const response = await fetch(url, { method: "DELETE" });
    if (!response.ok) {
        const msg = await response.text().catch(() => response.statusText);
        throw new Error(
            `Failed to delete secrets (${response.status}): ${msg}`
        );
    }
}

// AdminSecretsForm component for managing integration secrets
export default function AdminSecretsForm() {
    const [secrets, setSecrets] = useState<IntegrationSecrets>({
        x_consumer_key: "",
        x_access_secret: "",
        x_access_token: "",
        x_consumer_secret: "",
        x_bearer_token: "",
        instagram_username: "",
        instagram_password: "",
        bsky_handle: "",
        bsky_app_password: "",
    });

    // Fetch existing secrets on component mount
    useEffect(() => {
        getIntegrationSecrets()
            .then((data) => {
                if (data) {
                    setSecrets(data);
                }
            })
            .catch(console.error);
    }, []);

    // Handle input changes in the form
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!secrets) return;
        setSecrets({ ...secrets, [e.target.name]: e.target.value });
    };

    // Save secrets to the backend
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (secrets) await createIntegrationSecrets(secrets);
    };

    return (
        <div className="flex items-center justify-center  text-white my-4">
            <form
                onSubmit={handleSave}
                className="w-3/4 max-w-md p-4 border border-[#464db5] rounded bg-[#464db5]"
            >
                <h2 className="mb-4 text-xl font-semibold">Social Account Secrets</h2>

                <div className="mb-2">
                    <label className="block mb-1 text-white">Twitter Consumer Key</label>
                    <input
                        className="w-full p-2 border border-white rounded bg-transparent text-white placeholder-white"
                        type="password"
                        name="x_consumer_key"
                        placeholder="Twitter Consumer Key"
                        value={secrets.x_consumer_key}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-2">
                    <label className="block mb-1 text-white">Twitter Consumer Secret</label>
                    <input
                        className="w-full p-2 border border-white rounded bg-transparent text-white placeholder-white"
                        type="password"
                        name="x_consumer_secret"
                        placeholder="Twitter Consumer Secret"
                        value={secrets.x_consumer_secret}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-2">
                    <label className="block mb-1 text-white">Twitter Access Token</label>
                    <input
                        className="w-full p-2 border border-white rounded bg-transparent text-white placeholder-white"
                        type="password"
                        name="x_access_token"
                        placeholder="Twitter Access Token"
                        value={secrets.x_access_token}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-2">
                    <label className="block mb-1 text-white">Twitter Access Secret</label>
                    <input
                        className="w-full p-2 border border-white rounded bg-transparent text-white placeholder-white"
                        type="password"
                        name="x_access_secret"
                        placeholder="Twitter Access Secret"
                        value={secrets.x_access_secret}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-2">
                    <label className="block mb-1 text-white">Twitter Bearer Token</label>
                    <input
                        className="w-full p-2 border border-white rounded bg-transparent text-white placeholder-white"
                        type="password"
                        name="x_bearer_token"
                        placeholder="Twitter Bearer Token"
                        value={secrets.x_bearer_token}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-2">
                    <label className="block mb-1 text-white">Instagram Username</label>
                    <input
                        className="w-full p-2 border border-white rounded bg-transparent text-white placeholder-white"
                        type="text"
                        name="instagram_username"
                        placeholder="Instagram Username"
                        value={secrets.instagram_username}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-2">
                    <label className="block mb-1 text-white">Instagram Password</label>
                    <input
                        className="w-full p-2 border border-white rounded bg-transparent text-white placeholder-white"
                        type="password"
                        name="instagram_password"
                        placeholder="Instagram Password"
                        value={secrets.instagram_password}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-2">
                    <label className="block mb-1 text-white">Bluesky Handle</label>
                    <input
                        className="w-full p-2 border border-white rounded bg-transparent text-white placeholder-white"
                        type="text"
                        name="bsky_handle"
                        placeholder="Bluesky Handle"
                        value={secrets.bsky_handle}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-1 text-white">Bluesky App Password</label>
                    <input
                        className="w-full p-2 border border-white rounded bg-transparent text-white placeholder-white"
                        type="password"
                        name="bsky_app_password"
                        placeholder="Bluesky App Password"
                        value={secrets.bsky_app_password}
                        onChange={handleChange}
                    />
                </div>

                <button
                    type="submit"
                    className="bg-white text-[#464db5] px-4 py-2 rounded hover:bg-gray-100"
                >
                    Save
                </button>
            </form>
        </div>
    );
}