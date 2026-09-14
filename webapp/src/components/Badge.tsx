import type { CargoStatus, LoadType } from "../types";
import { CARGO_STATUS_LABELS, LOAD_TYPE_LABELS } from "../types";

export function LoadTypeBadge({ loadType }: { loadType: LoadType }) {
  const isFull = loadType === "toliq_mashina";
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{
        background: isFull ? "var(--yb-green-soft)" : "#ffedd5",
        color: isFull ? "var(--yb-green-dark)" : "#c2410c",
      }}
    >
      {LOAD_TYPE_LABELS[loadType]}
    </span>
  );
}

const STATUS_COLORS: Record<CargoStatus, { bg: string; fg: string }> = {
  active: { bg: "var(--yb-green-soft)", fg: "var(--yb-green-dark)" },
  completed: { bg: "#f3f4f6", fg: "#4b5563" },
  canceled: { bg: "#fee2e2", fg: "#b91c1c" },
};

export function StatusBadge({ status }: { status: CargoStatus }) {
  const colors = STATUS_COLORS[status];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: colors.bg, color: colors.fg }}
    >
      {status === "completed" ? "Yopilgan" : CARGO_STATUS_LABELS[status]}
    </span>
  );
}

export function Pill({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "green" }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={
        tone === "green"
          ? { background: "var(--yb-green-soft)", color: "var(--yb-green-dark)" }
          : { background: "#f3f4f6", color: "#4b5563" }
      }
    >
      {children}
    </span>
  );
}
