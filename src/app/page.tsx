"use client";
import { useEffect, useState } from "react";
import ScheduledPostModal, { ScheduleParameters } from "@/components/post";
import { postSocial } from "@/components/send";
import ScheduledPostsTable, {
    getScheduledPosts,
    ScheduledPost,
} from "@/components/receive";

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
        console.log("Scheduled post data:", payload);
        // 👉 you can call your backend API here instead of console.log
        postSocial(payload).then((res) => {
            if (res.ok) {
                refreshPosts(); // Refresh the list of scheduled posts
            } else {
                console.error("Failed to schedule post:", res.statusText);
            }
        });
    };

    useEffect(refreshPosts, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-100 text-black">
            <h1 className="text-2xl font-bold">Social-Media Scheduler</h1>

            <button
                onClick={() => setModalOpen(true)}
                className="px-6 py-3 rounded bg-blue-600 text-white shadow hover:bg-blue-700 transition"
            >
                Schedule a Post
            </button>

            <ScheduledPostModal
                isOpen={isModalOpen}
                onRequestClose={() => setModalOpen(false)}
                onSchedule={handleSchedule}
            />

            <ScheduledPostsTable posts={scheduledPosts} refresh={refreshPosts} />
        </div>
    );
}
