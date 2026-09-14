export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <div
      className="inline-block animate-spin rounded-full border-2 border-current border-t-transparent opacity-60"
      style={{ width: size, height: size }}
      role="status"
      aria-label="Yuklanmoqda"
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex h-full min-h-[60vh] w-full items-center justify-center" style={{ color: "var(--tg-link)" }}>
      <Spinner size={32} />
    </div>
  );
}
