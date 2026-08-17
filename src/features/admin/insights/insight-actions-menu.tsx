import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import baseStyles from "../customers/customer-management.module.css";
import type { InsightMenuAction, InsightStatus } from "./insight-types";

type Props = {
  id: number;
  title: string;
  status: InsightStatus;
  isOpen: boolean;
  onToggle: (id: number | null) => void;
  onAction: (action: InsightMenuAction) => void;
};
export function InsightActionsMenu({
  id,
  title,
  status,
  isOpen,
  onToggle,
  onAction,
}: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const place = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const height = 246;
    setPosition({
      top:
        rect.bottom + height > innerHeight
          ? Math.max(8, rect.top - height)
          : rect.bottom + 4,
      left: Math.max(8, Math.min(rect.right - 230, innerWidth - 238)),
    });
  }, []);
  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() => firstRef.current?.focus());
    const close = (focus = false) => {
      onToggle(null);
      if (focus) buttonRef.current?.focus();
    };
    const pointer = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !buttonRef.current?.contains(event.target) &&
        !menuRef.current?.contains(event.target)
      )
        close();
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
      }
    };
    document.addEventListener("pointerdown", pointer);
    window.addEventListener("keydown", key);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", pointer);
      window.removeEventListener("keydown", key);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [isOpen, onToggle, place]);
  const choose = (action: InsightMenuAction) => {
    onToggle(null);
    onAction(action);
  };
  const finished = status === "Çözüldü" || status === "Göz Ardı Edildi";
  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={baseStyles.moreButton}
        aria-label={`${title} için işlem menüsü`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => {
          if (isOpen) onToggle(null);
          else {
            place();
            onToggle(id);
          }
        }}
      >
        <span aria-hidden="true">•••</span>
      </button>
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label={`${title} işlemleri`}
            className={baseStyles.actionMenu}
            style={position}
          >
            <button
              ref={firstRef}
              type="button"
              role="menuitem"
              onClick={() => choose("detail")}
            >
              Detayları görüntüle
            </button>
            {status === "Yeni" && (
              <button
                type="button"
                role="menuitem"
                onClick={() => choose("review")}
              >
                İnceleniyor olarak işaretle
              </button>
            )}
            {!finished && (
              <>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => choose("plan")}
                >
                  Aksiyon planla
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => choose("solve")}
                >
                  Çözüldü olarak işaretle
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => choose("ignore")}
                >
                  Göz ardı et
                </button>
              </>
            )}
            <button
              type="button"
              role="menuitem"
              className={baseStyles.segmentMenuItem}
              onClick={() => choose("note")}
            >
              Yönetici notu ekle
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
