import { useEffect, useRef } from "react";
import { setBackButton, setMainButton } from "./telegram";

interface MainButtonOptions {
  text: string;
  onClick: () => void;
  visible?: boolean;
  enabled?: boolean;
  loading?: boolean;
}

/** Sahifa ochilganda Telegram'ning pastki katta tugmasini (MainButton) shu matn/amal bilan ko'rsatadi. */
export function useMainButton(options: MainButtonOptions | null) {
  const onClickRef = useRef(options?.onClick);
  onClickRef.current = options?.onClick;

  useEffect(() => {
    if (!options) return;
    const stableHandler = () => onClickRef.current?.();
    const cleanup = setMainButton({ ...options, onClick: stableHandler });
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.text, options?.visible, options?.enabled, options?.loading]);
}

/** Sahifa ochilganda Telegram'ning yuqori chap "Orqaga" tugmasini ko'rsatadi. */
export function useBackButton(onClick: (() => void) | null) {
  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;

  useEffect(() => {
    if (!onClick) return;
    const stableHandler = () => onClickRef.current?.();
    const cleanup = setBackButton(stableHandler);
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(onClick)]);
}
