import { useNavigate } from "react-router-dom";
import type { CargoOut } from "../types";
import { VEHICLE_TYPE_LABELS, PAYMENT_TYPE_LABELS, REGION_LABELS } from "../types";
import { formatDate, formatMoney, formatWeight } from "../lib/format";
import { mediaUrl } from "../lib/media";
import { LoadTypeBadge, StatusBadge, Pill } from "./Badge";
import { ClosedStamp } from "./ClosedStamp";

export function CargoCard({ cargo, showStatus = false }: { cargo: CargoOut; showStatus?: boolean }) {
  const navigate = useNavigate();
  const photo = mediaUrl(cargo.photos[0]?.url);
  const fromHint = [cargo.loading_district, cargo.loading_landmark].filter(Boolean).join(", ");
  const toHint = [cargo.unloading_district, cargo.unloading_landmark].filter(Boolean).join(", ");

  return (
    <button
      onClick={() => navigate(`/cargos/${cargo.id}`)}
      className="relative flex w-full gap-3 overflow-hidden rounded-3xl bg-white p-3 text-left shadow-sm active:opacity-80"
    >
      {cargo.status !== "active" && <ClosedStamp />}
      <div className="h-[76px] w-[76px] flex-shrink-0 overflow-hidden rounded-2xl bg-gray-100">
        {photo ? (
          <img src={photo} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl">📦</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-[14px] font-bold" style={{ color: "var(--tg-text)" }}>
            {REGION_LABELS[cargo.loading_region]} → {REGION_LABELS[cargo.unloading_region]}
          </p>
        </div>
        <p className="truncate text-[13px] font-medium" style={{ color: "var(--tg-text)" }}>
          {cargo.title}
        </p>
        {(fromHint || toHint) && (
          <p className="truncate text-[11px]" style={{ color: "var(--tg-hint)" }}>
            {fromHint || toHint}
          </p>
        )}
        <p className="mt-0.5 flex flex-wrap gap-x-2 text-[11px]" style={{ color: "var(--tg-hint)" }}>
          <span>⚖ {formatWeight(cargo.weight)}</span>
          {cargo.volume ? <span>▢ {cargo.volume} m³</span> : null}
          <span>🚚 {VEHICLE_TYPE_LABELS[cargo.vehicle_type]}</span>
          {cargo.loading_date ? <span>📅 {formatDate(cargo.loading_date)}</span> : null}
        </p>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            <LoadTypeBadge loadType={cargo.load_type} />
            <Pill>{PAYMENT_TYPE_LABELS[cargo.payment_type]}</Pill>
            {showStatus && <StatusBadge status={cargo.status} />}
          </div>
          <span className="whitespace-nowrap text-[13px] font-extrabold" style={{ color: "var(--yb-green)" }}>
            {formatMoney(cargo.price)}
          </span>
        </div>
      </div>
    </button>
  );
}
