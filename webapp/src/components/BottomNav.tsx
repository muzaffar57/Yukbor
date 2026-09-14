import { NavLink } from "react-router-dom";

const items = [
  { to: "/", label: "Yuklar", icon: "📦", end: true },
  { to: "/offers", label: "Transport", icon: "🚛", end: false },
  { to: "/profile", label: "Profil", icon: "👤", end: false },
];

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex border-t"
      style={{
        background: "#ffffff",
        borderColor: "rgba(0,0,0,0.06)",
        paddingBottom: "var(--safe-bottom)",
      }}
    >
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-semibold"
          style={({ isActive }) => ({
            color: isActive ? "var(--yb-green)" : "#9ca3af",
          })}
        >
          <span className="text-xl leading-none">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
