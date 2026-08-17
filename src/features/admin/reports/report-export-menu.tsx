import { useEffect, useRef } from "react";
import styles from "./report-management.module.css";

type Props = {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onCsv: () => void;
  onPrint: () => void;
};
export function ReportExportMenu({
  open,
  onToggle,
  onClose,
  onCsv,
  onPrint,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => firstRef.current?.focus());
    const pointer = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !wrapperRef.current?.contains(event.target)
      )
        onClose();
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", pointer);
    window.addEventListener("keydown", key);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", pointer);
      window.removeEventListener("keydown", key);
    };
  }, [onClose, open]);
  return (
    <div ref={wrapperRef} className={styles.exportWrap}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.exportButton}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={onToggle}
      >
        Dışa Aktar <span aria-hidden="true">⌄</span>
      </button>
      {open && (
        <div className={styles.exportMenu} role="menu">
          <button
            ref={firstRef}
            type="button"
            role="menuitem"
            onClick={() => {
              onClose();
              onCsv();
            }}
          >
            CSV indir
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onClose();
              onPrint();
            }}
          >
            Yazdır / PDF olarak kaydet
          </button>
          <button
            type="button"
            role="menuitem"
            disabled
            aria-describedby="excel-help"
          >
            Excel dışa aktarma
          </button>
          <small id="excel-help">
            Backend bağlantısıyla kullanıma açılacak
          </small>
        </div>
      )}
    </div>
  );
}
