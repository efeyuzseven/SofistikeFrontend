import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { AdminProduct } from "./product-types";
import styles from "./product-management.module.css";

type ProductActionsMenuProps = {
  product: AdminProduct;
  isOpen: boolean;
  onToggle: (productId: number | null) => void;
  onStatusChange: (product: AdminProduct) => void;
  onDeleteRequest: (product: AdminProduct) => void;
};

type MenuPosition = {
  top: number;
  left: number;
};

const menuWidth = 190;
const menuHeight = 92;
const viewportGap = 8;

export function ProductActionsMenu({
  product,
  isOpen,
  onToggle,
  onStatusChange,
  onDeleteRequest,
}: ProductActionsMenuProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState<MenuPosition>({ top: 0, left: 0 });

  const updateMenuPosition = useCallback(() => {
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
    const closeMenu = (returnFocus = false) => {
      onToggle(null);
      if (returnFocus) buttonRef.current?.focus();
    };
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Node &&
        !buttonRef.current?.contains(target) &&
        !menuRef.current?.contains(target) &&
        !(
          target instanceof Element &&
          target.closest("[data-product-actions-trigger]")
        )
      ) {
        closeMenu();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition);
    };
  }, [isOpen, onToggle, updateMenuPosition]);

  const toggleMenu = () => {
    if (isOpen) {
      onToggle(null);
      return;
    }

    updateMenuPosition();
    onToggle(product.id);
  };

  const statusAction = product.status === "Aktif" ? "Pasife Al" : "Aktife Al";
  const menuId = `product-actions-${product.id}`;
  const moveMenuFocus = (direction: "first" | "last" | "next" | "previous") => {
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"]',
      ) ?? [],
    );
    if (items.length === 0) return;

    const currentIndex = items.indexOf(
      document.activeElement as HTMLButtonElement,
    );
    const targetIndex =
      direction === "first"
        ? 0
        : direction === "last"
          ? items.length - 1
          : direction === "next"
            ? (currentIndex + 1) % items.length
            : (currentIndex - 1 + items.length) % items.length;
    items[targetIndex]?.focus();
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={styles.moreButton}
        aria-label={`${product.name} için diğer işlemler`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        data-product-actions-trigger
        onClick={toggleMenu}
      >
        <span aria-hidden="true">•••</span>
      </button>
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            className={styles.actionsMenu}
            role="menu"
            aria-label={`${product.name} ürün işlemleri`}
            style={position}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                moveMenuFocus("next");
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                moveMenuFocus("previous");
              } else if (event.key === "Home") {
                event.preventDefault();
                moveMenuFocus("first");
              } else if (event.key === "End") {
                event.preventDefault();
                moveMenuFocus("last");
              }
            }}
          >
            <button
              ref={firstItemRef}
              type="button"
              role="menuitem"
              onClick={() => onStatusChange(product)}
            >
              {statusAction}
            </button>
            <button
              type="button"
              role="menuitem"
              className={styles.deleteMenuItem}
              onClick={() => onDeleteRequest(product)}
            >
              Ürünü Sil
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
