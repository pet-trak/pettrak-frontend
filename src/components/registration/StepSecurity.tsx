import { Lock, FileText, Upload, ArrowLeft, ArrowRight } from "lucide-react";
import Spinner from "@/components/ui/spinner";
import { Field, TextInput, FileField, btnBase } from "./FormFields";

interface Docs {
  licenseDocument:         File | null;
  registrationCertificate: File | null;
  additionalDocuments:     File[];
}

interface Props {
  password:      string;
  licenseNumber: string;
  docs:          Docs;
  loading:       boolean;
  error:         string;
  onPasswordChange:      (v: string) => void;
  onLicenseNumberChange: (v: string) => void;
  onDocsChange:          (key: keyof Docs, value: File | File[] | null) => void;
  onBack: () => void;
}

export default function StepSecurity({
  password, licenseNumber, docs, loading, error,
  onPasswordChange, onLicenseNumberChange, onDocsChange, onBack,
}: Props) {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--sec-clr)" }}>Security & Documents</h1>
        <p className="text-xs mt-1" style={{ color: "var(--sec-clr)", opacity: 0.55 }}>
          Set your password and upload your credentials.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Field label="Password" icon={<Lock size={13} />}>
          <TextInput type="password" placeholder="••••••••"
            value={password} onChange={onPasswordChange} required />
        </Field>

        <Field label="License Number" icon={<FileText size={13} />}>
          <TextInput placeholder="LIC-00000"
            value={licenseNumber} onChange={onLicenseNumberChange} required />
        </Field>

        <FileField
          label="License Document" icon={<FileText size={13} />}
          file={docs.licenseDocument}
          onChange={(f) => onDocsChange("licenseDocument", f)}
          required hint="PDF or image of your practice license"
        />
        <FileField
          label="Registration Certificate" icon={<FileText size={13} />}
          file={docs.registrationCertificate}
          onChange={(f) => onDocsChange("registrationCertificate", f)}
          required
        />
        <FileField
          label="Additional Documents" icon={<Upload size={13} />}
          file={docs.additionalDocuments}
          onChange={(f) => onDocsChange("additionalDocuments", f)}
          multiple
        />

        {error && <p className="text-red-500 text-xs text-center">{error}</p>}

        <div className="flex gap-3 mt-2">
          <button type="button" onClick={onBack}
            className={btnBase + " flex-1"}
            style={{ backgroundColor: "#f3f4f6", color: "var(--sec-clr)" }}
          >
            <ArrowLeft size={15} /> Back
          </button>
          <button type="submit" disabled={loading}
            className={btnBase + " flex-1 text-white"}
            style={{ backgroundColor: "var(--acc-clr)" }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
          >
            {loading ? <Spinner /> : <>Register Clinic <ArrowRight size={15} /></>}
          </button>
        </div>
      </div>
    </>
  );
}