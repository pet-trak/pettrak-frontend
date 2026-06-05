import { Building2, Mail, Phone, ArrowRight } from "lucide-react";
import { PhoneInput } from "react-international-phone";
import { Field, TextInput, btnBase } from "./FormFields";

interface Props {
  clinicName: string;
  email: string;
  phone: string;
  onChange: (key: "clinicName" | "email" | "phone", value: string) => void;
  onNext: () => void;
}

export default function StepClinicInfo({ clinicName, email, phone, onChange, onNext }: Props) {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--sec-clr)" }}>Register Your Clinic</h1>
        <p className="text-xs mt-1" style={{ color: "var(--sec-clr)", opacity: 0.55 }}>
          Tell us a bit about your practice to get started with PetTrak.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Field label="Clinic Name" icon={<Building2 size={13} />}>
          <TextInput
            placeholder="Paws & Whiskers Veterinary"
            value={clinicName}
            onChange={(v) => onChange("clinicName", v)}
            required
          />
        </Field>

        <Field label="Clinic Email" icon={<Mail size={13} />}>
          <TextInput
            type="email"
            placeholder="contact@yourclinic.com"
            value={email}
            onChange={(v) => onChange("email", v)}
            required
          />
        </Field>

        <Field label="Phone Number" icon={<Phone size={13} />}>
          <div
            className="relative w-full flex items-center rounded-lg bg-gray-50 border border-gray-200 transition-all focus-within:border-[var(--acc-clr)]"
          >
            <PhoneInput
              defaultCountry="ng"
              value={phone}
              onChange={(v) => onChange("phone", v)}
              placeholder="(555) 000 0000"
              style={{ width: "100%" }}
              inputClassName="!flex-1 !w-full !bg-transparent !text-sm !px-4 !outline-none !border-none !shadow-none !focus:ring-0 !h-[46px]"
              countrySelectorStyleProps={{
                buttonClassName:
                  "!h-[46px] !px-3 !bg-transparent !border-none !border-r !border-gray-200 !hover:bg-gray-100 !rounded-l-lg !transition-colors",
                dropdownStyleProps: {
                  className:
                    "!absolute !top-full !left-0 !mt-1 !z-50 !w-full !min-w-[260px] !rounded-xl !shadow-xl !border !border-gray-200 !bg-(--pry-clr) !overflow-auto !max-h-50",
                },
              }}
            />
          </div>
        </Field>

        <button
          type="button"
          onClick={onNext}
          className={btnBase + " w-full mt-2 text-white"}
          style={{ backgroundColor: "var(--acc-clr)" }}
          onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
        >
          Next <ArrowRight size={15} />
        </button>
      </div>
    </>
  );
}