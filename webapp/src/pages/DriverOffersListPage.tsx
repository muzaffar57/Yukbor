import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { DriverOfferCard } from "../components/DriverOfferCard";
import { RouteFilters } from "../components/RouteFilters";
import { FullPageSpinner } from "../components/Spinner";
import { EmptyState, ErrorState } from "../components/EmptyState";
import { fetchDriverOffers, extractErrorMessage, type DriverOfferFilters } from "../lib/api";
import type { DriverOfferOut } from "../types";
import { useAuth } from "../lib/AuthContext";

export function DriverOffersListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<DriverOfferOut[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DriverOfferFilters>({});

  async function load(currentFilters: DriverOfferFilters) {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchDriverOffers({ ...currentFilters, limit: 50 });
      setItems(result.items);
      setTotal(result.total);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(filters);
  }, [filters.departure_region, filters.destination_region, filters.vehicle_type, filters.load_type]);

  return (
    <div>
      <Header title="Bo'sh transport" />
      <RouteFilters
        fromLabel="Qayerdan (jo'nash)"
        toLabel="Qayerga (borish)"
        fromValue={filters.departure_region}
        toValue={filters.destination_region}
        vehicleType={filters.vehicle_type}
        loadType={filters.load_type}
        onFromChange={(departure_region) => setFilters((f) => ({ ...f, departure_region }))}
        onToChange={(destination_region) => setFilters((f) => ({ ...f, destination_region }))}
        onVehicleChange={(vehicle_type) => setFilters((f) => ({ ...f, vehicle_type }))}
        onLoadTypeChange={(load_type) => setFilters((f) => ({ ...f, load_type }))}
        onSwap={() =>
          setFilters((f) => ({
            ...f,
            departure_region: f.destination_region,
            destination_region: f.departure_region,
          }))
        }
        onClear={() => setFilters({})}
        resultCount={total}
        loading={loading}
      />

      <div className="flex flex-col gap-3 p-4">
        {loading && items.length === 0 && <FullPageSpinner />}
        {!loading && error && <ErrorState message={error} onRetry={() => load(filters)} />}
        {!loading && !error && items.length === 0 && (
          <EmptyState
            icon="🚛"
            title="Bu yo'nalishda transport yo'q"
            subtitle="Boshqa viloyatni tanlang yoki filtrni tozalab qayta ko'ring."
          />
        )}
        {items.map((offer) => (
          <DriverOfferCard key={offer.id} offer={offer} />
        ))}
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
