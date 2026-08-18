"use client";

import { useEffect, useId, useRef } from "react";
import styles from "./admin-confirm-modal.module.css";

type AdminConfirmModalProps = {
  eyebrow: string;
  title: string;
  description: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  danger?: boolean;
};

export function AdminConfirmModal({
  eyebrow,
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm,
  danger = false,
}: AdminConfirmModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) {
        event.preventDefault();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [onCancel]);

  return (
    <div className={styles.backdrop} onMouseDown={onCancel}>
      <section
        ref={panelRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h2 id={titleId}>{title}</h2>
        <p>{description}</p>
        <div className={styles.actions}>
          <button ref={cancelRef} type="button" onClick={onCancel}>
            Vazgeç
          </button>
          <button
            type="button"
            className={danger ? styles.danger : styles.primary}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
