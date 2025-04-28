import React from "react";

async function deleteItem(id: string) {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const endpoint = `${baseURL}/api/post`;
    const response = await fetch(`${endpoint}/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        throw new Error(`Failed to delete item with id ${id}`);
    }
    return response.json();
}

interface DeleteButtonProps {
    id: string;
    refresh?: () => void; // Optional refresh function
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ id, refresh }) => {
    const handleDelete = async () => {
        try {
            await deleteItem(id);
        } catch (error) {
            console.error("Error deleting item:", error);
        }
        
        if (refresh) {
            refresh();
        }
    };

    return (
        <button
            onClick={handleDelete}
            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
            Delete
        </button>
    );
};

export default DeleteButton;
