/* eslint-disable @next/next/no-img-element */
/* components/NavBar.tsx */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx"; // optional convenience helper

const BRAND_COLOR = "#464db5";

export default function NavBar() {
    const pathname = usePathname(); // highlight the active link

    const linkClass = (href: string) =>
        clsx(
            "group relative flex items-center px-4 py-2 transition",
            pathname === href &&
                "after:absolute after:inset-x-4 after:-bottom-1 after:h-0.5 after:rounded-full",
            pathname === href && "after:bg-white"
        );

    const imgClass =
        "h-12 w-auto transition-transform duration-200 ease-in-out group-hover:scale-105";

    return (
        <nav
            className="sticky top-0 z-50 flex items-center justify-between px-6 shadow-md py-4"
            style={{ backgroundColor: BRAND_COLOR }}
        >
            <h1 className="text-2xl font-bold text-white">
                {pathname.includes("admin") ? "Admin" : "Social Media Scheduler"}
            </h1>
            <div className="flex items-center gap-2">
                {/* left – site logo */}
                <Link href="/" className={linkClass("/")}>
                    <img
                        src="/vcms.png"
                        alt="VCMS Home"
                        width={240}
                        height={64}
                        className={imgClass}
                    />
                </Link>

                {/* center – Title Social Media Scheduler*/}

                {/* right – admin link */}
                <Link href="/admin" className={linkClass("/admin")}>
                    <img
                        src="/admin.png"
                        alt="Admin dashboard"
                        width={240}
                        height={64}
                        className={imgClass}
                    />
                </Link>
            </div>
        </nav>
    );
}
