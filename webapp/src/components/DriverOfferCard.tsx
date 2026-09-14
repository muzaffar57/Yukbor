import { useNavigate } from "react-router-dom";
import type { DriverOfferOut } from "../types";
import { VEHICLE_TYPE_LABELS } from "../types";
import { formatDate, formatDistance, formatMoney } from "../lib/format";
import { LoadTypeBadge, StatusBadge } from "./Badge";
import { RouteLine, regionLabel } from "./RouteLine";

export function DriverOfferCard({ offer, showStatus = false }: { offer: DriverOfferOut; showStatus?: boolean }) {
  const navigate = useNavigate();
  const fromHint = [offer.departure_district, offer.departure_landmark].filter(Boolean).join(" · ");
  const toHint = [offer.destination_district, offer.destination_landmark].filter(Boolean).join(" · ");

  return (
    <button
      onClick={() => navigate(`/offers/${offer.id}`)}
      className="flex w-full flex-col gap-3 rounded-2xl p-4 text-left shadow-sm active:opacity-80"
      style={{ background: "var(--tg-secondary-bg)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12px]" style={{ color: "var(--tg-hint)" }}>
          {VEHICLE_TYPE_LABELS[offer.vehicle_type]}
          {offer.available_weight ? ` · ${offer.available_weight} kg bo'sh` : ""}
          {offer.available_volume ? ` · ${offer.available_volume} m³` : ""}
          {` · ${formatDate(offer.departure_date)}`}
        </p>
        {offer.price_expectation && (
          <span className="whitespace-nowrap text-[15px] font-bold" style={{ color: "var(--tg-link)" }}>
            {formatMoney(offer.price_expectation)}
          </span>
        )}
      </div>

      <RouteLine
        from={regionLabel(offer.departure_region)}
        to={offer.destination_region ? regionLabel(offer.destination_region) : "Kelishuv bo'yicha"}
        fromHint={fromHint || null}
        toHint={toHint || null}
        distance={formatDistance(offer.distance_km)}
      />

      <div className="flex items-center gap-1.5">
        <LoadTypeBadge loadType={offer.load_type} />
        {showStatus && <StatusBadge status={offer.status} />}
      </div>
    </button>
  );
}
