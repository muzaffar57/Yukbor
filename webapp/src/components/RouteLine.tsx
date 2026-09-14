import { REGION_LABELS } from "../types";
import type { Region } from "../types";

export function RouteLine({
  from,
  to,
  fromHint,
  toHint,
  distance,
}: {
  from: string;
  to: string;
  fromHint?: string | null;
  toHint?: string | null;
  distance?: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex w-4 flex-col items-center pt-1">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#10b981" }} />
        <span className="my-1 w-px flex-1" style={{ background: "rgba(36,129,204,0.35)", minHeight: 22 }} />
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#ef4444" }} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold leading-tight" style={{ color: "var(--tg-text)" }}>
            {from}
          </p>
          {fromHint && (
            <p className="truncate text-[12px]" style={{ color: "var(--tg-hint)" }}>
              {fromHint}
            </p>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold leading-tight" style={{ color: "var(--tg-text)" }}>
            {to}
          </p>
          {toHint && (
            <p className="truncate text-[12px]" style={{ color: "var(--tg-hint)" }}>
              {toHint}
            </p>
          )}
        </div>
      </div>
      {distance && (
        <span className="self-center whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-medium" style={{ background: "rgba(36,129,204,0.1)", color: "var(--tg-link)" }}>
          {distance}
        </span>
      )}
    </div>
  );
}

export function regionLabel(region: Region): string {
  return REGION_LABELS[region];
}
