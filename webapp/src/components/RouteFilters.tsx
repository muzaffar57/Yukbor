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
  "w-full appearance-none rounded-2xl border bg-white px-3 py-2.5 text-[13px] font-medium outline-none";
const selectStyle = { borderColor: "#e5e7eb", color: "var(--tg-text)" };

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
    <div className="px-4 pb-3">
      <div className="rounded-3xl bg-white p-3 shadow-sm">
        <div className="flex items-stretch gap-2">
          <label className="min-w-0 flex-1">
            <span className="mb-1 block text-[11px]" style={{ color: "var(--tg-hint)" }}>
              {fromLabel}
            </span>
            <select
              className={selectClass}
              style={selectStyle}
              value={fromValue ?? ""}
              onChange={(e) => onFromChange((e.target.value || undefined) as Region | undefined)}
            >
              <option value="">Barchasi</option>
              {Object.entries(REGION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          {onSwap && (
            <button
              type="button"
              onClick={onSwap}
              className="mt-5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border text-base"
              style={{ borderColor: "#e5e7eb", color: "var(--yb-green)" }}
              aria-label="Yo'nalishni almashtirish"
            >
              ⇄
            </button>
          )}
          <label className="min-w-0 flex-1">
            <span className="mb-1 block text-[11px]" style={{ color: "var(--tg-hint)" }}>
              {toLabel}
            </span>
            <select
              className={selectClass}
              style={selectStyle}
              value={toValue ?? ""}
              onChange={(e) => onToChange((e.target.value || undefined) as Region | undefined)}
            >
              <option value="">Barchasi</option>
              {Object.entries(REGION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-2">
          <select
            className={selectClass}
            style={selectStyle}
            value={vehicleType ?? ""}
            onChange={(e) => onVehicleChange((e.target.value || undefined) as VehicleType | undefined)}
          >
            <option value="">Mashina turi — barchasi</option>
            {Object.entries(VEHICLE_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-2 flex gap-1.5 overflow-x-auto">
          <Chip active={!loadType} onClick={() => onLoadTypeChange(undefined)}>
            Barchasi
          </Chip>
          {(Object.keys(LOAD_TYPE_LABELS) as LoadType[]).map((value) => (
            <Chip key={value} active={loadType === value} onClick={() => onLoadTypeChange(value)}>
              {LOAD_TYPE_LABELS[value]}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between px-1">
        <p className="text-[13px] font-semibold" style={{ color: "var(--tg-text)" }}>
          {loading ? "Qidirilmoqda..." : `${resultCount ?? 0} ta e'lon`}
        </p>
        {hasAny && (
          <button type="button" onClick={onClear} className="text-[12px] font-semibold" style={{ color: "var(--yb-green)" }}>
            Tozalash
          </button>
        )}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-semibold"
      style={
        active
          ? { background: "var(--yb-green)", color: "#fff" }
          : { background: "#f3f4f6", color: "#4b5563" }
      }
    >
      {children}
    </button>
  );
}
