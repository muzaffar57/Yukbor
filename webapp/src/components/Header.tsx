import { useNavigate } from "react-router-dom";

export function BrandHeader({
  showBack = false,
  right,
}: {
  showBack?: boolean;
  right?: React.ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <header
      className="sticky top-0 z-20 flex items-center gap-3 px-4 pb-3"
      style={{
        background: "var(--tg-header-bg)",
        paddingTop: `calc(0.75rem + var(--safe-top))`,
      }}
    >
      {showBack && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
          style={{ background: "var(--tg-bg)", color: "var(--tg-text)" }}
          aria-label="Orqaga"
        >
          ←
        </button>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[22px] font-extrabold leading-none tracking-tight" style={{ color: "var(--yb-green)" }}>
          Yukbor
        </p>
        <p className="mt-0.5 text-[11px]" style={{ color: "var(--yb-green)" }}>
          Yuk topish endi oson!
        </p>
      </div>
      {right}
    </header>
  );
}
