import { useState } from "react";
import { CustomerModalFrame } from "../customers/customer-modal-frame";
import baseStyles from "../customers/customer-management.module.css";
import styles from "./integration-management.module.css";
import {
  syncFrequencies,
  type Integration,
  type IntegrationDetailTab,
  type SyncFrequency,
} from "./integration-types";

type Props = {
  integration: Integration;
  initialTab: IntegrationDetailTab;
  onClose: () => void;
  onSaveSync: (autoSync: boolean, frequency: SyncFrequency) => void;
};

const tabs: { id: IntegrationDetailTab; label: string }[] = [
  { id: "overview", label: "Genel Bakış" },
  { id: "sync", label: "Senkronizasyon" },
  { id: "logs", label: "Hata ve İşlem Kayıtları" },
  { id: "settings", label: "Ayarlar" },
];

function date(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

export function IntegrationDetailModal({
  integration,
  initialTab,
  onClose,
  onSaveSync,
}: Props) {
  const [tab, setTab] = useState(initialTab);
  const [autoSync, setAutoSync] = useState(integration.autoSync);
  const [frequency, setFrequency] = useState<SyncFrequency>(
    integration.frequency,
  );
  return (
    <CustomerModalFrame
      title={integration.name}
      eyebrow={integration.category}
      closeLabel="Entegrasyon detayını kapat"
      onClose={onClose}
    >
      <div
        className={baseStyles.detailTabs}
        role="tablist"
        aria-label="Entegrasyon detay bölümleri"
      >
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={tab === item.id ? baseStyles.activeDetailTab : ""}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className={baseStyles.modalBody} role="tabpanel">
        {tab === "overview" && (
          <>
            <div className={baseStyles.modalBadges}>
              <span
                className={`${styles.statusBadge} ${styles[`status${integration.status.replaceAll(" ", "")}`]}`}
              >
                {integration.status}
              </span>
              <span className={styles.categoryBadge}>
                {integration.category}
              </span>
            </div>
            <dl className={baseStyles.detailGrid}>
              <Detail label="Entegrasyon adı" value={integration.name} />
              <Detail
                label="Bağlı hesap / mağaza"
                value={integration.accountName}
              />
              <Detail
                label="Bağlantı tarihi"
                value={date(integration.connectedAt)}
              />
              <Detail
                label="Son başarılı bağlantı"
                value={date(integration.lastSuccessfulConnection)}
              />
              <Detail
                label="Son senkronizasyon"
                value={date(integration.lastSync)}
              />
              <Detail
                label="Sonraki senkronizasyon"
                value={date(integration.nextSync)}
              />
              <Detail
                label="Bekleyen kayıt"
                value={String(integration.pendingRecords)}
              />
              <Detail
                label="Başarılı / hatalı işlem"
                value={`${integration.successfulOperations} / ${integration.failedOperations}`}
              />
            </dl>
          </>
        )}
        {tab === "sync" && (
          <section className={baseStyles.detailSection}>
            <h3>Senkronize edilen veriler</h3>
            <div className={styles.syncItems}>
              {integration.syncItems.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <div className={styles.syncForm}>
              <label className={styles.switchRow}>
                <span>
                  <strong>Otomatik senkronizasyon</strong>
                  <small>Planlanan aralıklarla veri akışını sürdürür.</small>
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  checked={autoSync}
                  onChange={(event) => setAutoSync(event.target.checked)}
                />
              </label>
              <label className={baseStyles.segmentField}>
                <span>Senkronizasyon sıklığı</span>
                <select
                  value={frequency}
                  disabled={!autoSync}
                  onChange={(event) =>
                    setFrequency(event.target.value as SyncFrequency)
                  }
                >
                  {syncFrequencies.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className={baseStyles.saveButton}
                onClick={() =>
                  onSaveSync(autoSync, autoSync ? frequency : "Manuel")
                }
              >
                Değişiklikleri Kaydet
              </button>
            </div>
          </section>
        )}
        {tab === "logs" && (
          <section className={baseStyles.detailSection}>
            <h3>Son işlemler</h3>
            <div className={baseStyles.orderHistoryWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Tarih ve saat</th>
                    <th>İşlem</th>
                    <th>Sonuç</th>
                    <th>Açıklama</th>
                    <th>Etkilenen</th>
                  </tr>
                </thead>
                <tbody>
                  {integration.logs.map((log) => (
                    <tr key={log.id}>
                      <td>{date(log.date)}</td>
                      <td>{log.operation}</td>
                      <td>
                        <span
                          className={`${styles.logResult} ${styles[`log${log.result}`]}`}
                        >
                          {log.result}
                        </span>
                      </td>
                      <td>{log.description}</td>
                      <td>{log.affectedRecords}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
        {tab === "settings" && (
          <section className={baseStyles.detailSection}>
            <h3>Yapılandırma</h3>
            <dl className={baseStyles.detailGrid}>
              <Detail
                label="Bağlı mağaza / hesap"
                value={integration.accountName}
              />
              <Detail label="Ortam" value={integration.environment} />
              <Detail
                label="Senkronizasyon"
                value={integration.syncItems.join(", ")}
              />
              <Detail
                label="Bildirim tercihleri"
                value={
                  integration.notificationsEnabled
                    ? "Uyarılar açık"
                    : "Uyarılar kapalı"
                }
              />
              <Detail
                label="Son yapılandırma"
                value={date(integration.lastConfiguredAt)}
              />
              <Detail label="Gizli bağlantı bilgisi" value="••••••••••••••••" />
            </dl>
            <p className={styles.securityNotice}>
              Bağlantı bilgileri güvenlik nedeniyle görüntülenmez. Bu alanda
              parola, anahtar veya erişim belirteci saklanmaz.
            </p>
          </section>
        )}
      </div>
    </CustomerModalFrame>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
