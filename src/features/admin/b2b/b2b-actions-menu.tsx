import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import baseStyles from "../customers/customer-management.module.css";
import type { B2BTab } from "./b2b-types";

export type B2BMenuAction =
  "detail" | "company" | "project" | "note" | "assign" | "review";

type B2BActionsMenuProps = {
  id: number;
  label: string;
  tab: B2BTab;
  canReview?: boolean;
  isOpen: boolean;
  onToggle: (id: number | null) => void;
  onAction: (action: B2BMenuAction) => void;
};

const menuWidth = 240;
const viewportGap = 8;

export function B2BActionsMenu({
  id,
  label,
  tab,
  canReview = false,
  isOpen,
  onToggle,
  onAction,
}: B2BActionsMenuProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const itemCount = 4 + (canReview ? 1 : 0);
  const menuHeight = itemCount * 40 + 12;

  const updatePosition = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const opensAbove =
      rect.bottom + menuHeight + viewportGap > window.innerHeight;
    setPosition({
      top: opensAbove
        ? Math.max(viewportGap, rect.top - menuHeight - 4)
        : rect.bottom + 4,
      left: Math.max(
        viewportGap,
        Math.min(
          rect.right - menuWidth,
          window.innerWidth - menuWidth - viewportGap,
        ),
      ),
    });
  }, [menuHeight]);

  useEffect(() => {
    if (!isOpen) return;
    const frame = window.requestAnimationFrame(() =>
      firstItemRef.current?.focus(),
    );
    const close = (returnFocus = false) => {
      onToggle(null);
      if (returnFocus) buttonRef.current?.focus();
    };
    const pointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !buttonRef.current?.contains(event.target) &&
        !menuRef.current?.contains(event.target)
      )
        close();
    };
    const keyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
      }
    };
    document.addEventListener("pointerdown", pointerDown);
    window.addEventListener("keydown", keyDown);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", pointerDown);
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, onToggle, updatePosition]);

  const choose = (action: B2BMenuAction) => {
    onToggle(null);
    onAction(action);
  };
  const menuId = `b2b-actions-${tab}-${id}`;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={baseStyles.moreButton}
        aria-label={`${label} için işlem menüsü`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
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
            id={menuId}
            className={baseStyles.actionMenu}
            role="menu"
            aria-label={`${label} işlemleri`}
            style={position}
          >
            <button
              ref={firstItemRef}
              type="button"
              role="menuitem"
              onClick={() => choose("detail")}
            >
              Detayları görüntüle
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => choose("company")}
            >
              Firma profilini görüntüle
            </button>
            {tab !== "applications" && (
              <button
                type="button"
                role="menuitem"
                onClick={() => choose("project")}
              >
                Talebi/projeyi görüntüle
              </button>
            )}
            <button
              type="button"
              role="menuitem"
              onClick={() => choose("note")}
            >
              Yönetici notu ekle
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => choose("assign")}
            >
              Sorumlu yönetici ata
            </button>
            {canReview && (
              <button
                type="button"
                role="menuitem"
                className={baseStyles.segmentMenuItem}
                onClick={() => choose("review")}
              >
                Başvuruyu değerlendir
              </button>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
