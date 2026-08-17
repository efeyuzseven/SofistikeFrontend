import { useState } from "react";
import { CustomerModalFrame } from "./customer-modal-frame";
import type { AdminCustomer, CustomerDetailTab } from "./customer-types";
import styles from "./customer-management.module.css";

type CustomerDetailModalProps = {
  customer: AdminCustomer;
  initialTab: CustomerDetailTab;
  onClose: () => void;
  onAddNote: (text: string) => void;
};

const tabs: { id: CustomerDetailTab; label: string }[] = [
  { id: "overview", label: "Genel Bakış" },
  { id: "orders", label: "Sipariş Geçmişi" },
  { id: "addresses", label: "Adresler" },
  { id: "permissions", label: "İletişim İzinleri" },
  { id: "notes", label: "Yönetici Notları" },
];

const currency = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
});

function formatDate(date?: string) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(date));
}

export function CustomerDetailModal({
  customer,
  initialTab,
  onClose,
  onAddNote,
}: CustomerDetailModalProps) {
  const [activeTab, setActiveTab] = useState<CustomerDetailTab>(initialTab);
  const [noteText, setNoteText] = useState("");
  const fullName = `${customer.firstName} ${customer.lastName}`;
  const averageBasket =
    customer.orderCount > 0 ? customer.totalSpend / customer.orderCount : 0;

  const submitNote = () => {
    const note = noteText.trim();
    if (!note) return;
    onAddNote(note);
    setNoteText("");
  };

  return (
    <CustomerModalFrame
      title={fullName}
      eyebrow={customer.customerNumber}
      closeLabel="Müşteri detayını kapat"
      onClose={onClose}
    >
      <div
        className={styles.detailTabs}
        role="tablist"
        aria-label="Müşteri detay bölümleri"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`customer-panel-${tab.id}`}
            className={activeTab === tab.id ? styles.activeDetailTab : ""}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        className={styles.modalBody}
        id={`customer-panel-${activeTab}`}
        role="tabpanel"
      >
        {activeTab === "overview" && (
          <>
            <div className={styles.modalBadges}>
              <span
                className={
                  styles[`segment${customer.segment.replaceAll(" ", "")}`]
                }
              >
                {customer.segment}
              </span>
              <span
                className={
                  customer.status === "Aktif"
                    ? styles.statusActive
                    : styles.statusPassive
                }
              >
                {customer.status}
              </span>
              <span className={styles.channelBadge}>
                {customer.registrationChannel}
              </span>
            </div>
            <dl className={styles.detailGrid}>
              <div>
                <dt>Müşteri numarası</dt>
                <dd>{customer.customerNumber}</dd>
              </div>
              <div>
                <dt>Ad soyad</dt>
                <dd>{fullName}</dd>
              </div>
              <div>
                <dt>E-posta</dt>
                <dd>{customer.email}</dd>
              </div>
              <div>
                <dt>Telefon</dt>
                <dd>{customer.phone}</dd>
              </div>
              <div>
                <dt>Kayıt tarihi</dt>
                <dd>{formatDate(customer.registrationDate)}</dd>
              </div>
              <div>
                <dt>Kayıt kanalı</dt>
                <dd>{customer.registrationChannel}</dd>
              </div>
              <div>
                <dt>Şehir / ülke</dt>
                <dd>
                  {customer.city}, {customer.country}
                </dd>
              </div>
              <div>
                <dt>Müşteri durumu</dt>
                <dd>{customer.status}</dd>
              </div>
            </dl>
            <section
              className={styles.customerStats}
              aria-label="Müşteri alışveriş özeti"
            >
              <div>
                <span>Toplam sipariş</span>
                <strong>{customer.orderCount}</strong>
              </div>
              <div>
                <span>Toplam harcama</span>
                <strong>{currency.format(customer.totalSpend)}</strong>
              </div>
              <div>
                <span>Ortalama sepet</span>
                <strong>{currency.format(averageBasket)}</strong>
              </div>
              <div>
                <span>Son sipariş</span>
                <strong>{formatDate(customer.lastOrderDate)}</strong>
              </div>
              <div>
                <span>+XTRA Rewards puanı</span>
                <strong>
                  {customer.loyaltyPoints.toLocaleString("tr-TR")}
                </strong>
              </div>
            </section>
          </>
        )}

        {activeTab === "orders" && (
          <section className={styles.detailSection}>
            <h3>Sipariş geçmişi</h3>
            {customer.orders.length ? (
              <div className={styles.orderHistoryWrap}>
                <table>
                  <thead>
                    <tr>
                      <th>Sipariş no</th>
                      <th>Tarih</th>
                      <th>Ürün</th>
                      <th>Tutar</th>
                      <th>Sipariş durumu</th>
                      <th>Ödeme durumu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.orders.map((order) => (
                      <tr key={order.orderNumber}>
                        <td>
                          <strong>{order.orderNumber}</strong>
                        </td>
                        <td>{formatDate(order.date)}</td>
                        <td>{order.itemCount} ürün</td>
                        <td>{currency.format(order.amount)}</td>
                        <td>
                          <span className={styles.orderStatus}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td>
                          <span className={styles.paymentStatus}>
                            {order.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyPanel
                title="Henüz sipariş yok"
                text="Bu mock müşteriye bağlı sipariş kaydı bulunmuyor."
              />
            )}
          </section>
        )}

        {activeTab === "addresses" && (
          <section className={styles.detailSection}>
            <h3>Kayıtlı adresler</h3>
            {customer.addresses.length ? (
              <div className={styles.addressGrid}>
                {customer.addresses.map((item) => (
                  <article key={item.id}>
                    <div>
                      <strong>{item.title}</strong>
                      {item.isDefault && <span>Varsayılan</span>}
                    </div>
                    <b>
                      {item.city} / {item.district}
                    </b>
                    <p>{item.address}</p>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyPanel
                title="Kayıtlı adres yok"
                text="Adresler bu ekranda yalnızca görüntülenir."
              />
            )}
          </section>
        )}

        {activeTab === "permissions" && (
          <section className={styles.detailSection}>
            <h3>Salt okunur iletişim izinleri</h3>
            <div className={styles.permissionGrid}>
              <Permission
                label="E-posta izni"
                allowed={customer.permissions.email}
              />
              <Permission label="SMS izni" allowed={customer.permissions.sms} />
              <Permission
                label="Kampanya bildirimi"
                allowed={customer.permissions.campaign}
              />
              <div>
                <span>Son güncelleme</span>
                <strong>{formatDate(customer.permissions.updatedAt)}</strong>
              </div>
            </div>
            <p className={styles.privacyNotice}>
              Bu ekrandan gerçek e-posta, SMS veya bildirim gönderilmez.
            </p>
          </section>
        )}

        {activeTab === "notes" && (
          <section className={styles.detailSection}>
            <h3>Yönetici notları</h3>
            <div className={styles.noteList}>
              {customer.notes.length ? (
                customer.notes.map((note) => (
                  <article key={note.id}>
                    <p>{note.text}</p>
                    <footer>
                      <strong>{note.adminName}</strong>
                      <time>{note.date}</time>
                    </footer>
                  </article>
                ))
              ) : (
                <EmptyPanel
                  title="Henüz not yok"
                  text="Bu müşteri için ilk yönetici notunu ekleyebilirsiniz."
                />
              )}
            </div>
            <label className={styles.noteField}>
              <span>Yeni not</span>
              <textarea
                rows={3}
                value={noteText}
                placeholder="Müşteriyle ilgili dahili bir not yazın..."
                onChange={(event) => setNoteText(event.target.value)}
              />
            </label>
            <div className={styles.noteActions}>
              <small>Not yalnızca frontend state’ine eklenir.</small>
              <button
                type="button"
                disabled={!noteText.trim()}
                onClick={submitNote}
              >
                Notu Ekle
              </button>
            </div>
          </section>
        )}
      </div>
    </CustomerModalFrame>
  );
}

function Permission({ label, allowed }: { label: string; allowed: boolean }) {
  return (
    <div>
      <span>{label}</span>
      <strong
        className={allowed ? styles.permissionAllowed : styles.permissionDenied}
      >
        {allowed ? "İzinli" : "İzinsiz"}
      </strong>
    </div>
  );
}

function EmptyPanel({ title, text }: { title: string; text: string }) {
  return (
    <div className={styles.emptyPanel}>
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}
