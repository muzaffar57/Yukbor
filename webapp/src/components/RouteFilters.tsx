import { REGION_LABELS, VEHICLE_TYPE_LABELS, LOAD_TYPE_LABELS } from "../types";
import type { LoadType, Region, VehicleType } from "../types";

interface RouteFiltersProps {
  fromLabel: string;
  toLabel: string;
  fromValue?: Region;
  toValue?: Region;
  vehicleType?: VehicleType;
  loadType?: LoadType;
  onFromChange: (value?: Region) => void;
  onToChange: (value?: Region) => void;
  onVehicleChange: (value?: VehicleType) => void;
  onLoadTypeChange: (value?: LoadType) => void;
  onSwap?: () => void;
  onClear: () => void;
  resultCount?: number;
  loading?: boolean;
}

const selectClass =
  "w-full appearance-none rounded-xl border bg-[var(--tg-secondary-bg)] px-3 py-2.5 text-[14px] font-medium outline-none";
const selectStyle = { borderColor: "rgba(0,0,0,0.1)", color: "var(--tg-text)" };

export function RouteFilters({
  fromLabel,
  toLabel,
  fromValue,
  toValue,
  vehicleType,
  loadType,
  onFromChange,
  onToChange,
  onVehicleChange,
  onLoadTypeChange,
  onSwap,
  onClear,
  resultCount,
  loading,
}: RouteFiltersProps) {
  const hasAny = Boolean(fromValue || toValue || vehicleType || loadType);

  return (
    <div className="border-b px-4 pb-3 pt-2" style={{ background: "var(--tg-header-bg)", borderColor: "rgba(0,0,0,0.06)" }}>
      <p className="mb-2 text-[12px] font-medium" style={{ color: "var(--tg-hint)" }}>
        O'zingizga kerakli yo'nalishni tanlang
      </p>

      <div className="flex items-stretch gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#047857" }}>
              {fromLabel}
            </span>
            <select
              className={selectClass}
              style={selectStyle}
              value={fromValue ?? ""}
              onChange={(e) => onFromChange((e.target.value || undefined) as Region | undefined)}
            >
              <option value="">Barcha viloyatlar</option>
              {Object.entries(REGION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#b91c1c" }}>
              {toLabel}
            </span>
            <select
              className={selectClass}
              style={selectStyle}
              value={toValue ?? ""}
              onChange={(e) => onToChange((e.target.value || undefined) as Region | undefined)}
            >
              <option value="">Barcha viloyatlar</option>
              {Object.entries(REGION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {onSwap && (
          <button
            type="button"
            onClick={onSwap}
            className="self-center rounded-xl px-2.5 py-3 text-lg"
            style={{ background: "var(--tg-secondary-bg)", border: "1px solid rgba(0,0,0,0.08)", color: "var(--tg-link)" }}
            aria-label="Yo'nalishni almashtirish"
          >
            ⇅
          </button>
        )}
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-0.5">
        <select
          className={selectClass + " min-w-[46%]"}
          style={selectStyle}
          value={vehicleType ?? ""}
          onChange={(e) => onVehicleChange((e.target.value || undefined) as VehicleType | undefined)}
        >
          <option value="">Barcha mashinalar</option>
          {Object.entries(VEHICLE_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          className={selectClass + " min-w-[46%]"}
          style={selectStyle}
          value={loadType ?? ""}
          onChange={(e) => onLoadTypeChange((e.target.value || undefined) as LoadType | undefined)}
        >
          <option value="">To'liq / lahtak</option>
          {Object.entries(LOAD_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-2.5 flex items-center justify-between">
        <p className="text-[12px]" style={{ color: "var(--tg-hint)" }}>
          {loading ? "Qidirilmoqda..." : resultCount === undefined ? "" : `${resultCount} ta e'lon`}
        </p>
        {hasAny && (
          <button type="button" onClick={onClear} className="text-[12px] font-semibold" style={{ color: "var(--tg-link)" }}>
            Filtrni tozalash
          </button>
        )}
      </div>
    </div>
  );
}
