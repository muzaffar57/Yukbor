import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BrandHeader } from "../components/Header";
import { FullPageSpinner } from "../components/Spinner";
import { ErrorState } from "../components/EmptyState";
import { LoadTypeBadge, StatusBadge } from "../components/Badge";
import { fetchCargo, updateCargoStatus, extractErrorMessage } from "../lib/api";
import { mediaUrl } from "../lib/media";
import type { CargoOut } from "../types";
import { REGION_LABELS, VEHICLE_TYPE_LABELS, PAYMENT_TYPE_LABELS } from "../types";
import { formatDate, formatDistance, formatMoney, formatVolume, formatWeight, yandexMapsUrl } from "../lib/format";
import { useAuth } from "../lib/AuthContext";
import { useBackButton, useMainButton } from "../lib/hooks";
import { hapticNotify, showConfirm } from "../lib/telegram";
import { ClosedBanner, ClosedStamp } from "../components/ClosedStamp";

export function CargoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cargo, setCargo] = useState<CargoOut | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
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
    const ok = await showConfirm(
      "Yukni yopamizmi? Telegram kanaldagi post ham «Yuk yopildi» bo'ladi, telefon raqami yashiriladi."
    );
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
      ? { text: "Yukni yopish", onClick: handleMarkCompleted, loading: updating }
      : cargo && cargo.status === "active"
        ? {
            text: "Qo'ng'iroq qilish",
            onClick: () => window.open(`tel:${cargo.owner.phone_number}`, "_self"),
          }
        : null
  );

  if (loading) return <FullPageSpinner />;
  if (error || !cargo) return <ErrorState message={error ?? "Yuk topilmadi"} onRetry={load} />;

  const photos = cargo.photos;
  const currentPhoto = mediaUrl(photos[photoIndex]?.url);

  return (
    <div>
      <BrandHeader showBack />
      <div className="flex flex-col gap-3 px-4 pb-28">
        <div className="relative overflow-hidden rounded-3xl bg-gray-100">
          {currentPhoto ? (
            <img src={currentPhoto} alt="" className="h-48 w-full object-cover" />
          ) : (
            <div className="flex h-40 items-center justify-center text-4xl">📦</div>
          )}
          {cargo.status !== "active" && <ClosedStamp />}
          {photos.length > 1 && (
            <div className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] text-white">
              {photoIndex + 1}/{photos.length}
            </div>
          )}
        </div>
        {photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {photos.map((photo, i) => (
              <button key={photo.id} type="button" onClick={() => setPhotoIndex(i)} className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl">
                <img src={mediaUrl(photo.url) ?? ""} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {cargo.status !== "active" && <ClosedBanner>✅ YUK YOPILDI — mijoz raqami yashirilgan</ClosedBanner>}

        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[20px] font-extrabold leading-tight">{cargo.title}</h2>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={cargo.status} />
              <span className="text-[12px]" style={{ color: "var(--tg-hint)" }}>
                {PAYMENT_TYPE_LABELS[cargo.payment_type]}
              </span>
            </div>
          </div>
          <p className="whitespace-nowrap text-[18px] font-extrabold" style={{ color: "var(--yb-green)" }}>
            {formatMoney(cargo.price)}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-sm">
          <div className="flex gap-3">
            <div className="flex w-4 flex-col items-center pt-1">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--yb-origin)" }} />
              <span className="my-1 w-px flex-1 bg-gray-200" />
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--yb-dest)" }} />
            </div>
            <div className="flex-1">
              <p className="font-bold">{REGION_LABELS[cargo.loading_region]}</p>
              <p className="text-[12px]" style={{ color: "var(--tg-hint)" }}>
                {[cargo.loading_district, cargo.loading_landmark].filter(Boolean).join(", ") || "Ortish manzili"}
              </p>
              {cargo.loading_lat != null && cargo.loading_lon != null && (
                <a
                  href={yandexMapsUrl(cargo.loading_lat, cargo.loading_lon)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[12px] font-semibold"
                  style={{ color: "var(--yb-green)" }}
                >
                  🗺 Ortish joyi xaritada
                </a>
              )}
              <p className="mt-3 font-bold">{REGION_LABELS[cargo.unloading_region]}</p>
              <p className="text-[12px]" style={{ color: "var(--tg-hint)" }}>
                {[cargo.unloading_district, cargo.unloading_landmark].filter(Boolean).join(", ") || "Tushirish manzili"}
              </p>
              {cargo.unloading_lat != null && cargo.unloading_lon != null && (
                <a
                  href={yandexMapsUrl(cargo.unloading_lat, cargo.unloading_lon)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[12px] font-semibold"
                  style={{ color: "var(--yb-dest)" }}
                >
                  🗺 Tushirish joyi xaritada
                </a>
              )}
            </div>
            {cargo.distance_km !== null && (
              <span className="self-center text-[12px] font-semibold" style={{ color: "var(--tg-hint)" }}>
                {formatDistance(cargo.distance_km)}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <InfoBox label="Og'irligi" value={formatWeight(cargo.weight)} />
          <InfoBox label="Hajmi" value={cargo.volume ? formatVolume(cargo.volume) : "—"} />
          <InfoBox label="Mashina turi" value={VEHICLE_TYPE_LABELS[cargo.vehicle_type]} />
          <InfoBox label="Ortish sanasi" value={cargo.loading_date ? formatDate(cargo.loading_date) : "—"} />
          <InfoBox label="Yuk turi" value={<LoadTypeBadge loadType={cargo.load_type} />} />
        </div>

        {cargo.description && (
          <div className="rounded-3xl bg-white p-4 shadow-sm">
            <p className="mb-1 text-[12px] font-semibold" style={{ color: "var(--tg-hint)" }}>
              Qo'shimcha ma'lumot
            </p>
            <p className="text-[14px]">{cargo.description}</p>
          </div>
        )}

        <div className="flex items-center gap-3 rounded-3xl bg-white p-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full text-xl" style={{ background: "var(--yb-green-soft)" }}>
            👤
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold">{cargo.owner.full_name}</p>
            <p className="text-[12px]" style={{ color: "var(--tg-hint)" }}>
              Yuk beruvchi
            </p>
            {cargo.status === "active" && cargo.owner.phone_number ? (
              <a href={`tel:${cargo.owner.phone_number}`} className="text-[13px] font-semibold" style={{ color: "var(--yb-green)" }}>
                {cargo.owner.phone_number}
              </a>
            ) : (
              <p className="text-[13px] font-semibold" style={{ color: "var(--tg-hint)" }}>
                🔒 Raqam yashirilgan
              </p>
            )}
          </div>
        </div>
      </div>

      {cargo.status === "active" && (
        <div
          className="fixed inset-x-0 z-20 px-4"
          style={{ bottom: "calc(72px + var(--safe-bottom))" }}
        >
          {isOwner ? (
            <button
              type="button"
              disabled={updating}
              onClick={handleMarkCompleted}
              className="w-full rounded-2xl py-3.5 text-[15px] font-bold text-white disabled:opacity-50"
              style={{ background: "var(--yb-green)" }}
            >
              {updating ? "Yopilmoqda..." : "Yukni yopish"}
            </button>
          ) : (
            <a
              href={`tel:${cargo.owner.phone_number}`}
              className="block w-full rounded-2xl py-3.5 text-center text-[15px] font-bold text-white"
              style={{ background: "var(--yb-green)" }}
            >
              📞 Qo'ng'iroq qilish
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-white p-3.5 shadow-sm">
      <p className="text-[11px]" style={{ color: "var(--tg-hint)" }}>
        {label}
      </p>
      <div className="mt-1 text-[14px] font-bold">{value}</div>
    </div>
  );
}
