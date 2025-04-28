"use client";
import AdminSecretsForm from "@/components/admin";

export default function AdminPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-white w-full text-black">
            <div className="w-3/4">
                <AdminSecretsForm />
            </div>
        </div>
    );
}
