import { useNavigate } from "react-router-dom";
import type { CargoOut } from "../types";
import { REGION_LABELS, VEHICLE_TYPE_LABELS } from "../types";
import { formatDate, formatDistance, formatMoney, formatWeight } from "../lib/format";
import { LoadTypeBadge, StatusBadge } from "./Badge";

export function CargoCard({ cargo, showStatus = false }: { cargo: CargoOut; showStatus?: boolean }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/cargos/${cargo.id}`)}
      className="flex w-full flex-col gap-2 rounded-2xl p-4 text-left shadow-sm active:opacity-70"
      style={{ background: "var(--tg-secondary-bg)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[15px] font-semibold leading-tight" style={{ color: "var(--tg-text)" }}>
          {cargo.title}
        </h3>
        <span className="whitespace-nowrap text-[15px] font-semibold" style={{ color: "var(--tg-link)" }}>
          {formatMoney(cargo.price)}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-[13px]" style={{ color: "var(--tg-hint)" }}>
        <span className="font-medium" style={{ color: "var(--tg-text)" }}>
          {REGION_LABELS[cargo.loading_region]}
        </span>
        <span>→</span>
        <span className="font-medium" style={{ color: "var(--tg-text)" }}>
          {REGION_LABELS[cargo.unloading_region]}
        </span>
        {cargo.distance_km !== null && <span>· {formatDistance(cargo.distance_km)}</span>}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 text-[12px]" style={{ color: "var(--tg-hint)" }}>
        <span>{VEHICLE_TYPE_LABELS[cargo.vehicle_type]}</span>
        <span>· {formatWeight(cargo.weight)}</span>
        {cargo.volume && <span>· {cargo.volume} m³</span>}
        {cargo.loading_date && <span>· {formatDate(cargo.loading_date)}</span>}
      </div>

      <div className="mt-1 flex items-center gap-1.5">
        <LoadTypeBadge loadType={cargo.load_type} />
        {showStatus && <StatusBadge status={cargo.status} />}
      </div>
    </button>
  );
}
