import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BrandHeader } from "../components/Header";
import { FullPageSpinner } from "../components/Spinner";
import { ErrorState } from "../components/EmptyState";
import { LoadTypeBadge, StatusBadge } from "../components/Badge";
import { fetchDriverOffer, updateDriverOfferStatus, extractErrorMessage } from "../lib/api";
import type { DriverOfferOut } from "../types";
import { REGION_LABELS, VEHICLE_TYPE_LABELS, PAYMENT_TYPE_LABELS } from "../types";
import { formatDateTime, formatDistance, formatMoney, formatWeight, timeAgo } from "../lib/format";
import { useAuth } from "../lib/AuthContext";
import { useBackButton, useMainButton } from "../lib/hooks";
import { hapticNotify, showConfirm } from "../lib/telegram";

export function DriverOfferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [offer, setOffer] = useState<DriverOfferOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useBackButton(() => navigate(-1));

  async function load() {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setOffer(await fetchDriverOffer(Number(id)));
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

  const isOwner = offer && user && offer.driver.id === user.id;

  async function handleMarkCompleted() {
    if (!offer || updating) return;
    const ok = await showConfirm("Bu e'lonni 'Yakunlangan' deb belgilaymizmi?");
    if (!ok) return;
    setUpdating(true);
    try {
      const updated = await updateDriverOfferStatus(offer.id, "completed");
      setOffer(updated);
      hapticNotify("success");
    } catch (err) {
      hapticNotify("error");
      setError(extractErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  }

  useMainButton(
    isOwner && offer?.status === "active"
      ? { text: "✅ Yakunlangan deb belgilash", onClick: handleMarkCompleted, loading: updating }
      : offer && offer.status === "active"
      ? {
          text: `📞 Qo'ng'iroq: ${offer.driver.phone_number}`,
          onClick: () => window.open(`tel:${offer.driver.phone_number}`, "_self"),
        }
      : null
  );

  if (loading) return <FullPageSpinner />;
  if (error || !offer) return <ErrorState message={error ?? "E'lon topilmadi"} onRetry={load} />;

  return (
    <div>
      <BrandHeader showBack />
      <div className="flex flex-col gap-4 p-4 pb-28">
        <div className="rounded-2xl p-4" style={{ background: "var(--tg-secondary-bg)" }}>
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-lg font-semibold" style={{ color: "var(--tg-text)" }}>
              {REGION_LABELS[offer.departure_region]} → {offer.destination_region ? REGION_LABELS[offer.destination_region] : "Kelishuv bo'yicha"}
            </h2>
            <StatusBadge status={offer.status} />
          </div>
          {offer.price_expectation && (
            <p className="mt-1 text-2xl font-bold" style={{ color: "var(--tg-link)" }}>
              {formatMoney(offer.price_expectation)}
            </p>
          )}
          <p className="text-[13px]" style={{ color: "var(--tg-hint)" }}>
            {offer.payment_type ? PAYMENT_TYPE_LABELS[offer.payment_type] + " · " : ""}
            {timeAgo(offer.created_at)}
          </p>
          <div className="mt-2">
            <LoadTypeBadge loadType={offer.load_type} />
          </div>
        </div>

        {offer.description && (
          <div className="rounded-2xl p-4" style={{ background: "var(--tg-secondary-bg)" }}>
            <p className="mb-1 text-[12px] font-medium uppercase" style={{ color: "var(--tg-hint)" }}>
              Izoh
            </p>
            <p className="text-[14px]" style={{ color: "var(--tg-text)" }}>
              {offer.description}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <InfoBox label="Jo'nash sanasi" value={formatDateTime(offer.departure_date)} />
          <InfoBox label="Mashina turi" value={VEHICLE_TYPE_LABELS[offer.vehicle_type]} />
          {offer.available_weight && <InfoBox label="Bo'sh joy (og'irlik)" value={formatWeight(offer.available_weight)} />}
          {offer.available_volume && <InfoBox label="Bo'sh joy (hajm)" value={`${offer.available_volume} m³`} />}
          {offer.distance_km !== null && <InfoBox label="Taxminiy masofa" value={formatDistance(offer.distance_km)} />}
        </div>

        {(offer.departure_landmark || offer.departure_lat) && (
          <div className="rounded-2xl p-4" style={{ background: "var(--tg-secondary-bg)" }}>
            <p className="mb-1 text-[12px] font-medium uppercase" style={{ color: "var(--tg-hint)" }}>
              Jo'nash mo'ljali
            </p>
            {offer.departure_landmark && (
              <p className="text-[14px]" style={{ color: "var(--tg-text)" }}>
                {offer.departure_landmark}
              </p>
            )}
            {offer.departure_lat != null && offer.departure_lon != null && (
              <a
                href={`https://yandex.com/maps/?pt=${offer.departure_lon},${offer.departure_lat}&z=14&l=map`}
                target="_blank"
                rel="noreferrer"
                className="text-[12px] underline"
                style={{ color: "var(--tg-link)" }}
              >
                📍 Xaritada ko'rish
              </a>
            )}
          </div>
        )}

        <div className="rounded-2xl p-4" style={{ background: "var(--tg-secondary-bg)" }}>
          <p className="mb-1 text-[12px] font-medium uppercase" style={{ color: "var(--tg-hint)" }}>
            Haydovchi
          </p>
          <p className="text-[15px] font-medium" style={{ color: "var(--tg-text)" }}>
            {offer.driver.full_name}
          </p>
          <a href={`tel:${offer.driver.phone_number}`} className="text-[15px] font-medium" style={{ color: "var(--tg-link)" }}>
            📞 {offer.driver.phone_number}
          </a>
        </div>
      </div>

      {offer.status === "active" && (
        <div className="fixed inset-x-0 z-20 px-4" style={{ bottom: "calc(72px + var(--safe-bottom))" }}>
          {isOwner ? (
            <button
              type="button"
              disabled={updating}
              onClick={handleMarkCompleted}
              className="w-full rounded-2xl py-3.5 text-[15px] font-bold text-white disabled:opacity-50"
              style={{ background: "var(--yb-green)" }}
            >
              {updating ? "Saqlanmoqda..." : "Yakunlangan deb belgilash"}
            </button>
          ) : (
            <a
              href={`tel:${offer.driver.phone_number}`}
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
