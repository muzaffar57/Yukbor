import type { CargoStatus, LoadType } from "../types";
import { CARGO_STATUS_LABELS, LOAD_TYPE_LABELS } from "../types";

export function LoadTypeBadge({ loadType }: { loadType: LoadType }) {
  const isFull = loadType === "toliq_mashina";
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{
        background: isFull ? "rgba(36,129,204,0.12)" : "rgba(245,158,11,0.15)",
        color: isFull ? "#2481cc" : "#b45309",
      }}
    >
      {isFull ? "🚚" : "📦"} {LOAD_TYPE_LABELS[loadType]}
    </span>
  );
}

const STATUS_COLORS: Record<CargoStatus, { bg: string; fg: string }> = {
  active: { bg: "rgba(16,185,129,0.15)", fg: "#047857" },
  completed: { bg: "rgba(107,114,128,0.15)", fg: "#374151" },
  canceled: { bg: "rgba(239,68,68,0.15)", fg: "#b91c1c" },
};

export function StatusBadge({ status }: { status: CargoStatus }) {
  const colors = STATUS_COLORS[status];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ background: colors.bg, color: colors.fg }}
    >
      {CARGO_STATUS_LABELS[status]}
    </span>
  );
}
