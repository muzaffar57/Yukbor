import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrandHeader } from "../components/Header";
import { Field, Select, TextArea, TextInput, ErrorBanner, SegmentedControl } from "../components/Form";
import { createCargo, uploadCargoPhotos, extractErrorMessage } from "../lib/api";
import { REGION_LABELS, VEHICLE_TYPE_LABELS, VEHICLE_TYPE_OPTIONS, LOAD_TYPE_LABELS, PAYMENT_TYPE_LABELS } from "../types";
import type { Region, VehicleType, LoadType, PaymentType } from "../types";
import { useBackButton, useMainButton } from "../lib/hooks";
import { hapticNotify, showAlert } from "../lib/telegram";
import { parseNumber, tonsToKg } from "../lib/format";

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
  const [paymentType, setPaymentType] = useState<PaymentType | "">("naqd");
  const [loadingDate, setLoadingDate] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [loadingCoords, setLoadingCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [unloadingCoords, setUnloadingCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locating, setLocating] = useState<"loading" | "unloading" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const weightTons = parseNumber(weight);
  const priceValue = parseNumber(price);
  const volumeValue = parseNumber(volume);

  function missingFields(): string[] {
    const missing: string[] = [];
    if (title.trim().length < 2) missing.push("yuk nomi");
    if (weightTons === null || weightTons <= 0) missing.push("og'irligi (tonna)");
    if (!loadingRegion) missing.push("ortish viloyati");
    if (!unloadingRegion) missing.push("tushirish viloyati");
    if (!vehicleType) missing.push("mashina turi");
    if (priceValue === null || priceValue <= 0) missing.push("narx");
    if (!paymentType) missing.push("to'lov turi");
    return missing;
  }

  function handleLocate(target: "loading" | "unloading") {
    if (!navigator.geolocation) {
      showAlert("Bu qurilmada joylashuvni aniqlash imkoni yo'q.");
      return;
    }
    setLocating(target);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const point = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        if (target === "loading") setLoadingCoords(point);
        else setUnloadingCoords(point);
        setLocating(null);
        hapticNotify("success");
      },
      () => {
        setLocating(null);
        showAlert("Joylashuvni aniqlab bo'lmadi. Ruxsat berilganini tekshiring.");
      },
      { timeout: 8000 }
    );
  }

  async function handleSubmit() {
    if (submitting) return;
    const missing = missingFields();
    if (missing.length > 0) {
      const message = "To'ldiring: " + missing.join(", ");
      setError(message);
      hapticNotify("error");
      await showAlert(message);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const cargo = await createCargo({
        title: title.trim(),
        description: description.trim() || null,
        weight: tonsToKg(weightTons as number),
        volume: volumeValue !== null && volumeValue > 0 ? volumeValue : null,
        loading_region: loadingRegion as Region,
        loading_district: loadingDistrict.trim() || null,
        loading_landmark: loadingLandmark.trim() || null,
        loading_lat: loadingCoords?.lat ?? null,
        loading_lon: loadingCoords?.lon ?? null,
        unloading_region: unloadingRegion as Region,
        unloading_district: unloadingDistrict.trim() || null,
        unloading_landmark: unloadingLandmark.trim() || null,
        unloading_lat: unloadingCoords?.lat ?? null,
        unloading_lon: unloadingCoords?.lon ?? null,
        vehicle_type: vehicleType as VehicleType,
        load_type: loadType,
        price: priceValue as number,
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
    enabled: !submitting,
    loading: submitting,
  });

  return (
    <div>
      <BrandHeader showBack />
      <div className="flex flex-col gap-4 px-4 pb-36">
        <div>
          <h2 className="text-[18px] font-extrabold">Yangi yuk e'loni</h2>
          <p className="text-[13px]" style={{ color: "var(--tg-hint)" }}>
            Yuk ma'lumotlarini kiriting va e'lonni joylashtiring
          </p>
        </div>

        <Field label="Yuk nomi" required>
          <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Masalan: Penoplast mahsulotlari" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Og'irligi" required hint="tonna">
            <TextInput type="number" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Masalan: 5" />
          </Field>
          <Field label="Hajmi" hint="m³">
            <TextInput type="number" inputMode="decimal" value={volume} onChange={(e) => setVolume(e.target.value)} placeholder="Masalan: 12" />
          </Field>
        </div>

        <Field label="Mashina turi" required>
          <Select value={vehicleType} onChange={(e) => setVehicleType(e.target.value as VehicleType)}>
            <option value="">Tanlang</option>
            {VEHICLE_TYPE_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {VEHICLE_TYPE_LABELS[value]}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Ortish viloyati" required>
            <Select value={loadingRegion} onChange={(e) => setLoadingRegion(e.target.value as Region)}>
              <option value="">Tanlang</option>
              {Object.entries(REGION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tushirish viloyati" required>
            <Select value={unloadingRegion} onChange={(e) => setUnloadingRegion(e.target.value as Region)}>
              <option value="">Tanlang</option>
              {Object.entries(REGION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Yuk turi" required>
          <SegmentedControl
            value={loadType}
            onChange={setLoadType}
            options={(Object.keys(LOAD_TYPE_LABELS) as LoadType[]).map((value) => ({
              value,
              label: LOAD_TYPE_LABELS[value],
            }))}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Narx (so'm)" required>
            <TextInput type="number" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="2800000" />
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

        <div className="rounded-3xl p-3.5" style={{ background: "#ecfdf5" }}>
          <p className="mb-2 text-[13px] font-bold" style={{ color: "var(--yb-green-dark)" }}>
            Ortish manzili
          </p>
          <Field label="Tuman / aniq manzil">
            <TextInput value={loadingLandmark} onChange={(e) => setLoadingLandmark(e.target.value)} placeholder="Masalan: Industriel zona, 5-ombor" />
          </Field>
          <Field label="Tuman (ixtiyoriy)">
            <TextInput value={loadingDistrict} onChange={(e) => setLoadingDistrict(e.target.value)} />
          </Field>
          <button
            type="button"
            onClick={() => handleLocate("loading")}
            disabled={locating !== null}
            className="mt-2 rounded-xl px-3 py-2 text-[13px] font-semibold disabled:opacity-50"
            style={{ background: loadingCoords ? "var(--yb-green)" : "#fff", color: loadingCoords ? "#fff" : "var(--yb-green)" }}
          >
            {locating === "loading" ? "Aniqlanmoqda..." : loadingCoords ? "Ortish GPS ulandi" : "Ortish joyida GPS ni ulash"}
          </button>
          <p className="mt-1 text-[11px]" style={{ color: "var(--tg-hint)" }}>
            Tugmani yuk turgan joyda turib bosing.
          </p>
        </div>

        <div className="rounded-3xl p-3.5" style={{ background: "#fef2f2" }}>
          <p className="mb-2 text-[13px] font-bold" style={{ color: "#b91c1c" }}>
            Tushirish manzili
          </p>
          <Field label="Tuman / aniq manzil">
            <TextInput value={unloadingLandmark} onChange={(e) => setUnloadingLandmark(e.target.value)} placeholder="Masalan: Yangihayot tumani" />
          </Field>
          <Field label="Tuman (ixtiyoriy)">
            <TextInput value={unloadingDistrict} onChange={(e) => setUnloadingDistrict(e.target.value)} />
          </Field>
          <button
            type="button"
            onClick={() => handleLocate("unloading")}
            disabled={locating !== null}
            className="mt-2 rounded-xl px-3 py-2 text-[13px] font-semibold disabled:opacity-50"
            style={{ background: unloadingCoords ? "#ef4444" : "#fff", color: unloadingCoords ? "#fff" : "#b91c1c" }}
          >
            {locating === "unloading" ? "Aniqlanmoqda..." : unloadingCoords ? "Tushirish GPS ulandi" : "Tushirish joyida GPS ni ulash"}
          </button>
          <p className="mt-1 text-[11px]" style={{ color: "var(--tg-hint)" }}>
            Tugmani yuk tushadigan joyda turib bosing. Ikkalasi ham ulansa haydovchi aniqroq km ko'radi.
          </p>
        </div>

        <Field label="Qo'shimcha ma'lumot">
          <TextArea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Agar qo'shimcha ma'lumot bo'lsa, shu yerga yozing" />
        </Field>

        <Field label="Rasmlar (ixtiyoriy, JPG/PNG)">
          <input
            type="file"
            accept="image/jpeg,image/png"
            multiple
            onChange={(e) => setPhotos(Array.from(e.target.files ?? []).slice(0, 5))}
            className="text-[13px]"
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
          disabled={submitting}
          onClick={handleSubmit}
          className="rounded-2xl px-4 py-3.5 text-[15px] font-bold text-white disabled:opacity-40"
          style={{ background: "var(--yb-green)" }}
        >
          {submitting ? "Yuborilmoqda..." : "E'lonni joylashtirish"}
        </button>
      </div>
    </div>
  );
}
