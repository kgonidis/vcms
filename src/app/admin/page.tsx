"use client";
import React, { useState, useEffect } from "react";

export interface IntegrationSecrets {
    x_consumer_key: string;
    x_consumer_secret: string;
    x_access_token: string;
    x_access_secret: string;
    x_bearer_token: string;
    instagram_username: string;
    instagram_password: string;
    bsky_handle: string;
    bsky_app_password: string;
    created_at?: string;
}

export async function getIntegrationSecrets(): Promise<IntegrationSecrets | null> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const response = await fetch(`${apiUrl}/api/secrets`, { method: "GET" });
    if (!response.ok) return null;
    const data = await response.json();
    return data as IntegrationSecrets;
}

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

export function AdminSecretsForm() {
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

    useEffect(() => {
        getIntegrationSecrets()
            .then((data) => {
                if (data) {
                    setSecrets(data);
                }
            })
            .catch(console.error);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!secrets) return;
        setSecrets({ ...secrets, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (secrets) await createIntegrationSecrets(secrets);
    };

    return (
        <form
            onSubmit={handleSave}
            className="max-w-md mx-auto p-4 bg-white border border-gray-300 rounded"
        >
            <h2 className="mb-4 text-xl font-semibold">Integration Secrets</h2>
            <div className="mb-2">
                <label className="block mb-1">Twitter Consumer Key</label>
                <input
                    className="w-full p-2 border border-gray-300 rounded"
                    type="password"
                    name="x_consumer_key"
                    placeholder="Twitter Consumer Key"
                    value={secrets.x_consumer_key}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-2">
                <label className="block mb-1">Twitter Consumer Secret</label>
                <input
                    className="w-full p-2 border border-gray-300 rounded"
                    type="password"
                    name="x_consumer_secret"
                    placeholder="Twitter Consumer Secret"
                    value={secrets.x_consumer_secret}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-2">
                <label className="block mb-1">Twitter Access Token</label>
                <input
                    className="w-full p-2 border border-gray-300 rounded"
                    type="password"
                    name="x_access_token"
                    placeholder="Twitter Access Token"
                    value={secrets.x_access_token}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-2">
                <label className="block mb-1">Twitter Access Secret</label>
                <input
                    className="w-full p-2 border border-gray-300 rounded"
                    type="password"
                    name="x_access_secret"
                    placeholder="Twitter Access Secret"
                    value={secrets.x_access_secret}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-2">
                <label className="block mb-1">Twitter Bearer Token</label>
                <input
                    className="w-full p-2 border border-gray-300 rounded"
                    type="password"
                    name="x_bearer_token"
                    placeholder="Twitter Bearer Token"
                    value={secrets.x_bearer_token}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-2">
                <label className="block mb-1">Instagram Username</label>
                <input
                    className="w-full p-2 border border-gray-300 rounded"
                    type="text"
                    name="instagram_username"
                    placeholder="Instagram Username"
                    value={secrets.instagram_username}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-2">
                <label className="block mb-1">Instagram Password</label>
                <input
                    className="w-full p-2 border border-gray-300 rounded"
                    type="password"
                    name="instagram_password"
                    placeholder="Instagram Password"
                    value={secrets.instagram_password}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-2">
                <label className="block mb-1">Bluesky Handle</label>
                <input
                    className="w-full p-2 border border-gray-300 rounded"
                    type="text"
                    name="bsky_handle"
                    placeholder="Bluesky Handle"
                    value={secrets.bsky_handle}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-4">
                <label className="block mb-1">Bluesky App Password</label>
                <input
                    className="w-full p-2 border border-gray-300 rounded"
                    type="password"
                    name="bsky_app_password"
                    placeholder="Bluesky App Password"
                    value={secrets.bsky_app_password}
                    onChange={handleChange}
                />
            </div>
            <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Save
            </button>
        </form>
    );
}

export default function AdminPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-white w-full text-black">
            <div className="w-3/4">
                <AdminSecretsForm />
            </div>
        </div>
    );
}
