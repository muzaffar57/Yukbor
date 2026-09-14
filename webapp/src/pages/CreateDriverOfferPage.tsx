import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { Field, Select, TextArea, TextInput, ErrorBanner } from "../components/Form";
import { createDriverOffer, extractErrorMessage } from "../lib/api";
import { REGION_LABELS, VEHICLE_TYPE_LABELS, LOAD_TYPE_LABELS, PAYMENT_TYPE_LABELS } from "../types";
import type { Region, VehicleType, LoadType, PaymentType } from "../types";
import { useBackButton, useMainButton } from "../lib/hooks";
import { hapticNotify, showAlert } from "../lib/telegram";

function localDateTimeNow(): string {
  const now = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
  return now.toISOString().slice(0, 16);
}

export function CreateDriverOfferPage() {
  const navigate = useNavigate();
  useBackButton(() => navigate(-1));

  const [description, setDescription] = useState("");
  const [departureRegion, setDepartureRegion] = useState<Region | "">("");
  const [departureDistrict, setDepartureDistrict] = useState("");
  const [departureLandmark, setDepartureLandmark] = useState("");
  const [destinationRegion, setDestinationRegion] = useState<Region | "">("");
  const [destinationDistrict, setDestinationDistrict] = useState("");
  const [destinationLandmark, setDestinationLandmark] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleType | "">("");
  const [loadType, setLoadType] = useState<LoadType>("qisman_yuk");
  const [availableWeight, setAvailableWeight] = useState("");
  const [availableVolume, setAvailableVolume] = useState("");
  const [priceExpectation, setPriceExpectation] = useState("");
  const [paymentType, setPaymentType] = useState<PaymentType | "">("");
  const [departureDate, setDepartureDate] = useState(localDateTimeNow());
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = departureRegion !== "" && vehicleType !== "" && departureDate.length > 0;

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
      const offer = await createDriverOffer({
        description: description.trim() || null,
        departure_region: departureRegion as Region,
        departure_district: departureDistrict.trim() || null,
        departure_landmark: departureLandmark.trim() || null,
        departure_lat: coords?.lat ?? null,
        departure_lon: coords?.lon ?? null,
        destination_region: destinationRegion ? (destinationRegion as Region) : null,
        destination_district: destinationDistrict.trim() || null,
        destination_landmark: destinationLandmark.trim() || null,
        vehicle_type: vehicleType as VehicleType,
        load_type: loadType,
        available_weight: availableWeight ? Number(availableWeight) : null,
        available_volume: availableVolume ? Number(availableVolume) : null,
        price_expectation: priceExpectation ? Number(priceExpectation) : null,
        payment_type: paymentType || null,
        departure_date: new Date(departureDate).toISOString(),
      });
      hapticNotify("success");
      navigate(`/offers/${offer.id}`, { replace: true });
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      hapticNotify("error");
    } finally {
      setSubmitting(false);
    }
  }

  useMainButton({
    text: "🚛 E'lonni joylashtirish",
    onClick: handleSubmit,
    enabled: canSubmit && !submitting,
    loading: submitting,
  });

  return (
    <div>
      <Header title="Bo'sh transport e'loni" />
      <div className="flex flex-col gap-4 p-4 pb-24">
        <div
          className="rounded-xl px-3.5 py-2.5 text-[12px]"
          style={{ background: "rgba(36,129,204,0.1)", color: "#1d4ed8" }}
        >
          🚛 Bo'sh joyingiz yoki mashinangiz haqida yozing — yuk beruvchilar sizni topadi.
        </div>

        <div className="rounded-2xl p-3.5" style={{ background: "var(--tg-secondary-bg)" }}>
          <p className="mb-3 text-[13px] font-semibold" style={{ color: "var(--tg-text)" }}>
            📍 Jo'nash manzili
          </p>
          <div className="flex flex-col gap-3">
            <Field label="Viloyat" required>
              <Select value={departureRegion} onChange={(e) => setDepartureRegion(e.target.value as Region)}>
                <option value="">Tanlang</option>
                {Object.entries(REGION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Tuman / shahar">
              <TextInput value={departureDistrict} onChange={(e) => setDepartureDistrict(e.target.value)} />
            </Field>
            <Field label="Mo'ljal">
              <TextInput value={departureLandmark} onChange={(e) => setDepartureLandmark(e.target.value)} />
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
            🏁 Borish manzili (ixtiyoriy)
          </p>
          <div className="flex flex-col gap-3">
            <Field label="Viloyat" hint="Bo'sh qoldirsangiz — 'Kelishuv bo'yicha' deb ko'rinadi">
              <Select value={destinationRegion} onChange={(e) => setDestinationRegion(e.target.value as Region)}>
                <option value="">Kelishuv bo'yicha</option>
                {Object.entries(REGION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            {destinationRegion && (
              <>
                <Field label="Tuman / shahar">
                  <TextInput value={destinationDistrict} onChange={(e) => setDestinationDistrict(e.target.value)} />
                </Field>
                <Field label="Mo'ljal">
                  <TextInput value={destinationLandmark} onChange={(e) => setDestinationLandmark(e.target.value)} />
                </Field>
              </>
            )}
          </div>
        </div>

        <Field label="Mashina turi" required>
          <Select value={vehicleType} onChange={(e) => setVehicleType(e.target.value as VehicleType)}>
            <option value="">Tanlang</option>
            {Object.entries(VEHICLE_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Bo'sh joy turi" required>
          <Select value={loadType} onChange={(e) => setLoadType(e.target.value as LoadType)}>
            {Object.entries(LOAD_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Bo'sh joy (kg)">
            <TextInput type="number" inputMode="decimal" value={availableWeight} onChange={(e) => setAvailableWeight(e.target.value)} placeholder="2000" />
          </Field>
          <Field label="Bo'sh joy (m³)">
            <TextInput type="number" inputMode="decimal" value={availableVolume} onChange={(e) => setAvailableVolume(e.target.value)} placeholder="5" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Kutilayotgan narx (so'm)">
            <TextInput type="number" inputMode="decimal" value={priceExpectation} onChange={(e) => setPriceExpectation(e.target.value)} />
          </Field>
          <Field label="To'lov turi">
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

        <Field label="Jo'nash sanasi va vaqti" required>
          <TextInput type="datetime-local" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} />
        </Field>

        <Field label="Izoh">
          <TextArea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Qo'shimcha shartlar bo'lsa" />
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
