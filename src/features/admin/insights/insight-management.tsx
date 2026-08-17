"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon, type IconName } from "../admin-icons";
import baseStyles from "../customers/customer-management.module.css";
import { InsightActionModal } from "./insight-action-modal";
import { InsightActionsMenu } from "./insight-actions-menu";
import { initialInsights, reviewThemes } from "./insight-data";
import { InsightDetailModal } from "./insight-detail-modal";
import styles from "./insight-management.module.css";
import {
  insightPriorities,
  insightSources,
  insightStatuses,
  insightTypes,
  periods,
  salesChannels,
  type ActionPlan,
  type Insight,
  type InsightDetailTab,
  type InsightMenuAction,
  type Period,
} from "./insight-types";

type ActiveModal =
  | { kind: "detail"; id: number; tab: InsightDetailTab }
  | { kind: "action"; id: number; action: "plan" | "ignore" };
const money = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const priorityRank = { Kritik: 0, Yüksek: 1, Orta: 2, Düşük: 3 } as const;
function date(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}
function nowText() {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date());
}
function statusKey(value: string) {
  return value
    .replaceAll(" ", "")
    .replaceAll("İ", "I")
    .replaceAll("ı", "i")
    .replaceAll("ş", "s")
    .replaceAll("Ş", "S")
    .replaceAll("ö", "o")
    .replaceAll("Ö", "O")
    .replaceAll("ü", "u")
    .replaceAll("Ü", "U")
    .replaceAll("ğ", "g")
    .replaceAll("Ğ", "G")
    .replaceAll("ç", "c")
    .replaceAll("Ç", "C");
}
function trendText(changePercent: number) {
  if (changePercent > 0) return `↑ %${changePercent} artış`;
  if (changePercent < 0) return `↓ %${Math.abs(changePercent)} azalış`;
  return "→ Değişim yok";
}

