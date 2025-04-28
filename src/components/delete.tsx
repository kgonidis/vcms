import React from "react";

// Function to delete an item by its ID
async function deleteItem(id: string) {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const endpoint = `${baseURL}/api/post`;
    const response = await fetch(`${endpoint}/${id}`, {
        method: "DELETE", // HTTP DELETE request
    });
    if (!response.ok) {
        throw new Error(`Failed to delete item with id ${id}`); // Throw error if request fails
    }
    return response.json(); // Return the response as JSON
}

// Props interface for the DeleteButton component
interface DeleteButtonProps {
    id: string; // ID of the item to delete
    refresh?: () => void; // Optional refresh function to reload data
}

// DeleteButton component for deleting an item
const DeleteButton: React.FC<DeleteButtonProps> = ({ id, refresh }) => {
    // Handle the delete action
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
            onClick={handleDelete} // Trigger handleDelete on click
            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
            Delete
        </button>
    );
};

export default DeleteButton;
