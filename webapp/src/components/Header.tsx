export function Header({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between px-4 py-3"
      style={{
        background: "var(--tg-header-bg)",
        paddingTop: `calc(0.75rem + var(--safe-top))`,
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <h1 className="text-lg font-semibold" style={{ color: "var(--tg-text)" }}>
        {title}
      </h1>
      {right}
    </header>
  );
}
