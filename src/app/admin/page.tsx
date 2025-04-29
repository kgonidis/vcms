"use client";
import AdminSecretsForm from "@/components/admin";
import NavBar from "@/components/navbar";

export default function AdminPage() {
    return (
        <>
            <NavBar />
            <div className="flex items-center justify-center bg-white w-full text-black">
                <div className="w-3/4">
                    <AdminSecretsForm />
                </div>
            </div>
        </>
    );
}
