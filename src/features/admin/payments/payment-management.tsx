"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "../admin-icons";
import { PaymentActionsMenu } from "./payment-actions-menu";
import { mockPayments } from "./payment-data";
import { PaymentDetailModal } from "./payment-detail-modal";
import {
  customerTypes,
  invoiceStatuses,
  paymentCurrencies,
  paymentMethods,
  paymentStatuses,
  salesChannels,
  type AdminPayment,
  type InvoiceStatus,
  type PaymentCurrency,
  type PaymentCustomerType,
  type PaymentMethod,
  type PaymentModalView,
  type PaymentSalesChannel,
  type PaymentStatus,
} from "./payment-types";
import styles from "./payment-management.module.css";

type FilterValue<Value extends string> = "Tümü" | Value;
type ActiveModal = {
  payment: AdminPayment;
  view: PaymentModalView;
};

const pageSize = 6;

function formatMoney(value: number, currency: PaymentCurrency = "TRY") {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

function paymentStatusClass(status: PaymentStatus) {
  return {
    Başarılı: styles.statusSuccessful,
    Bekliyor: styles.statusPending,
    Başarısız: styles.statusFailed,
    "İade Edildi": styles.statusRefunded,
    "Kısmi İade": styles.statusPartialRefund,
  }[status];
}

function invoiceStatusClass(status: InvoiceStatus) {
  return {
    "Fatura Oluşturuldu": styles.invoiceCreated,
    "Fatura Bekliyor": styles.invoicePending,
    "Fatura Hatası": styles.invoiceFailed,
    "Fatura Gerekmiyor": styles.invoiceNotRequired,
  }[status];
}

export function PaymentManagement() {
  // Bu state yalnızca mock veriyi kullanır; sayfa yenilendiğinde sıfırlanması normaldir.
  const [payments] = useState<AdminPayment[]>(mockPayments);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [paymentStatus, setPaymentStatus] =
    useState<FilterValue<PaymentStatus>>("Tümü");
  const [paymentMethod, setPaymentMethod] =
    useState<FilterValue<PaymentMethod>>("Tümü");
  const [customerType, setCustomerType] =
    useState<FilterValue<PaymentCustomerType>>("Tümü");
  const [salesChannel, setSalesChannel] =
    useState<FilterValue<PaymentSalesChannel>>("Tümü");
  const [invoiceStatus, setInvoiceStatus] =
    useState<FilterValue<InvoiceStatus>>("Tümü");
  const [currency, setCurrency] =
    useState<FilterValue<PaymentCurrency>>("Tümü");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [activeModal, setActiveModal] = useState<ActiveModal | null>(null);

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

  const summary = useMemo(() => {
    const collected = payments.filter((payment) =>
      ["Başarılı", "İade Edildi", "Kısmi İade"].includes(payment.paymentStatus),
    );
    const successful = payments.filter(
      (payment) => payment.paymentStatus === "Başarılı",
    );
    const pending = payments.filter(
      (payment) => payment.paymentStatus === "Bekliyor",
    );
    const failed = payments.filter(
      (payment) => payment.paymentStatus === "Başarısız",
    );
    const refunded = payments.filter(
      (payment) => (payment.refundReportingAmountTry ?? 0) > 0,
    );
    const refundedTotal = refunded.reduce(
      (total, payment) => total + (payment.refundReportingAmountTry ?? 0),
      0,
    );

    return {
      collected: {
        count: collected.length,
        amount:
          collected.reduce(
            (total, payment) => total + payment.reportingAmountTry,
            0,
          ) - refundedTotal,
      },
      successful: {
        count: successful.length,
        amount: successful.reduce(
          (total, payment) => total + payment.reportingAmountTry,
          0,
        ),
      },
      pending: {
        count: pending.length,
        amount: pending.reduce(
          (total, payment) => total + payment.reportingAmountTry,
          0,
        ),
      },
      failed: {
        count: failed.length,
        amount: failed.reduce(
          (total, payment) => total + payment.reportingAmountTry,
          0,
        ),
      },
      refunded: { count: refunded.length, amount: refundedTotal },
    };
  }, [payments]);

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("tr-TR");
    return payments.filter((payment) => {
      const searchableValues = [
        payment.transactionNumber,
        payment.orderNumber,
        payment.customerName,
        payment.companyName ?? "",
      ];
      const paymentDay = payment.paymentDate.slice(0, 10);
      return (
        (!query ||
          searchableValues.some((value) =>
            value.toLocaleLowerCase("tr-TR").includes(query),
          )) &&
        (paymentStatus === "Tümü" || payment.paymentStatus === paymentStatus) &&
        (paymentMethod === "Tümü" || payment.paymentMethod === paymentMethod) &&
        (customerType === "Tümü" || payment.customerType === customerType) &&
        (salesChannel === "Tümü" || payment.salesChannel === salesChannel) &&
        (invoiceStatus === "Tümü" || payment.invoiceStatus === invoiceStatus) &&
        (currency === "Tümü" || payment.currency === currency) &&
        (!startDate || paymentDay >= startDate) &&
        (!endDate || paymentDay <= endDate)
      );
    });
  }, [
    currency,
    customerType,
    endDate,
    invoiceStatus,
    paymentMethod,
    payments,
    paymentStatus,
    salesChannel,
    search,
    startDate,
  ]);

  const pageCount = Math.max(1, Math.ceil(filteredPayments.length / pageSize));
  const activePage = Math.min(currentPage, pageCount);
  const pageStart = (activePage - 1) * pageSize;
  const visiblePayments = filteredPayments.slice(
    pageStart,
    pageStart + pageSize,
  );

  const summaryCards = [
    {
      label: "Toplam tahsilat",
      ...summary.collected,
      icon: "payments" as const,
      tone: "pink",
    },
    {
      label: "Başarılı ödemeler",
      ...summary.successful,
      icon: "trend" as const,
      tone: "green",
    },
    {
      label: "Bekleyen ödemeler",
      ...summary.pending,
      icon: "calendar" as const,
      tone: "orange",
    },
    {
      label: "Başarısız ödemeler",
      ...summary.failed,
      icon: "alert" as const,
      tone: "red",
    },
    {
      label: "Toplam iade",
      ...summary.refunded,
      icon: "returns" as const,
      tone: "purple",
    },
  ];

  const resetPage = () => setCurrentPage(1);
  const clearFilters = () => {
    setSearch("");
    setPaymentStatus("Tümü");
    setPaymentMethod("Tümü");
    setCustomerType("Tümü");
    setSalesChannel("Tümü");
    setInvoiceStatus("Tümü");
    setCurrency("Tümü");
    setStartDate("");
    setEndDate("");
    resetPage();
  };

  const openModal = (payment: AdminPayment, view: PaymentModalView) => {
    setOpenMenuId(null);
    setActiveModal({ payment, view });
  };

  if (isLoading) {
    return <PaymentLoading />;
  }

  return (
    <div className={styles.page}>
      <p className={styles.intro}>
        B2C, B2B, pazaryeri ve e-ihracat tahsilatlarını tek ekrandan izleyin.
      </p>

      <section className={styles.summaryGrid} aria-label="Ödeme özeti">
        {summaryCards.map((card) => (
          <article
            key={card.label}
            className={`${styles.summaryCard} ${styles[card.tone]}`}
          >
            <span className={styles.summaryIcon}>
              <Icon name={card.icon} />
            </span>
            <div>
              <p>{card.label}</p>
              <strong>{formatMoney(card.amount)}</strong>
              <small>{card.count} işlem</small>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.card} aria-labelledby="payment-list-title">
        <div className={styles.cardHeading}>
          <div>
            <h2 id="payment-list-title">Ödeme İşlemleri</h2>
            <p>
              Tahsilat, fatura, satış kanalı ve lokasyon bilgilerini
              görüntüleyin.
            </p>
          </div>
          <span className={styles.providerBadge}>
            Sağlayıcı bağımsız altyapı
          </span>
        </div>

        <div className={styles.filters}>
          <label className={styles.searchField}>
            <span className={styles.srOnly}>
              Sipariş, işlem, müşteri veya şirket ara
            </span>
            <Icon name="search" />
            <input
              type="search"
              value={search}
              placeholder="Sipariş, işlem, müşteri veya şirket ara..."
              onChange={(event) => {
                setSearch(event.target.value);
                resetPage();
              }}
            />
          </label>
          <FilterSelect
            label="Ödeme durumu"
            value={paymentStatus}
            options={paymentStatuses}
            onChange={(value) => setPaymentStatus(value)}
            resetPage={resetPage}
          />
          <FilterSelect
            label="Ödeme yöntemi"
            value={paymentMethod}
            options={paymentMethods}
            onChange={(value) => setPaymentMethod(value)}
            resetPage={resetPage}
          />
          <FilterSelect
            label="Müşteri tipi"
            value={customerType}
            options={customerTypes}
            onChange={(value) => setCustomerType(value)}
            resetPage={resetPage}
          />
          <FilterSelect
            label="Satış kanalı"
            value={salesChannel}
            options={salesChannels}
            onChange={(value) => setSalesChannel(value)}
            resetPage={resetPage}
          />
          <FilterSelect
            label="Fatura durumu"
            value={invoiceStatus}
            options={invoiceStatuses}
            onChange={(value) => setInvoiceStatus(value)}
            resetPage={resetPage}
          />
          <FilterSelect
            label="Para birimi"
            value={currency}
            options={paymentCurrencies}
            onChange={(value) => setCurrency(value)}
            resetPage={resetPage}
          />
          <label>
            <span>Başlangıç tarihi</span>
            <input
              type="date"
              value={startDate}
              max={endDate || "2026-08-11"}
              onChange={(event) => {
                setStartDate(event.target.value);
                resetPage();
              }}
            />
          </label>
          <label>
            <span>Bitiş tarihi</span>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              max="2026-08-11"
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
          {payments.length} işlemden {filteredPayments.length} tanesi eşleşiyor
        </div>

        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>İşlem no</th>
                <th>Sipariş no</th>
                <th>Müşteri / şirket</th>
                <th>Tip</th>
                <th>Satış kanalı</th>
                <th>Ödeme tarihi</th>
                <th>Ödeme yöntemi</th>
                <th>PB</th>
                <th>Ödenen tutar</th>
                <th>Ödeme durumu</th>
                <th>Fatura durumu</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {visiblePayments.map((payment) => (
                <tr key={payment.id}>
                  <td>
                    <strong className={styles.transactionNumber}>
                      {payment.transactionNumber}
                    </strong>
                  </td>
                  <td>
                    <code>{payment.orderNumber}</code>
                  </td>
                  <td>
                    <div className={styles.customerName}>
                      <strong>
                        {payment.companyName ?? payment.customerName}
                      </strong>
                      {payment.companyName && (
                        <small>{payment.customerName}</small>
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      className={
                        payment.customerType === "B2B"
                          ? styles.typeB2B
                          : styles.typeB2C
                      }
                    >
                      {payment.customerType}
                    </span>
                  </td>
                  <td>
                    <div className={styles.channelCell}>
                      <strong>{payment.salesChannel}</strong>
                      <small>{payment.salesLocation}</small>
                    </div>
                  </td>
                  <td className={styles.dateCell}>
                    {payment.paymentDateLabel}
                  </td>
                  <td>{payment.paymentMethod}</td>
                  <td>
                    <span className={styles.currencyBadge}>
                      {payment.currency}
                    </span>
                  </td>
                  <td className={styles.amount}>
                    {formatMoney(payment.amount, payment.currency)}
                  </td>
                  <td>
                    <span className={paymentStatusClass(payment.paymentStatus)}>
                      {payment.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span className={invoiceStatusClass(payment.invoiceStatus)}>
                      {payment.invoiceStatus}
                    </span>
                  </td>
                  <td>
                    <PaymentActionsMenu
                      payment={payment}
                      isOpen={openMenuId === payment.id}
                      onToggle={setOpenMenuId}
                      onAction={openModal}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPayments.length === 0 && (
            <div className={styles.emptyState}>
              <span>
                <Icon name="search" />
              </span>
              <h3>Ödeme işlemi bulunamadı</h3>
              <p>
                Arama ifadenizi veya filtrelerinizi değiştirerek tekrar deneyin.
              </p>
              <button type="button" onClick={clearFilters}>
                Tüm Filtreleri Temizle
              </button>
            </div>
          )}
        </div>

        {filteredPayments.length > 0 && (
          <nav
            className={styles.pagination}
            aria-label="Ödeme işlemleri sayfaları"
          >
            <span>
              {pageStart + 1}–
              {Math.min(pageStart + pageSize, filteredPayments.length)} /{" "}
              {filteredPayments.length} işlem
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

      {activeModal && (
        <PaymentDetailModal
          payment={activeModal.payment}
          view={activeModal.view}
          onClose={() => setActiveModal(null)}
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

function PaymentLoading() {
  return (
    <div
      className={styles.page}
      aria-busy="true"
      aria-label="Ödemeler yükleniyor"
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
      <span className={styles.srOnly}>Ödeme verileri yükleniyor…</span>
    </div>
  );
}
