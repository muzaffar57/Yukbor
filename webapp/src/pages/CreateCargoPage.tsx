import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { Field, Select, TextArea, TextInput, ErrorBanner } from "../components/Form";
import { createCargo, uploadCargoPhotos, extractErrorMessage } from "../lib/api";
import { REGION_LABELS, VEHICLE_TYPE_LABELS, LOAD_TYPE_LABELS, PAYMENT_TYPE_LABELS } from "../types";
import type { Region, VehicleType, LoadType, PaymentType } from "../types";
import { useBackButton, useMainButton } from "../lib/hooks";
import { hapticNotify, showAlert } from "../lib/telegram";

export function CreateCargoPage() {
  const navigate = useNavigate();
  useBackButton(() => navigate(-1));

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState("");
  const [volume, setVolume] = useState("");
  const [loadingRegion, setLoadingRegion] = useState<Region | "">("");
  const [loadingDistrict, setLoadingDistrict] = useState("");
  const [loadingLandmark, setLoadingLandmark] = useState("");
  const [unloadingRegion, setUnloadingRegion] = useState<Region | "">("");
  const [unloadingDistrict, setUnloadingDistrict] = useState("");
  const [unloadingLandmark, setUnloadingLandmark] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleType | "">("");
  const [loadType, setLoadType] = useState<LoadType>("toliq_mashina");
  const [price, setPrice] = useState("");
  const [paymentType, setPaymentType] = useState<PaymentType | "">("");
  const [loadingDate, setLoadingDate] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    title.trim().length >= 2 &&
    Number(weight) > 0 &&
    loadingRegion !== "" &&
    unloadingRegion !== "" &&
    vehicleType !== "" &&
    Number(price) > 0 &&
    paymentType !== "";

  function handleLocate() {
    if (!navigator.geolocation) {
      showAlert("Bu qurilmada joylashuvni aniqlash imkoni yo'q.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocating(false);
        hapticNotify("success");
      },
      () => {
        setLocating(false);
        showAlert("Joylashuvni aniqlab bo'lmadi. Ruxsat berilganini tekshiring.");
      },
      { timeout: 8000 }
    );
  }

  async function handleSubmit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const cargo = await createCargo({
        title: title.trim(),
        description: description.trim() || null,
        weight: Number(weight),
        volume: volume ? Number(volume) : null,
        loading_region: loadingRegion as Region,
        loading_district: loadingDistrict.trim() || null,
        loading_landmark: loadingLandmark.trim() || null,
        loading_lat: coords?.lat ?? null,
        loading_lon: coords?.lon ?? null,
        unloading_region: unloadingRegion as Region,
        unloading_district: unloadingDistrict.trim() || null,
        unloading_landmark: unloadingLandmark.trim() || null,
        vehicle_type: vehicleType as VehicleType,
        load_type: loadType,
        price: Number(price),
        payment_type: paymentType as PaymentType,
        loading_date: loadingDate || null,
      });
      if (photos.length > 0) {
        try {
          await uploadCargoPhotos(cargo.id, photos);
        } catch {
          // Rasm yuklanmasa ham, yukning o'zi yaratilgan -- xato bermaymiz.
        }
      }
      hapticNotify("success");
      navigate(`/cargos/${cargo.id}`, { replace: true });
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      hapticNotify("error");
    } finally {
      setSubmitting(false);
    }
  }

  useMainButton({
    text: "E'lonni joylashtirish",
    onClick: handleSubmit,
    enabled: canSubmit && !submitting,
    loading: submitting,
  });

  return (
    <div>
      <Header title="Yangi yuk e'loni" />
      <div className="flex flex-col gap-4 p-4 pb-24">
        <Field label="Yuk nomi" required>
          <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Masalan: Poliuretan profil" />
        </Field>

        <Field label="Izoh" hint="Ehtiyotkorlik, yuklash vaqti va h.k.">
          <TextArea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Og'irligi (kg)" required>
            <TextInput type="number" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="5000" />
          </Field>
          <Field label="Hajmi (m³)">
            <TextInput type="number" inputMode="decimal" value={volume} onChange={(e) => setVolume(e.target.value)} placeholder="12" />
          </Field>
        </div>

        <div className="rounded-2xl p-3.5" style={{ background: "var(--tg-secondary-bg)" }}>
          <p className="mb-3 text-[13px] font-semibold" style={{ color: "var(--tg-text)" }}>
            📍 Ortish manzili
          </p>
          <div className="flex flex-col gap-3">
            <Field label="Viloyat" required>
              <Select value={loadingRegion} onChange={(e) => setLoadingRegion(e.target.value as Region)}>
                <option value="">Tanlang</option>
                {Object.entries(REGION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Tuman / shahar">
              <TextInput value={loadingDistrict} onChange={(e) => setLoadingDistrict(e.target.value)} placeholder="Masalan: Qibray tumani" />
            </Field>
            <Field label="Mo'ljal (ko'cha, bozor va h.k.)">
              <TextInput value={loadingLandmark} onChange={(e) => setLoadingLandmark(e.target.value)} placeholder="Masalan: Ko'kcha bozori yaqinida" />
            </Field>
            <button
              type="button"
              onClick={handleLocate}
              disabled={locating}
              className="self-start rounded-xl px-3.5 py-2 text-[13px] font-medium disabled:opacity-50"
              style={{ background: coords ? "rgba(16,185,129,0.15)" : "var(--tg-bg)", color: coords ? "#047857" : "var(--tg-link)", border: "1px solid rgba(0,0,0,0.08)" }}
            >
              {locating ? "Aniqlanmoqda..." : coords ? "✅ GPS ulandi" : "📍 GPS joylashuvni ulash (ixtiyoriy)"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl p-3.5" style={{ background: "var(--tg-secondary-bg)" }}>
          <p className="mb-3 text-[13px] font-semibold" style={{ color: "var(--tg-text)" }}>
            🏁 Tushirish manzili
          </p>
          <div className="flex flex-col gap-3">
            <Field label="Viloyat" required>
              <Select value={unloadingRegion} onChange={(e) => setUnloadingRegion(e.target.value as Region)}>
                <option value="">Tanlang</option>
                {Object.entries(REGION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Tuman / shahar">
              <TextInput value={unloadingDistrict} onChange={(e) => setUnloadingDistrict(e.target.value)} />
            </Field>
            <Field label="Mo'ljal">
              <TextInput value={unloadingLandmark} onChange={(e) => setUnloadingLandmark(e.target.value)} />
            </Field>
          </div>
        </div>

        <Field label="Kerakli mashina turi" required>
          <Select value={vehicleType} onChange={(e) => setVehicleType(e.target.value as VehicleType)}>
            <option value="">Tanlang</option>
            {Object.entries(VEHICLE_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Yuk turi" required>
          <Select value={loadType} onChange={(e) => setLoadType(e.target.value as LoadType)}>
            {Object.entries(LOAD_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Narx (so'm)" required>
            <TextInput type="number" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="1500000" />
          </Field>
          <Field label="To'lov turi" required>
            <Select value={paymentType} onChange={(e) => setPaymentType(e.target.value as PaymentType)}>
              <option value="">Tanlang</option>
              {Object.entries(PAYMENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Ortish sanasi">
          <TextInput type="date" value={loadingDate} onChange={(e) => setLoadingDate(e.target.value)} />
        </Field>

        <Field label="Rasmlar (ixtiyoriy, max 5MB, JPG/PNG)">
          <input
            type="file"
            accept="image/jpeg,image/png"
            multiple
            onChange={(e) => setPhotos(Array.from(e.target.files ?? []).slice(0, 5))}
            className="text-[13px]"
            style={{ color: "var(--tg-text)" }}
          />
          {photos.length > 0 && (
            <span className="text-[12px]" style={{ color: "var(--tg-hint)" }}>
              {photos.length} ta rasm tanlandi
            </span>
          )}
        </Field>

        <ErrorBanner message={error} />

        <button
          type="button"
          disabled={!canSubmit || submitting}
          onClick={handleSubmit}
          className="rounded-xl px-4 py-3 text-[15px] font-semibold disabled:opacity-40"
          style={{ background: "var(--tg-button)", color: "var(--tg-button-text)" }}
        >
          {submitting ? "Yuborilmoqda..." : "E'lonni joylashtirish"}
        </button>
      </div>
    </div>
  );
}
