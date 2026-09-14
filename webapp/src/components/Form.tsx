import type { ReactNode, SelectHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const fieldBase =
  "w-full rounded-xl border px-3.5 py-2.5 text-[15px] outline-none transition-colors focus:border-[var(--tg-link)]";
const fieldStyle = { background: "var(--tg-secondary-bg)", borderColor: "rgba(0,0,0,0.1)", color: "var(--tg-text)" };

export function Field({ label, required, children, hint }: { label: string; required?: boolean; children: ReactNode; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium" style={{ color: "var(--tg-hint)" }}>
        {label}
        {required && <span style={{ color: "#ef4444" }}> *</span>}
      </span>
      {children}
      {hint && (
        <span className="text-[12px]" style={{ color: "var(--tg-hint)" }}>
          {hint}
        </span>
      )}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={fieldBase + " " + (props.className ?? "")} style={fieldStyle} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={fieldBase + " " + (props.className ?? "")} style={fieldStyle} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={fieldBase + " " + (props.className ?? "")} style={fieldStyle}>
      {props.children}
    </select>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-0.5">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors"
            style={
              active
                ? { background: "var(--yb-green)", color: "#fff" }
                : { background: "#f3f4f6", color: "#4b5563" }
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      className="rounded-xl px-3.5 py-2.5 text-[13px]"
      style={{ background: "rgba(239,68,68,0.1)", color: "#b91c1c" }}
    >
      {message}
    </div>
  );
}
