import { useState } from "react";
import { CustomerModalFrame } from "../customers/customer-modal-frame";
import baseStyles from "../customers/customer-management.module.css";
import styles from "./insight-management.module.css";
import type { Insight, InsightDetailTab } from "./insight-types";

type Props = {
  insight: Insight;
  initialTab: InsightDetailTab;
  onClose: () => void;
  onAddNote: (text: string) => void;
};
const tabs: { id: InsightDetailTab; label: string }[] = [
  { id: "overview", label: "Genel Bakış" },
  { id: "evidence", label: "Kanıtlar" },
  { id: "action", label: "Önerilen Aksiyon" },
  { id: "history", label: "Geçmiş ve Notlar" },
];
const money = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
function trendText(changePercent: number) {
  if (changePercent > 0) return `↑ %${changePercent} artış`;
  if (changePercent < 0) return `↓ %${Math.abs(changePercent)} azalış`;
  return "→ Değişim yok";
}
function date(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

export function InsightDetailModal({
  insight,
  initialTab,
  onClose,
  onAddNote,
}: Props) {
  const [tab, setTab] = useState(initialTab);
  const [note, setNote] = useState("");
  return (
    <CustomerModalFrame
      title={insight.title}
      eyebrow={`${insight.source} · ${insight.periodComparison}`}
      closeLabel="İçgörü detayını kapat"
      onClose={onClose}
    >
      <div
        className={baseStyles.detailTabs}
        role="tablist"
        aria-label="İçgörü detay bölümleri"
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
              <Badge text={insight.type} />
              <Badge text={insight.source} />
              <Badge text={insight.priority} />
              <Badge text={insight.status} />
            </div>
            <dl className={baseStyles.detailGrid}>
              <Detail label="Tespit tarihi" value={date(insight.detectedAt)} />
              <Detail label="Etkilenen alan" value={insight.affectedArea} />
              <Detail
                label={insight.metricLabel}
                value={`${insight.metricValue} · ${trendText(insight.changePercent)}`}
              />
              <Detail
                label="Tahmini finansal etki"
                value={money.format(insight.financialImpact)}
              />
              <Detail
                label="Karşılaştırılan dönem"
                value={insight.periodComparison}
              />
              <Detail label="Satış kanalı" value={insight.channel} />
            </dl>
            <section className={baseStyles.detailSection}>
              <h3>Kısa açıklama</h3>
              <p className={styles.detailCopy}>{insight.description}</p>
            </section>
          </>
        )}
        {tab === "evidence" && (
          <>
            <section className={baseStyles.detailSection}>
              <h3>Kullanılan metrikler</h3>
              <div className={baseStyles.orderHistoryWrap}>
                <table>
                  <thead>
                    <tr>
                      <th>Metrik</th>
                      <th>Önceki dönem</th>
                      <th>Mevcut dönem</th>
                      <th>Değişim</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insight.evidence.map((item) => (
                      <tr key={item.label}>
                        <td>
                          <strong>{item.label}</strong>
                        </td>
                        <td>{item.previous}</td>
                        <td>{item.current}</td>
                        <td>{item.change}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <section className={baseStyles.detailSection}>
              <h3>Bu içgörü neden sunuluyor?</h3>
              <p className={styles.detailCopy}>{insight.rationale}</p>
              <p className={styles.sourceLine}>
                <strong>Veri kaynağı:</strong> {insight.source} ·{" "}
                <strong>Dönem:</strong> {insight.periodComparison}
              </p>
            </section>
          </>
        )}
        {tab === "action" && (
          <section className={baseStyles.detailSection}>
            <h3>Önerilen işlem</h3>
            <p className={styles.actionRecommendation}>
              {insight.recommendation}
            </p>
            <dl className={baseStyles.detailGrid}>
              <Detail label="Beklenen etki" value={insight.expectedImpact} />
              <Detail label="Önerilen ekip" value={insight.suggestedTeam} />
              <Detail label="Hedef süre" value={insight.targetDuration} />
              <Detail
                label="Mevcut plan"
                value={
                  insight.actionPlan
                    ? `${insight.actionPlan.team} · ${insight.actionPlan.targetDate}`
                    : "Henüz planlanmadı"
                }
              />
            </dl>
            <h3>Dikkat edilmesi gerekenler</h3>
            <ul className={styles.cautions}>
              {insight.cautions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}
        {tab === "history" && (
          <section className={baseStyles.detailSection}>
            <h3>Yönetici notları</h3>
            <div className={baseStyles.noteList}>
              {insight.notes.length ? (
                insight.notes.map((item) => (
                  <article key={item.id}>
                    <p>{item.text}</p>
                    <footer>
                      <strong>{item.author}</strong>
                      <time>{item.date}</time>
                    </footer>
                  </article>
                ))
              ) : (
                <div className={baseStyles.emptyPanel}>
                  <strong>Henüz not yok</strong>
                  <p>İçgörüye ilk yönetici notunu ekleyebilirsiniz.</p>
                </div>
              )}
            </div>
            <label className={baseStyles.noteField}>
              <span>Yeni yönetici notu</span>
              <textarea
                rows={3}
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </label>
            <div className={baseStyles.noteActions}>
              <small>Not yalnızca yönetim ekibine görünür.</small>
              <button
                type="button"
                disabled={!note.trim()}
                onClick={() => {
                  onAddNote(note.trim());
                  setNote("");
                }}
              >
                Notu Ekle
              </button>
            </div>
            <h3 className={styles.historyTitle}>Durum geçmişi</h3>
            <ol className={styles.timeline}>
              {insight.history.map((item, index) => (
                <li key={`${item.title}-${index}`}>
                  <span />
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.description}</p>
                    <small>{item.date}</small>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </CustomerModalFrame>
  );
}
function Badge({ text }: { text: string }) {
  return <span className={styles.detailBadge}>{text}</span>;
}
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
