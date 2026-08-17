"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon, type IconName } from "../admin-icons";
import baseStyles from "../customers/customer-management.module.css";
import { IntegrationActionsMenu } from "./integration-actions-menu";
import {
  IntegrationConfirmModal,
  type ConfirmAction,
} from "./integration-confirm-modal";
import { initialIntegrations } from "./integration-data";
import { IntegrationDetailModal } from "./integration-detail-modal";
import styles from "./integration-management.module.css";
import {
  integrationCategories,
  integrationStatuses,
  type Integration,
  type IntegrationDetailTab,
  type IntegrationMenuAction,
  type SyncFrequency,
} from "./integration-types";

type ActiveModal =
  | { kind: "detail"; id: number; tab: IntegrationDetailTab }
  | { kind: "confirm"; id: number; action: ConfirmAction };

function date(value?: string) {
  if (!value) return "Henüz yok";
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

function statusKey(status: string) {
  return `status${status.replaceAll(" ", "")}`;
}

export function IntegrationManagement() {
  // Demo işlemleri yalnızca yerel state'i günceller; gerçek servis çağrısı yapılmaz.
  const [integrations, setIntegrations] =
    useState<Integration[]>(initialIntegrations);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tümü");
  const [status, setStatus] = useState("Tümü");
  const [autoSync, setAutoSync] = useState("Tümü");
  const [errorFilter, setErrorFilter] = useState("Tümü");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [activeModal, setActiveModal] = useState<ActiveModal | null>(null);
  const [busyIds, setBusyIds] = useState<number[]>([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 450);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 4200);
    return () => window.clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    if (!activeModal) return;
    const shell = document.querySelector<HTMLElement>("[data-admin-shell]");
    const bodyOverflow = document.body.style.overflow;
    const shellOverflow = shell?.style.overflow ?? "";
    document.body.style.overflow = "hidden";
    if (shell) shell.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = bodyOverflow;
      if (shell) shell.style.overflow = shellOverflow;
    };
  }, [activeModal]);

  const summary = useMemo(
    () => ({
      total: integrations.length,
      connected: integrations.filter((item) => item.status === "Bağlı").length,
      attention: integrations.filter((item) =>
        ["Dikkat Gerekiyor", "Bakımda", "Bağlantı Bekliyor"].includes(
          item.status,
        ),
      ).length,
      errors: integrations.filter((item) => item.status === "Hata").length,
      pending: integrations.reduce(
        (total, item) => total + item.pendingRecords,
        0,
      ),
    }),
    [integrations],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("tr-TR");
    return integrations.filter(
      (item) =>
        (!query || item.name.toLocaleLowerCase("tr-TR").includes(query)) &&
        (category === "Tümü" || item.category === category) &&
        (status === "Tümü" || item.status === status) &&
        (autoSync === "Tümü" || item.autoSync === (autoSync === "Açık")) &&
        (errorFilter === "Tümü" ||
          (errorFilter === "Hata var"
            ? Boolean(item.errorMessage || item.failedOperations)
            : !item.errorMessage && item.failedOperations === 0)),
    );
  }, [autoSync, category, errorFilter, integrations, search, status]);

  const activeIntegration = activeModal
    ? integrations.find((item) => item.id === activeModal.id)
    : undefined;
  const clearFilters = () => {
    setSearch("");
    setCategory("Tümü");
    setStatus("Tümü");
    setAutoSync("Tümü");
    setErrorFilter("Tümü");
  };
  const update = (id: number, updater: (item: Integration) => Integration) =>
    setIntegrations((items) =>
      items.map((item) => (item.id === id ? updater(item) : item)),
    );

  const openAction = (item: Integration, action: IntegrationMenuAction) => {
    setOpenMenuId(null);
    if (action === "detail" || action === "settings")
      setActiveModal({
        kind: "detail",
        id: item.id,
        tab: action === "settings" ? "settings" : "overview",
      });
    else if (action === "toggle")
      setActiveModal({
        kind: "confirm",
        id: item.id,
        action: item.status === "Devre Dışı" ? "enable" : "disable",
      });
    else setActiveModal({ kind: "confirm", id: item.id, action });
  };

  const completeAction = (item: Integration, action: ConfirmAction) => {
    if (busyIds.includes(item.id)) return;
    if (action === "disable" || action === "enable") {
      update(item.id, (current) => ({
        ...current,
        status: action === "disable" ? "Devre Dışı" : "Bağlı",
        autoSync: action === "enable" ? current.autoSync : false,
        nextSync: action === "disable" ? undefined : current.nextSync,
      }));
      setActiveModal(null);
      setNotice(
        action === "disable"
          ? `${item.name} devre dışı bırakıldı.`
          : `${item.name} etkinleştirildi.`,
      );
      return;
    }
    setBusyIds((ids) => [...ids, item.id]);
    window.setTimeout(() => {
      const now = new Date().toISOString();
      if (action === "test") {
        const fails = item.status === "Hata";
        update(item.id, (current) => ({
          ...current,
          lastSuccessfulConnection: fails
            ? current.lastSuccessfulConnection
            : now,
          logs: [
            {
              id: `test-${Date.now()}`,
              date: now,
              operation: "Bağlantı testi",
              result: fails ? "Hata" : "Başarılı",
              description: fails
                ? "Bağlantı doğrulanamadı; ayarların kontrol edilmesi gerekiyor."
                : "Bağlantı ayarları başarıyla doğrulandı.",
              affectedRecords: 0,
            },
            ...current.logs,
          ],
        }));
        setNotice(
          fails
            ? `${item.name} bağlantı testi tamamlanamadı.`
            : `${item.name} bağlantı testi başarılı.`,
        );
      } else {
        update(item.id, (current) => ({
          ...current,
          lastSync: now,
          nextSync: current.autoSync
            ? new Date(Date.now() + 60 * 60 * 1000).toISOString()
            : undefined,
          pendingRecords: 0,
          successfulOperations:
            current.successfulOperations + current.pendingRecords,
          logs: [
            {
              id: `sync-${Date.now()}`,
              date: now,
              operation: "Manuel senkronizasyon",
              result: "Başarılı",
              description: "Bekleyen kayıtlar başarıyla güncellendi.",
              affectedRecords: current.pendingRecords,
            },
            ...current.logs,
          ],
        }));
        setNotice(`${item.name} senkronizasyonu tamamlandı.`);
      }
      setBusyIds((ids) => ids.filter((id) => id !== item.id));
      setActiveModal(null);
    }, 850);
  };

  const saveSync = (
    item: Integration,
    enabled: boolean,
    frequency: SyncFrequency,
  ) => {
    update(item.id, (current) => ({
      ...current,
      autoSync: enabled,
      frequency,
      lastConfiguredAt: new Date().toISOString(),
      nextSync: enabled
        ? new Date(Date.now() + 60 * 60 * 1000).toISOString()
        : undefined,
    }));
    setNotice(`${item.name} senkronizasyon ayarları kaydedildi.`);
  };

  if (loading) return <Loading />;
  return (
    <section className={baseStyles.page}>
      <p className={baseStyles.intro}>
        Satış, operasyon ve müşteri deneyimi bağlantılarını tek merkezden
        izleyin.
      </p>
      <div className={baseStyles.summaryGrid}>
        <Summary
          title="Toplam entegrasyon"
          value={summary.total}
          unit="entegrasyon"
          icon="integrations"
          tone="pink"
        />
        <Summary
          title="Bağlı entegrasyonlar"
          value={summary.connected}
          unit="bağlı"
          icon="insights"
          tone="green"
        />
        <Summary
          title="Dikkat gerektirenler"
          value={summary.attention}
          unit="uyarı"
          icon="alert"
          tone="orange"
        />
        <Summary
          title="Hatalı bağlantılar"
          value={summary.errors}
          unit="hata"
          icon="returns"
          tone="purple"
        />
        <Summary
          title="Senkronizasyon kuyruğu"
          value={summary.pending}
          unit="kayıt"
          icon="refresh"
          tone="blue"
        />
      </div>
      <div className={baseStyles.card}>
        <div className={baseStyles.cardHeading}>
          <div>
            <h2>Entegrasyon Merkezi</h2>
            <p>
              Bağlantı durumlarını, veri akışlarını ve işlem geçmişini yönetin.
            </p>
          </div>
          <span className={baseStyles.crmBadge}>
            8 Kategori · Merkezi Yönetim
          </span>
        </div>
        <div className={baseStyles.filters}>
          <label className={baseStyles.searchField}>
            <Icon name="search" />
            <span className={baseStyles.srOnly}>
              Entegrasyon adına göre ara
            </span>
            <input
              type="search"
              value={search}
              placeholder="Entegrasyon adına göre ara..."
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <Filter
            label="Kategori"
            value={category}
            options={integrationCategories}
            onChange={setCategory}
          />
          <Filter
            label="Bağlantı durumu"
            value={status}
            options={integrationStatuses}
            onChange={setStatus}
          />
          <Filter
            label="Otomatik senkronizasyon"
            value={autoSync}
            options={["Açık", "Kapalı"]}
            onChange={setAutoSync}
          />
          <Filter
            label="Hata durumu"
            value={errorFilter}
            options={["Hata var", "Hata yok"]}
            onChange={setErrorFilter}
          />
          <button
            type="button"
            className={baseStyles.clearButton}
            onClick={clearFilters}
          >
            Filtreleri Temizle
          </button>
        </div>
        <p className={baseStyles.resultLine}>
          {integrations.length} entegrasyondan {filtered.length} tanesi
          gösteriliyor
        </p>
        {filtered.length ? (
          <div className={styles.integrationGrid}>
            {filtered.map((item) => (
              <IntegrationCard
                key={item.id}
                integration={item}
                busy={busyIds.includes(item.id)}
                menuOpen={openMenuId === item.id}
                onToggleMenu={setOpenMenuId}
                onAction={(action) => openAction(item, action)}
              />
            ))}
          </div>
        ) : (
          <div className={baseStyles.emptyState}>
            <span>
              <Icon name="search" />
            </span>
            <h3>Entegrasyon bulunamadı</h3>
            <p>Arama veya filtre ölçütlerini değiştirin.</p>
            <button type="button" onClick={clearFilters}>
              Filtreleri Temizle
            </button>
          </div>
        )}
      </div>
      {activeModal?.kind === "detail" && activeIntegration && (
        <IntegrationDetailModal
          integration={activeIntegration}
          initialTab={activeModal.tab}
          onClose={() => setActiveModal(null)}
          onSaveSync={(enabled, frequency) =>
            saveSync(activeIntegration, enabled, frequency)
          }
        />
      )}
      {activeModal?.kind === "confirm" && activeIntegration && (
        <IntegrationConfirmModal
          integration={activeIntegration}
          action={activeModal.action}
          busy={busyIds.includes(activeIntegration.id)}
          onClose={() => {
            if (!busyIds.includes(activeIntegration.id)) setActiveModal(null);
          }}
          onConfirm={() =>
            completeAction(activeIntegration, activeModal.action)
          }
        />
      )}
      {notice && (
        <div className={baseStyles.toast} role="status">
          <span>{notice}</span>
          <button
            type="button"
            aria-label="Bildirimi kapat"
            onClick={() => setNotice("")}
          >
            ×
          </button>
        </div>
      )}
    </section>
  );
}

