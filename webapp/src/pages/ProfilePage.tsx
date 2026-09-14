import { useEffect, useState } from "react";
import { Header } from "../components/Header";
import { CargoCard } from "../components/CargoCard";
import { DriverOfferCard } from "../components/DriverOfferCard";
import { FullPageSpinner } from "../components/Spinner";
import { EmptyState, ErrorState } from "../components/EmptyState";
import { fetchMyCargos, fetchMyDriverOffers, extractErrorMessage } from "../lib/api";
import type { CargoOut, DriverOfferOut } from "../types";
import { useAuth } from "../lib/AuthContext";
import { showConfirm } from "../lib/telegram";

export function ProfilePage() {
  const { user, logout } = useAuth();
  const [cargos, setCargos] = useState<CargoOut[]>([]);
  const [offers, setOffers] = useState<DriverOfferOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      if (user?.role === "shipper") {
        setCargos(await fetchMyCargos());
      } else if (user?.role === "driver") {
        setOffers(await fetchMyDriverOffers());
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function handleLogout() {
    const ok = await showConfirm("Hisobdan chiqmoqchimisiz?");
    if (ok) logout();
  }

  if (!user) return <FullPageSpinner />;

  return (
    <div>
      <Header title="Profilim" />
      <div className="flex flex-col gap-4 p-4 pb-8">
        <div className="flex items-center gap-3 rounded-2xl p-4" style={{ background: "var(--tg-secondary-bg)" }}>
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full text-2xl"
            style={{ background: "rgba(36,129,204,0.12)" }}
          >
            {user.role === "shipper" ? "📦" : "🚛"}
          </div>
          <div className="flex-1">
            <p className="text-[16px] font-semibold" style={{ color: "var(--tg-text)" }}>
              {user.full_name}
            </p>
            <p className="text-[13px]" style={{ color: "var(--tg-hint)" }}>
              {user.phone_number} · {user.role === "shipper" ? "Yuk beruvchi" : "Haydovchi"}
            </p>
          </div>
        </div>

        <div>
          <p className="mb-2 px-1 text-[13px] font-semibold" style={{ color: "var(--tg-hint)" }}>
            {user.role === "shipper" ? "Mening yuk e'lonlarim" : "Mening bo'sh transportlarim"}
          </p>

          {loading && <FullPageSpinner />}
          {!loading && error && <ErrorState message={error} onRetry={load} />}

          {!loading && !error && user.role === "shipper" && cargos.length === 0 && (
            <EmptyState icon="📦" title="Hali e'lon yo'q" subtitle="Bosh sahifadagi + tugmasi orqali birinchi yukingizni joylashtiring." />
          )}
          {!loading && !error && user.role === "driver" && offers.length === 0 && (
            <EmptyState icon="🚛" title="Hali e'lon yo'q" subtitle="'Transport' sahifasidagi + tugmasi orqali bo'sh joyingizni e'lon qiling." />
          )}

          <div className="flex flex-col gap-3">
            {!loading &&
              !error &&
              cargos.map((cargo) => <CargoCard key={cargo.id} cargo={cargo} showStatus />)}
            {!loading &&
              !error &&
              offers.map((offer) => <DriverOfferCard key={offer.id} offer={offer} showStatus />)}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-2 rounded-xl px-4 py-3 text-[14px] font-medium"
          style={{ background: "rgba(239,68,68,0.1)", color: "#b91c1c" }}
        >
          Hisobdan chiqish
        </button>
      </div>
    </div>
  );
}
