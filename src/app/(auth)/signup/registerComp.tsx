"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Building2, User } from "lucide-react";

export default function RegisterComp() {
  const router = useRouter();
  const [msgIndex, setMsgIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const messages = [
    "A unified system for veterinary clinics and pet owners.",
    "Track vaccinations, treatments, and appointments in one place.",
    "Built for modern clinics and responsible pet owners.",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const roles = [
    {
      name: "Veterinary Clinic",
      route: "/signup/clinic",
      description: "Manage appointments, medical records, and clinic staff.",
      icon: <Building2 size={20} />,
    },
    {
      name: "Pet Owner",
      route: "/signup/pet-owner",
      description: "Book visits, track vaccinations, and monitor pet health.",
      icon: <User size={20} />,
    },
  ];

  return (
    <main
      className="min-h-screen flex items-center justify-center pry-ff p-4"
      style={{ backgroundColor: "var(--bg-clr)" }}
    >
      <div className="w-full max-w-4xl flex rounded-2xl shadow-xl overflow-hidden bg-white">

        {/* ── Left: Branding (desktop only) ── */}
        <section
          className="hidden md:flex w-[340px] flex-shrink-0 flex-col justify-between p-10 relative overflow-hidden"
          style={{ backgroundColor: "var(--acc-clr)" }}
        >
          {/* decorative circles */}
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full opacity-10 bg-white" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full opacity-10 bg-white" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full opacity-5 bg-white" />

          <div className="relative z-10 flex flex-col gap-6">
            <Link href="/">
              <Image
                src="/official_logo_remove.png"
                alt="PetTrak Logo"
                width={200}
                height={200}
                className="h-9 w-auto object-contain"
              />
            </Link>

            <div>
              <p className="text-white text-2xl font-bold leading-snug mt-6">
                Simplifying care for<br />every animal.
              </p>
              <p
                key={msgIndex}
                className="text-white/80 text-sm mt-4 leading-relaxed transition-opacity duration-700"
              >
                {messages[msgIndex]}
              </p>
            </div>
          </div>

          {/* bottom */}
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              {/* avatar stack */}
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white/60 bg-white/20 -ml-2 first:ml-0"
                />
              ))}
            </div>
            <p className="text-white/70 text-xs">Trusted by over 3,000 professionals</p>
          </div>
        </section>

        {/* ── Right: Form ── */}
        <section className="flex-1 flex flex-col justify-center p-8 md:p-12">

          {/* mobile logo */}
          <div className="flex md:hidden justify-center mb-8">
            <Link href="/">
              <Image
                src="/official_logo_remove.png"
                alt="PetTrak Logo"
                width={160}
                height={160}
                className="h-8 w-auto object-contain"
              />
            </Link>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--sec-clr)" }}>
            Create Your Account
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--sec-clr)", opacity: 0.6 }}>
            Choose how you&apos;ll be using the platform to get started.
          </p>

          {/* Role cards */}
          <div className="flex flex-col gap-4 w-full">
            {roles.map((role) => {
              const isSelected = selected === role.name;
              return (
                <button
                  key={role.name}
                  onClick={() => setSelected(role.name)}
                  className="w-full flex items-start gap-4 border rounded-xl p-5 text-left transition-all duration-200 cursor-pointer active:scale-[0.98]"
                  style={{
                    borderColor: isSelected ? "var(--acc-clr)" : "#e5e7eb",
                    backgroundColor: isSelected ? "var(--bg-clr)" : "white",
                    boxShadow: isSelected ? "0 0 0 1px var(--acc-clr)" : "none",
                  }}
                >
                  {/* icon box */}
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center mt-0.5"
                    style={{
                      backgroundColor: isSelected ? "var(--acc-clr)" : "#f3f4f6",
                      color: isSelected ? "white" : "var(--sec-clr)",
                    }}
                  >
                    {role.icon}
                  </div>

                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--sec-clr)" }}>
                      {role.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--sec-clr)", opacity: 0.6 }}>
                      {role.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Continue button */}
          <button
            disabled={!selected}
            onClick={() => {
              const role = roles.find((r) => r.name === selected);
              if (role) router.push(role.route);
            }}
            className="mt-6 w-full py-3 rounded-lg text-white font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: "var(--acc-clr)" }}
            onMouseEnter={(e) => { if (selected) e.currentTarget.style.filter = "brightness(1.1)"; }}
            onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
          >
            Continue to Registration
          </button>

          {/* Login link */}
          <p className="text-sm text-center mt-6" style={{ color: "var(--sec-clr)", opacity: 0.7 }}>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold hover:underline underline-offset-4"
              style={{ color: "var(--acc-clr)", opacity: 1 }}
            >
              Log in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}