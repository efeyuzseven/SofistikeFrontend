import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { AdminRefundRequest } from "./refund-types";
import styles from "./refund-management.module.css";

export type RefundMenuAction = "request" | "order" | "payment" | "review";

type RefundActionsMenuProps = {
  request: AdminRefundRequest;
  isOpen: boolean;
  onToggle: (requestId: number | null) => void;
  onAction: (request: AdminRefundRequest, action: RefundMenuAction) => void;
};

const menuWidth = 235;
const viewportGap = 8;

export function RefundActionsMenu({
  request,
  isOpen,
  onToggle,
  onAction,
}: RefundActionsMenuProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const canReview = request.status === "İnceleniyor";
  const menuHeight = canReview ? 172 : 132;

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
      )
        close();
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
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, onToggle, updatePosition]);

  const choose = (action: RefundMenuAction) => {
    onToggle(null);
    onAction(request, action);
  };

  const menuId = `refund-actions-${request.id}`;
  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={styles.moreButton}
        aria-label={`${request.requestNumber} için işlem menüsü`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => {
          if (isOpen) onToggle(null);
          else {
            updatePosition();
            onToggle(request.id);
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
            aria-label={`${request.requestNumber} işlemleri`}
            style={position}
          >
            <button
              ref={firstItemRef}
              type="button"
              role="menuitem"
              onClick={() => choose("request")}
            >
              Talep detayını görüntüle
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => choose("order")}
            >
              İlgili siparişi görüntüle
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => choose("payment")}
            >
              Ödeme detayını görüntüle
            </button>
            {canReview && (
              <button
                type="button"
                role="menuitem"
                className={styles.reviewMenuItem}
                onClick={() => choose("review")}
              >
                Talebi değerlendir
              </button>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
