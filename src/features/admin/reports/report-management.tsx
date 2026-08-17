"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "../admin-icons";
import baseStyles from "../customers/customer-management.module.css";
import { reportDefinitions } from "./report-data";
import { ReportExportMenu } from "./report-export-menu";
import styles from "./report-management.module.css";
import {
  currencies,
  customerTypes,
  orderStatuses,
  paymentStatuses,
  productCategories,
  reportChannels,
  reportPeriods,
  reportTypes,
  type ReportColumn,
  type ReportFilters,
  type ReportKpi,
  type ReportPeriod,
  type ReportRow,
  type ReportType,
  type SortDirection,
  type TrendImpact,
} from "./report-types";

const pageSize = 5;
const initialFilters: ReportFilters = {
  period: "Son 30 Gün",
  compare: true,
  channel: "Tümü",
  customerType: "Tümü",
  category: "Tümü",
  orderStatus: "Tümü",
  paymentStatus: "Tümü",
  currency: "Tümü",
  location: "",
  startDate: "",
  endDate: "",
};
const money = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const number = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 });
function nowText() {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "long",
    timeStyle: "medium",
    timeZone: "Europe/Istanbul",
  }).format(new Date());
}
function todayInput() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Istanbul",
  }).format(new Date());
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}
function sum(rows: ReportRow[], key: string) {
  return rows.reduce(
    (total, row) =>
      total + (typeof row.values[key] === "number" ? row.values[key] : 0),
    0,
  );
}
function average(rows: ReportRow[], key: string) {
  return rows.length ? sum(rows, key) / rows.length : 0;
}
function kpi(
  label: string,
  raw: number,
  unit: string,
  impact: TrendImpact,
  compare: boolean,
  options: { currency?: boolean; percent?: boolean; change?: number } = {},
): ReportKpi {
  const change = options.change ?? 8.4;
  const value = options.currency
    ? money.format(raw)
    : options.percent
      ? `%${number.format(raw)}`
      : number.format(raw);
  const previousRaw = raw / (1 + change / 100);
  const previous = options.currency
    ? money.format(previousRaw)
    : options.percent
      ? `%${number.format(previousRaw)}`
      : number.format(previousRaw);
  return {
    label,
    value,
    unit,
    impact,
    previous: compare ? previous : undefined,
    change: compare ? change : undefined,
  };
}
function textKpi(label: string, value: string, unit: string): ReportKpi {
  return { label, value, unit, impact: "neutral" };
}

