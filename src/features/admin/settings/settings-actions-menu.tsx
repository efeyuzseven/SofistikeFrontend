"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./settings-management.module.css";

type Action = "detail" | "role" | "toggle";
type Props = {
  id: string;
  name: string;
  active: boolean;
  open: boolean;
  onToggle: (id: string | null) => void;
  onAction: (action: Action) => void;
};

export function SettingsActionsMenu({
  id,
  name,
  active,
  open,
  onToggle,
  onAction,
}: Props) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const updatePosition = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({
      top:
        rect.bottom + 150 > innerHeight
          ? Math.max(8, rect.top - 142)
          : rect.bottom + 4,
      left: Math.max(8, Math.min(rect.right - 220, innerWidth - 228)),
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => firstRef.current?.focus());
    const pointer = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !triggerRef.current?.contains(event.target) &&
        !menuRef.current?.contains(event.target)
      )
        onToggle(null);
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onToggle(null);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", pointer);
    window.addEventListener("keydown", keydown);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", pointer);
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, onToggle, updatePosition]);

  const choose = (action: Action) => {
    onToggle(null);
    onAction(action);
  };
  return (
    <>
      <button
        ref={triggerRef}
        className={styles.moreButton}
        type="button"
        aria-label={`${name} için işlem menüsü`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          updatePosition();
          onToggle(open ? null : id);
        }}
      >
        •••
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            className={styles.actionMenu}
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
              Kullanıcı detayını görüntüle
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => choose("role")}
            >
              Rolü değiştir
            </button>
            <button
              type="button"
              role="menuitem"
              className={
                !active ? styles.positiveMenuItem : styles.dangerMenuItem
              }
              onClick={() => choose("toggle")}
            >
              {active ? "Devre dışı bırak" : "Etkinleştir"}
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
