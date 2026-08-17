"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "../admin-icons";
import {
  CustomerActionsMenu,
  type CustomerMenuAction,
} from "./customer-actions-menu";
import { mockCustomers } from "./customer-data";
import { CustomerDetailModal } from "./customer-detail-modal";
import { CustomerSegmentModal } from "./customer-segment-modal";
import {
  customerSegments,
  customerStatuses,
  registrationChannels,
  type AdminCustomer,
  type CustomerDetailTab,
  type CustomerSegment,
  type CustomerStatus,
  type PermissionFilter,
  type RegistrationChannel,
} from "./customer-types";
import styles from "./customer-management.module.css";

type FilterValue<Value extends string> = "Tümü" | Value;
type ActiveModal =
  | { kind: "detail"; customerId: number; tab: CustomerDetailTab }
  | { kind: "segment"; customerId: number };

const pageSize = 6;
const currency = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 2,
});

function formatDate(date?: string, includeTime = false) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    ...(includeTime ? { timeStyle: "short" as const } : {}),
    timeZone: "Europe/Istanbul",
  }).format(new Date(date));
}

function todayForInput() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Istanbul",
  }).format(new Date());
}

function segmentClass(segment: CustomerSegment) {
  return {
    "Yeni Müşteri": styles.segmentYeniMüşteri,
    "Aktif Müşteri": styles.segmentAktifMüşteri,
    "Sadık Müşteri": styles.segmentSadıkMüşteri,
    "VIP Müşteri": styles.segmentVIPMüşteri,
    "Risk Altında": styles.segmentRiskAltında,
    "Pasif Müşteri": styles.segmentPasifMüşteri,
  }[segment];
}

