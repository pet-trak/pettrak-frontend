import { Upload } from "lucide-react";

export function Field({
  label, icon, children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium flex items-center gap-1.5" style={{ color: "var(--sec-clr)" }}>
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}

export function TextInput({
  type = "text", placeholder, value, onChange, required,
}: {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full px-4 py-3 rounded-lg text-sm border border-gray-200 bg-gray-50 focus:outline-none transition-all"
      onFocus={(e) => (e.target.style.borderColor = "var(--acc-clr)")}
      onBlur={(e)  => (e.target.style.borderColor = "#e5e7eb")}
    />
  );
}

export function FileField({
  label, icon, file, onChange, required, multiple, hint,
}: {
  label: string;
  icon: React.ReactNode;
  file: File | File[] | null;
  onChange: (f: File | File[] | null) => void;
  required?: boolean;
  multiple?: boolean;
  hint?: string;
}) {
  const displayName = Array.isArray(file)
    ? file.length ? `${file.length} file(s) selected` : null
    : file?.name ?? null;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium flex items-center gap-1.5" style={{ color: "var(--sec-clr)" }}>
        {icon}
        {label}
        {!required && <span className="text-gray-400 font-normal">(optional)</span>}
      </label>
      <label className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm border border-dashed border-gray-300 bg-gray-50 cursor-pointer hover:border-[var(--acc-clr)] transition-all">
        <Upload size={15} className="flex-shrink-0 text-gray-400" />
        <span className="truncate" style={{ color: displayName ? "var(--sec-clr)" : "#9ca3af" }}>
          {displayName ?? "Click to upload"}
        </span>
        <input
          type="file"
          multiple={multiple}
          required={required}
          className="hidden"
          onChange={(e) => {
            if (multiple) onChange(Array.from(e.target.files ?? []));
            else onChange(e.target.files?.[0] ?? null);
          }}
        />
      </label>
      {hint && <p className="text-[10px] text-gray-400">{hint}</p>}
    </div>
  );
}

export function StepIndicator({ current, steps }: { current: number; steps: string[] }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((label, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  backgroundColor: done || active ? "var(--acc-clr)" : "transparent",
                  border: `2px solid ${done || active ? "var(--acc-clr)" : "#d1d5db"}`,
                  color: done || active ? "white" : "#9ca3af",
                }}
              >
                {done ? "✓" : i + 1}
              </div>
              <span
                className="text-[10px] font-medium whitespace-nowrap"
                style={{ color: active ? "var(--acc-clr)" : done ? "var(--sec-clr)" : "#9ca3af" }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="w-16 sm:w-24 h-[2px] mb-5 mx-1 transition-all"
                style={{ backgroundColor: done ? "var(--acc-clr)" : "#e5e7eb" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export const btnBase =
  "flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50";