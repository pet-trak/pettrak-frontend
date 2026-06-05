"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { StepIndicator } from "@/components/registration/FormFields";
import StepClinicInfo from "./StepClinicInfo";
import StepLocation   from "./StepLocation";
import StepSecurity   from "./StepSecurity";

const STEPS = ["Clinic Info", "Location", "Security"];

export default function RegisterClinicForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [step, setStep]       = useState(0);

  const [form, setForm] = useState({
    clinicName:    "",
    email:         "",
    phone:         "",
    licenseNumber: "",
    password:      "",
    address: { street: "", city: "", state: "", country: "" },
  });

  const [docs, setDocs] = useState({
    licenseDocument:         null as File | null,
    registrationCertificate: null as File | null,
    additionalDocuments:     [] as File[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("clinicName",    form.clinicName);
      fd.append("email",         form.email);
      fd.append("phone",         form.phone);
      fd.append("password",      form.password);
      fd.append("licenseNumber", form.licenseNumber);
      fd.append("address",       JSON.stringify(form.address));
      if (docs.licenseDocument)         fd.append("licenseDocument",         docs.licenseDocument);
      if (docs.registrationCertificate) fd.append("registrationCertificate", docs.registrationCertificate);
      docs.additionalDocuments.forEach((f) => fd.append("additionalDocuments", f));

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/clinic/register`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      router.push("/verification");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center pry-ff px-4 py-10"
      style={{ backgroundColor: "var(--bg-clr)" }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center mb-6">
        <Link href="/">
          <Image
            src="/official_logo_remove.png"
            alt="PetTrak"
            width={160}
            height={160}
            className="h-10 w-auto object-contain mb-2"
          />
        </Link>
        <p className="text-xs" style={{ color: "var(--sec-clr)", opacity: 0.5 }}>
          Modern Veterinary Care System Registration
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-10">
        <StepIndicator current={step} steps={STEPS} />

        <form onSubmit={handleSubmit}>
          {step === 0 && (
            <StepClinicInfo
              clinicName={form.clinicName}
              email={form.email}
              phone={form.phone}
              onChange={(key, value) => setForm({ ...form, [key]: value })}
              onNext={() => setStep(1)}
            />
          )}
          {step === 1 && (
            <StepLocation
              address={form.address}
              onChange={(key, value) => setForm({ ...form, address: { ...form.address, [key]: value } })}
              onNext={() => setStep(2)}
              onBack={() => setStep(0)}
            />
          )}
          {step === 2 && (
            <StepSecurity
              password={form.password}
              licenseNumber={form.licenseNumber}
              docs={docs}
              loading={loading}
              error={error}
              onPasswordChange={(v) => setForm({ ...form, password: v })}
              onLicenseNumberChange={(v) => setForm({ ...form, licenseNumber: v })}
              onDocsChange={(key, value) => setDocs({ ...docs, [key]: value })}
              onBack={() => setStep(1)}
            />
          )}
        </form>

        <p className="text-xs text-center mt-6" style={{ color: "var(--sec-clr)", opacity: 0.6 }}>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold hover:underline" style={{ color: "var(--acc-clr)", opacity: 1 }}>
            Log in here
          </Link>
        </p>
      </div>
    </main>
  );
}