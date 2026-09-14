import { useNavigate } from "react-router-dom";
import type { CargoOut } from "../types";
import { VEHICLE_TYPE_LABELS } from "../types";
import { formatDate, formatDistance, formatMoney, formatWeight } from "../lib/format";
import { LoadTypeBadge, StatusBadge } from "./Badge";
import { RouteLine, regionLabel } from "./RouteLine";

export function CargoCard({ cargo, showStatus = false }: { cargo: CargoOut; showStatus?: boolean }) {
  const navigate = useNavigate();
  const fromHint = [cargo.loading_district, cargo.loading_landmark].filter(Boolean).join(" · ");
  const toHint = [cargo.unloading_district, cargo.unloading_landmark].filter(Boolean).join(" · ");

  return (
    <button
      onClick={() => navigate(`/cargos/${cargo.id}`)}
      className="flex w-full flex-col gap-3 rounded-2xl p-4 text-left shadow-sm active:opacity-80"
      style={{ background: "var(--tg-secondary-bg)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-[16px] font-semibold leading-tight" style={{ color: "var(--tg-text)" }}>
            {cargo.title}
          </h3>
          <p className="mt-0.5 text-[12px]" style={{ color: "var(--tg-hint)" }}>
            {VEHICLE_TYPE_LABELS[cargo.vehicle_type]} · {formatWeight(cargo.weight)}
            {cargo.volume ? ` · ${cargo.volume} m³` : ""}
            {cargo.loading_date ? ` · ${formatDate(cargo.loading_date)}` : ""}
          </p>
        </div>
        <span className="whitespace-nowrap text-[16px] font-bold" style={{ color: "var(--tg-link)" }}>
          {formatMoney(cargo.price)}
        </span>
      </div>

      <RouteLine
        from={regionLabel(cargo.loading_region)}
        to={regionLabel(cargo.unloading_region)}
        fromHint={fromHint || null}
        toHint={toHint || null}
        distance={formatDistance(cargo.distance_km)}
      />

      <div className="flex items-center gap-1.5">
        <LoadTypeBadge loadType={cargo.load_type} />
        {showStatus && <StatusBadge status={cargo.status} />}
      </div>
    </button>
  );
}
