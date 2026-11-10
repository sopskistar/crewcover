import { useRef } from "react";

export function useDialogFocusReturn() {
  const origin = useRef<HTMLElement | null>(null);
  return {
    onOpenAutoFocus: () => {
      origin.current =
        document.activeElement instanceof HTMLElement &&
        document.activeElement !== document.body
          ? document.activeElement
          : null;
    },
    onCloseAutoFocus: (event: Event) => {
      event.preventDefault();
      const target = origin.current?.isConnected
        ? origin.current
        : document.querySelector<HTMLElement>(".cc-tabs > button.is-active");
      target?.focus();
    },
  };
}
