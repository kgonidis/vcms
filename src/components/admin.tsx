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

function SecretField({
    label,
    name,
    value,
    handleChange,
}: {
    label: string;
    name: string;
    value: string;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <div className="mb-2">
            <label className="block mb-1 text-[#464db5]">{label}</label>
            <input
                className="w-full p-2 border border-[#464db5] rounded bg-transparent text-[#464db5] placeholder-[#464db5]"
                type="password"
                name={name}
                placeholder={label}
                value={value}
                onChange={handleChange}
            />
        </div>
    );
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
                className="w-3/4 max-w-md p-4 border border-[#464db5] rounded bg-white"
            >
                <h2 className="mb-4 text-xl font-semibold text-[#464db5]">
                    Social Account Secrets
                </h2>

                <SecretField
                    label="Twitter Consumer Key"
                    name="x_consumer_key"
                    value={secrets.x_consumer_key}
                    handleChange={handleChange}
                />

                <SecretField
                    label="Twitter Consumer Secret"
                    name="x_consumer_secret"
                    value={secrets.x_consumer_secret}
                    handleChange={handleChange}
                />

                <SecretField
                    label="Twitter Access Token"
                    name="x_access_token"
                    value={secrets.x_access_token}
                    handleChange={handleChange}
                />

                <SecretField
                    label="Twitter Access Secret"
                    name="x_access_secret"
                    value={secrets.x_access_secret}
                    handleChange={handleChange}
                />

                <SecretField
                    label="Twitter Bearer Token"
                    name="x_bearer_token"
                    value={secrets.x_bearer_token}
                    handleChange={handleChange}
                />

                <SecretField
                    label="Instagram Username"
                    name="instagram_username"
                    value={secrets.instagram_username}
                    handleChange={handleChange}
                />
                
                <SecretField
                    label="Instagram Password"
                    name="instagram_password"
                    value={secrets.instagram_password}
                    handleChange={handleChange}
                />

                <SecretField
                    label="Bluesky Handle"
                    name="bsky_handle"
                    value={secrets.bsky_handle}
                    handleChange={handleChange}
                />

                <SecretField
                    label="Bluesky App Password"
                    name="bsky_app_password"
                    value={secrets.bsky_app_password}
                    handleChange={handleChange}
                />

                <button
                    type="submit"
                    className="bg-[#464db5] text-white px-4 py-2 rounded hover:bg-[#3a3f9e] cursor-pointer"
                >
                    Save
                </button>
            </form>
        </div>
    );
}
