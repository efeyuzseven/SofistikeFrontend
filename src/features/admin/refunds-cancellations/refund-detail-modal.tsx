import { AccessibleModal } from "./accessible-modal";
import type { AdminRefundRequest, ReviewDecision } from "./refund-types";
import styles from "./refund-management.module.css";

type RefundDetailModalProps = {
  request: AdminRefundRequest;
  onClose: () => void;
  onReview: (decision: ReviewDecision) => void;
};

function formatMoney(value: number, currency: AdminRefundRequest["currency"]) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(date));
}

export function RefundDetailModal({
  request,
  onClose,
  onReview,
}: RefundDetailModalProps) {
  const canReview = request.status === "İnceleniyor";
  return (
    <AccessibleModal
      title={request.requestNumber}
      eyebrow="Talep detayı"
      closeLabel="Talep detayını kapat"
      onClose={onClose}
    >
      <div className={styles.modalBody}>
        <div className={styles.modalBadges}>
          <span
            className={styles[`status${request.status.replaceAll(" ", "")}`]}
          >
            {request.status}
          </span>
          <span className={styles.typeBadge}>{request.requestType}</span>
          <span className={styles.customerBadge}>{request.customerType}</span>
          <span className={styles.channelBadge}>{request.salesChannel}</span>
        </div>

        <dl className={styles.detailGrid}>
          <div>
            <dt>Sipariş numarası</dt>
            <dd>{request.orderNumber}</dd>
          </div>
          <div>
            <dt>Ödeme işlem numarası</dt>
            <dd>{request.transactionNumber}</dd>
          </div>
          <div>
            <dt>Müşteri / şirket</dt>
            <dd>{request.companyName ?? request.customerName}</dd>
            {request.companyName && <small>{request.customerName}</small>}
          </div>
          <div>
            <dt>Satış kanalı ve lokasyon</dt>
            <dd>{request.salesChannel}</dd>
            <small>{request.salesLocation}</small>
          </div>
          <div>
            <dt>Talep türü</dt>
            <dd>{request.requestType}</dd>
          </div>
          <div>
            <dt>Talep nedeni</dt>
            <dd>{request.reason}</dd>
          </div>
          <div>
            <dt>Talep tarihi</dt>
            <dd>{formatDate(request.requestDate)}</dd>
          </div>
          <div>
            <dt>Müşteri tipi</dt>
            <dd>{request.customerType}</dd>
          </div>
        </dl>

        <section className={styles.modalSection}>
          <h3>Siparişteki ürünler</h3>
          <div className={styles.itemList}>
            {request.items.map((item) => (
              <div
                key={item.sku}
                className={
                  item.requestedQuantity > 0 ? styles.returnedItem : ""
                }
              >
                <div>
                  <strong>{item.name}</strong>
                  <small>{item.sku}</small>
                </div>
                <span>Sipariş: {item.orderedQuantity} adet</span>
                <span className={styles.requestedQuantity}>
                  İade: {item.requestedQuantity} adet
                </span>
                <b>{formatMoney(item.unitPrice, request.currency)}</b>
              </div>
            ))}
          </div>
          {request.requestType === "Kısmi iade" && (
            <p className={styles.partialNotice}>
              Renkli satırlar, kısmi iadeye dahil edilen ürün ve adetleri
              gösterir.
            </p>
          )}
        </section>

        <section className={styles.amountSummary} aria-label="Talep tutarları">
          <div>
            <span>Sipariş toplamı</span>
            <strong>
              {formatMoney(request.orderAmount, request.currency)}
            </strong>
          </div>
          <div>
            <span>Talep edilen iade</span>
            <strong>
              {formatMoney(request.requestedAmount, request.currency)}
            </strong>
          </div>
        </section>

        <section className={styles.noteGrid}>
          <div>
            <h3>Müşteri açıklaması</h3>
            <p>{request.customerNote}</p>
          </div>
          <div>
            <h3>Yönetici notu</h3>
            <p>{request.adminNote ?? "Henüz yönetici notu eklenmedi."}</p>
          </div>
        </section>

        <section className={styles.modalSection}>
          <h3>İşlem zaman çizelgesi</h3>
          <ol className={styles.timeline}>
            {request.timeline.map((entry, index) => (
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

        {canReview && (
          <footer className={styles.detailActions}>
            <p>
              Bu değerlendirme yalnızca frontend mock kaydını günceller;
              finansal işlem başlatmaz.
            </p>
            <div>
              <button
                type="button"
                className={styles.rejectButton}
                onClick={() => onReview("reject")}
              >
                Reddet
              </button>
              <button
                type="button"
                className={styles.approveButton}
                onClick={() => onReview("approve")}
              >
                Onayla
              </button>
            </div>
          </footer>
        )}
      </div>
    </AccessibleModal>
  );
}