function IntegrationCard({
  integration,
  busy,
  menuOpen,
  onToggleMenu,
  onAction,
}: {
  integration: Integration;
  busy: boolean;
  menuOpen: boolean;
  onToggleMenu: (id: number | null) => void;
  onAction: (action: IntegrationMenuAction) => void;
}) {
  const isEnabled = integration.status !== "Devre Dışı";
  const canSync = !["Devre Dışı", "Bağlantı Bekliyor"].includes(
    integration.status,
  );
  return (
    <article className={styles.integrationCard}>
      {busy && (
        <div className={styles.busyOverlay} role="status">
          <span />
          <strong>Senkronize Ediliyor</strong>
        </div>
      )}
      <header>
        <span className={styles.integrationIcon}>
          <Icon name="integrations" />
        </span>
        <div>
          <h3>{integration.name}</h3>
          <span className={styles.categoryBadge}>{integration.category}</span>
        </div>
        <IntegrationActionsMenu
          id={integration.id}
          name={integration.name}
          disabled={busy}
          isEnabled={isEnabled}
          canSync={canSync}
          isOpen={menuOpen}
          onToggle={onToggleMenu}
          onAction={onAction}
        />
      </header>
      <p className={styles.description}>{integration.description}</p>
      <div className={styles.statusLine}>
        <span
          className={`${styles.statusBadge} ${styles[statusKey(integration.status)]}`}
        >
          {integration.status}
        </span>
        <span className={integration.autoSync ? styles.autoOn : styles.autoOff}>
          Otomatik: {integration.autoSync ? "Açık" : "Kapalı"}
        </span>
      </div>
      <dl className={styles.cardDetails}>
        <div>
          <dt>Son başarılı senkronizasyon</dt>
          <dd>{date(integration.lastSync)}</dd>
        </div>
        <div>
          <dt>Sonraki planlanan</dt>
          <dd>{date(integration.nextSync)}</dd>
        </div>
      </dl>
      {(integration.pendingRecords > 0 || integration.errorMessage) && (
        <div className={styles.alerts}>
          {integration.pendingRecords > 0 && (
            <p>
              <strong>{integration.pendingRecords}</strong> bekleyen kayıt
            </p>
          )}
          {integration.errorMessage && (
            <p className={styles.errorText}>
              <Icon name="alert" />
              {integration.errorMessage}
            </p>
          )}
        </div>
      )}
      <footer>
        <button
          type="button"
          className={styles.detailButton}
          disabled={busy}
          onClick={() => onAction("detail")}
        >
          Detayları Görüntüle
        </button>
      </footer>
    </article>
  );
}

function Summary({
  title,
  value,
  unit,
  icon,
  tone,
}: {
  title: string;
  value: number;
  unit: string;
  icon: IconName;
  tone: "pink" | "green" | "orange" | "purple" | "blue";
}) {
  return (
    <article
      className={`${baseStyles.summaryCard} ${tone === "pink" ? "" : baseStyles[tone]}`}
    >
      <span className={baseStyles.summaryIcon}>
        <Icon name={icon} />
      </span>
      <div>
        <p>{title}</p>
        <strong>{value}</strong>
        <small>
          {value} {unit}
        </small>
      </div>
    </article>
  );
}
function Filter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label>
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option>Tümü</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
function Loading() {
  return (
    <section className={baseStyles.page} aria-label="Entegrasyonlar yükleniyor">
      <div className={baseStyles.loadingIntro} />
      <div className={baseStyles.loadingSummary}>
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className={baseStyles.skeletonCard} />
        ))}
      </div>
      <div className={baseStyles.loadingTable}>
        <div className={baseStyles.loadingHeading} />
        <div className={baseStyles.loadingFilters} />
        <div className={styles.loadingCards}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className={baseStyles.loadingRow} />
          ))}
        </div>
      </div>
    </section>
  );
}
