import { useNavigate } from "react-router-dom";
import type { DriverOfferOut } from "../types";
import { REGION_LABELS, VEHICLE_TYPE_LABELS } from "../types";
import { formatDate, formatDistance, formatMoney } from "../lib/format";
import { LoadTypeBadge, StatusBadge } from "./Badge";

export function DriverOfferCard({ offer, showStatus = false }: { offer: DriverOfferOut; showStatus?: boolean }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/offers/${offer.id}`)}
      className="flex w-full flex-col gap-2 rounded-2xl p-4 text-left shadow-sm active:opacity-70"
      style={{ background: "var(--tg-secondary-bg)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[15px] font-semibold leading-tight" style={{ color: "var(--tg-text)" }}>
          <span>{REGION_LABELS[offer.departure_region]}</span>
          <span>→</span>
          <span>{offer.destination_region ? REGION_LABELS[offer.destination_region] : "Kelishuv bo'yicha"}</span>
        </div>
        {offer.price_expectation && (
          <span className="whitespace-nowrap text-[14px] font-semibold" style={{ color: "var(--tg-link)" }}>
            {formatMoney(offer.price_expectation)}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 text-[12px]" style={{ color: "var(--tg-hint)" }}>
        <span>{VEHICLE_TYPE_LABELS[offer.vehicle_type]}</span>
        {offer.available_weight && <span>· {offer.available_weight} kg bo'sh</span>}
        {offer.available_volume && <span>· {offer.available_volume} m³ bo'sh</span>}
        {offer.distance_km !== null && <span>· {formatDistance(offer.distance_km)}</span>}
        <span>· {formatDate(offer.departure_date)}</span>
      </div>

      <div className="mt-1 flex items-center gap-1.5">
        <LoadTypeBadge loadType={offer.load_type} />
        {showStatus && <StatusBadge status={offer.status} />}
      </div>
    </button>
  );
}