function buildKpis(
  type: ReportType,
  rows: ReportRow[],
  compare: boolean,
): ReportKpi[] {
  const gross = sum(rows, "gross");
  const net = sum(rows, "net");
  const orderCount = sum(rows, "orders");
  switch (type) {
    case "Satış Raporu":
      return [
        kpi("Net satış", net, "tahsil edilen satış", "positive", compare, {
          currency: true,
          change: 12.6,
        }),
        kpi("Brüt satış", gross, "indirim öncesi", "positive", compare, {
          currency: true,
          change: 10.8,
        }),
        kpi("Sipariş sayısı", orderCount, "sipariş", "positive", compare),
        kpi(
          "Ortalama sepet tutarı",
          orderCount ? net / orderCount : 0,
          "sipariş başına",
          "positive",
          compare,
          { currency: true },
        ),
        kpi(
          "İndirim toplamı",
          sum(rows, "discount"),
          "uygulanan indirim",
          "neutral",
          compare,
          { currency: true, change: 4.2 },
        ),
      ];
    case "Sipariş Raporu": {
      const completed = rows.filter(
        (row) => row.values.status === "Teslim Edildi",
      ).length;
      const cancelled = rows.filter(
        (row) => row.values.status === "İptal Edildi",
      ).length;
      return [
        kpi("Toplam sipariş", rows.length, "sipariş", "positive", compare),
        kpi("Tamamlanan", completed, "teslim edildi", "positive", compare),
        kpi("İptal edilen", cancelled, "iptal", "negative", compare, {
          change: 6.5,
        }),
        kpi("Ortalama hazırlanma süresi", 17.4, "saat", "positive", compare, {
          change: -9.2,
        }),
        kpi(
          "Ortalama sipariş tutarı",
          average(rows, "amount"),
          "sipariş başına",
          "positive",
          compare,
          { currency: true },
        ),
      ];
    }
    case "Ürün ve Stok Raporu": {
      const best = [...rows].sort(
        (a, b) => Number(b.values.sold) - Number(a.values.sold),
      )[0];
      return [
        kpi(
          "Satılan ürün adedi",
          sum(rows, "sold"),
          "adet",
          "positive",
          compare,
        ),
        kpi(
          "Kritik stoktaki ürünler",
          rows.filter((row) => Number(row.values.stock) < 20).length,
          "ürün",
          "negative",
          compare,
        ),
        kpi(
          "Stok değeri",
          sum(rows, "stockValue"),
          "mevcut değer",
          "neutral",
          compare,
          { currency: true },
        ),
        textKpi(
          "En çok satan ürün",
          String(best?.values.product ?? "—"),
          "satış adedine göre",
        ),
        kpi("Stok devir oranı", 4.7, "devir", "positive", compare, {
          change: 7.1,
        }),
      ];
    }
    case "Müşteri Raporu":
      return [
        kpi(
          "Toplam müşteri",
          sum(rows, "customerCount"),
          "müşteri",
          "positive",
          compare,
        ),
        kpi(
          "Yeni müşteri",
          rows
            .filter((row) => row.values.segment === "Yeni Müşteri")
            .reduce((a, r) => a + Number(r.values.customerCount), 0),
          "müşteri",
          "positive",
          compare,
        ),
        kpi("Tekrar alışveriş oranı", 42.8, "oran", "positive", compare, {
          percent: true,
        }),
        kpi(
          "Aktif müşteri",
          rows
            .filter((row) => row.values.segment !== "Pasif Müşteri")
            .reduce((a, r) => a + Number(r.values.customerCount), 0),
          "müşteri",
          "positive",
          compare,
        ),
        kpi(
          "Ortalama müşteri harcaması",
          average(rows, "averageSpend"),
          "müşteri başına",
          "positive",
          compare,
          { currency: true },
        ),
      ];
    case "İade ve İptal Raporu": {
      const topReason = rows[0]?.values.reason ?? "—";
      return [
        kpi("Toplam talep", rows.length, "talep", "negative", compare),
        kpi("İade tutarı", sum(rows, "amount"), "toplam", "negative", compare, {
          currency: true,
        }),
        kpi("İade oranı", 5.8, "oran", "negative", compare, {
          percent: true,
          change: 3.6,
        }),
        kpi("İptal oranı", 3.2, "oran", "positive", compare, {
          percent: true,
          change: -4.1,
        }),
        textKpi("En sık talep nedeni", String(topReason), "talep nedeni"),
      ];
    }
    case "Ödeme Raporu":
      return [
        kpi(
          "Toplam tahsilat",
          sum(
            rows.filter((r) => r.values.status === "Başarılı"),
            "amount",
          ),
          "başarılı tahsilat",
          "positive",
          compare,
          { currency: true },
        ),
        kpi(
          "Başarılı ödeme",
          rows.filter((r) => r.values.status === "Başarılı").length,
          "işlem",
          "positive",
          compare,
        ),
        kpi(
          "Bekleyen ödeme",
          rows.filter((r) => r.values.status === "Bekliyor").length,
          "işlem",
          "negative",
          compare,
        ),
        kpi(
          "Başarısız ödeme",
          rows.filter((r) => r.values.status === "Başarısız").length,
          "işlem",
          "negative",
          compare,
        ),
        kpi(
          "İade edilen tutar",
          sum(
            rows.filter((r) => r.values.status === "İade Edildi"),
            "amount",
          ),
          "toplam iade",
          "negative",
          compare,
          { currency: true },
        ),
      ];
    case "B2B Raporu":
      return [
        kpi("Toplam firma", rows.length, "firma", "positive", compare),
        kpi(
          "Yeni başvuru",
          Math.max(1, Math.round(rows.length / 3)),
          "başvuru",
          "positive",
          compare,
        ),
        kpi("Aktif proje", sum(rows, "projects"), "proje", "positive", compare),
        kpi(
          "Onaylanan teklif",
          Math.round(sum(rows, "projects") * 0.62),
          "teklif",
          "positive",
          compare,
        ),
        kpi(
          "B2B ciro",
          sum(rows, "revenue"),
          "toplam ciro",
          "positive",
          compare,
          { currency: true },
        ),
      ];
    case "Kanal Performansı Raporu": {
      const totals = reportChannels.map((channel) => ({
        channel,
        value: rows
          .filter((r) => r.values.channel === channel)
          .reduce((a, r) => a + Number(r.values.revenue), 0),
      }));
      const strongest = [...totals].sort((a, b) => b.value - a.value)[0];
      return [
        ...totals.map((item) =>
          kpi(
            `${item.channel} satışı`,
            item.value,
            "kanal satışı",
            "positive",
            compare,
            { currency: true },
          ),
        ),
        textKpi(
          "En güçlü kanal",
          strongest?.channel ?? "—",
          "toplam satışa göre",
        ),
        kpi(
          "Kanal başına ortalama sipariş",
          rows.length ? sum(rows, "orders") / 3 : 0,
          "sipariş",
          "positive",
          compare,
        ),
      ];
    }
  }
}

