import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { CargoCard } from "../components/CargoCard";
import { RouteFilters } from "../components/RouteFilters";
import { FullPageSpinner } from "../components/Spinner";
import { EmptyState, ErrorState } from "../components/EmptyState";
import { fetchCargos, extractErrorMessage, type CargoFilters } from "../lib/api";
import type { CargoOut } from "../types";
import { useAuth } from "../lib/AuthContext";

export function CargoListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<CargoOut[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CargoFilters>({});

  async function load(currentFilters: CargoFilters) {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCargos({ ...currentFilters, limit: 50 });
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
  }, [filters.loading_region, filters.unloading_region, filters.vehicle_type, filters.load_type]);

  return (
    <div>
      <Header title="Yuklar" />
      <RouteFilters
        fromLabel="Qayerdan (ortish)"
        toLabel="Qayerga (tushirish)"
        fromValue={filters.loading_region}
        toValue={filters.unloading_region}
        vehicleType={filters.vehicle_type}
        loadType={filters.load_type}
        onFromChange={(loading_region) => setFilters((f) => ({ ...f, loading_region }))}
        onToChange={(unloading_region) => setFilters((f) => ({ ...f, unloading_region }))}
        onVehicleChange={(vehicle_type) => setFilters((f) => ({ ...f, vehicle_type }))}
        onLoadTypeChange={(load_type) => setFilters((f) => ({ ...f, load_type }))}
        onSwap={() =>
          setFilters((f) => ({
            ...f,
            loading_region: f.unloading_region,
            unloading_region: f.loading_region,
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
            title="Bu yo'nalishda e'lon yo'q"
            subtitle="Boshqa viloyatni tanlang yoki filtrni tozalab, barcha yuklarni ko'ring."
          />
        )}
        {items.map((cargo) => (
          <CargoCard key={cargo.id} cargo={cargo} />
        ))}
      </div>

      {user?.role === "shipper" && (
        <button
          onClick={() => navigate("/cargos/new")}
          className="fixed bottom-20 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full text-2xl shadow-lg"
          style={{ background: "var(--tg-button)", color: "var(--tg-button-text)" }}
          aria-label="Yangi yuk qo'shish"
        >
          +
        </button>
      )}
    </div>
  );
}
