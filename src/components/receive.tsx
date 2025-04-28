"use client";

import DeleteButton from "./delete";

// api/getScheduledPosts.ts

export interface PostAsset {
    file_name: string; // Name of the file
    bucket: string; // Bucket name where the file is stored
    key: string; // Key for accessing the file
}

/** Server-side representation of a scheduled post */
export interface ScheduledPost {
    id: number; // Unique identifier for the post
    text: string; // Text content of the post
    schedule: string; // Scheduled date and time
    socials: { social: string }[]; // List of social media platforms
    assets: PostAsset[]; // List of assets associated with the post
    repeat: string; // Repeat interval (e.g., daily, weekly)
    immediate: boolean; // Whether the post is immediate or scheduled
    time: string; // Timestamp of when the post was created
}

/**
 * Fetch the list of scheduled / queued posts.
 *
 * @param endpoint  The API route that returns JSON (default: '/api/social/posts')
 * @returns         Array of scheduled-post objects
 * @throws          Error when response is not OK or JSON fails to parse
 */
export async function getScheduledPosts(): Promise<ScheduledPost[]> {
    // get the api URL from the environment variable
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const endpoint = `${apiUrl}/api/post`;

    const res = await fetch(endpoint, {
        method: "GET",
        headers: { Accept: "application/json" },
    });

    if (!res.ok) {
        const msg = await res.text().catch(() => res.statusText);
        throw new Error(`Fetch failed (${res.status}): ${msg}`);
    }

    // Validate / narrow the JSON if you like (zod, io-ts, etc.)
    const data = (await res.json()) as ScheduledPost[];
    return data;
}
interface Props {
    posts: ScheduledPost[];
    refresh?: () => void; // Optional refresh function
}

/* ───────────────────────── Component ───────────────────────── */

const ScheduledPostsTable: React.FC<Props> = ({ posts, refresh }) => {
    if (posts.length === 0) {
        return <p className="text-center text-gray-500">No scheduled posts.</p>;
    }

    return (
        <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-gray-100">
                    <tr>
                        <Th>ID</Th>
                        <Th>Text</Th>
                        <Th>Schedule</Th>
                        <Th>Repeat</Th>
                        <Th>Socials</Th>
                        <Th>Media</Th>
                        <Th>Actions</Th>
                    </tr>
                </thead>

                <tbody>
                    {posts.map((p) => (
                        <tr key={p.id} className="border-t last:border-b">
                            <Td>{p.id}</Td>
                            <Td className="max-w-xs truncate" title={p.text}>
                                {p.text.length > 30 ? p.text.slice(0, 30) + "..." : p.text}
                            </Td>
                            <Td>
                                {p.schedule
                                    ? new Date(p.schedule).toLocaleString()
                                    : "—"}
                            </Td>
                            <Td>{p.repeat}</Td>
                            <Td>{p.socials.map((s) => s.social).join(", ")}</Td>
                            <Td>{p.assets?.[0]?.file_name ?? "—"}</Td>
                            <Td>
                                <DeleteButton
                                    id={String(p.id)}
                                    refresh={refresh}
                                />
                            </Td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

/* ─── Tiny helpers for cleaner JSX ─── */

const Th: React.FC<React.PropsWithChildren> = ({ children }) => (
    <th className="px-4 py-2 font-semibold text-gray-700">{children}</th>
);

const Td: React.FC<
    React.PropsWithChildren<{ className?: string; title?: string }>
> = ({ children, className = "", title }) => (
    <td className={`px-4 py-2 ${className}`} title={title}>
        {children}
    </td>
);

export default ScheduledPostsTable;