function filterRows(type: ReportType, filters: ReportFilters) {
  const rows = reportDefinitions[type].rows;
  const latest = Math.max(...rows.map((row) => new Date(row.date).getTime()));
  const days =
    filters.period === "Bugün"
      ? 0
      : filters.period === "Son 7 Gün"
        ? 6
        : filters.period === "Son 30 Gün"
          ? 29
          : 89;
  const cutoff = latest - days * 86400000;
  return rows.filter((row) => {
    const time = new Date(row.date).getTime();
    const periodMatch =
      filters.period === "Özel Tarih"
        ? (!filters.startDate || row.date >= filters.startDate) &&
          (!filters.endDate || row.date <= filters.endDate)
        : time >= cutoff;
    return (
      periodMatch &&
      (filters.channel === "Tümü" ||
        row.channel === filters.channel ||
        row.values.channel === filters.channel) &&
      (filters.customerType === "Tümü" ||
        row.customerType === filters.customerType ||
        row.values.customerType === filters.customerType) &&
      (filters.category === "Tümü" ||
        row.category === filters.category ||
        row.values.category === filters.category) &&
      (filters.orderStatus === "Tümü" ||
        row.orderStatus === filters.orderStatus ||
        row.values.status === filters.orderStatus) &&
      (filters.paymentStatus === "Tümü" ||
        row.paymentStatus === filters.paymentStatus ||
        row.values.status === filters.paymentStatus) &&
      (filters.currency === "Tümü" ||
        row.currency === filters.currency ||
        row.values.currency === filters.currency) &&
      (!filters.location.trim() ||
        row.location
          .toLocaleLowerCase("tr-TR")
          .includes(filters.location.trim().toLocaleLowerCase("tr-TR")))
    );
  });
}

