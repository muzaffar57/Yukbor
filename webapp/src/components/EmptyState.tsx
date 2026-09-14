interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon = "📦", title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <div className="text-5xl">{icon}</div>
      <p className="text-base font-medium" style={{ color: "var(--tg-text)" }}>
        {title}
      </p>
      {subtitle && (
        <p className="max-w-xs text-sm" style={{ color: "var(--tg-hint)" }}>
          {subtitle}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-3 rounded-xl px-5 py-2.5 text-sm font-medium"
          style={{ background: "var(--tg-button)", color: "var(--tg-button-text)" }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <div className="text-4xl">⚠️</div>
      <p className="max-w-xs text-sm" style={{ color: "var(--tg-text)" }}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 rounded-xl px-5 py-2 text-sm font-medium"
          style={{ background: "var(--tg-secondary-bg)", color: "var(--tg-link)", border: "1px solid var(--tg-link)" }}
        >
          Qayta urinish
        </button>
      )}
    </div>
  );
}
