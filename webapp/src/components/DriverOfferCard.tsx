import { useNavigate } from "react-router-dom";
import type { DriverOfferOut } from "../types";
import { REGION_LABELS, VEHICLE_TYPE_LABELS } from "../types";
import { formatDate, formatMoney, formatWeight } from "../lib/format";
import { LoadTypeBadge, StatusBadge, Pill } from "./Badge";

export function DriverOfferCard({ offer, showStatus = false }: { offer: DriverOfferOut; showStatus?: boolean }) {
  const navigate = useNavigate();
  const dest = offer.destination_region ? REGION_LABELS[offer.destination_region] : "Kelishuv bo'yicha";

  return (
    <button
      onClick={() => navigate(`/offers/${offer.id}`)}
      className="flex w-full gap-3 rounded-3xl bg-white p-3 text-left shadow-sm active:opacity-80"
    >
      <div className="flex h-[76px] w-[76px] flex-shrink-0 items-center justify-center rounded-2xl text-3xl" style={{ background: "var(--yb-green-soft)" }}>
        🚛
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[14px] font-bold" style={{ color: "var(--tg-text)" }}>
            {VEHICLE_TYPE_LABELS[offer.vehicle_type]}
          </p>
          <Pill tone="green">Bo'sh</Pill>
        </div>
        <p className="truncate text-[13px]" style={{ color: "var(--tg-hint)" }}>
          {offer.driver.full_name}
        </p>
        <p className="mt-0.5 flex flex-wrap gap-x-2 text-[11px]" style={{ color: "var(--tg-hint)" }}>
          {offer.available_weight ? <span>⚖ {formatWeight(offer.available_weight)}</span> : null}
          {offer.available_volume ? <span>▢ {offer.available_volume} m³</span> : null}
          <span>📅 {formatDate(offer.departure_date)}</span>
        </p>
        <p className="mt-1 text-[12px] font-medium">
          <span style={{ color: "var(--yb-origin)" }}>●</span> {REGION_LABELS[offer.departure_region]}
          {"  "}
          <span style={{ color: "var(--yb-dest)" }}>●</span> {dest}
        </p>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            <LoadTypeBadge loadType={offer.load_type} />
            {showStatus && <StatusBadge status={offer.status} />}
          </div>
          {offer.price_expectation && (
            <span className="whitespace-nowrap text-[13px] font-extrabold" style={{ color: "var(--yb-green)" }}>
              {formatMoney(offer.price_expectation)}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