export function CustomerManagement() {
  // Not ve segment işlemleri yalnızca mock state'i günceller; yenilemede sıfırlanmaları normaldir.
  const [customers, setCustomers] = useState<AdminCustomer[]>(mockCustomers);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState<FilterValue<CustomerSegment>>("Tümü");
  const [status, setStatus] = useState<FilterValue<CustomerStatus>>("Tümü");
  const [channel, setChannel] =
    useState<FilterValue<RegistrationChannel>>("Tümü");
  const [location, setLocation] = useState("");
  const [emailPermission, setEmailPermission] =
    useState<PermissionFilter>("Tümü");
  const [smsPermission, setSmsPermission] = useState<PermissionFilter>("Tümü");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [activeModal, setActiveModal] = useState<ActiveModal | null>(null);
  const [notice, setNotice] = useState("");
  const today = todayForInput();

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 450);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!activeModal) return;
    const adminShell =
      document.querySelector<HTMLElement>("[data-admin-shell]");
    const previousBodyOverflow = document.body.style.overflow;
    const previousShellOverflow = adminShell?.style.overflow ?? "";
    document.body.style.overflow = "hidden";
    if (adminShell) adminShell.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      if (adminShell) adminShell.style.overflow = previousShellOverflow;
    };
  }, [activeModal]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 4200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const summary = useMemo(() => {
    const now = new Date();
    const currentYear = Number(
      new Intl.DateTimeFormat("en", {
        year: "numeric",
        timeZone: "Europe/Istanbul",
      }).format(now),
    );
    const currentMonth = Number(
      new Intl.DateTimeFormat("en", {
        month: "numeric",
        timeZone: "Europe/Istanbul",
      }).format(now),
    );
    return {
      total: customers.length,
      active: customers.filter((customer) => customer.status === "Aktif")
        .length,
      newThisMonth: customers.filter((customer) => {
        const date = new Date(customer.registrationDate);
        const year = Number(
          new Intl.DateTimeFormat("en", {
            year: "numeric",
            timeZone: "Europe/Istanbul",
          }).format(date),
        );
        const month = Number(
          new Intl.DateTimeFormat("en", {
            month: "numeric",
            timeZone: "Europe/Istanbul",
          }).format(date),
        );
        return year === currentYear && month === currentMonth;
      }).length,
      repeat: customers.filter((customer) => customer.orderCount > 1).length,
      vip: customers.filter((customer) => customer.segment === "VIP Müşteri")
        .length,
    };
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("tr-TR");
    const locationQuery = location.trim().toLocaleLowerCase("tr-TR");
    return customers.filter((customer) => {
      const searchable = [
        customer.firstName,
        customer.lastName,
        `${customer.firstName} ${customer.lastName}`,
        customer.email,
        customer.phone,
        customer.customerNumber,
      ];
      const registrationDay = customer.registrationDate.slice(0, 10);
      const matchesPermission = (filter: PermissionFilter, allowed: boolean) =>
        filter === "Tümü" || (filter === "İzinli" ? allowed : !allowed);
      return (
        (!query ||
          searchable.some((value) =>
            value.toLocaleLowerCase("tr-TR").includes(query),
          )) &&
        (segment === "Tümü" || customer.segment === segment) &&
        (status === "Tümü" || customer.status === status) &&
        (channel === "Tümü" || customer.registrationChannel === channel) &&
        (!locationQuery ||
          customer.city.toLocaleLowerCase("tr-TR").includes(locationQuery) ||
          customer.country
            .toLocaleLowerCase("tr-TR")
            .includes(locationQuery)) &&
        matchesPermission(emailPermission, customer.permissions.email) &&
        matchesPermission(smsPermission, customer.permissions.sms) &&
        (!startDate || registrationDay >= startDate) &&
        (!endDate || registrationDay <= endDate)
      );
    });
  }, [
    channel,
    customers,
    emailPermission,
    endDate,
    location,
    search,
    segment,
    smsPermission,
    startDate,
    status,
  ]);

  const pageCount = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const activePage = Math.min(currentPage, pageCount);
  const pageStart = (activePage - 1) * pageSize;
  const visibleCustomers = filteredCustomers.slice(
    pageStart,
    pageStart + pageSize,
  );
  const activeCustomer = activeModal
    ? customers.find((customer) => customer.id === activeModal.customerId)
    : undefined;

  const resetPage = () => setCurrentPage(1);
  const clearFilters = () => {
    setSearch("");
    setSegment("Tümü");
    setStatus("Tümü");
    setChannel("Tümü");
    setLocation("");
    setEmailPermission("Tümü");
    setSmsPermission("Tümü");
    setStartDate("");
    setEndDate("");
    resetPage();
  };

  const handleMenuAction = (
    customer: AdminCustomer,
    action: CustomerMenuAction,
  ) => {
    setOpenMenuId(null);
    if (action.kind === "segment")
      setActiveModal({ kind: "segment", customerId: customer.id });
    else
      setActiveModal({
        kind: "detail",
        customerId: customer.id,
        tab: action.tab,
      });
  };

  const addNote = (customerId: number, text: string) => {
    const date = new Intl.DateTimeFormat("tr-TR", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Europe/Istanbul",
    }).format(new Date());
    setCustomers((current) =>
      current.map((customer) =>
        customer.id === customerId
          ? {
              ...customer,
              notes: [
                ...customer.notes,
                { id: `note-${Date.now()}`, text, adminName: "Admin", date },
              ],
            }
          : customer,
      ),
    );
    setNotice("Yönetici notu mock müşteri kaydına eklendi.");
  };

  const updateSegment = (
    customer: AdminCustomer,
    nextSegment: CustomerSegment,
    note: string,
  ) => {
    const date = new Intl.DateTimeFormat("tr-TR", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Europe/Istanbul",
    }).format(new Date());
    setCustomers((current) =>
      current.map((item) =>
        item.id === customer.id
          ? {
              ...item,
              segment: nextSegment,
              notes: note
                ? [
                    ...item.notes,
                    {
                      id: `segment-${Date.now()}`,
                      text: `Segment ${customer.segment} → ${nextSegment} olarak güncellendi. ${note}`,
                      adminName: "Admin",
                      date,
                    },
                  ]
                : item.notes,
            }
          : item,
      ),
    );
    setActiveModal(null);
    setNotice(
      `${customer.firstName} ${customer.lastName} için segment ${nextSegment} olarak güncellendi.`,
    );
  };

  if (isLoading) return <CustomerLoading />;

  const cards = [
    {
      label: "Toplam müşteri",
      value: summary.total,
      icon: "customers" as const,
      tone: styles.pink,
    },
    {
      label: "Aktif müşteriler",
      value: summary.active,
      icon: "trend" as const,
      tone: styles.green,
    },
    {
      label: "Bu ay katılan",
      value: summary.newThisMonth,
      icon: "calendar" as const,
      tone: styles.orange,
    },
    {
      label: "Tekrar alışveriş",
      value: summary.repeat,
      icon: "refresh" as const,
      tone: styles.blue,
    },
    {
      label: "VIP müşteriler",
      value: summary.vip,
      icon: "insights" as const,
      tone: styles.purple,
    },
  ];

  return (
    <div className={styles.page}>
      <p className={styles.intro}>
        B2C web sitesi, pazaryeri ve e-ihracat müşterilerini CRM görünümünde
        takip edin.
      </p>
      <section className={styles.summaryGrid} aria-label="B2C müşteri özeti">
        {cards.map((card) => (
          <article
            key={card.label}
            className={`${styles.summaryCard} ${card.tone}`}
          >
            <span className={styles.summaryIcon}>
              <Icon name={card.icon} />
            </span>
            <div>
              <p>{card.label}</p>
              <strong>{card.value}</strong>
              <small>müşteri</small>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.card} aria-labelledby="customer-list-title">
        <div className={styles.cardHeading}>
          <div>
            <h2 id="customer-list-title">B2C Müşteri Listesi</h2>
            <p>
              Segment, alışveriş davranışı ve iletişim izinlerini görüntüleyin.
            </p>
          </div>
          <span className={styles.crmBadge}>+XTRA Rewards uyumlu</span>
        </div>

        <div className={styles.filters}>
          <label className={styles.searchField}>
            <span className={styles.srOnly}>
              Ad, e-posta, telefon veya müşteri numarası ara
            </span>
            <Icon name="search" />
            <input
              type="search"
              value={search}
              placeholder="Ad, e-posta, telefon veya müşteri no ara..."
              onChange={(event) => {
                setSearch(event.target.value);
                resetPage();
              }}
            />
          </label>
          <FilterSelect
            label="Müşteri segmenti"
            value={segment}
            options={customerSegments}
            onChange={setSegment}
            resetPage={resetPage}
          />
          <FilterSelect
            label="Müşteri durumu"
            value={status}
            options={customerStatuses}
            onChange={setStatus}
            resetPage={resetPage}
          />
          <FilterSelect
            label="Kayıt kanalı"
            value={channel}
            options={registrationChannels}
            onChange={setChannel}
            resetPage={resetPage}
          />
          <label>
            <span>Ülke veya şehir</span>
            <input
              type="search"
              value={location}
              placeholder="Örn. İstanbul"
              onChange={(event) => {
                setLocation(event.target.value);
                resetPage();
              }}
            />
          </label>
          <FilterSelect
            label="E-posta izni"
            value={emailPermission}
            options={["İzinli", "İzinsiz"] as const}
            onChange={setEmailPermission}
            resetPage={resetPage}
          />
          <FilterSelect
            label="SMS izni"
            value={smsPermission}
            options={["İzinli", "İzinsiz"] as const}
            onChange={setSmsPermission}
            resetPage={resetPage}
          />
          <label>
            <span>Kayıt başlangıç tarihi</span>
            <input
              type="date"
              value={startDate}
              max={endDate || today}
              onChange={(event) => {
                setStartDate(event.target.value);
                resetPage();
              }}
            />
          </label>
          <label>
            <span>Kayıt bitiş tarihi</span>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              max={today}
              onChange={(event) => {
                setEndDate(event.target.value);
                resetPage();
              }}
            />
          </label>
          <button
            type="button"
            className={styles.clearButton}
            onClick={clearFilters}
          >
            Tüm Filtreleri Temizle
          </button>
        </div>

        <div className={styles.resultLine}>
          {customers.length} müşteriden {filteredCustomers.length} tanesi
          eşleşiyor
        </div>
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Müşteri no</th>
                <th>Ad soyad</th>
                <th>İletişim</th>
                <th>Segment</th>
                <th>Kayıt kanalı</th>
                <th>Şehir / ülke</th>
                <th>Sipariş</th>
                <th>Toplam harcama</th>
                <th>Son sipariş</th>
                <th>İletişim izinleri</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {visibleCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <strong className={styles.customerNumber}>
                      {customer.customerNumber}
                    </strong>
                  </td>
                  <td>
                    <div className={styles.nameCell}>
                      <strong>
                        {customer.firstName} {customer.lastName}
                      </strong>
                      <small>
                        {formatDate(customer.registrationDate)} tarihinde
                        katıldı
                      </small>
                    </div>
                  </td>
                  <td>
                    <div className={styles.contactCell}>
                      <span>{customer.email}</span>
                      <small>{customer.phone}</small>
                    </div>
                  </td>
                  <td>
                    <span className={segmentClass(customer.segment)}>
                      {customer.segment}
                    </span>
                  </td>
                  <td>
                    <span className={styles.channelBadge}>
                      {customer.registrationChannel}
                    </span>
                  </td>
                  <td>
                    {customer.city}, {customer.country}
                  </td>
                  <td className={styles.orderCount}>{customer.orderCount}</td>
                  <td className={styles.amount}>
                    {currency.format(customer.totalSpend)}
                  </td>
                  <td className={styles.dateCell}>
                    {formatDate(customer.lastOrderDate)}
                  </td>
                  <td>
                    <div className={styles.permissionCell}>
                      <span
                        className={
                          customer.permissions.email
                            ? styles.allowed
                            : styles.denied
                        }
                      >
                        E-posta
                      </span>
                      <span
                        className={
                          customer.permissions.sms
                            ? styles.allowed
                            : styles.denied
                        }
                      >
                        SMS
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={
                        customer.status === "Aktif"
                          ? styles.statusActive
                          : styles.statusPassive
                      }
                    >
                      {customer.status}
                    </span>
                  </td>
                  <td>
                    <CustomerActionsMenu
                      customer={customer}
                      isOpen={openMenuId === customer.id}
                      onToggle={setOpenMenuId}
                      onAction={handleMenuAction}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCustomers.length === 0 && (
            <div className={styles.emptyState}>
              <span>
                <Icon name="search" />
              </span>
              <h3>Müşteri bulunamadı</h3>
              <p>
                Arama ifadenizi veya filtrelerinizi değiştirerek tekrar deneyin.
              </p>
              <button type="button" onClick={clearFilters}>
                Tüm Filtreleri Temizle
              </button>
            </div>
          )}
        </div>

        {filteredCustomers.length > 0 && (
          <nav className={styles.pagination} aria-label="B2C müşteri sayfaları">
            <span>
              {pageStart + 1}–
              {Math.min(pageStart + pageSize, filteredCustomers.length)} /{" "}
              {filteredCustomers.length} müşteri
            </span>
            <div>
              <button
                type="button"
                aria-label="Önceki sayfa"
                disabled={activePage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                <Icon name="chevron" />
              </button>
              <strong>{activePage}</strong>
              <span>/ {pageCount}</span>
              <button
                type="button"
                aria-label="Sonraki sayfa"
                disabled={activePage === pageCount}
                onClick={() =>
                  setCurrentPage((page) => Math.min(pageCount, page + 1))
                }
              >
                <Icon name="chevron" />
              </button>
            </div>
          </nav>
        )}
      </section>

      {notice && (
        <div className={styles.toast} role="status">
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

      {activeModal?.kind === "detail" && activeCustomer && (
        <CustomerDetailModal
          customer={activeCustomer}
          initialTab={activeModal.tab}
          onClose={() => setActiveModal(null)}
          onAddNote={(text) => addNote(activeCustomer.id, text)}
        />
      )}
      {activeModal?.kind === "segment" && activeCustomer && (
        <CustomerSegmentModal
          customer={activeCustomer}
          onClose={() => setActiveModal(null)}
          onConfirm={(nextSegment, note) =>
            updateSegment(activeCustomer, nextSegment, note)
          }
        />
      )}
    </div>
  );
}

type FilterSelectProps<Value extends string> = {
  label: string;
  value: FilterValue<Value>;
  options: readonly Value[];
  onChange: (value: FilterValue<Value>) => void;
  resetPage: () => void;
};

function FilterSelect<Value extends string>({
  label,
  value,
  options,
  onChange,
  resetPage,
}: FilterSelectProps<Value>) {
  return (
    <label>
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => {
          onChange(event.target.value as FilterValue<Value>);
          resetPage();
        }}
      >
        <option>Tümü</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function CustomerLoading() {
  return (
    <div
      className={styles.page}
      aria-busy="true"
      aria-label="B2C müşteriler yükleniyor"
    >
      <div className={styles.loadingIntro} />
      <div className={styles.loadingSummary}>
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className={styles.skeletonCard} />
        ))}
      </div>
      <div className={styles.loadingTable}>
        <div className={styles.loadingHeading} />
        <div className={styles.loadingFilters} />
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className={styles.loadingRow} />
        ))}
      </div>
      <span className={styles.srOnly}>Müşteri verileri yükleniyor…</span>
    </div>
  );
}
