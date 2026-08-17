import { useEffect, useRef } from "react";
import type {
  AdminPayment,
  PaymentCurrency,
  PaymentModalView,
} from "./payment-types";
import styles from "./payment-management.module.css";

type PaymentDetailModalProps = {
  payment: AdminPayment;
  view: PaymentModalView;
  onClose: () => void;
};

function formatMoney(value: number, currency: PaymentCurrency) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

const viewTitles: Record<PaymentModalView, string> = {
  payment: "Ödeme Detayı",
  order: "İlgili Sipariş",
  invoice: "Fatura Bilgisi",
};

function modalPaymentStatusClass(payment: AdminPayment) {
  return {
    Başarılı: styles.statusSuccessful,
    Bekliyor: styles.statusPending,
    Başarısız: styles.statusFailed,
    "İade Edildi": styles.statusRefunded,
    "Kısmi İade": styles.statusPartialRefund,
  }[payment.paymentStatus];
}

export function PaymentDetailModal({
  payment,
  view,
  onClose,
}: PaymentDetailModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = Array.from(
        modalRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (!firstElement || !lastElement) {
        event.preventDefault();
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const titleId = `payment-modal-title-${view}`;

  return (
    <div className={styles.modalBackdrop} onMouseDown={onClose}>
      <section
        ref={modalRef}
        className={styles.detailModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={styles.modalHeader}>
          <div>
            <span>{viewTitles[view]}</span>
            <h2 id={titleId}>
              {view === "payment"
                ? payment.transactionNumber
                : payment.orderNumber}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label={`${viewTitles[view]} penceresini kapat`}
            onClick={onClose}
          >
            ×
          </button>
        </header>

        {view === "payment" && (
          <div className={styles.modalBody}>
            <div className={styles.modalBadges}>
              <span className={modalPaymentStatusClass(payment)}>
                {payment.paymentStatus}
              </span>
              <span className={styles.customerTypeBadge}>
                {payment.customerType}
              </span>
              <span className={styles.channelBadge}>
                {payment.salesChannel}
              </span>
            </div>
            <dl className={styles.detailGrid}>
              <div>
                <dt>İşlem numarası</dt>
                <dd>{payment.transactionNumber}</dd>
              </div>
              <div>
                <dt>Sipariş numarası</dt>
                <dd>{payment.orderNumber}</dd>
              </div>
              <div>
                <dt>Müşteri / şirket</dt>
                <dd>{payment.companyName ?? payment.customerName}</dd>
                {payment.companyName && <small>{payment.customerName}</small>}
              </div>
              <div>
                <dt>Satış kanalı ve lokasyon</dt>
                <dd>{payment.salesChannel}</dd>
                <small>{payment.salesLocation}</small>
              </div>
              <div>
                <dt>Ödeme yöntemi</dt>
                <dd>{payment.paymentMethod}</dd>
              </div>
              <div>
                <dt>Ödeme sağlayıcısı</dt>
                <dd>{payment.paymentProvider}</dd>
              </div>
              <div>
                <dt>Ödeme tarihi</dt>
                <dd>{payment.paymentDateLabel}</dd>
              </div>
              <div>
                <dt>Fatura durumu</dt>
                <dd>{payment.invoiceStatus}</dd>
              </div>
            </dl>
            <section className={styles.amountCard} aria-label="Ödeme tutarları">
              <div>
                <span>Ara toplam</span>
                <strong>
                  {formatMoney(payment.subtotal, payment.currency)}
                </strong>
              </div>
              <div>
                <span>İndirim</span>
                <strong>
                  −{formatMoney(payment.discount, payment.currency)}
                </strong>
              </div>
              <div>
                <span>Kargo</span>
                <strong>
                  {payment.shipping === 0
                    ? "Ücretsiz"
                    : formatMoney(payment.shipping, payment.currency)}
                </strong>
              </div>
              <div className={styles.grandTotal}>
                <span>Genel toplam</span>
                <strong>{formatMoney(payment.amount, payment.currency)}</strong>
              </div>
            </section>
            {payment.refundAmount !== undefined && (
              <section className={styles.refundCard}>
                <span>Geçmiş iade bilgisi</span>
                <strong>
                  {formatMoney(payment.refundAmount, payment.currency)}
                </strong>
                <small>{payment.refundDate}</small>
                <p>
                  Bu alan yalnızca daha önce gerçekleşmiş mock iade kaydını
                  gösterir.
                </p>
              </section>
            )}
            <Timeline payment={payment} />
          </div>
        )}

        {view === "order" && (
          <div className={styles.modalBody}>
            <dl className={styles.detailGrid}>
              <div>
                <dt>Sipariş numarası</dt>
                <dd>{payment.orderNumber}</dd>
              </div>
              <div>
                <dt>Müşteri tipi</dt>
                <dd>{payment.customerType}</dd>
              </div>
              <div>
                <dt>Müşteri / şirket</dt>
                <dd>{payment.companyName ?? payment.customerName}</dd>
              </div>
              <div>
                <dt>Satış kaynağı</dt>
                <dd>{payment.salesChannel}</dd>
                <small>{payment.salesLocation}</small>
              </div>
            </dl>
            <section className={styles.modalSection}>
              <h3>Siparişteki ürünler</h3>
              <div className={styles.orderItems}>
                {payment.orderItems.map((item) => (
                  <div key={item.sku}>
                    <div>
                      <strong>{item.name}</strong>
                      <small>{item.sku}</small>
                    </div>
                    <span>{item.quantity} adet</span>
                  </div>
                ))}
              </div>
            </section>
            <section className={styles.orderPaymentSummary}>
              <span>Ödeme kaydı</span>
              <strong>{payment.transactionNumber}</strong>
              <b>{formatMoney(payment.amount, payment.currency)}</b>
            </section>
          </div>
        )}

        {view === "invoice" && (
          <div className={styles.modalBody}>
            <div className={styles.invoiceNotice}>
              Bu bölüm yalnızca mock fatura bilgisini gösterir. Gerçek fatura
              oluşturma veya gönderme işlemi yapılmaz.
            </div>
            <dl className={styles.detailGrid}>
              <div>
                <dt>Fatura durumu</dt>
                <dd>{payment.invoiceStatus}</dd>
              </div>
              <div>
                <dt>Fatura türü</dt>
                <dd>{payment.invoiceType}</dd>
              </div>
              <div>
                <dt>Fatura numarası</dt>
                <dd>{payment.invoiceNumber ?? "Henüz oluşturulmadı"}</dd>
              </div>
              <div>
                <dt>Fatura tarihi</dt>
                <dd>{payment.invoiceDate ?? "—"}</dd>
              </div>
              <div>
                <dt>Alıcı</dt>
                <dd>{payment.companyName ?? payment.customerName}</dd>
              </div>
              <div>
                <dt>İlgili sipariş</dt>
                <dd>{payment.orderNumber}</dd>
              </div>
            </dl>
            {payment.invoiceStatus === "Fatura Hatası" && (
              <div className={styles.invoiceError} role="status">
                Mock fatura entegrasyonu hata kaydı: Belge servisinden yanıt
                alınamadı.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function Timeline({ payment }: { payment: AdminPayment }) {
  return (
    <section className={styles.modalSection}>
      <h3>İşlem zaman çizelgesi</h3>
      <ol className={styles.timeline}>
        {payment.timeline.map((entry, index) => (
          <li key={`${entry.title}-${index}`}>
            <span />
            <div>
              <strong>{entry.title}</strong>
              <p>{entry.description}</p>
              <small>{entry.date}</small>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
