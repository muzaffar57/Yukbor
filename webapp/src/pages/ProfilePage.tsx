import { useEffect, useState } from "react";
import { BrandHeader } from "../components/Header";
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

  const items = user.role === "shipper" ? cargos : offers;
  const active = items.filter((item) => item.status === "active").length;
  const closed = items.length - active;

  return (
    <div>
      <BrandHeader />
      <div className="flex flex-col gap-4 px-4 pb-8">
        <div className="flex items-center gap-3 rounded-3xl bg-white p-4 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full text-2xl" style={{ background: "var(--yb-green-soft)" }}>
            {user.role === "shipper" ? "📦" : "🚛"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[16px] font-extrabold">{user.full_name}</p>
            <p className="text-[13px] font-semibold" style={{ color: "var(--yb-green)" }}>
              {user.role === "shipper" ? "Yuk beruvchi" : "Haydovchi"}
            </p>
            <p className="text-[13px]" style={{ color: "var(--tg-hint)" }}>
              {user.phone_number}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Stat label="Jami" value={items.length} />
          <Stat label="Faol" value={active} />
          <Stat label="Yopilgan" value={closed} />
        </div>

        <div>
          <p className="mb-2 px-1 text-[15px] font-extrabold">Mening e'lonlarim</p>
          {loading && <FullPageSpinner />}
          {!loading && error && <ErrorState message={error} onRetry={load} />}
          {!loading && !error && items.length === 0 && (
            <EmptyState title="Hali e'lon yo'q" subtitle="Birinchi e'loningizni + tugmasi orqali joylashtiring." />
          )}
          <div className="flex flex-col gap-3">
            {!loading && !error && cargos.map((cargo) => <CargoCard key={cargo.id} cargo={cargo} showStatus />)}
            {!loading && !error && offers.map((offer) => <DriverOfferCard key={offer.id} offer={offer} showStatus />)}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-2xl px-4 py-3.5 text-[14px] font-bold"
          style={{ background: "#fee2e2", color: "#b91c1c" }}
        >
          Chiqish
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl bg-white p-3 text-center shadow-sm">
      <p className="text-[18px] font-extrabold">{value}</p>
      <p className="text-[11px]" style={{ color: "var(--tg-hint)" }}>
        {label}
      </p>
    </div>
  );
}
