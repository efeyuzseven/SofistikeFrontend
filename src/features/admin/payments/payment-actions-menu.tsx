import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { AdminPayment, PaymentModalView } from "./payment-types";
import styles from "./payment-management.module.css";

type PaymentActionsMenuProps = {
  payment: AdminPayment;
  isOpen: boolean;
  onToggle: (paymentId: number | null) => void;
  onAction: (payment: AdminPayment, view: PaymentModalView) => void;
};

type MenuPosition = {
  top: number;
  left: number;
};

const menuWidth = 218;
const menuHeight = 128;
const viewportGap = 8;

export function PaymentActionsMenu({
  payment,
  isOpen,
  onToggle,
  onAction,
}: PaymentActionsMenuProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState<MenuPosition>({ top: 0, left: 0 });

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

    const focusFrame = window.requestAnimationFrame(() =>
      firstItemRef.current?.focus(),
    );
    const close = (returnFocus = false) => {
      onToggle(null);
      if (returnFocus) buttonRef.current?.focus();
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !buttonRef.current?.contains(event.target) &&
        !menuRef.current?.contains(event.target)
      ) {
        close();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [isOpen, onToggle, updatePosition]);

  const toggleMenu = () => {
    if (isOpen) {
      onToggle(null);
      return;
    }
    updatePosition();
    onToggle(payment.id);
  };

  const selectAction = (view: PaymentModalView) => {
    onToggle(null);
    onAction(payment, view);
  };

  const menuId = `payment-actions-${payment.id}`;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={styles.moreButton}
        aria-label={`${payment.transactionNumber} için işlem menüsü`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={toggleMenu}
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
            aria-label={`${payment.transactionNumber} işlemleri`}
            style={position}
          >
            <button
              ref={firstItemRef}
              type="button"
              role="menuitem"
              onClick={() => selectAction("payment")}
            >
              Ödeme detayını görüntüle
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => selectAction("order")}
            >
              İlgili siparişi görüntüle
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => selectAction("invoice")}
            >
              Fatura bilgisini görüntüle
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
