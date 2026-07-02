"use client";

import { ChevronRight, UserCircle2, Users } from "lucide-react";
import Link from "next/link";

interface PreferenceItem {
    label: string;
    description: string;
    icon: React.ElementType;
    href: string;
    accent?: boolean;
}

const preferenceItems: PreferenceItem[] = [
    {
        label: "Profile Settings",
        description: "Manage your personal information",
        icon: UserCircle2,
        href: "/dashboard/settings/profile",
        accent: true,
    },
    // {
    //     label: "Staffs",
    //     description: "Manage your clinic staff",
    //     icon: Users,
    //     href: "/dashboard/settings/staffs",
    // },
];

export default function Preferences() {
    return (
        <section>
            <h2 className="text-xl font-semibold text-sec-clr mb-3">
                Preferences
            </h2>

            <div className="flex flex-col gap-5">
                {preferenceItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="flex items-center justify-between bg-pry-clr rounded-2xl px-4 py-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-bg-clr text-acc-clr"
                                >
                                    <Icon size={20} />
                                </span>

                                <div>
                                    <p className="text-sm font-semibold text-sec-clr">
                                        {item.label}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {item.description}
                                    </p>
                                </div>
                            </div>

                            <ChevronRight
                                size={18}
                                className="text-acc-clr"
                            />
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}