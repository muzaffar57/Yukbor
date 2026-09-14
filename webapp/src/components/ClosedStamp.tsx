export function ClosedStamp({ label = "YUK YOPILDI" }: { label?: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      <span
        className="rotate-[-12deg] rounded-xl border-4 px-3 py-1 text-[18px] font-black tracking-wide"
        style={{
          color: "#b91c1c",
          borderColor: "#b91c1c",
          background: "rgba(255,255,255,0.88)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

export function ClosedBanner({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-3xl border-2 px-4 py-3 text-center text-[15px] font-extrabold"
      style={{ borderColor: "#b91c1c", color: "#b91c1c", background: "#fef2f2" }}
    >
      {children}
    </div>
  );
}