export function ReportManagement() {
  const [reportType, setReportType] = useState<ReportType>("Satış Raporu");
  const [draft, setDraft] = useState<ReportFilters>(initialFilters);
  const [applied, setApplied] = useState<ReportFilters>(initialFilters);
  const [generatedType, setGeneratedType] =
    useState<ReportType>("Satış Raporu");
  const [generating, setGenerating] = useState(false);
  const [generatedAt, setGeneratedAt] = useState(() => nowText());
  const [validation, setValidation] = useState("");
  const [notice, setNotice] = useState("");
  const [sortKey, setSortKey] = useState("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [exportOpen, setExportOpen] = useState(false);
  const today = todayInput();
  const definition = reportDefinitions[generatedType];
  const rows = useMemo(
    () => filterRows(generatedType, applied),
    [applied, generatedType],
  );
  const dirty =
    reportType !== generatedType ||
    JSON.stringify(draft) !== JSON.stringify(applied);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 4200);
    return () => window.clearTimeout(timer);
  }, [notice]);
  const kpis = useMemo(
    () => buildKpis(generatedType, rows, applied.compare),
    [applied.compare, generatedType, rows],
  );
  const sortedRows = useMemo(
    () =>
      [...rows].sort((a, b) => {
        const left = a.values[sortKey] ?? (sortKey === "date" ? a.date : "");
        const right = b.values[sortKey] ?? (sortKey === "date" ? b.date : "");
        const result =
          typeof left === "number" && typeof right === "number"
            ? left - right
            : String(left).localeCompare(String(right), "tr");
        return sortDirection === "asc" ? result : -result;
      }),
    [rows, sortDirection, sortKey],
  );
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const activePage = Math.min(page, pageCount);
  const visibleRows = sortedRows.slice(
    (activePage - 1) * pageSize,
    activePage * pageSize,
  );
  const setFilter = <K extends keyof ReportFilters>(
    key: K,
    value: ReportFilters[K],
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setValidation("");
  };
  const generate = () => {
    if (generating) return;
    if (draft.period === "Özel Tarih" && (!draft.startDate || !draft.endDate)) {
      setValidation("Özel tarih için başlangıç ve bitiş tarihlerini seçin.");
      return;
    }
    if (draft.startDate && draft.endDate && draft.startDate > draft.endDate) {
      setValidation("Başlangıç tarihi bitiş tarihinden sonra olamaz.");
      return;
    }
    if (
      (draft.startDate && draft.startDate > today) ||
      (draft.endDate && draft.endDate > today)
    ) {
      setValidation("Gelecek tarihli rapor oluşturulamaz.");
      return;
    }
    setGenerating(true);
    window.setTimeout(() => {
      setApplied(draft);
      setGeneratedType(reportType);
      setGeneratedAt(nowText());
      setSortKey(reportDefinitions[reportType].columns[0].key);
      setSortDirection("desc");
      setPage(1);
      setGenerating(false);
      setNotice(`${reportType} oluşturuldu.`);
    }, 650);
  };
  const clearFilters = () => {
    setDraft(initialFilters);
    setValidation("");
  };
  const sort = (column: ReportColumn) => {
    if (!column.sortable) return;
    if (sortKey === column.key)
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
    else {
      setSortKey(column.key);
      setSortDirection("asc");
    }
    setPage(1);
  };
  const exportCsv = () => {
    if (!rows.length) {
      setNotice("Dışa aktarılabilecek rapor kaydı bulunmuyor.");
      return;
    }
    const safe = (value: string) => {
      const protectedValue = /^[=+\-@]/.test(value) ? `'${value}` : value;
      return `"${protectedValue.replaceAll('"', '""')}"`;
    };
    const header = definition.columns
      .map((column) => safe(column.label))
      .join(";");
    const content = rows
      .map((row) =>
        definition.columns
          .map((column) => safe(csvCell(row, column)))
          .join(";"),
      )
      .join("\r\n");
    const blob = new Blob(["\uFEFF", header, "\r\n", content], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dates = rows.map((row) => row.date).sort();
    link.href = url;
    link.download = `${slug(generatedType)}_${dates[0]}_${dates.at(-1)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setNotice("CSV dosyası indirildi.");
  };
  const filterFlags = {
    channel: [
      "Satış Raporu",
      "Sipariş Raporu",
      "İade ve İptal Raporu",
      "Ödeme Raporu",
      "Kanal Performansı Raporu",
    ].includes(reportType),
    customer: [
      "Satış Raporu",
      "Sipariş Raporu",
      "Müşteri Raporu",
      "İade ve İptal Raporu",
    ].includes(reportType),
    category: [
      "Satış Raporu",
      "Ürün ve Stok Raporu",
      "İade ve İptal Raporu",
    ].includes(reportType),
    order: ["Sipariş Raporu", "İade ve İptal Raporu"].includes(reportType),
    payment: ["Sipariş Raporu", "Ödeme Raporu"].includes(reportType),
    currency: [
      "Satış Raporu",
      "Ödeme Raporu",
      "B2B Raporu",
      "Kanal Performansı Raporu",
    ].includes(reportType),
  };
  return (
    <section className={`${baseStyles.page} ${styles.reportPage}`}>
      <p className={baseStyles.intro}>
        Kesin sayısal sonuçları, dönem karşılaştırmalarını ve detay kayıtlarını
        inceleyin.
      </p>
      <div
        className={styles.reportSelector}
        role="tablist"
        aria-label="Rapor türleri"
      >
        {reportTypes.map((type) => (
          <button
            key={type}
            type="button"
            role="tab"
            aria-selected={reportType === type}
            className={reportType === type ? styles.activeReport : ""}
            onClick={() => {
              setReportType(type);
              setValidation("");
            }}
          >
            <Icon name={reportIcon(type)} />
            <span>
              <strong>{reportDefinitions[type].shortLabel}</strong>
              <small>{reportDefinitions[type].description}</small>
            </span>
          </button>
        ))}
      </div>
      <div className={`${baseStyles.card} ${styles.noPrint}`}>
        <div className={baseStyles.cardHeading}>
          <div>
            <h2>Rapor Filtreleri</h2>
            <p>{reportType} için veri kapsamını belirleyin.</p>
          </div>
        </div>
        <div className={baseStyles.filters}>
          <Select
            label="Dönem"
            value={draft.period}
            options={reportPeriods}
            onChange={(value) => setFilter("period", value as ReportPeriod)}
          />
          <label className={styles.compareField}>
            <span>Önceki dönemle karşılaştır</span>
            <input
              type="checkbox"
              role="switch"
              checked={draft.compare}
              onChange={(event) => setFilter("compare", event.target.checked)}
            />
          </label>
          {filterFlags.channel && (
            <Select
              label="Satış kanalı"
              value={draft.channel}
              options={reportChannels}
              onChange={(value) => setFilter("channel", value)}
            />
          )}
          {filterFlags.customer && (
            <Select
              label="Müşteri tipi"
              value={draft.customerType}
              options={customerTypes}
              onChange={(value) => setFilter("customerType", value)}
            />
          )}
          {filterFlags.category && (
            <Select
              label="Ürün kategorisi"
              value={draft.category}
              options={productCategories}
              onChange={(value) => setFilter("category", value)}
            />
          )}
          {filterFlags.order && (
            <Select
              label="Sipariş durumu"
              value={draft.orderStatus}
              options={orderStatuses}
              onChange={(value) => setFilter("orderStatus", value)}
            />
          )}
          {filterFlags.payment && (
            <Select
              label="Ödeme durumu"
              value={draft.paymentStatus}
              options={paymentStatuses}
              onChange={(value) => setFilter("paymentStatus", value)}
            />
          )}
          {filterFlags.currency && (
            <Select
              label="Para birimi"
              value={draft.currency}
              options={currencies}
              onChange={(value) => setFilter("currency", value)}
            />
          )}
          <label>
            Ülke veya şehir
            <input
              value={draft.location}
              placeholder="Şehir veya ülke"
              onChange={(event) => setFilter("location", event.target.value)}
            />
          </label>
          {draft.period === "Özel Tarih" && (
            <>
              <label>
                Başlangıç tarihi
                <input
                  type="date"
                  max={today}
                  value={draft.startDate}
                  onInput={(event) =>
                    setFilter("startDate", event.currentTarget.value)
                  }
                />
              </label>
              <label>
                Bitiş tarihi
                <input
                  type="date"
                  min={draft.startDate}
                  max={today}
                  value={draft.endDate}
                  onInput={(event) =>
                    setFilter("endDate", event.currentTarget.value)
                  }
                />
              </label>
            </>
          )}
          <button
            type="button"
            className={baseStyles.clearButton}
            onClick={clearFilters}
          >
            Filtreleri Temizle
          </button>
        </div>
        {validation && (
          <p className={styles.validation} role="alert">
            {validation}
          </p>
        )}
        <div className={styles.filterActions}>
          {dirty && (
            <p className={styles.staleNotice}>
              Filtreler değişti. Görünen raporu yenilemek için yeniden
              oluşturun.
            </p>
          )}
          <button
            type="button"
            className={styles.generateButton}
            disabled={generating}
            onClick={generate}
          >
            {generating ? (
              <>
                <span />
                Rapor oluşturuluyor...
              </>
            ) : (
              "Raporu Oluştur"
            )}
          </button>
        </div>
      </div>
      <header className={styles.reportHeader}>
        <div>
          <span>Oluşturulan rapor</span>
          <h2>{generatedType}</h2>
          <p>
            {periodLabel(applied, rows)} · Son oluşturulma: {generatedAt}
          </p>
        </div>
        <ReportExportMenu
          open={exportOpen}
          onToggle={() => setExportOpen((open) => !open)}
          onClose={() => setExportOpen(false)}
          onCsv={exportCsv}
          onPrint={() => window.print()}
        />
      </header>
      {generating ? (
        <ReportSkeleton />
      ) : (
        <>
          <div className={baseStyles.summaryGrid}>
            {kpis.map((item, index) => (
              <Kpi
                key={item.label}
                item={item}
                tone={
                  index === 0
                    ? "pink"
                    : index === 1
                      ? "green"
                      : index === 2
                        ? "orange"
                        : index === 3
                          ? "blue"
                          : "purple"
                }
              />
            ))}
          </div>
          <ReportCharts
            type={generatedType}
            rows={rows}
            compare={applied.compare}
          />
          <section className={styles.tableCard}>
            <div className={styles.tableHeading}>
              <div>
                <h2>Detay Kayıtları</h2>
                <p>{rows.length} sonuç</p>
              </div>
              <span>Sütun başlığına tıklayarak sıralayın</span>
            </div>
            {rows.length ? (
              <div className={styles.tableWrap}>
                <table>
                  <thead>
                    <tr>
                      {definition.columns.map((column) => (
                        <th
                          key={column.key}
                          aria-sort={
                            sortKey === column.key
                              ? sortDirection === "asc"
                                ? "ascending"
                                : "descending"
                              : "none"
                          }
                        >
                          <button type="button" onClick={() => sort(column)}>
                            {column.label}
                            {sortKey === column.key && (
                              <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                            )}
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((row) => (
                      <tr key={row.id}>
                        {definition.columns.map((column) => (
                          <td key={column.key}>{formatCell(row, column)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={baseStyles.emptyState}>
                <span>
                  <Icon name="reports" />
                </span>
                <h3>Rapor kaydı bulunamadı</h3>
                <p>Filtreleri değiştirip raporu yeniden oluşturun.</p>
              </div>
            )}
            <div className={baseStyles.pagination}>
              <span>
                {rows.length
                  ? `${(activePage - 1) * pageSize + 1}-${Math.min(activePage * pageSize, rows.length)} / ${rows.length} kayıt`
                  : "0 kayıt"}
              </span>
              <div>
                <button
                  type="button"
                  aria-label="Önceki sayfa"
                  disabled={activePage === 1}
                  onClick={() => setPage(activePage - 1)}
                >
                  <Icon name="chevron" />
                </button>
                <strong>{activePage}</strong>
                <span>/ {pageCount}</span>
                <button
                  type="button"
                  aria-label="Sonraki sayfa"
                  disabled={activePage === pageCount}
                  onClick={() => setPage(activePage + 1)}
                >
                  <Icon name="chevron" />
                </button>
              </div>
            </div>
          </section>
        </>
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

function reportIcon(type: ReportType): Parameters<typeof Icon>[0]["name"] {
  return type.includes("Satış")
    ? "sales"
    : type.includes("Sipariş")
      ? "orders"
      : type.includes("Ürün")
        ? "products"
        : type.includes("Müşteri")
          ? "customers"
          : type.includes("İade")
            ? "returns"
            : type.includes("Ödeme")
              ? "payments"
              : type.includes("B2B")
                ? "b2b"
                : "trend";
}
function slug(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
function Select({
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
        {label !== "Dönem" && <option>Tümü</option>}
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
function formatCell(row: ReportRow, column: ReportColumn) {
  const value =
    row.values[column.key] ?? (column.key === "date" ? row.date : "");
  if (column.type === "currency" && typeof value === "number")
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: String(row.values.currency ?? row.currency ?? "TRY"),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  if (column.type === "number" && typeof value === "number")
    return number.format(value);
  if (column.type === "date") return formatDate(String(value));
  if (column.type === "status")
    return <span className={styles.statusCell}>{String(value)}</span>;
  return String(value);
}
function csvCell(row: ReportRow, column: ReportColumn) {
  const value =
    row.values[column.key] ?? (column.key === "date" ? row.date : "");
  if (column.type === "currency" && typeof value === "number")
    return number.format(value);
  if (column.type === "date") return formatDate(String(value));
  return String(value);
}
function periodLabel(filters: ReportFilters, rows: ReportRow[]) {
  if (filters.period !== "Özel Tarih") return filters.period;
  if (filters.startDate && filters.endDate)
    return `${formatDate(filters.startDate)} – ${formatDate(filters.endDate)}`;
  if (rows.length) {
    const dates = rows.map((row) => row.date).sort();
    return `${formatDate(dates[0])} – ${formatDate(dates.at(-1)!)}`;
  }
  return "Özel tarih";
}
function Kpi({
  item,
  tone,
}: {
  item: ReportKpi;
  tone: "pink" | "green" | "orange" | "blue" | "purple";
}) {
  const trend =
    item.change === undefined
      ? null
      : item.change > 0
        ? `↑ %${Math.abs(item.change).toLocaleString("tr-TR")}`
        : item.change < 0
          ? `↓ %${Math.abs(item.change).toLocaleString("tr-TR")}`
          : "→ %0";
  return (
    <article
      className={`${baseStyles.summaryCard} ${tone === "pink" ? "" : baseStyles[tone]}`}
    >
      <div className={styles.kpiContent}>
        <p>{item.label}</p>
        <strong>{item.value}</strong>
        <small>{item.unit}</small>
        {item.previous && (
          <div className={styles.comparison}>
            <span>Önceki: {item.previous}</span>
            <b className={styles[`impact${item.impact}`]}>{trend}</b>
          </div>
        )}
      </div>
    </article>
  );
}
function ReportCharts({
  type,
  rows,
  compare,
}: {
  type: ReportType;
  rows: ReportRow[];
  compare: boolean;
}) {
  const metricKey =
    type === "Satış Raporu"
      ? "net"
      : type === "Sipariş Raporu"
        ? "amount"
        : type === "Ürün ve Stok Raporu"
          ? "sold"
          : type === "Müşteri Raporu"
            ? "totalSpend"
            : type === "İade ve İptal Raporu"
              ? "amount"
              : type === "Ödeme Raporu"
                ? "amount"
                : type === "B2B Raporu"
                  ? "revenue"
                  : "revenue";
  const trend = [...rows]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7)
    .map((row) => ({
      label: row.date.slice(5),
      value: Number(row.values[metricKey] ?? 0),
    }));
  const distribution = reportChannels.map((channel) => ({
    label: channel,
    value: rows
      .filter(
        (row) => row.channel === channel || row.values.channel === channel,
      )
      .reduce((total, row) => total + Number(row.values[metricKey] ?? 1), 0),
  }));
  const max = Math.max(...trend.map((item) => item.value), 1);
  const distMax = Math.max(...distribution.map((item) => item.value), 1);
  return (
    <section className={styles.charts}>
      <article>
        <h3>Dönemsel trend</h3>
        <div
          className={styles.lineChart}
          role="img"
          aria-label={trend
            .map((item) => `${item.label}: ${number.format(item.value)}`)
            .join(", ")}
        >
          <div className={styles.yScale}>
            <span>{number.format(max)}</span>
            <span>{number.format(max / 2)}</span>
            <span>0</span>
          </div>
          <div className={styles.columns}>
            {trend.map((item) => (
              <div
                key={item.label}
                title={`${item.label} mevcut dönem: ${number.format(item.value)}${compare ? `; önceki dönem: ${number.format(item.value * 0.92)}` : ""}`}
              >
                <span
                  className={styles.currentBar}
                  style={{
                    height: `${Math.max(6, (item.value / max) * 100)}%`,
                  }}
                />
                {compare && (
                  <span
                    className={styles.previousBar}
                    style={{
                      height: `${Math.max(6, ((item.value * 0.92) / max) * 100)}%`,
                    }}
                  />
                )}
                <small>{item.label}</small>
              </div>
            ))}
          </div>
        </div>
        <p className={styles.legend}>
          <span>
            <i className={styles.currentDot} />
            Mevcut dönem
          </span>
          {compare && (
            <span>
              <i className={styles.previousDot} />
              Önceki dönem
            </span>
          )}
        </p>
      </article>
      <article>
        <h3>Kanal dağılımı</h3>
        <div
          className={styles.horizontalChart}
          role="img"
          aria-label={distribution
            .map((item) => `${item.label}: ${number.format(item.value)}`)
            .join(", ")}
        >
          {distribution.map((item) => (
            <div
              key={item.label}
              title={`${item.label}: ${number.format(item.value)}`}
            >
              <span>{item.label}</span>
              <i style={{ width: `${(item.value / distMax) * 100}%` }} />
              <b>{number.format(item.value)}</b>
            </div>
          ))}
        </div>
        <p className={styles.legend}>
          <span>
            <i className={styles.channelDot} />
            Filtrelenmiş rapor verisi
          </span>
        </p>
      </article>
    </section>
  );
}
function ReportSkeleton() {
  return (
    <div className={styles.reportSkeleton}>
      <div className={baseStyles.loadingSummary}>
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className={baseStyles.skeletonCard} />
        ))}
      </div>
      <div className={baseStyles.loadingTable}>
        <div className={baseStyles.loadingHeading} />
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className={baseStyles.loadingRow} />
        ))}
      </div>
    </div>
  );
}
