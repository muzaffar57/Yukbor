import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { DriverOfferCard } from "../components/DriverOfferCard";
import { FullPageSpinner } from "../components/Spinner";
import { EmptyState, ErrorState } from "../components/EmptyState";
import { Select } from "../components/Form";
import { fetchDriverOffers, extractErrorMessage, type DriverOfferFilters } from "../lib/api";
import type { DriverOfferOut } from "../types";
import { REGION_LABELS, VEHICLE_TYPE_LABELS } from "../types";
import type { Region, VehicleType } from "../types";
import { useAuth } from "../lib/AuthContext";
import { hapticImpact } from "../lib/telegram";

export function DriverOffersListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<DriverOfferOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<DriverOfferFilters>({});

  async function load(currentFilters: DriverOfferFilters) {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchDriverOffers({ ...currentFilters, limit: 50 });
      setItems(result.items);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div>
      <Header
        title="Bo'sh transport"
        right={
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="relative rounded-full px-3 py-1.5 text-[13px] font-medium"
            style={{ background: "var(--tg-secondary-bg)", color: "var(--tg-link)" }}
          >
            ⚙️ Filtr
            {activeFilterCount > 0 && (
              <span
                className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white"
                style={{ background: "var(--tg-link)" }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>
        }
      />

      {showFilters && (
        <div className="flex flex-col gap-2.5 border-b px-4 py-3" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          <Select
            value={filters.departure_region ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, departure_region: (e.target.value || undefined) as Region }))}
          >
            <option value="">Qayerdan (barchasi)</option>
            {Object.entries(REGION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Select
            value={filters.destination_region ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, destination_region: (e.target.value || undefined) as Region }))}
          >
            <option value="">Qayerga (barchasi)</option>
            {Object.entries(REGION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Select
            value={filters.vehicle_type ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, vehicle_type: (e.target.value || undefined) as VehicleType }))}
          >
            <option value="">Mashina turi (barchasi)</option>
            {Object.entries(VEHICLE_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setFilters({});
                load({});
                setShowFilters(false);
              }}
              className="flex-1 rounded-xl px-4 py-2.5 text-[14px] font-medium"
              style={{ background: "var(--tg-secondary-bg)", color: "var(--tg-hint)", border: "1px solid rgba(0,0,0,0.08)" }}
            >
              Tozalash
            </button>
            <button
              onClick={() => {
                load(filters);
                setShowFilters(false);
                hapticImpact("light");
              }}
              className="flex-1 rounded-xl px-4 py-2.5 text-[14px] font-medium"
              style={{ background: "var(--tg-button)", color: "var(--tg-button-text)" }}
            >
              Qo'llash
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 p-4">
        {loading && <FullPageSpinner />}
        {!loading && error && <ErrorState message={error} onRetry={() => load(filters)} />}
        {!loading && !error && items.length === 0 && (
          <EmptyState
            icon="🚛"
            title="Hozircha bo'sh transport yo'q"
            subtitle="Haydovchilar bo'sh joyini e'lon qilganda shu yerda ko'rinadi."
          />
        )}
        {!loading && !error && items.map((offer) => <DriverOfferCard key={offer.id} offer={offer} />)}
      </div>

      {user?.role === "driver" && (
        <button
          onClick={() => navigate("/offers/new")}
          className="fixed bottom-20 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full text-2xl shadow-lg"
          style={{ background: "var(--tg-button)", color: "var(--tg-button-text)" }}
          aria-label="Bo'sh transport qo'shish"
        >
          +
        </button>
      )}
    </div>
  );
}
