import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "../components/Header";
import { FullPageSpinner } from "../components/Spinner";
import { ErrorState } from "../components/EmptyState";
import { LoadTypeBadge, StatusBadge } from "../components/Badge";
import { fetchCargo, updateCargoStatus, extractErrorMessage, API_BASE_URL } from "../lib/api";
import type { CargoOut } from "../types";
import { REGION_LABELS, VEHICLE_TYPE_LABELS, PAYMENT_TYPE_LABELS } from "../types";
import { formatDate, formatDistance, formatMoney, formatVolume, formatWeight, timeAgo } from "../lib/format";
import { useAuth } from "../lib/AuthContext";
import { useBackButton, useMainButton } from "../lib/hooks";
import { hapticNotify, showConfirm } from "../lib/telegram";

export function CargoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cargo, setCargo] = useState<CargoOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useBackButton(() => navigate(-1));

  async function load() {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setCargo(await fetchCargo(Number(id)));
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isOwner = cargo && user && cargo.owner.id === user.id;

  async function handleMarkCompleted() {
    if (!cargo || updating) return;
    const ok = await showConfirm("Bu yukni 'Yakunlangan' deb belgilaymizmi?");
    if (!ok) return;
    setUpdating(true);
    try {
      const updated = await updateCargoStatus(cargo.id, "completed");
      setCargo(updated);
      hapticNotify("success");
    } catch (err) {
      hapticNotify("error");
      setError(extractErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  }

  useMainButton(
    isOwner && cargo?.status === "active"
      ? { text: "✅ Yakunlangan deb belgilash", onClick: handleMarkCompleted, loading: updating }
      : cargo && cargo.status === "active"
      ? {
          text: `📞 Qo'ng'iroq: ${cargo.owner.phone_number}`,
          onClick: () => window.open(`tel:${cargo.owner.phone_number}`, "_self"),
        }
      : null
  );

  if (loading) return <FullPageSpinner />;
  if (error || !cargo) return <ErrorState message={error ?? "Yuk topilmadi"} onRetry={load} />;

  return (
    <div>
      <Header title="Yuk tafsilotlari" />
      <div className="flex flex-col gap-4 p-4 pb-8">
        {cargo.photos.length > 0 && (
          <div className="flex gap-2 overflow-x-auto">
            {cargo.photos.map((photo) => (
              <img
                key={photo.id}
                src={`${API_BASE_URL}${photo.url}`}
                alt=""
                className="h-40 w-40 flex-shrink-0 rounded-xl object-cover"
              />
            ))}
          </div>
        )}

        <div className="rounded-2xl p-4" style={{ background: "var(--tg-secondary-bg)" }}>
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-lg font-semibold" style={{ color: "var(--tg-text)" }}>
              {cargo.title}
            </h2>
            <StatusBadge status={cargo.status} />
          </div>
          <p className="mt-1 text-2xl font-bold" style={{ color: "var(--tg-link)" }}>
            {formatMoney(cargo.price)}
          </p>
          <p className="text-[13px]" style={{ color: "var(--tg-hint)" }}>
            {PAYMENT_TYPE_LABELS[cargo.payment_type]} · {timeAgo(cargo.created_at)}
          </p>
          <div className="mt-2">
            <LoadTypeBadge loadType={cargo.load_type} />
          </div>
        </div>

        {cargo.description && (
          <div className="rounded-2xl p-4" style={{ background: "var(--tg-secondary-bg)" }}>
            <p className="mb-1 text-[12px] font-medium uppercase" style={{ color: "var(--tg-hint)" }}>
              Izoh
            </p>
            <p className="text-[14px]" style={{ color: "var(--tg-text)" }}>
              {cargo.description}
            </p>
          </div>
        )}

        <div className="rounded-2xl p-4" style={{ background: "var(--tg-secondary-bg)" }}>
          <p className="mb-2 text-[12px] font-medium uppercase" style={{ color: "var(--tg-hint)" }}>
            Yo'nalish
          </p>
          <div className="flex flex-col gap-3">
            <LocationRow
              label="Ortish"
              region={REGION_LABELS[cargo.loading_region]}
              district={cargo.loading_district}
              landmark={cargo.loading_landmark}
              lat={cargo.loading_lat}
              lon={cargo.loading_lon}
            />
            <LocationRow label="Tushirish" region={REGION_LABELS[cargo.unloading_region]} district={cargo.unloading_district} landmark={cargo.unloading_landmark} />
          </div>
          {cargo.distance_km !== null && (
            <p className="mt-2 text-[13px] font-medium" style={{ color: "var(--tg-link)" }}>
              Taxminiy masofa: {formatDistance(cargo.distance_km)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InfoBox label="Og'irligi" value={formatWeight(cargo.weight)} />
          {cargo.volume && <InfoBox label="Hajmi" value={formatVolume(cargo.volume)} />}
          <InfoBox label="Mashina turi" value={VEHICLE_TYPE_LABELS[cargo.vehicle_type]} />
          {cargo.loading_date && <InfoBox label="Ortish sanasi" value={formatDate(cargo.loading_date)} />}
        </div>

        <div className="rounded-2xl p-4" style={{ background: "var(--tg-secondary-bg)" }}>
          <p className="mb-1 text-[12px] font-medium uppercase" style={{ color: "var(--tg-hint)" }}>
            Yuk beruvchi
          </p>
          <p className="text-[15px] font-medium" style={{ color: "var(--tg-text)" }}>
            {cargo.owner.full_name}
          </p>
          <a href={`tel:${cargo.owner.phone_number}`} className="text-[15px] font-medium" style={{ color: "var(--tg-link)" }}>
            📞 {cargo.owner.phone_number}
          </a>
        </div>
      </div>
    </div>
  );
}

function LocationRow({
  label,
  region,
  district,
  landmark,
  lat,
  lon,
}: {
  label: string;
  region: string;
  district?: string | null;
  landmark?: string | null;
  lat?: number | null;
  lon?: number | null;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium" style={{ color: "var(--tg-hint)" }}>
        {label}
      </p>
      <p className="text-[14px] font-medium" style={{ color: "var(--tg-text)" }}>
        {region}
        {district ? `, ${district}` : ""}
      </p>
      {landmark && (
        <p className="text-[13px]" style={{ color: "var(--tg-hint)" }}>
          {landmark}
        </p>
      )}
      {lat != null && lon != null && (
        <a
          href={`https://yandex.com/maps/?pt=${lon},${lat}&z=14&l=map`}
          target="_blank"
          rel="noreferrer"
          className="text-[12px] underline"
          style={{ color: "var(--tg-link)" }}
        >
          📍 Xaritada ko'rish
        </a>
      )}
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl p-3.5" style={{ background: "var(--tg-secondary-bg)" }}>
      <p className="text-[11px] font-medium" style={{ color: "var(--tg-hint)" }}>
        {label}
      </p>
      <p className="text-[14px] font-semibold" style={{ color: "var(--tg-text)" }}>
        {value}
      </p>
    </div>
  );
}
