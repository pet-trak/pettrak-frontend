import { MapPin, ArrowRight, ArrowLeft } from "lucide-react";
import { Field, TextInput, btnBase } from "./FormFields";

interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
}

interface Props {
  address: Address;
  onChange: (key: keyof Address, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepLocation({ address, onChange, onNext, onBack }: Props) {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--sec-clr)" }}>Clinic Location</h1>
        <p className="text-xs mt-1" style={{ color: "var(--sec-clr)", opacity: 0.55 }}>
          Where is your clinic located?
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Field label="Street" icon={<MapPin size={13} />}>
          <TextInput placeholder="123 Vet Street" value={address.street}
            onChange={(v) => onChange("street", v)} required />
        </Field>
        <Field label="City" icon={<MapPin size={13} />}>
          <TextInput placeholder="Lagos" value={address.city}
            onChange={(v) => onChange("city", v)} required />
        </Field>
        <Field label="State" icon={<MapPin size={13} />}>
          <TextInput placeholder="Lagos State" value={address.state}
            onChange={(v) => onChange("state", v)} required />
        </Field>
        <Field label="Country" icon={<MapPin size={13} />}>
          <TextInput placeholder="Nigeria" value={address.country}
            onChange={(v) => onChange("country", v)} required />
        </Field>

        <div className="flex gap-3 mt-2">
          <button type="button" onClick={onBack}
            className={btnBase + " flex-1"}
            style={{ backgroundColor: "#f3f4f6", color: "var(--sec-clr)" }}
          >
            <ArrowLeft size={15} /> Back
          </button>
          <button type="button" onClick={onNext}
            className={btnBase + " flex-1 text-white"}
            style={{ backgroundColor: "var(--acc-clr)" }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
          >
            Next <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </>
  );
}