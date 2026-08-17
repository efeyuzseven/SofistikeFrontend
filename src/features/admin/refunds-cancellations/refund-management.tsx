"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "../admin-icons";
import { mockPayments } from "../payments/payment-data";
import { PaymentDetailModal } from "../payments/payment-detail-modal";
import { mockRefundRequests } from "./refund-data";
import {
  RefundActionsMenu,
  type RefundMenuAction,
} from "./refund-actions-menu";
import { RefundDetailModal } from "./refund-detail-modal";
import { ReviewConfirmationModal } from "./review-confirmation-modal";
import {
  refundReasons,
  refundRequestStatuses,
  refundRequestTypes,
  type AdminRefundRequest,
  type RefundReason,
  type RefundRequestStatus,
  type RefundRequestType,
  type RefundTab,
  type ReviewDecision,
} from "./refund-types";
import type {
  PaymentCustomerType,
  PaymentModalView,
  PaymentSalesChannel,
} from "../payments/payment-types";
import { customerTypes, salesChannels } from "../payments/payment-types";
import styles from "./refund-management.module.css";

type FilterValue<Value extends string> = "Tümü" | Value;
type ActiveModal =
  | { kind: "request"; requestId: number }
  | { kind: "payment"; requestId: number; view: PaymentModalView }
  | { kind: "review"; requestId: number; decision: ReviewDecision };
type Notice = { tone: "success" | "error"; message: string };

const pageSize = 6;
const approvedRefundStatuses: RefundRequestStatus[] = [
  "Onaylandı",
  "İade İşleniyor",
];
const approvedCancellationStatuses: RefundRequestStatus[] = [
  ...approvedRefundStatuses,
  "Tamamlandı",
];

function formatMoney(value: number, currency = "TRY") {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Istanbul",
  }).format(new Date(date));
}

function todayForInput() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Istanbul",
  }).format(new Date());
}

function statusClass(status: RefundRequestStatus) {
  return {
    İnceleniyor: styles.statusİnceleniyor,
    Onaylandı: styles.statusOnaylandı,
    Reddedildi: styles.statusReddedildi,
    "İade İşleniyor": styles.statusİadeİşleniyor,
    Tamamlandı: styles.statusTamamlandı,
  }[status];
}

