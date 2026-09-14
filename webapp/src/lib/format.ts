export function formatMoney(value: number): string {
  return new Intl.NumberFormat("uz-UZ").format(Math.round(value)) + " so'm";
}

export function kgToTons(kg: number): number {
  return kg / 1000;
}

export function tonsToKg(tons: number): number {
  return Math.round(tons * 1000 * 1000) / 1000;
}

export function formatWeight(kg: number): string {
  if (kg >= 1000) {
    const tons = kgToTons(kg);
    return `${tons % 1 === 0 ? tons.toFixed(0) : tons.toFixed(1)} tonna`;
  }
  return `${kg} kg`;
}

export function formatVolume(m3: number): string {
  return `${m3} m³`;
}

export function formatDistance(km: number | null): string {
  if (km === null) return "";
  return `~${Math.round(km)} km`;
}

export function formatDate(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  return date.toLocaleDateString("uz-UZ", { day: "2-digit", month: "short" });
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "hozir";
  if (minutes < 60) return `${minutes} daqiqa oldin`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} soat oldin`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} kun oldin`;
  return formatDate(iso);
}
