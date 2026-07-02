// dashboard/settings/page.tsx
import { Metadata } from "next";
import Preferences from "@/components/preference-settings";
import Actions from "@/components/action-settings";

export const metadata: Metadata = {
    title: "Settings",
    description: "Settings page",
};

export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-8 p-6 max-w-5xl sec-ff">
            <Preferences />
            <Actions />
        </div>
    );
}