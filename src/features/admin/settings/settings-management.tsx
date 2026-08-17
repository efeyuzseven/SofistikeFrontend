"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SettingsActionsMenu } from "./settings-actions-menu";
import {
  auditEntries,
  initialSettings,
  initialUsers,
  permissionAreas,
  permissionMatrix,
  roles,
  settingsTabs,
} from "./settings-data";
import { SettingsModal } from "./settings-modal";
import type {
  AdminRole,
  AdminUser,
  SettingsModal as ModalState,
  SettingsState,
  SettingsTab,
} from "./settings-types";
import styles from "./settings-management.module.css";

const cloneSettings = (value: SettingsState): SettingsState =>
  structuredClone(value);
const money = (value: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(value);
const same = (left: unknown, right: unknown) =>
  JSON.stringify(left) === JSON.stringify(right);

type Notice = { type: "success" | "error"; text: string } | null;

export function SettingsManagement() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [saved, setSaved] = useState(() => cloneSettings(initialSettings));
  const [draft, setDraft] = useState(() => cloneSettings(initialSettings));
  const [savedUsers, setSavedUsers] = useState(() =>
    structuredClone(initialUsers),
  );
  const [users, setUsers] = useState(() => structuredClone(initialUsers));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [auditPage, setAuditPage] = useState(1);
  const [maintenanceReason, setMaintenanceReason] = useState("");
  const [invite, setInvite] = useState({
    name: "",
    email: "",
    role: "Görüntüleyici" as AdminRole,
    note: "",
  });
  const [roleDraft, setRoleDraft] = useState<AdminRole>("Görüntüleyici");
  const [roleNote, setRoleNote] = useState("");
  const [toggleReason, setToggleReason] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  const usersDirty = !same(users, savedUsers);
  const sectionDirty =
    activeTab === "users"
      ? usersDirty
      : activeTab === "security"
        ? !same(draft.security, saved.security)
        : !same(draft[activeTab], saved[activeTab]);
  const anyDirty = useMemo(
    () => usersDirty || !same(draft, saved),
    [draft, saved, usersDirty],
  );

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!anyDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [anyDirty]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const changed = (section: Exclude<SettingsTab, "users">, key: string) => {
    const current = draft[section] as unknown as Record<string, unknown>;
    const previous = saved[section] as unknown as Record<string, unknown>;
    return !same(current[key], previous[key]);
  };
  const fieldClass = (section: Exclude<SettingsTab, "users">, key: string) =>
    changed(section, key) ? styles.changedField : "";

  const discardTab = useCallback(
    (tab: SettingsTab) => {
      if (tab === "users") setUsers(structuredClone(savedUsers));
      else if (tab === "security")
        setDraft((value) => ({
          ...value,
          security: structuredClone(saved.security),
        }));
      else
        setDraft((value) => ({ ...value, [tab]: structuredClone(saved[tab]) }));
    },
    [saved, savedUsers],
  );

  const chooseTab = (tab: SettingsTab) => {
    if (tab === activeTab) return;
    if (sectionDirty) setModal({ kind: "leave", target: tab });
    else setActiveTab(tab);
  };

  const validate = () => {
    const form = formRef.current;
    if (form && !form.checkValidity()) {
      const invalid = form.querySelector<HTMLElement>(":invalid");
      invalid?.focus();
      form.reportValidity();
      setNotice({
        type: "error",
        text: "Lütfen işaretlenen alanları kontrol edin.",
      });
      return false;
    }
    if (activeTab === "general") {
      if (!/^\+?[\d\s()-]{10,}$/.test(draft.general.supportPhone)) {
        document.getElementById("supportPhone")?.focus();
        setNotice({
          type: "error",
          text: "Geçerli bir destek telefonu girin.",
        });
        return false;
      }
    }
    if (
      activeTab === "company" &&
      (!/^\d{10}$/.test(draft.company.taxNumber) ||
        !/^\d{16}$/.test(draft.company.mersisNumber))
    ) {
      document
        .getElementById(
          !/^\d{10}$/.test(draft.company.taxNumber)
            ? "taxNumber"
            : "mersisNumber",
        )
        ?.focus();
      setNotice({
        type: "error",
        text: "Vergi numarası 10, MERSİS numarası 16 rakam olmalıdır.",
      });
      return false;
    }
    return true;
  };

  const saveTab = () => {
    if (!validate() || saving) return;
    setSaving(true);
    window.setTimeout(() => {
      if (activeTab === "users") setSavedUsers(structuredClone(users));
      else if (activeTab === "security")
        setSaved((value) => ({
          ...value,
          security: structuredClone(draft.security),
        }));
      else
        setSaved((value) => ({
          ...value,
          [activeTab]: structuredClone(draft[activeTab]),
        }));
      setSaving(false);
      setNotice({
        type: "success",
        text: `${settingsTabs.find((tab) => tab.id === activeTab)?.label} ayarları kaydedildi.`,
      });
    }, 600);
  };

  const restoreDefaults = () => {
    if (activeTab === "users") setUsers(structuredClone(initialUsers));
    else if (activeTab === "security")
      setDraft((value) => ({
        ...value,
        security: structuredClone(initialSettings.security),
      }));
    else
      setDraft((value) => ({
        ...value,
        [activeTab]: structuredClone(initialSettings[activeTab]),
      }));
    setModal(null);
    setNotice({
      type: "success",
      text: "Varsayılan değerler forma uygulandı. Kaydetmeyi unutmayın.",
    });
  };

  const activeModalUser =
    modal && "userId" in modal
      ? users.find((user) => user.id === modal.userId)
      : undefined;
  const activeSuperAdmins = users.filter(
    (user) => user.role === "Süper Yönetici" && user.status === "Aktif",
  );

  const openUserAction = (
    user: AdminUser,
    action: "detail" | "role" | "toggle",
  ) => {
    if (action === "detail") setModal({ kind: "detail", userId: user.id });
    if (action === "role") {
      setRoleDraft(user.role);
      setRoleNote("");
      setModal({ kind: "role", userId: user.id });
    }
    if (action === "toggle") {
      setToggleReason("");
      setModal({ kind: "toggle", userId: user.id });
    }
  };

  const applyRole = () => {
    if (!activeModalUser) return;
    if (
      activeModalUser.role === "Süper Yönetici" &&
      roleDraft !== "Süper Yönetici" &&
      activeSuperAdmins.length === 1
    ) {
      setNotice({
        type: "error",
        text: "Son aktif Süper Yöneticinin rolü düşürülemez.",
      });
      return;
    }
    setUsers((items) =>
      items.map((user) =>
        user.id === activeModalUser.id ? { ...user, role: roleDraft } : user,
      ),
    );
    setModal(null);
    setNotice({
      type: "success",
      text: `${activeModalUser.name} için rol değişikliği kayda hazırlandı.`,
    });
  };

  const toggleUser = () => {
    if (!activeModalUser) return;
    const disabling = activeModalUser.status === "Aktif";
    if (disabling && activeModalUser.isCurrent) {
      setNotice({
        type: "error",
        text: "Mevcut oturumdaki Süper Yönetici kendi hesabını devre dışı bırakamaz.",
      });
      return;
    }
    if (
      disabling &&
      activeModalUser.role === "Süper Yönetici" &&
      activeSuperAdmins.length === 1
    ) {
      setNotice({
        type: "error",
        text: "Son aktif Süper Yönetici devre dışı bırakılamaz.",
      });
      return;
    }
    if (disabling && !toggleReason.trim()) {
      setNotice({
        type: "error",
        text: "Devre dışı bırakma gerekçesi zorunludur.",
      });
      return;
    }
    setUsers((items) =>
      items.map((user) =>
        user.id === activeModalUser.id
          ? { ...user, status: disabling ? "Devre Dışı" : "Aktif" }
          : user,
      ),
    );
    setModal(null);
    setNotice({
      type: "success",
      text: `${activeModalUser.name} için durum değişikliği kayda hazırlandı.`,
    });
  };

  const addInvite = () => {
    if (!invite.name.trim() || !/^\S+@\S+\.\S+$/.test(invite.email)) {
      setNotice({
        type: "error",
        text: "Ad soyad ve geçerli e-posta adresi zorunludur.",
      });
      return;
    }
    if (
      users.some(
        (user) =>
          user.email.toLocaleLowerCase("tr-TR") ===
          invite.email.toLocaleLowerCase("tr-TR"),
      )
    ) {
      setNotice({ type: "error", text: "Bu e-posta adresi zaten listede." });
      return;
    }
    setUsers((items) => [
      ...items,
      {
        id: `invite-${Date.now()}`,
        name: invite.name.trim(),
        email: invite.email.trim(),
        role: invite.role,
        status: "Davet Bekliyor",
        lastLogin: "Henüz giriş yapmadı",
        twoFactor: false,
      },
    ]);
    setInvite({ name: "", email: "", role: "Görüntüleyici", note: "" });
    setModal(null);
    setNotice({
      type: "success",
      text: "Kullanıcı, Davet Bekliyor durumunda tabloya eklendi.",
    });
  };

  if (loading)
    return (
      <section className={styles.page} aria-label="Ayarlar yükleniyor">
        <div className={styles.skeletonIntro} />
        <div className={styles.settingsLayout}>
          <div className={styles.skeletonNav} />
          <div className={styles.skeletonPanel} />
        </div>
      </section>
    );

  const general = draft.general;
  const operations = draft.operations;
  const notifications = draft.notifications;
  const company = draft.company;
  const security = draft.security;
  const updateGeneral = (key: keyof typeof general, value: string | boolean) =>
    setDraft((state) => ({
      ...state,
      general: { ...state.general, [key]: value },
    }));
  const updateOperations = (
    key: keyof typeof operations,
    value: number | boolean | string,
  ) =>
    setDraft((state) => ({
      ...state,
      operations: { ...state.operations, [key]: value },
    }));
  const updateCompany = (
    key: keyof typeof company,
    value: number | boolean | string,
  ) =>
    setDraft((state) => ({
      ...state,
      company: { ...state.company, [key]: value },
    }));
  const updateSecurity = (
    key: keyof typeof security,
    value: number | boolean,
  ) =>
    setDraft((state) => ({
      ...state,
      security: { ...state.security, [key]: value },
    }));

  return (
    <section className={styles.page}>
      <p className={styles.intro}>
        Yönetim panelinin işleyişini, bildirim tercihlerini ve yönetici
        erişimlerini yapılandırın.
      </p>
      <div className={styles.settingsLayout}>
        <nav
          className={styles.tabNav}
          aria-label="Ayar bölümleri"
          role="tablist"
        >
          {settingsTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={activeTab === tab.id ? styles.activeTab : ""}
              onClick={() => chooseTab(tab.id)}
            >
              {tab.label}
              {(tab.id === "users"
                ? usersDirty
                : tab.id === "security"
                  ? !same(draft.security, saved.security)
                  : !same(draft[tab.id], saved[tab.id])) && (
                <span aria-label="Kaydedilmemiş değişiklik" />
              )}
            </button>
          ))}
        </nav>
        <div className={styles.panel} role="tabpanel">
          <form
            ref={formRef}
            onInvalidCapture={() =>
              setNotice({
                type: "error",
                text: "Lütfen işaretlenen alanları kontrol edin.",
              })
            }
            onSubmit={(event) => {
              event.preventDefault();
              saveTab();
            }}
          >
            {activeTab === "general" && (
              <>
                <SectionHeading
                  title="Genel ayarlar"
                  description="Marka, yerelleştirme ve destek bilgilerinin panelde nasıl görüneceğini belirleyin."
                />
                <div className={styles.formGrid}>
                  <Field
                    label="Marka adı"
                    changed={fieldClass("general", "brandName")}
                  >
                    <input
                      required
                      value={general.brandName}
                      onChange={(e) =>
                        updateGeneral("brandName", e.target.value)
                      }
                    />
                  </Field>
                  <Field
                    label="Yönetim paneli görünen adı"
                    changed={fieldClass("general", "panelName")}
                  >
                    <input
                      required
                      value={general.panelName}
                      onChange={(e) =>
                        updateGeneral("panelName", e.target.value)
                      }
                    />
                  </Field>
                  <Field
                    label="Destek e-posta adresi"
                    changed={fieldClass("general", "supportEmail")}
                  >
                    <input
                      required
                      type="email"
                      value={general.supportEmail}
                      onChange={(e) =>
                        updateGeneral("supportEmail", e.target.value)
                      }
                    />
                  </Field>
                  <Field
                    label="Destek telefon numarası"
                    changed={fieldClass("general", "supportPhone")}
                  >
                    <input
                      id="supportPhone"
                      required
                      type="tel"
                      value={general.supportPhone}
                      onChange={(e) =>
                        updateGeneral("supportPhone", e.target.value)
                      }
                    />
                  </Field>
                  <Field
                    label="Web sitesi adresi"
                    changed={fieldClass("general", "website")}
                  >
                    <input
                      required
                      type="url"
                      value={general.website}
                      onChange={(e) => updateGeneral("website", e.target.value)}
                    />
                  </Field>
                  <Field
                    label="Merkez adresi"
                    wide
                    changed={fieldClass("general", "address")}
                  >
                    <textarea
                      required
                      rows={3}
                      value={general.address}
                      onChange={(e) => updateGeneral("address", e.target.value)}
                    />
                  </Field>
                  <Field
                    label="Varsayılan dil"
                    changed={fieldClass("general", "language")}
                  >
                    <select
                      value={general.language}
                      onChange={(e) =>
                        updateGeneral("language", e.target.value)
                      }
                    >
                      <option>Türkçe</option>
                      <option>English</option>
                    </select>
                  </Field>
                  <Field
                    label="Saat dilimi"
                    changed={fieldClass("general", "timezone")}
                  >
                    <select
                      value={general.timezone}
                      onChange={(e) =>
                        updateGeneral("timezone", e.target.value)
                      }
                    >
                      <option>Europe/Istanbul</option>
                      <option>Europe/London</option>
                      <option>Europe/Berlin</option>
                    </select>
                  </Field>
                  <Field
                    label="Varsayılan para birimi"
                    changed={fieldClass("general", "currency")}
                  >
                    <select
                      value={general.currency}
                      onChange={(e) =>
                        updateGeneral("currency", e.target.value)
                      }
                    >
                      <option value="TRY">Türk lirası (TRY)</option>
                      <option value="EUR">Euro (EUR)</option>
                      <option value="USD">ABD doları (USD)</option>
                    </select>
                  </Field>
                  <Field
                    label="Tarih biçimi"
                    changed={fieldClass("general", "dateFormat")}
                  >
                    <select
                      value={general.dateFormat}
                      onChange={(e) =>
                        updateGeneral("dateFormat", e.target.value)
                      }
                    >
                      <option>GG.AA.YYYY</option>
                      <option>YYYY-AA-GG</option>
                      <option>AA/GG/YYYY</option>
                    </select>
                  </Field>
                </div>
                <SwitchRow
                  label="Bakım modu"
                  description="Açıldığında mağaza ziyaretçilerine bakım bilgilendirmesi gösterilir."
                  checked={general.maintenanceMode}
                  changed={changed("general", "maintenanceMode")}
                  onChange={(checked) =>
                    checked
                      ? setModal({ kind: "maintenance" })
                      : updateGeneral("maintenanceMode", false)
                  }
                />
              </>
            )}

            {activeTab === "operations" && (
              <>
                <SectionHeading
                  title="Satış ve Operasyon"
                  description="Sipariş, stok, vergi ve +XTRA Rewards varsayılanlarını yönetin."
                />
                <div className={styles.warning}>
                  Bu bölümdeki değişiklikler yeni siparişlerin fiyatlama ve
                  operasyon kurallarını etkileyebilir. Mevcut kayıtlar bu
                  ekranda değiştirilmez.
                </div>
                <div className={styles.formGrid}>
                  <Field
                    label="Sipariş numarası ön eki"
                    changed={fieldClass("operations", "orderPrefix")}
                  >
                    <input
                      required
                      pattern="[A-Z0-9-]{2,12}"
                      value={operations.orderPrefix}
                      onChange={(e) =>
                        updateOperations(
                          "orderPrefix",
                          e.target.value.toUpperCase(),
                        )
                      }
                    />
                  </Field>
                  <Field
                    label="B2B sipariş numarası ön eki"
                    changed={fieldClass("operations", "b2bOrderPrefix")}
                  >
                    <input
                      required
                      pattern="[A-Z0-9-]{2,12}"
                      value={operations.b2bOrderPrefix}
                      onChange={(e) =>
                        updateOperations(
                          "b2bOrderPrefix",
                          e.target.value.toUpperCase(),
                        )
                      }
                    />
                  </Field>
                  <NumberField
                    label="Varsayılan düşük stok eşiği"
                    value={operations.lowStockThreshold}
                    min={0}
                    changed={fieldClass("operations", "lowStockThreshold")}
                    onChange={(v) => updateOperations("lowStockThreshold", v)}
                  />
                  <NumberField
                    label="B2C iade süresi (gün)"
                    value={operations.b2cReturnDays}
                    min={0}
                    changed={fieldClass("operations", "b2cReturnDays")}
                    onChange={(v) => updateOperations("b2cReturnDays", v)}
                  />
                  <NumberField
                    label="Sipariş iptal süresi (saat)"
                    value={operations.cancellationHours}
                    min={0}
                    changed={fieldClass("operations", "cancellationHours")}
                    onChange={(v) => updateOperations("cancellationHours", v)}
                  />
                  <NumberField
                    label="Varsayılan KDV oranı (%)"
                    value={operations.vatRate}
                    min={0}
                    max={100}
                    changed={fieldClass("operations", "vatRate")}
                    onChange={(v) => updateOperations("vatRate", v)}
                  />
                  <NumberField
                    label="Ücretsiz kargo alt limiti"
                    value={operations.freeShippingLimit}
                    min={0}
                    suffix={money(operations.freeShippingLimit)}
                    changed={fieldClass("operations", "freeShippingLimit")}
                    onChange={(v) => updateOperations("freeShippingLimit", v)}
                  />
                  <NumberField
                    label="B2B minimum sipariş tutarı"
                    value={operations.b2bMinimumOrder}
                    min={0}
                    suffix={money(operations.b2bMinimumOrder)}
                    changed={fieldClass("operations", "b2bMinimumOrder")}
                    onChange={(v) => updateOperations("b2bMinimumOrder", v)}
                  />
                  <NumberField
                    label="Harcamaya göre puan oranı (%)"
                    value={operations.pointsRate}
                    min={0}
                    max={100}
                    changed={fieldClass("operations", "pointsRate")}
                    onChange={(v) => updateOperations("pointsRate", v)}
                  />
                  <NumberField
                    label="Puan geçerlilik süresi (ay)"
                    value={operations.pointsValidityMonths}
                    min={0}
                    changed={fieldClass("operations", "pointsValidityMonths")}
                    onChange={(v) =>
                      updateOperations("pointsValidityMonths", v)
                    }
                  />
                </div>
                <div className={styles.switchGrid}>
                  <SwitchRow
                    label="Stok tükenince satışa devam et"
                    description="Yeni siparişlerde stok kontrolü uyarı olarak gösterilir."
                    checked={operations.continueOutOfStock}
                    changed={changed("operations", "continueOutOfStock")}
                    onChange={(v) => updateOperations("continueOutOfStock", v)}
                  />
                  <SwitchRow
                    label="Fiyatlara vergi dâhil"
                    description="Panelde gösterilen varsayılan fiyat yorumunu belirler."
                    checked={operations.taxIncluded}
                    changed={changed("operations", "taxIncluded")}
                    onChange={(v) => updateOperations("taxIncluded", v)}
                  />
                  <SwitchRow
                    label="+XTRA Rewards etkin"
                    description="Sadakat puanı hesaplama alanlarını kullanıma açar."
                    checked={operations.rewardsEnabled}
                    changed={changed("operations", "rewardsEnabled")}
                    onChange={(v) => updateOperations("rewardsEnabled", v)}
                  />
                </div>
              </>
            )}

            {activeTab === "notifications" && (
              <>
                <SectionHeading
                  title="Bildirimler"
                  description="Yönetim olaylarının hangi kanallarda duyurulacağını belirleyin."
                />
                <div className={styles.integrationWarning}>
                  E-posta ve SMS kanallarından en az biri bağlantı bekliyor.{" "}
                  <Link href="/admin/integrations">
                    Entegrasyonları görüntüle
                  </Link>
                </div>
                <div
                  className={`${styles.tableWrap} ${changed("notifications", "events") ? styles.changedField : ""}`}
                >
                  <table className={styles.notificationTable}>
                    <thead>
                      <tr>
                        <th>Olay</th>
                        <th>Panel</th>
                        <th>E-posta</th>
                        <th>SMS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notifications.events.map((item, index) => (
                        <tr key={item.id}>
                          <th>{item.label}</th>
                          {(["panel", "email", "sms"] as const).map(
                            (channel) => (
                              <td key={channel}>
                                <input
                                  type="checkbox"
                                  aria-label={`${item.label}: ${channel}`}
                                  checked={item[channel]}
                                  onChange={(event) =>
                                    setDraft((state) => ({
                                      ...state,
                                      notifications: {
                                        ...state.notifications,
                                        events: state.notifications.events.map(
                                          (entry, itemIndex) =>
                                            itemIndex === index
                                              ? {
                                                  ...entry,
                                                  [channel]:
                                                    event.target.checked,
                                                }
                                              : entry,
                                        ),
                                      },
                                    }))
                                  }
                                />
                              </td>
                            ),
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className={styles.formGrid}>
                  <Field
                    label="Günlük özet gönderim saati"
                    changed={fieldClass("notifications", "dailyTime")}
                  >
                    <input
                      type="time"
                      value={notifications.dailyTime}
                      onChange={(e) =>
                        setDraft((s) => ({
                          ...s,
                          notifications: {
                            ...s.notifications,
                            dailyTime: e.target.value,
                          },
                        }))
                      }
                    />
                  </Field>
                  <Field
                    label="Haftalık rapor günü"
                    changed={fieldClass("notifications", "weeklyDay")}
                  >
                    <select
                      value={notifications.weeklyDay}
                      onChange={(e) =>
                        setDraft((s) => ({
                          ...s,
                          notifications: {
                            ...s.notifications,
                            weeklyDay: e.target.value,
                          },
                        }))
                      }
                    >
                      {[
                        "Pazartesi",
                        "Salı",
                        "Çarşamba",
                        "Perşembe",
                        "Cuma",
                      ].map((day) => (
                        <option key={day}>{day}</option>
                      ))}
                    </select>
                  </Field>
                  <Field
                    label="Haftalık rapor saati"
                    changed={fieldClass("notifications", "weeklyTime")}
                  >
                    <input
                      type="time"
                      value={notifications.weeklyTime}
                      onChange={(e) =>
                        setDraft((s) => ({
                          ...s,
                          notifications: {
                            ...s.notifications,
                            weeklyTime: e.target.value,
                          },
                        }))
                      }
                    />
                  </Field>
                </div>
              </>
            )}

            {activeTab === "company" && (
              <>
                <SectionHeading
                  title="Şirket ve Fatura"
                  description="Faturalarda kullanılacak kurgusal şirket ve belge varsayılanlarını yönetin."
                />
                <div className={styles.formGrid}>
                  <Field
                    label="Ticari unvan"
                    wide
                    changed={fieldClass("company", "legalName")}
                  >
                    <input
                      required
                      value={company.legalName}
                      onChange={(e) =>
                        updateCompany("legalName", e.target.value)
                      }
                    />
                  </Field>
                  <Field
                    label="Vergi dairesi"
                    changed={fieldClass("company", "taxOffice")}
                  >
                    <input
                      required
                      value={company.taxOffice}
                      onChange={(e) =>
                        updateCompany("taxOffice", e.target.value)
                      }
                    />
                  </Field>
                  <Field
                    label="Vergi numarası"
                    hint="10 rakam"
                    changed={fieldClass("company", "taxNumber")}
                  >
                    <input
                      id="taxNumber"
                      required
                      inputMode="numeric"
                      pattern="\d{10}"
                      maxLength={10}
                      value={company.taxNumber}
                      onChange={(e) =>
                        updateCompany(
                          "taxNumber",
                          e.target.value.replace(/\D/g, ""),
                        )
                      }
                    />
                  </Field>
                  <Field
                    label="MERSİS numarası"
                    hint="16 rakam"
                    changed={fieldClass("company", "mersisNumber")}
                  >
                    <input
                      id="mersisNumber"
                      required
                      inputMode="numeric"
                      pattern="\d{16}"
                      maxLength={16}
                      value={company.mersisNumber}
                      onChange={(e) =>
                        updateCompany(
                          "mersisNumber",
                          e.target.value.replace(/\D/g, ""),
                        )
                      }
                    />
                  </Field>
                  <Field
                    label="Fatura adresi"
                    wide
                    changed={fieldClass("company", "invoiceAddress")}
                  >
                    <textarea
                      required
                      rows={3}
                      value={company.invoiceAddress}
                      onChange={(e) =>
                        updateCompany("invoiceAddress", e.target.value)
                      }
                    />
                  </Field>
                  <Field
                    label="Ülke"
                    changed={fieldClass("company", "country")}
                  >
                    <input
                      required
                      value={company.country}
                      onChange={(e) => updateCompany("country", e.target.value)}
                    />
                  </Field>
                  <Field label="Şehir" changed={fieldClass("company", "city")}>
                    <input
                      required
                      value={company.city}
                      onChange={(e) => updateCompany("city", e.target.value)}
                    />
                  </Field>
                  <Field
                    label="E-arşiv belge ön eki"
                    changed={fieldClass("company", "archivePrefix")}
                  >
                    <input
                      required
                      pattern="[A-Z]{3}"
                      maxLength={3}
                      value={company.archivePrefix}
                      onChange={(e) =>
                        updateCompany(
                          "archivePrefix",
                          e.target.value.toUpperCase(),
                        )
                      }
                    />
                  </Field>
                  <NumberField
                    label="Fatura sıra numarası başlangıcı"
                    value={company.invoiceStart}
                    min={1}
                    changed={fieldClass("company", "invoiceStart")}
                    onChange={(v) => updateCompany("invoiceStart", v)}
                  />
                  <Field
                    label="Varsayılan fatura notu"
                    wide
                    changed={fieldClass("company", "invoiceNote")}
                  >
                    <textarea
                      rows={3}
                      value={company.invoiceNote}
                      onChange={(e) =>
                        updateCompany("invoiceNote", e.target.value)
                      }
                    />
                  </Field>
                  <Field
                    label="Varsayılan ihracat para birimi"
                    changed={fieldClass("company", "exportCurrency")}
                  >
                    <select
                      value={company.exportCurrency}
                      onChange={(e) =>
                        updateCompany("exportCurrency", e.target.value)
                      }
                    >
                      <option>EUR</option>
                      <option>USD</option>
                      <option>GBP</option>
                    </select>
                  </Field>
                  <Field
                    label="Varsayılan teslimat şekli"
                    changed={fieldClass("company", "deliveryTerm")}
                  >
                    <select
                      value={company.deliveryTerm}
                      onChange={(e) =>
                        updateCompany("deliveryTerm", e.target.value)
                      }
                    >
                      <option>DAP</option>
                      <option>EXW</option>
                      <option>FCA</option>
                      <option>CIP</option>
                    </select>
                  </Field>
                </div>
                <SwitchRow
                  label="E-ihracat faturalarını etkinleştir"
                  description="E-ihracat siparişlerinde fatura alanlarını görünür kılar."
                  checked={company.exportInvoices}
                  changed={changed("company", "exportInvoices")}
                  onChange={(v) => updateCompany("exportInvoices", v)}
                />
              </>
            )}

            {activeTab === "users" && (
              <>
                <div className={styles.headingWithAction}>
                  <SectionHeading
                    title="Kullanıcılar ve Roller"
                    description="Yönetici erişimlerini ve salt okunur yetki matrisini inceleyin."
                  />
                  <button
                    className={styles.primaryButton}
                    type="button"
                    onClick={() => {
                      setInvite({
                        name: "",
                        email: "",
                        role: "Görüntüleyici",
                        note: "",
                      });
                      setModal({ kind: "invite" });
                    }}
                  >
                    + Yeni Kullanıcı Davet Et
                  </button>
                </div>
                <div className={styles.tableWrap}>
                  <table className={styles.userTable}>
                    <thead>
                      <tr>
                        <th>Ad soyad</th>
                        <th>E-posta</th>
                        <th>Rol</th>
                        <th>Durum</th>
                        <th>Son giriş</th>
                        <th>2FA</th>
                        <th>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className={
                            !same(
                              user,
                              savedUsers.find(
                                (savedUser) => savedUser.id === user.id,
                              ),
                            )
                              ? styles.changedRow
                              : ""
                          }
                        >
                          <th>
                            {user.name}
                            {user.isCurrent && <small>Siz</small>}
                          </th>
                          <td>{user.email}</td>
                          <td>{user.role}</td>
                          <td>
                            <StatusBadge status={user.status} />
                          </td>
                          <td>{user.lastLogin}</td>
                          <td>{user.twoFactor ? "Etkin" : "Kapalı"}</td>
                          <td>
                            <SettingsActionsMenu
                              id={user.id}
                              name={user.name}
                              active={user.status === "Aktif"}
                              open={openMenu === user.id}
                              onToggle={setOpenMenu}
                              onAction={(action) =>
                                openUserAction(user, action)
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <h3 className={styles.subheading}>Yetki matrisi</h3>
                <p className={styles.readOnlyNote}>
                  Yetki seviyeleri bu ekranda yalnızca görüntülenebilir.
                </p>
                <div className={styles.tableWrap}>
                  <table className={styles.permissionTable}>
                    <thead>
                      <tr>
                        <th>Rol</th>
                        {permissionAreas.map((area) => (
                          <th key={area}>{area}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {roles.map((role) => (
                        <tr key={role}>
                          <th>{role}</th>
                          {permissionMatrix[role].map((level, index) => (
                            <td key={`${role}-${permissionAreas[index]}`}>
                              <span data-level={level}>{level}</span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeTab === "security" && (
              <>
                <SectionHeading
                  title="Güvenlik"
                  description="Yönetici oturumları ve temel güvenlik politikaları için panel varsayılanlarını belirleyin."
                />
                <div className={styles.warning}>
                  Bu değişiklikler gerçek oturum, parola veya kimlik doğrulama
                  sistemine uygulanmaz.
                </div>
                <div className={styles.formGrid}>
                  <NumberField
                    label="Oturum zaman aşımı (dakika)"
                    value={security.sessionTimeout}
                    min={5}
                    max={480}
                    changed={fieldClass("security", "sessionTimeout")}
                    onChange={(v) => updateSecurity("sessionTimeout", v)}
                  />
                  <NumberField
                    label="Minimum parola uzunluğu"
                    value={security.minimumPasswordLength}
                    min={8}
                    max={64}
                    changed={fieldClass("security", "minimumPasswordLength")}
                    onChange={(v) => updateSecurity("minimumPasswordLength", v)}
                  />
                  <NumberField
                    label="Başarısız giriş denemesi limiti"
                    value={security.failedLoginLimit}
                    min={1}
                    max={20}
                    changed={fieldClass("security", "failedLoginLimit")}
                    onChange={(v) => updateSecurity("failedLoginLimit", v)}
                  />
                </div>
                <div className={styles.switchGrid}>
                  <SwitchRow
                    label="Tüm yöneticiler için iki aşamalı doğrulama"
                    description="Etkinleştirme öncesinde onay gerekir."
                    checked={security.requireTwoFactor}
                    changed={changed("security", "requireTwoFactor")}
                    onChange={(v) =>
                      v
                        ? setModal({ kind: "twoFactor" })
                        : updateSecurity("requireTwoFactor", false)
                    }
                  />
                  <SwitchRow
                    label="Şüpheli giriş bildirimi"
                    description="Olağandışı girişlerde panel bildirimi oluşturur."
                    checked={security.suspiciousLoginNotice}
                    changed={changed("security", "suspiciousLoginNotice")}
                    onChange={(v) => updateSecurity("suspiciousLoginNotice", v)}
                  />
                </div>
                <div className={styles.auditHeader}>
                  <div>
                    <h3>Son yönetici işlemleri</h3>
                    <p>Audit kayıtları salt okunurdur.</p>
                  </div>
                  <span>{auditEntries.length} kayıt</span>
                </div>
                <div className={styles.tableWrap}>
                  <table className={styles.auditTable}>
                    <thead>
                      <tr>
                        <th>Tarih ve saat</th>
                        <th>Yönetici</th>
                        <th>İşlem</th>
                        <th>Modül</th>
                        <th>Hedef kayıt</th>
                        <th>Sonuç</th>
                        <th>Açıklama</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditEntries
                        .slice((auditPage - 1) * 5, auditPage * 5)
                        .map((entry) => (
                          <tr key={entry.id}>
                            <td>{entry.occurredAt}</td>
                            <th>{entry.administrator}</th>
                            <td>{entry.action}</td>
                            <td>{entry.module}</td>
                            <td>{entry.target}</td>
                            <td>
                              <StatusBadge status={entry.result} />
                            </td>
                            <td>{entry.description}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <div className={styles.pagination}>
                  <span>
                    {(auditPage - 1) * 5 + 1}-
                    {Math.min(auditPage * 5, auditEntries.length)} /{" "}
                    {auditEntries.length} kayıt
                  </span>
                  <button
                    type="button"
                    aria-label="Önceki audit sayfası"
                    disabled={auditPage === 1}
                    onClick={() => setAuditPage((p) => p - 1)}
                  >
                    ‹
                  </button>
                  <b>
                    {auditPage} / {Math.ceil(auditEntries.length / 5)}
                  </b>
                  <button
                    type="button"
                    aria-label="Sonraki audit sayfası"
                    disabled={auditPage === Math.ceil(auditEntries.length / 5)}
                    onClick={() => setAuditPage((p) => p + 1)}
                  >
                    ›
                  </button>
                </div>
              </>
            )}

            <div className={styles.formActions}>
              <span>
                {sectionDirty
                  ? "Kaydedilmemiş değişiklikler var"
                  : "Tüm değişiklikler kaydedildi"}
              </span>
              <div>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => setModal({ kind: "defaults" })}
                >
                  Varsayılanlara Döndür
                </button>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  disabled={!sectionDirty || saving}
                  onClick={() => discardTab(activeTab)}
                >
                  Değişiklikleri İptal Et
                </button>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={!sectionDirty || saving}
                >
                  {saving ? "Kaydediliyor…" : "Değişiklikleri Kaydet"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {notice && (
        <div
          className={`${styles.toast} ${notice.type === "error" ? styles.errorToast : ""}`}
          role={notice.type === "error" ? "alert" : "status"}
        >
          <span>{notice.text}</span>
          <button
            type="button"
            aria-label="Bildirimi kapat"
            onClick={() => setNotice(null)}
          >
            ×
          </button>
        </div>
      )}

      {modal?.kind === "maintenance" && (
        <SettingsModal
          eyebrow="Yüksek etkili ayar"
          title="Bakım modunu aç"
          onClose={() => {
            setModal(null);
            setMaintenanceReason("");
          }}
        >
          <div className={styles.modalBody}>
            <p>
              Mağaza ziyaretçileri bakım bilgilendirmesi görecek. Yönetici
              açıklaması zorunludur.
            </p>
            <Field label="Yönetici açıklaması">
              <textarea
                autoFocus
                required
                rows={4}
                value={maintenanceReason}
                onChange={(e) => setMaintenanceReason(e.target.value)}
              />
            </Field>
            <ModalActions
              onCancel={() => setModal(null)}
              confirmLabel="Bakım Modunu Aç"
              onConfirm={() => {
                if (!maintenanceReason.trim()) {
                  setNotice({
                    type: "error",
                    text: "Yönetici açıklaması zorunludur.",
                  });
                  return;
                }
                updateGeneral("maintenanceMode", true);
                setModal(null);
                setMaintenanceReason("");
              }}
            />
          </div>
        </SettingsModal>
      )}
      {modal?.kind === "twoFactor" && (
        <SettingsModal
          eyebrow="Güvenlik onayı"
          title="İki aşamalı doğrulamayı zorunlu yap"
          onClose={() => setModal(null)}
        >
          <div className={styles.modalBody}>
            <p>
              Tüm yöneticiler sonraki girişlerinde iki aşamalı doğrulama
              kurulumuna yönlendirilecek olarak işaretlenir. Gerçek hesaplara
              işlem uygulanmaz.
            </p>
            <ModalActions
              onCancel={() => setModal(null)}
              confirmLabel="Zorunlu Yap"
              onConfirm={() => {
                updateSecurity("requireTwoFactor", true);
                setModal(null);
              }}
            />
          </div>
        </SettingsModal>
      )}
      {modal?.kind === "defaults" && (
        <SettingsModal
          eyebrow="Doğrulama"
          title="Varsayılanlara dön"
          onClose={() => setModal(null)}
        >
          <div className={styles.modalBody}>
            <p>
              Bu sekmedeki alanlar başlangıç değerlerine dönecek. Değişiklikleri
              uygulamak için yine kaydetmeniz gerekir.
            </p>
            <ModalActions
              onCancel={() => setModal(null)}
              confirmLabel="Varsayılanlara Döndür"
              onConfirm={restoreDefaults}
            />
          </div>
        </SettingsModal>
      )}
      {modal?.kind === "leave" && (
        <SettingsModal
          eyebrow="Kaydedilmemiş değişiklik"
          title="Kaydetmeden ayrılmak istiyor musunuz?"
          onClose={() => setModal(null)}
        >
          <div className={styles.modalBody}>
            <p>Bu sekmedeki kaydedilmemiş değişiklikler iptal edilecek.</p>
            <ModalActions
              onCancel={() => setModal(null)}
              confirmLabel="Değişiklikleri İptal Et ve Ayrıl"
              danger
              onConfirm={() => {
                discardTab(activeTab);
                setActiveTab(modal.target);
                setModal(null);
              }}
            />
          </div>
        </SettingsModal>
      )}
      {modal?.kind === "invite" && (
        <SettingsModal
          eyebrow="Kullanıcı yönetimi"
          title="Yeni Kullanıcı Davet Et"
          onClose={() => setModal(null)}
        >
          <div className={styles.modalBody}>
            <div className={styles.formGrid}>
              <Field label="Ad soyad">
                <input
                  autoFocus
                  required
                  value={invite.name}
                  onChange={(e) =>
                    setInvite((v) => ({ ...v, name: e.target.value }))
                  }
                />
              </Field>
              <Field label="E-posta">
                <input
                  required
                  type="email"
                  value={invite.email}
                  onChange={(e) =>
                    setInvite((v) => ({ ...v, email: e.target.value }))
                  }
                />
              </Field>
              <Field label="Rol">
                <select
                  value={invite.role}
                  onChange={(e) =>
                    setInvite((v) => ({
                      ...v,
                      role: e.target.value as AdminRole,
                    }))
                  }
                >
                  {roles.map((role) => (
                    <option key={role}>{role}</option>
                  ))}
                </select>
              </Field>
              <Field label="Kısa not" wide>
                <textarea
                  rows={3}
                  value={invite.note}
                  onChange={(e) =>
                    setInvite((v) => ({ ...v, note: e.target.value }))
                  }
                />
              </Field>
            </div>
            <p className={styles.demoNote}>
              Kayıt “Davet Bekliyor” durumunda eklenir; e-posta gönderilmez.
            </p>
            <ModalActions
              onCancel={() => setModal(null)}
              confirmLabel="Davet Kaydı Oluştur"
              onConfirm={addInvite}
            />
          </div>
        </SettingsModal>
      )}
      {modal?.kind === "detail" && activeModalUser && (
        <SettingsModal
          eyebrow="Yönetici hesabı"
          title={activeModalUser.name}
          onClose={() => setModal(null)}
        >
          <div className={styles.modalBody}>
            <dl className={styles.detailGrid}>
              <div>
                <dt>E-posta</dt>
                <dd>{activeModalUser.email}</dd>
              </div>
              <div>
                <dt>Rol</dt>
                <dd>{activeModalUser.role}</dd>
              </div>
              <div>
                <dt>Durum</dt>
                <dd>{activeModalUser.status}</dd>
              </div>
              <div>
                <dt>Son giriş</dt>
                <dd>{activeModalUser.lastLogin}</dd>
              </div>
              <div>
                <dt>İki aşamalı doğrulama</dt>
                <dd>{activeModalUser.twoFactor ? "Etkin" : "Kapalı"}</dd>
              </div>
            </dl>
          </div>
        </SettingsModal>
      )}
      {modal?.kind === "role" && activeModalUser && (
        <SettingsModal
          eyebrow="Rol doğrulaması"
          title={`${activeModalUser.name} rolünü değiştir`}
          onClose={() => setModal(null)}
        >
          <div className={styles.modalBody}>
            <div className={styles.comparison}>
              <span>
                Mevcut rol<strong>{activeModalUser.role}</strong>
              </span>
              <span>
                Yeni rol<strong>{roleDraft}</strong>
              </span>
            </div>
            <Field label="Yeni rol">
              <select
                autoFocus
                value={roleDraft}
                onChange={(e) => setRoleDraft(e.target.value as AdminRole)}
              >
                {roles.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </Field>
            <Field label="Yönetici notu (isteğe bağlı)">
              <textarea
                rows={3}
                value={roleNote}
                onChange={(e) => setRoleNote(e.target.value)}
              />
            </Field>
            <ModalActions
              onCancel={() => setModal(null)}
              confirmLabel="Rolü Güncelle"
              onConfirm={applyRole}
            />
          </div>
        </SettingsModal>
      )}
      {modal?.kind === "toggle" && activeModalUser && (
        <SettingsModal
          eyebrow="Durum doğrulaması"
          title={`${activeModalUser.name} hesabını ${activeModalUser.status === "Aktif" ? "devre dışı bırak" : "etkinleştir"}`}
          onClose={() => setModal(null)}
        >
          <div className={styles.modalBody}>
            <p>
              {activeModalUser.status === "Aktif"
                ? "Devre dışı bırakma gerekçesi zorunludur."
                : "Hesap tekrar aktif olarak işaretlenecek."}
            </p>
            {activeModalUser.status === "Aktif" && (
              <Field label="Gerekçe">
                <textarea
                  autoFocus
                  required
                  rows={3}
                  value={toggleReason}
                  onChange={(e) => setToggleReason(e.target.value)}
                />
              </Field>
            )}
            <ModalActions
              onCancel={() => setModal(null)}
              confirmLabel={
                activeModalUser.status === "Aktif"
                  ? "Devre Dışı Bırak"
                  : "Etkinleştir"
              }
              danger={activeModalUser.status === "Aktif"}
              onConfirm={toggleUser}
            />
          </div>
        </SettingsModal>
      )}
    </section>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header className={styles.sectionHeading}>
      <h2>{title}</h2>
      <p>{description}</p>
    </header>
  );
}
function Field({
  label,
  hint,
  wide,
  changed = "",
  children,
}: {
  label: string;
  hint?: string;
  wide?: boolean;
  changed?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`${styles.field} ${wide ? styles.wideField : ""} ${changed}`}
    >
      <span>
        {label}
        {hint && <small>{hint}</small>}
      </span>
      {children}
    </label>
  );
}
function NumberField({
  label,
  value,
  min,
  max,
  suffix,
  changed,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max?: number;
  suffix?: string;
  changed?: string;
  onChange: (value: number) => void;
}) {
  return (
    <Field label={label} hint={suffix} changed={changed}>
      <input
        required
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(event.currentTarget.valueAsNumber)}
      />
    </Field>
  );
}
function SwitchRow({
  label,
  description,
  checked,
  changed,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  changed?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={`${styles.switchRow} ${changed ? styles.changedField : ""}`}
    >
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}
function StatusBadge({ status }: { status: string }) {
  return (
    <span className={styles.statusBadge} data-status={status}>
      {status}
    </span>
  );
}
function ModalActions({
  onCancel,
  onConfirm,
  confirmLabel,
  danger = false,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  danger?: boolean;
}) {
  return (
    <div className={styles.modalActions}>
      <button
        type="button"
        className={styles.secondaryButton}
        onClick={onCancel}
      >
        Vazgeç
      </button>
      <button
        type="button"
        className={danger ? styles.dangerButton : styles.primaryButton}
        onClick={onConfirm}
      >
        {confirmLabel}
      </button>
    </div>
  );
}