export function InsightManagement() {
  // Önceden hazırlanmış analiz kayıtları yalnızca yerel state üzerinde güncellenir.
  const [insights, setInsights] = useState<Insight[]>(initialInsights);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("Son 30 gün");
  const [source, setSource] = useState("Tümü");
  const [type, setType] = useState("Tümü");
  const [priority, setPriority] = useState("Tümü");
  const [status, setStatus] = useState("Tümü");
  const [channel, setChannel] = useState("Tümü");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [activeModal, setActiveModal] = useState<ActiveModal | null>(null);
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
    const body = document.body.style.overflow;
    const shellValue = shell?.style.overflow ?? "";
    document.body.style.overflow = "hidden";
    if (shell) shell.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = body;
      if (shell) shell.style.overflow = shellValue;
    };
  }, [activeModal]);

  const summary = useMemo(() => {
    const active = insights.filter(
      (item) => !["Çözüldü", "Göz Ardı Edildi"].includes(item.status),
    );
    const month = new Intl.DateTimeFormat("sv-SE", {
      year: "numeric",
      month: "2-digit",
      timeZone: "Europe/Istanbul",
    }).format(new Date());
    return {
      active: active.length,
      high: active.filter((item) =>
        ["Kritik", "Yüksek"].includes(item.priority),
      ).length,
      opportunities: active.filter((item) =>
        ["Fırsat", "Büyüme Önerisi"].includes(item.type),
      ).length,
      riskAmount: active
        .filter((item) =>
          ["Risk", "Anomali", "Müşteri Sorunu", "Operasyon Uyarısı"].includes(
            item.type,
          ),
        )
        .reduce((sum, item) => sum + item.financialImpact, 0),
      solved: insights.filter(
        (item) =>
          item.status === "Çözüldü" && item.resolvedAt?.startsWith(month),
      ).length,
    };
  }, [insights]);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("tr-TR");
    const days = period === "Son 7 gün" ? 7 : period === "Son 30 gün" ? 30 : 90;
    const latestDetectedAt = Math.max(
      ...insights.map((item) => new Date(item.detectedAt).getTime()),
    );
    const cutoff = new Date(latestDetectedAt - days * 86400000);
    return [...insights]
      .filter((item) => {
        const detected = new Date(item.detectedAt);
        const periodMatch =
          period === "Özel tarih aralığı"
            ? (!startDate || item.detectedAt.slice(0, 10) >= startDate) &&
              (!endDate || item.detectedAt.slice(0, 10) <= endDate)
            : detected >= cutoff;
        return (
          periodMatch &&
          (!query ||
            [item.title, item.description, item.affectedArea].some((value) =>
              value.toLocaleLowerCase("tr-TR").includes(query),
            )) &&
          (source === "Tümü" || item.source === source) &&
          (type === "Tümü" || item.type === type) &&
          (priority === "Tümü" || item.priority === priority) &&
          (status === "Tümü" || item.status === status) &&
          (channel === "Tümü" || item.channel === channel)
        );
      })
      .sort(
        (a, b) =>
          priorityRank[a.priority] - priorityRank[b.priority] ||
          +new Date(b.detectedAt) - +new Date(a.detectedAt),
      );
  }, [
    channel,
    endDate,
    insights,
    period,
    priority,
    search,
    source,
    startDate,
    status,
    type,
  ]);
  const resetList = () => setVisibleCount(6);
  const clearFilters = () => {
    setPeriod("Son 30 gün");
    setSource("Tümü");
    setType("Tümü");
    setPriority("Tümü");
    setStatus("Tümü");
    setChannel("Tümü");
    setSearch("");
    setStartDate("");
    setEndDate("");
    resetList();
  };
  const activeInsight = activeModal
    ? insights.find((item) => item.id === activeModal.id)
    : undefined;
  const update = (id: number, updater: (item: Insight) => Insight) =>
    setInsights((items) =>
      items.map((item) => (item.id === id ? updater(item) : item)),
    );
  const changeStatus = (
    item: Insight,
    nextStatus: Insight["status"],
    description: string,
  ) => {
    const stamp = nowText();
    update(item.id, (current) => ({
      ...current,
      status: nextStatus,
      resolvedAt:
        nextStatus === "Çözüldü"
          ? new Date().toISOString()
          : current.resolvedAt,
      history: [
        ...current.history,
        { title: nextStatus, description, date: stamp },
      ],
    }));
    setNotice(
      `“${item.title}” ${nextStatus.toLocaleLowerCase("tr-TR")} olarak güncellendi.`,
    );
  };
  const handleAction = (item: Insight, action: InsightMenuAction) => {
    setOpenMenuId(null);
    if (action === "detail" || action === "note")
      setActiveModal({
        kind: "detail",
        id: item.id,
        tab: action === "note" ? "history" : "overview",
      });
    else if (action === "plan" || action === "ignore")
      setActiveModal({ kind: "action", id: item.id, action });
    else if (action === "review")
      changeStatus(item, "İnceleniyor", "Yönetici incelemesi başlatıldı.");
    else
      changeStatus(
        item,
        "Çözüldü",
        "İçgörü yönetici tarafından çözüldü olarak işaretlendi.",
      );
  };
  const plan = (item: Insight, actionPlan: ActionPlan) => {
    update(item.id, (current) => ({
      ...current,
      status: "Aksiyon Planlandı",
      actionPlan,
      history: [
        ...current.history,
        {
          title: "Aksiyon planlandı",
          description: `${actionPlan.team} · ${actionPlan.description}`,
          date: nowText(),
        },
      ],
    }));
    setActiveModal(null);
    setNotice("Aksiyon planı kaydedildi.");
  };
  const ignore = (item: Insight, reason: string) => {
    changeStatus(item, "Göz Ardı Edildi", reason);
    setActiveModal(null);
  };
  const addNote = (item: Insight, text: string) => {
    update(item.id, (current) => ({
      ...current,
      notes: [
        ...current.notes,
        { id: `note-${Date.now()}`, text, author: "Admin", date: nowText() },
      ],
    }));
    setNotice("Yönetici notu eklendi.");
  };

  if (loading) return <Loading />;
  const opportunities = filtered
    .filter((item) => ["Fırsat", "Büyüme Önerisi"].includes(item.type))
    .slice(0, 3);
  return (
    <section className={baseStyles.page}>
      <p className={baseStyles.intro}>
        Önemli sorunları, fırsatları ve önerilen aksiyonları tek bakışta
        değerlendirin.
      </p>
      <div className={baseStyles.summaryGrid}>
        <Summary
          title="Aktif içgörüler"
          value={String(summary.active)}
          unit={`${summary.active} açık konu`}
          icon="insights"
          tone="pink"
        />
        <Summary
          title="Yüksek öncelikli konular"
          value={String(summary.high)}
          unit={`${summary.high} kritik veya yüksek`}
          icon="alert"
          tone="orange"
        />
        <Summary
          title="Tespit edilen fırsatlar"
          value={String(summary.opportunities)}
          unit={`${summary.opportunities} büyüme alanı`}
          icon="trend"
          tone="green"
        />
        <Summary
          title="Risk altındaki tahmini tutar"
          value={money.format(summary.riskAmount)}
          unit="aktif risklerin toplamı"
          icon="payments"
          tone="purple"
        />
        <Summary
          title="Bu ay çözülen içgörüler"
          value={String(summary.solved)}
          unit={`${summary.solved} tamamlanan konu`}
          icon="reports"
          tone="blue"
        />
      </div>
      <div className={baseStyles.card}>
        <div className={baseStyles.cardHeading}>
          <div>
            <h2>Karar Destek Merkezi</h2>
            <p>Kanıt, karşılaştırma ve önerileri bir arada değerlendirin.</p>
          </div>
          <span className={baseStyles.crmBadge}>Açıklanabilir İçgörüler</span>
        </div>
        <div className={baseStyles.filters}>
          <Filter
            label="Dönem"
            value={period}
            options={periods}
            onChange={(value) => {
              setPeriod(value as Period);
              resetList();
            }}
          />
          <Filter
            label="Kaynak"
            value={source}
            options={insightSources}
            onChange={(value) => {
              setSource(value);
              resetList();
            }}
          />
          <Filter
            label="İçgörü türü"
            value={type}
            options={insightTypes}
            onChange={(value) => {
              setType(value);
              resetList();
            }}
          />
          <Filter
            label="Öncelik"
            value={priority}
            options={insightPriorities}
            onChange={(value) => {
              setPriority(value);
              resetList();
            }}
          />
          <Filter
            label="Durum"
            value={status}
            options={insightStatuses}
            onChange={(value) => {
              setStatus(value);
              resetList();
            }}
          />
          <Filter
            label="Satış kanalı"
            value={channel}
            options={salesChannels}
            onChange={(value) => {
              setChannel(value);
              resetList();
            }}
          />
          <label className={baseStyles.searchField}>
            <Icon name="search" />
            <span className={baseStyles.srOnly}>İçgörülerde ara</span>
            <input
              type="search"
              value={search}
              placeholder="Başlık, açıklama veya etkilenen alan..."
              onChange={(event) => {
                setSearch(event.target.value);
                resetList();
              }}
            />
          </label>
          {period === "Özel tarih aralığı" && (
            <>
              <label>
                Başlangıç
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => {
                    setStartDate(event.target.value);
                    resetList();
                  }}
                />
              </label>
              <label>
                Bitiş
                <input
                  type="date"
                  min={startDate}
                  value={endDate}
                  onChange={(event) => {
                    setEndDate(event.target.value);
                    resetList();
                  }}
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
      </div>
      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <h2>Öncelikli İçgörüler</h2>
            <p>{filtered.length} içgörü filtrelerle eşleşiyor</p>
          </div>
        </div>
        {filtered.length ? (
          <>
            <div className={styles.insightGrid}>
              {filtered.slice(0, visibleCount).map((item) => (
                <InsightCard
                  key={item.id}
                  insight={item}
                  menuOpen={openMenuId === item.id}
                  onToggleMenu={setOpenMenuId}
                  onAction={(action) => handleAction(item, action)}
                />
              ))}
            </div>
            {visibleCount < filtered.length && (
              <button
                type="button"
                className={styles.moreButton}
                onClick={() => setVisibleCount((count) => count + 6)}
              >
                Daha Fazla Göster
              </button>
            )}
          </>
        ) : (
          <div className={baseStyles.emptyState}>
            <span>
              <Icon name="search" />
            </span>
            <h3>İçgörü bulunamadı</h3>
            <p>Filtreleri değiştirerek yeniden deneyin.</p>
            <button type="button" onClick={clearFilters}>
              Filtreleri Temizle
            </button>
          </div>
        )}
      </section>
      <Charts insights={insights} />
      <div className={styles.lowerGrid}>
        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <div>
              <h2>Müşteri Sesi – Review Lab</h2>
              <p>Tekrar eden yorum temaları ve iyileştirme alanları</p>
            </div>
          </div>
          <div className={styles.reviewGrid}>
            {reviewThemes.map((item) => (
              <article key={item.id} className={styles.reviewCard}>
                <header>
                  <div>
                    <h3>{item.title}</h3>
                    <span>{item.area}</span>
                  </div>
                  <span
                    className={
                      item.sentiment === "Olumsuz"
                        ? styles.negative
                        : styles.positive
                    }
                  >
                    {item.sentiment}
                  </span>
                </header>
                <div className={styles.reviewStats}>
                  <strong>{item.reviewCount} yorum</strong>
                  <span>
                    {item.changePercent > 0 ? "+" : ""}%{item.changePercent}{" "}
                    önceki döneme göre
                  </span>
                </div>
                <p>{item.summary}</p>
                <footer>
                  <strong>Öneri</strong>
                  <span>{item.recommendation}</span>
                </footer>
              </article>
            ))}
          </div>
        </section>
        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <div>
              <h2>Fırsatlar</h2>
              <p>Satış ve B2B verilerinden öne çıkan alanlar</p>
            </div>
          </div>
          <div className={styles.opportunityList}>
            {opportunities.map((item) => (
              <article key={item.id}>
                <span>
                  <Icon name="trend" />
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <small>
                    {item.channel} · {item.affectedArea}
                  </small>
                  <p>{item.rationale}</p>
                  <strong>
                    Potansiyel: {money.format(item.financialImpact)}
                  </strong>
                  <b>Sonraki adım: {item.recommendation}</b>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
      {activeModal?.kind === "detail" && activeInsight && (
        <InsightDetailModal
          insight={activeInsight}
          initialTab={activeModal.tab}
          onClose={() => setActiveModal(null)}
          onAddNote={(text) => addNote(activeInsight, text)}
        />
      )}
      {activeModal?.kind === "action" && activeInsight && (
        <InsightActionModal
          insight={activeInsight}
          kind={activeModal.action}
          onClose={() => setActiveModal(null)}
          onPlan={(actionPlan) => plan(activeInsight, actionPlan)}
          onIgnore={(reason) => ignore(activeInsight, reason)}
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

function InsightCard({
  insight,
  menuOpen,
  onToggleMenu,
  onAction,
}: {
  insight: Insight;
  menuOpen: boolean;
  onToggleMenu: (id: number | null) => void;
  onAction: (action: InsightMenuAction) => void;
}) {
  return (
    <article className={styles.insightCard}>
      <header>
        <div className={styles.cardBadges}>
          <span
            className={`${styles.priorityBadge} ${styles[`priority${statusKey(insight.priority)}`]}`}
          >
            {insight.priority}
          </span>
          <span className={styles.sourceBadge}>{insight.source}</span>
        </div>
        <InsightActionsMenu
          id={insight.id}
          title={insight.title}
          status={insight.status}
          isOpen={menuOpen}
          onToggle={onToggleMenu}
          onAction={onAction}
        />
      </header>
      <h3>{insight.title}</h3>
      <p className={styles.cardDescription}>{insight.description}</p>
      <div className={styles.contextLine}>
        <span>{insight.affectedArea}</span>
        <time>{date(insight.detectedAt)}</time>
      </div>
      <div className={styles.metricBox}>
        <div>
          <small>{insight.metricLabel}</small>
          <strong>{insight.metricValue}</strong>
        </div>
        <b
          className={styles[`trend${insight.trendImpact}`]}
          title={`${insight.metricLabel}: ${trendText(insight.changePercent)}; ${insight.trendImpact === "positive" ? "olumlu" : insight.trendImpact === "negative" ? "olumsuz" : "nötr"} etki`}
        >
          {trendText(insight.changePercent)}
        </b>
      </div>
      <div className={styles.impactLine}>
        <span>Tahmini finansal etki</span>
        <strong>{money.format(insight.financialImpact)}</strong>
      </div>
      <p className={styles.recommendation}>
        <strong>Önerilen aksiyon</strong>
        {insight.recommendation}
      </p>
      <footer>
        <span
          className={`${styles.statusBadge} ${styles[`status${statusKey(insight.status)}`]}`}
        >
          {insight.status}
        </span>
        <button type="button" onClick={() => onAction("detail")}>
          Detayları Görüntüle
        </button>
      </footer>
    </article>
  );
}

function Charts({ insights }: { insights: Insight[] }) {
  const active = insights.filter(
    (item) => !["Çözüldü", "Göz Ardı Edildi"].includes(item.status),
  );
  const distribution = insightSources
    .map((item) => ({
      label: item,
      value: active.filter((insight) => insight.source === item).length,
    }))
    .filter((item) => item.value);
  const max = Math.max(...distribution.map((item) => item.value), 1);
  const issues = reviewThemes.map((item) => ({
    label: item.title,
    value: item.reviewCount,
  }));
  const trendPeriods = ["22–28 Tem", "29 Tem–4 Ağu", "5–11 Ağu", "12–18 Ağu"];
  const riskValues = [6, 5, 5, 4];
  const opportunityValues = [2, 3, 4, 5];
  const trendX = [48, 150, 252, 354];
  const trendY = (value: number) => 132 - value * 15;
  return (
    <section className={styles.chartSection}>
      <div className={styles.sectionHeading}>
        <div>
          <h2>Görsel Özet</h2>
          <p>Kaynak, eğilim ve müşteri sorunu dağılımları</p>
        </div>
      </div>
      <div className={styles.chartGrid}>
        <article className={styles.chartCard}>
          <h3>İçgörülerin kaynaklara göre dağılımı</h3>
          <div
            className={styles.barChart}
            role="img"
            aria-label={distribution
              .map((item) => `${item.label}: ${item.value}`)
              .join(", ")}
          >
            {distribution.map((item) => (
              <div
                key={item.label}
                title={`${item.label}: ${item.value} aktif içgörü`}
              >
                <span title={item.label}>{item.label}</span>
                <i style={{ width: `${(item.value / max) * 100}%` }} />
                <b>{item.value}</b>
              </div>
            ))}
          </div>
          <p className={styles.chartLegend}>
            <i /> Aktif içgörü sayısı
          </p>
        </article>
        <article className={styles.chartCard}>
          <h3>Son dönem risk/fırsat eğilimi</h3>
          <svg
            className={styles.trendChart}
            viewBox="0 0 400 185"
            role="img"
            aria-label="Dört haftalık risk ve fırsat eğilimi"
          >
            <title>
              {"Riskler 6'dan 4'e gerilerken fırsatlar 2'den 5'e yükseldi."}
            </title>
            {[0, 2, 4, 6].map((value) => (
              <g key={value}>
                <line
                  className={styles.chartGridLine}
                  x1="38"
                  x2="382"
                  y1={trendY(value)}
                  y2={trendY(value)}
                />
                <text className={styles.axisLabel} x="28" y={trendY(value) + 3}>
                  {value}
                </text>
              </g>
            ))}
            <text className={styles.axisTitle} x="7" y="18">
              Adet
            </text>
            <polyline
              className={styles.riskLine}
              points={riskValues
                .map((value, index) => `${trendX[index]},${trendY(value)}`)
                .join(" ")}
            />
            <polyline
              className={styles.opportunityLine}
              points={opportunityValues
                .map((value, index) => `${trendX[index]},${trendY(value)}`)
                .join(" ")}
            />
            {riskValues.map((value, i) => (
              <circle
                key={`r${i}`}
                cx={trendX[i]}
                cy={trendY(value)}
                r="5"
                className={styles.riskPoint}
                tabIndex={0}
              >
                <title>
                  Risk · {trendPeriods[i]} · {value} içgörü
                </title>
              </circle>
            ))}
            {opportunityValues.map((value, i) => (
              <circle
                key={`o${i}`}
                cx={trendX[i]}
                cy={trendY(value)}
                r="5"
                className={styles.opportunityPoint}
                tabIndex={0}
              >
                <title>
                  Fırsat · {trendPeriods[i]} · {value} içgörü
                </title>
              </circle>
            ))}
            {trendPeriods.map((label, index) => (
              <text
                key={label}
                className={styles.periodLabel}
                x={trendX[index]}
                y="163"
                textAnchor="middle"
              >
                {label}
              </text>
            ))}
          </svg>
          <p className={styles.dualLegend}>
            <span>
              <i className={styles.riskDot} /> Risk
            </span>
            <span>
              <i className={styles.opportunityDot} /> Fırsat
            </span>
          </p>
        </article>
        <article className={styles.chartCard}>
          <h3>En sık görülen müşteri sorunları</h3>
          <div
            className={styles.issueChart}
            role="img"
            aria-label={issues
              .map((item) => `${item.label}: ${item.value} yorum`)
              .join(", ")}
          >
            {issues.map((item) => (
              <div
                key={item.label}
                title={`${item.label}: ${item.value} yorum`}
              >
                <span>{item.label}</span>
                <b>{item.value}</b>
                <i style={{ height: `${Math.max(20, item.value / 0.55)}%` }} />
              </div>
            ))}
          </div>
          <p className={styles.chartLegend}>
            <i /> İlgili yorum sayısı
          </p>
        </article>
      </div>
    </section>
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
  value: string;
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
        <small>{unit}</small>
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
        {label !== "Dönem" && <option>Tümü</option>}
        {options.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </label>
  );
}
function Loading() {
  return (
    <section className={baseStyles.page} aria-label="İçgörüler yükleniyor">
      <div className={baseStyles.loadingIntro} />
      <div className={baseStyles.loadingSummary}>
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className={baseStyles.skeletonCard} />
        ))}
      </div>
      <div className={baseStyles.loadingTable}>
        <div className={baseStyles.loadingHeading} />
        <div className={baseStyles.loadingFilters} />
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className={baseStyles.loadingRow} />
        ))}
      </div>
    </section>
  );
}
