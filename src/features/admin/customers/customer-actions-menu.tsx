import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { AdminCustomer, CustomerDetailTab } from "./customer-types";
import styles from "./customer-management.module.css";

export type CustomerMenuAction =
  { kind: "detail"; tab: CustomerDetailTab } | { kind: "segment" };

type CustomerActionsMenuProps = {
  customer: AdminCustomer;
  isOpen: boolean;
  onToggle: (customerId: number | null) => void;
  onAction: (customer: AdminCustomer, action: CustomerMenuAction) => void;
};

const menuWidth = 230;
const menuHeight = 172;
const viewportGap = 8;

export function CustomerActionsMenu({
  customer,
  isOpen,
  onToggle,
  onAction,
}: CustomerActionsMenuProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

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
  }, []);

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

  const choose = (action: CustomerMenuAction) => {
    onToggle(null);
    onAction(customer, action);
  };
  const menuId = `customer-actions-${customer.id}`;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={styles.moreButton}
        aria-label={`${customer.firstName} ${customer.lastName} için işlem menüsü`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => {
          if (isOpen) onToggle(null);
          else {
            updatePosition();
            onToggle(customer.id);
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
            className={styles.actionMenu}
            role="menu"
            aria-label={`${customer.firstName} ${customer.lastName} işlemleri`}
            style={position}
          >
            <button
              ref={firstItemRef}
              type="button"
              role="menuitem"
              onClick={() => choose({ kind: "detail", tab: "overview" })}
            >
              Müşteri detayını görüntüle
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => choose({ kind: "detail", tab: "orders" })}
            >
              Sipariş geçmişini görüntüle
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => choose({ kind: "detail", tab: "notes" })}
            >
              Not ekle
            </button>
            <button
              type="button"
              role="menuitem"
              className={styles.segmentMenuItem}
              onClick={() => choose({ kind: "segment" })}
            >
              Segmenti güncelle
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
