import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import baseStyles from "../customers/customer-management.module.css";
import type { IntegrationMenuAction } from "./integration-types";

type Props = {
  id: number;
  name: string;
  disabled: boolean;
  isEnabled: boolean;
  canSync: boolean;
  isOpen: boolean;
  onToggle: (id: number | null) => void;
  onAction: (action: IntegrationMenuAction) => void;
};

export function IntegrationActionsMenu({
  id,
  name,
  disabled,
  isEnabled,
  canSync,
  isOpen,
  onToggle,
  onAction,
}: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const updatePosition = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const height = 208;
    setPosition({
      top:
        rect.bottom + height + 8 > window.innerHeight
          ? Math.max(8, rect.top - height - 4)
          : rect.bottom + 4,
      left: Math.max(8, Math.min(rect.right - 230, window.innerWidth - 238)),
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() => firstRef.current?.focus());
    const close = (returnFocus = false) => {
      onToggle(null);
      if (returnFocus) buttonRef.current?.focus();
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
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", pointer);
      window.removeEventListener("keydown", key);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, onToggle, updatePosition]);

  const choose = (action: IntegrationMenuAction) => {
    onToggle(null);
    onAction(action);
  };
  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={baseStyles.moreButton}
        aria-label={`${name} için işlem menüsü`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => {
          if (isOpen) onToggle(null);
          else {
            updatePosition();
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
            className={baseStyles.actionMenu}
            role="menu"
            aria-label={`${name} işlemleri`}
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
            <button
              type="button"
              role="menuitem"
              onClick={() => choose("test")}
            >
              Bağlantıyı test et
            </button>
            <button
              type="button"
              role="menuitem"
              disabled={disabled || !canSync}
              onClick={() => choose("sync")}
            >
              Şimdi senkronize et
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => choose("settings")}
            >
              Ayarları görüntüle
            </button>
            <button
              type="button"
              role="menuitem"
              className={baseStyles.segmentMenuItem}
              onClick={() => choose("toggle")}
            >
              {isEnabled ? "Devre dışı bırak" : "Etkinleştir"}
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
