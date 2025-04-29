"use client";
import { useEffect, useState } from "react";
import ScheduledPostModal, { ScheduleParameters } from "@/components/post";
import { postSocial } from "@/components/send";
import ScheduledPostsTable, {
    getScheduledPosts,
    ScheduledPost,
} from "@/components/receive";
import NavBar from "@/components/navbar";

export default function Home() {
    const [isModalOpen, setModalOpen] = useState(false);
    const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);

    const refreshPosts = () => {
        getScheduledPosts()
            .then((posts) => {
                setScheduledPosts(posts);
            })
            .catch((error) => {
                console.error("Error fetching scheduled posts:", error);
            });
    };

    const handleSchedule = (payload: ScheduleParameters) => {
        postSocial(payload)
            .then((res) => {
                if (res.ok) {
                    refreshPosts(); // Refresh the list of scheduled posts
                } else {
                    console.error("Failed to schedule post:", res.statusText);
                }
            })
            .catch((error) => {
                console.error("Error scheduling post:", error);
                alert(`Failed to schedule post: ${error}`);
            });
    };

    useEffect(refreshPosts, []);

    return (
        <div className="flex min-h-screen flex-col">
            <div className="shrink-0">
                <NavBar />
            </div>
            <div className="flex flex-col grow items-center justify-center gap-6 bg-gray-100 text-[#464db5]">
                <button
                    onClick={() => setModalOpen(true)}
                    className="px-6 py-3 rounded bg-[#464db5] text-white shadow hover:bg-[#5d6199] transition"
                >
                    Schedule a Post
                </button>

                <ScheduledPostModal
                    isOpen={isModalOpen}
                    onRequestClose={() => setModalOpen(false)}
                    onSchedule={handleSchedule}
                />

                <ScheduledPostsTable
                    posts={scheduledPosts}
                    refresh={refreshPosts}
                />
            </div>
        </div>
    );
}
