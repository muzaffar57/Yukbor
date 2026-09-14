import { useMemo, useState } from "react";
import { useAuth } from "../lib/AuthContext";
import { telegramRegister, extractErrorMessage } from "../lib/api";
import { getInitData, hapticNotify, requestPhoneContact, showAlert } from "../lib/telegram";
import { useMainButton } from "../lib/hooks";
import { Field, SegmentedControl, TextInput, ErrorBanner } from "../components/Form";

const PHONE_PATTERN = /^\+998\d{9}$/;

function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+998")) return digits;
  if (digits.startsWith("998")) return "+" + digits;
  if (digits.startsWith("9") && digits.length === 9) return "+998" + digits;
  if (digits.startsWith("0") && digits.length === 9) return "+998" + digits.slice(1);
  return digits;
}

export function OnboardingPage() {
  const { insideTelegram, telegramProfile, completeRegistration, loginAsDev } = useAuth();

  const defaultName = useMemo(() => {
    if (!telegramProfile) return "";
    return [telegramProfile.first_name, telegramProfile.last_name].filter(Boolean).join(" ");
  }, [telegramProfile]);

  const [fullName, setFullName] = useState(defaultName);
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"shipper" | "driver">("shipper");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = fullName.trim().length >= 2 && PHONE_PATTERN.test(normalizePhone(phone));

  async function handleShareContact() {
    const contact = await requestPhoneContact();
    if (contact) {
      setPhone(normalizePhone(contact.phoneNumber));
      hapticNotify("success");
    }
  }

  async function handleSubmit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const normalizedPhone = normalizePhone(phone);
      if (insideTelegram) {
        const result = await telegramRegister({
          init_data: getInitData(),
          full_name: fullName.trim(),
          phone_number: normalizedPhone,
          role,
        });
        await completeRegistration(result.access_token);
      } else {
        const devId = telegramProfile?.telegram_id ?? Math.floor(100000000 + Math.random() * 800000000);
        await loginAsDev({
          telegram_id: devId,
          full_name: fullName.trim(),
          phone_number: normalizedPhone,
          role,
        });
      }
      hapticNotify("success");
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      hapticNotify("error");
      if (insideTelegram) await showAlert(message);
    } finally {
      setSubmitting(false);
    }
  }

  useMainButton({
    text: "Ro'yxatdan o'tish",
    onClick: handleSubmit,
    enabled: canSubmit && !submitting,
    loading: submitting,
    visible: insideTelegram,
  });

  return (
    <div className="flex min-h-full flex-col px-5" style={{ paddingTop: "calc(2rem + var(--safe-top))" }}>
      <div className="mb-6 flex flex-col items-center gap-2 text-center">
        <p className="text-[28px] font-extrabold" style={{ color: "var(--yb-green)" }}>
          Yukbor
        </p>
        <p className="text-[13px] font-medium" style={{ color: "var(--yb-green)" }}>
          Yuk topish endi oson!
        </p>
        <p className="mt-2 text-[14px]" style={{ color: "var(--tg-hint)" }}>
          O'zbekiston bo'yicha yuk va bo'sh transport e'lonlari. Davom etish uchun qisqa ma'lumot to'ldiring.
        </p>
      </div>

      {!insideTelegram && (
        <div
          className="mb-4 rounded-xl px-3.5 py-2.5 text-[12px]"
          style={{ background: "rgba(245,158,11,0.12)", color: "#92400e" }}
        >
          🧪 Test rejimi: bu sahifa Telegram tashqarisida ochilgan, shuning uchun ma'lumotlarni qo'lda kiritasiz.
        </div>
      )}

      <div className="flex flex-col gap-4">
        <Field label="Ism-familiya" required>
          <TextInput
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Masalan: Aziz Karimov"
          />
        </Field>

        <Field label="Telefon raqami" required hint="+998XXXXXXXXX formatida">
          <div className="flex gap-2">
            <TextInput
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
              inputMode="tel"
              className="flex-1"
            />
            {insideTelegram && (
              <button
                type="button"
                onClick={handleShareContact}
                className="whitespace-nowrap rounded-xl px-3 py-2.5 text-[13px] font-medium"
                style={{ background: "var(--tg-link)", color: "#fff" }}
              >
                📱 Ulashish
              </button>
            )}
          </div>
        </Field>

        <Field label="Siz kimsiz?" required>
          <SegmentedControl
            value={role}
            onChange={setRole}
            options={[
              { value: "shipper", label: "📦 Yuk beruvchi" },
              { value: "driver", label: "🚛 Haydovchi" },
            ]}
          />
        </Field>

        <ErrorBanner message={error} />

        {!insideTelegram && (
          <button
            type="button"
            disabled={!canSubmit || submitting}
            onClick={handleSubmit}
            className="mt-2 rounded-xl px-4 py-3 text-[15px] font-semibold disabled:opacity-40"
            style={{ background: "var(--tg-button)", color: "var(--tg-button-text)" }}
          >
            {submitting ? "Yuborilmoqda..." : "Ro'yxatdan o'tish"}
          </button>
        )}
      </div>
    </div>
  );
}
