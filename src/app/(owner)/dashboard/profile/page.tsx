"use client";

import { useState } from "react";
import { useAuthStore, OwnerProfile } from "@/store/auth";
import { updateProfile } from "@/libs/api/user";
import { toast } from "sonner";
// import Image from "next/image";
// import { ImageIcon, Trash, User } from "lucide-react";
import PetsPanel from "@/components/pet-panel";

type FormState = {
  fullname: string;
  phoneNumber: string;
};

// Separated so the loading guard fires before useState ever initializes
function ProfileForm({ ownerProfile }: Readonly<{ ownerProfile: OwnerProfile }>) {
  const { setProfile } = useAuthStore();

  const [form, setForm] = useState<FormState>({
    fullname: ownerProfile.fullname ?? "",
    phoneNumber: ownerProfile.phoneNumber ?? "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const updated = await updateProfile({
        fullname: form.fullname,
        phoneNumber: form.phoneNumber,
      });
      toast.success("Profile updated");
      const token = localStorage.getItem("token") ?? "";
      setProfile(updated, token);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  };

  const inputClass =
    "w-full bg-white/70 backdrop-blur-sm px-3 sm:px-4 py-2 sm:py-2.5 text-sm rounded-xl " +
    "ring-1 ring-gray-200/70 focus:ring-2 focus:ring-green-400/60 " +
    "outline-none transition shadow-sm";

  const labelClass =
    "block text-[10px] sm:text-[11px] font-semibold tracking-wide text-gray-400 uppercase mb-1.5";

  const firstPet = ownerProfile.pets?.[0];
  const petImage =
    firstPet?.photo && firstPet.photo.trim().length > 0
      ? firstPet.photo
      : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen sec-ff mb-14">
      <h1 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800">
        Account Preferences
      </h1>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* LEFT - Main Content */}
        <div className="flex-1 space-y-4 sm:space-y-6">

          {/* FORM - Edit Profile */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-4 sm:p-5 space-y-4 sm:space-y-5 shadow-sm ring-1 ring-gray-100"
          >
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={labelClass}>Full Name</label>
                <input
                  className={inputClass}
                  value={form.fullname}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, fullname: e.target.value }))
                  }
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className={labelClass}>Phone Number</label>
                <input
                  className={inputClass}
                  value={form.phoneNumber}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phoneNumber: e.target.value }))
                  }
                  placeholder="Enter your phone number"
                  type="tel"
                />
              </div>

              <div>
                <label className={labelClass}>Email</label>
                <input
                  className={inputClass + " opacity-60 cursor-not-allowed bg-gray-50"}
                  value={ownerProfile.email ?? ""}
                  disabled
                  readOnly
                  placeholder="Email address"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button className="bg-green-500 hover:bg-green-600 transition text-white px-4 sm:px-5 py-2 rounded-xl text-sm font-semibold shadow-sm w-full sm:w-auto">
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT - Pets Panel */}
        <div className="w-full lg:w-80 xl:w-96">
          <PetsPanel />
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { profile } = useAuthStore();

  const ownerProfile: OwnerProfile | null =
    profile?.type === "owner" ? profile : null;

  if (!ownerProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-6 text-sm text-gray-400 animate-pulse">
          Loading profile...
        </div>
      </div>
    );
  }

  return <ProfileForm ownerProfile={ownerProfile} />;
}