export function RefundManagement() {
  // Bu ekran yalnızca mock state kullanır; yenileme sonrası değişikliklerin sıfırlanması normaldir.
  const [requests, setRequests] =
    useState<AdminRefundRequest[]>(mockRefundRequests);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<RefundTab>("all");
  const [search, setSearch] = useState("");
  const [requestType, setRequestType] =
    useState<FilterValue<RefundRequestType>>("Tümü");
  const [requestStatus, setRequestStatus] =
    useState<FilterValue<RefundRequestStatus>>("Tümü");
  const [customerType, setCustomerType] =
    useState<FilterValue<PaymentCustomerType>>("Tümü");
  const [salesChannel, setSalesChannel] =
    useState<FilterValue<PaymentSalesChannel>>("Tümü");
  const [reason, setReason] = useState<FilterValue<RefundReason>>("Tümü");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [activeModal, setActiveModal] = useState<ActiveModal | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
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
    const timer = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const summary = useMemo(() => {
    const pending = requests.filter(
      (request) => request.status === "İnceleniyor",
    );
    const approvedRefunds = requests.filter(
      (request) =>
        request.requestType !== "Sipariş iptali" &&
        approvedRefundStatuses.includes(request.status),
    );
    const approvedCancellations = requests.filter(
      (request) =>
        request.requestType === "Sipariş iptali" &&
        approvedCancellationStatuses.includes(request.status),
    );
    const completedRefunds = requests.filter(
      (request) =>
        request.requestType !== "Sipariş iptali" &&
        request.status === "Tamamlandı",
    );
    const rejected = requests.filter(
      (request) => request.status === "Reddedildi",
    );
    const sum = (items: AdminRefundRequest[]) =>
      items.reduce((total, request) => total + request.requestedAmountTry, 0);
    return {
      pending: { count: pending.length, amount: sum(pending) },
      approvedRefunds: {
        count: approvedRefunds.length,
        amount: sum(approvedRefunds),
      },
      approvedCancellations: {
        count: approvedCancellations.length,
        amount: sum(approvedCancellations),
      },
      rejected: { count: rejected.length, amount: sum(rejected) },
      refunded: {
        count: completedRefunds.length,
        amount: sum(completedRefunds),
      },
    };
  }, [requests]);

  const tabCounts = useMemo(
    () => ({
      all: requests.length,
      refunds: requests.filter(
        (request) => request.requestType !== "Sipariş iptali",
      ).length,
      cancellations: requests.filter(
        (request) => request.requestType === "Sipariş iptali",
      ).length,
    }),
    [requests],
  );

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("tr-TR");
    return requests.filter((request) => {
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "refunds" && request.requestType !== "Sipariş iptali") ||
        (activeTab === "cancellations" &&
          request.requestType === "Sipariş iptali");
      const searchable = [
        request.requestNumber,
        request.orderNumber,
        request.transactionNumber,
        request.customerName,
        request.companyName ?? "",
      ];
      const requestDay = request.requestDate.slice(0, 10);
      return (
        matchesTab &&
        (!query ||
          searchable.some((value) =>
            value.toLocaleLowerCase("tr-TR").includes(query),
          )) &&
        (requestType === "Tümü" || request.requestType === requestType) &&
        (requestStatus === "Tümü" || request.status === requestStatus) &&
        (customerType === "Tümü" || request.customerType === customerType) &&
        (salesChannel === "Tümü" || request.salesChannel === salesChannel) &&
        (reason === "Tümü" || request.reason === reason) &&
        (!startDate || requestDay >= startDate) &&
        (!endDate || requestDay <= endDate)
      );
    });
  }, [
    activeTab,
    customerType,
    endDate,
    reason,
    requestStatus,
    requestType,
    requests,
    salesChannel,
    search,
    startDate,
  ]);

  const pageCount = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
  const activePage = Math.min(currentPage, pageCount);
  const pageStart = (activePage - 1) * pageSize;
  const visibleRequests = filteredRequests.slice(
    pageStart,
    pageStart + pageSize,
  );
  const activeRequest = activeModal
    ? requests.find((request) => request.id === activeModal.requestId)
    : undefined;
  const activePayment = activeRequest
    ? mockPayments.find((payment) => payment.id === activeRequest.paymentId)
    : undefined;

  const resetPage = () => setCurrentPage(1);
  const clearFilters = () => {
    setSearch("");
    setRequestType("Tümü");
    setRequestStatus("Tümü");
    setCustomerType("Tümü");
    setSalesChannel("Tümü");
    setReason("Tümü");
    setStartDate("");
    setEndDate("");
    setActiveTab("all");
    resetPage();
  };

  const handleMenuAction = (
    request: AdminRefundRequest,
    action: RefundMenuAction,
  ) => {
    setOpenMenuId(null);
    if (action === "payment" || action === "order") {
      setActiveModal({ kind: "payment", requestId: request.id, view: action });
      return;
    }
    setActiveModal({ kind: "request", requestId: request.id });
  };

  const completeReview = (note: string) => {
    if (!activeRequest || activeModal?.kind !== "review") return;
    const decision = activeModal.decision;
    if (
      decision === "approve" &&
      activeRequest.requestType === "Kısmi iade" &&
      activeRequest.requestedAmount > activeRequest.orderAmount
    ) {
      setNotice({
        tone: "error",
        message: "Kısmi iade tutarı sipariş toplamını aşamaz.",
      });
      return;
    }
    const nextStatus: RefundRequestStatus =
      decision === "approve" ? "Onaylandı" : "Reddedildi";
    const timelineDate = new Intl.DateTimeFormat("tr-TR", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Europe/Istanbul",
    }).format(new Date());
    setRequests((current) =>
      current.map((request) =>
        request.id === activeRequest.id
          ? {
              ...request,
              status: nextStatus,
              adminNote:
                note ||
                (decision === "approve"
                  ? "Talep mock ortamda onaylandı."
                  : request.adminNote),
              timeline: [
                ...request.timeline,
                {
                  title:
                    decision === "approve"
                      ? "Talep onaylandı"
                      : "Talep reddedildi",
                  description:
                    "Yalnızca frontend mock kaydı güncellendi; finansal veya operasyonel işlem yapılmadı.",
                  date: timelineDate,
                },
              ],
            }
          : request,
      ),
    );
    setActiveModal(null);
    setOpenMenuId(null);
    setNotice({
      tone: "success",
      message: `${activeRequest.requestNumber} talebi ${decision === "approve" ? "onaylandı" : "reddedildi"}. Mock kayıtlar güncellendi.`,
    });
  };

  if (isLoading) return <RefundLoading />;

  const cards = [
    {
      label: "Bekleyen talepler",
      ...summary.pending,
      icon: "calendar" as const,
      tone: styles.orange,
    },
    {
      label: "Onaylanan iadeler",
      ...summary.approvedRefunds,
      icon: "returns" as const,
      tone: styles.green,
    },
    {
      label: "Onaylanan iptaller",
      ...summary.approvedCancellations,
      icon: "orders" as const,
      tone: styles.blue,
    },
    {
      label: "Reddedilen talepler",
      ...summary.rejected,
      icon: "alert" as const,
      tone: styles.red,
    },
    {
      label: "Toplam iade tutarı",
      ...summary.refunded,
      icon: "payments" as const,
      tone: styles.purple,
    },
  ];

  return (
    <div className={styles.page}>
      <p className={styles.intro}>
        B2C, B2B, pazaryeri ve e-ihracat iade/iptal taleplerini tek ekrandan
        takip edin.
      </p>
      <section className={styles.summaryGrid} aria-label="İade ve iptal özeti">
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
              <strong>{formatMoney(card.amount)}</strong>
              <small>{card.count} talep</small>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.card} aria-labelledby="refund-list-title">
        <div className={styles.cardHeading}>
          <div>
            <h2 id="refund-list-title">İade ve İptal Talepleri</h2>
            <p>
              Talep durumlarını, tutarları ve geçmiş değerlendirmeleri
              görüntüleyin.
            </p>
          </div>
          <span className={styles.mockBadge}>Frontend mock akışı</span>
        </div>

        <div
          className={styles.tabs}
          role="tablist"
          aria-label="Talep türü sekmeleri"
        >
          {(
            [
              ["all", "Tüm Talepler", tabCounts.all],
              ["refunds", "İade Talepleri", tabCounts.refunds],
              ["cancellations", "İptal Talepleri", tabCounts.cancellations],
            ] as const
          ).map(([tab, label, count]) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              className={activeTab === tab ? styles.activeTab : ""}
              onClick={() => {
                setActiveTab(tab);
                resetPage();
              }}
            >
              {label}
              <span>{count}</span>
            </button>
          ))}
        </div>

        <div className={styles.filters}>
          <label className={styles.searchField}>
            <span className={styles.srOnly}>
              Talep, sipariş, işlem, müşteri veya şirket ara
            </span>
            <Icon name="search" />
            <input
              type="search"
              value={search}
              placeholder="Talep, sipariş, işlem, müşteri veya şirket ara..."
              onChange={(event) => {
                setSearch(event.target.value);
                resetPage();
              }}
            />
          </label>
          <FilterSelect
            label="Talep türü"
            value={requestType}
            options={refundRequestTypes}
            onChange={setRequestType}
            resetPage={resetPage}
          />
          <FilterSelect
            label="Talep durumu"
            value={requestStatus}
            options={refundRequestStatuses}
            onChange={setRequestStatus}
            resetPage={resetPage}
          />
          <FilterSelect
            label="Müşteri tipi"
            value={customerType}
            options={customerTypes}
            onChange={setCustomerType}
            resetPage={resetPage}
          />
          <FilterSelect
            label="Satış kanalı"
            value={salesChannel}
            options={salesChannels}
            onChange={setSalesChannel}
            resetPage={resetPage}
          />
          <FilterSelect
            label="Talep nedeni"
            value={reason}
            options={refundReasons}
            onChange={setReason}
            resetPage={resetPage}
          />
          <label>
            <span>Başlangıç tarihi</span>
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
            <span>Bitiş tarihi</span>
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
          {requests.length} talepten {filteredRequests.length} tanesi eşleşiyor
        </div>
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Talep no</th>
                <th>Sipariş no</th>
                <th>Müşteri / şirket</th>
                <th>Tip</th>
                <th>Talep türü</th>
                <th>Talep nedeni</th>
                <th>Talep tarihi</th>
                <th>Sipariş tutarı</th>
                <th>İade tutarı</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {visibleRequests.map((request) => (
                <tr key={request.id}>
                  <td>
                    <strong className={styles.requestNumber}>
                      {request.requestNumber}
                    </strong>
                  </td>
                  <td>
                    <code>{request.orderNumber}</code>
                  </td>
                  <td>
                    <div className={styles.customerName}>
                      <strong>
                        {request.companyName ?? request.customerName}
                      </strong>
                      {request.companyName && (
                        <small>{request.customerName}</small>
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      className={
                        request.customerType === "B2B"
                          ? styles.typeB2B
                          : styles.typeB2C
                      }
                    >
                      {request.customerType}
                    </span>
                  </td>
                  <td>
                    <span className={styles.requestTypeBadge}>
                      {request.requestType}
                    </span>
                  </td>
                  <td>{request.reason}</td>
                  <td className={styles.dateCell}>
                    {formatDate(request.requestDate)}
                  </td>
                  <td className={styles.amount}>
                    {formatMoney(request.orderAmount, request.currency)}
                  </td>
                  <td className={styles.refundAmount}>
                    {formatMoney(request.requestedAmount, request.currency)}
                  </td>
                  <td>
                    <span className={statusClass(request.status)}>
                      {request.status}
                    </span>
                  </td>
                  <td>
                    <RefundActionsMenu
                      request={request}
                      isOpen={openMenuId === request.id}
                      onToggle={setOpenMenuId}
                      onAction={handleMenuAction}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRequests.length === 0 && (
            <div className={styles.emptyState}>
              <span>
                <Icon name="search" />
              </span>
              <h3>Talep bulunamadı</h3>
              <p>
                Arama ifadenizi veya filtrelerinizi değiştirerek tekrar deneyin.
              </p>
              <button type="button" onClick={clearFilters}>
                Tüm Filtreleri Temizle
              </button>
            </div>
          )}
        </div>

        {filteredRequests.length > 0 && (
          <nav
            className={styles.pagination}
            aria-label="İade ve iptal talepleri sayfaları"
          >
            <span>
              {pageStart + 1}–
              {Math.min(pageStart + pageSize, filteredRequests.length)} /{" "}
              {filteredRequests.length} talep
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
        <div
          className={`${styles.toast} ${notice.tone === "error" ? styles.toastError : ""}`}
          role={notice.tone === "error" ? "alert" : "status"}
        >
          <span>{notice.message}</span>
          <button
            type="button"
            aria-label="Bildirimi kapat"
            onClick={() => setNotice(null)}
          >
            ×
          </button>
        </div>
      )}

      {activeModal?.kind === "request" && activeRequest && (
        <RefundDetailModal
          request={activeRequest}
          onClose={() => setActiveModal(null)}
          onReview={(decision) =>
            setActiveModal({
              kind: "review",
              requestId: activeRequest.id,
              decision,
            })
          }
        />
      )}
      {activeModal?.kind === "review" && activeRequest && (
        <ReviewConfirmationModal
          request={activeRequest}
          decision={activeModal.decision}
          onClose={() =>
            setActiveModal({ kind: "request", requestId: activeRequest.id })
          }
          onConfirm={completeReview}
        />
      )}
      {activeModal?.kind === "payment" && activePayment && (
        <PaymentDetailModal
          payment={activePayment}
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

function RefundLoading() {
  return (
    <div
      className={styles.page}
      aria-busy="true"
      aria-label="İade ve iptal talepleri yükleniyor"
    >
      <div className={styles.loadingIntro} />
      <div className={styles.loadingSummary}>
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className={styles.skeletonCard} />
        ))}
      </div>
      <div className={styles.loadingTable}>
        <div className={styles.loadingHeading} />
        <div className={styles.loadingTabs} />
        <div className={styles.loadingFilters} />
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className={styles.loadingRow} />
        ))}
      </div>
      <span className={styles.srOnly}>Talep verileri yükleniyor…</span>
    </div>
  );
}
