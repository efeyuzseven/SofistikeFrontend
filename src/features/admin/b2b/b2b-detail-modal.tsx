import { useState } from "react";
import { CustomerModalFrame } from "../customers/customer-modal-frame";
import baseStyles from "../customers/customer-management.module.css";
import type { B2BDetailTab, B2BRecord, B2BWorkItem } from "./b2b-types";
import styles from "./b2b-management.module.css";

type B2BDetailModalProps = {
  record: B2BRecord;
  initialTab: B2BDetailTab;
  onClose: () => void;
  onAddNote: (text: string) => void;
};

const tabs: { id: B2BDetailTab; label: string }[] = [
  { id: "company", label: "Firma Bilgileri" },
  { id: "needs", label: "Başvuru ve İhtiyaçlar" },
  { id: "work", label: "Siparişler ve Projeler" },
  { id: "documents", label: "Belgeler" },
  { id: "history", label: "Notlar ve Geçmiş" },
];

const money = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
});

function formatDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

export function B2BDetailModal({
  record,
  initialTab,
  onClose,
  onAddNote,
}: B2BDetailModalProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [noteText, setNoteText] = useState("");
  const data = record.data;
  const profile = data.profile;
  const identifier =
    record.kind === "application"
      ? record.data.applicationNumber
      : record.kind === "company"
        ? record.data.companyNumber
        : record.data.projectNumber;
  const notes = data.notes;
  const history = data.history;
  const relatedWork = data.relatedWork;
  const manager = data.manager;

  const submitNote = () => {
    const text = noteText.trim();
    if (!text) return;
    onAddNote(text);
    setNoteText("");
  };

  return (
    <CustomerModalFrame
      title={profile.companyName}
      eyebrow={identifier}
      closeLabel="B2B detayını kapat"
      onClose={onClose}
    >
      <div
        className={baseStyles.detailTabs}
        role="tablist"
        aria-label="B2B detay bölümleri"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={activeTab === tab.id ? baseStyles.activeDetailTab : ""}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={baseStyles.modalBody} role="tabpanel">
        {activeTab === "company" && (
          <dl className={baseStyles.detailGrid}>
            <Detail label="Firma adı" value={profile.companyName} />
            <Detail label="Ticari unvan" value={profile.legalName} />
            <Detail
              label="Vergi numarası"
              value={profile.taxNumber}
              hint={profile.taxOffice}
            />
            <Detail label="İşletme türü" value={profile.businessType} />
            <Detail label="Çalışan / şube ölçeği" value={profile.scaleLabel} />
            <Detail label="Web sitesi" value={profile.website} />
            <Detail
              label="Telefon"
              value={profile.phone}
              hint={profile.email}
            />
            <Detail
              label="Şehir / ülke"
              value={`${profile.city}, ${profile.country}`}
            />
            <Detail
              label="Yetkili kişi"
              value={profile.contactName}
              hint={profile.contactRole}
            />
            <Detail label="Satış pazarı" value={profile.market} />
            <Detail label="Sorumlu yönetici" value={manager} />
          </dl>
        )}

        {activeTab === "needs" && <NeedsPanel record={record} />}

        {activeTab === "work" && (
          <section className={baseStyles.detailSection}>
            <h3>Siparişler ve projeler</h3>
            {relatedWork.length ? (
              <div className={baseStyles.orderHistoryWrap}>
                <table>
                  <thead>
                    <tr>
                      <th>Numara</th>
                      <th>Tür</th>
                      <th>Oluşturulma</th>
                      <th>Tutar</th>
                      <th>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatedWork.map((item) => (
                      <WorkRow key={item.number} item={item} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty text="Henüz bağlı sipariş veya proje yok." />
            )}
          </section>
        )}

        {activeTab === "documents" && (
          <section className={baseStyles.detailSection}>
            <h3>Salt okunur belge durumları</h3>
            <div className={styles.documentGrid}>
              {data.documents.map((document) => (
                <article key={document.name}>
                  <strong>{document.name}</strong>
                  <span className={styles[`document${document.status}`]}>
                    {document.status}
                  </span>
                </article>
              ))}
            </div>
            <p className={baseStyles.privacyNotice}>
              Bu ekranda gerçek belge yükleme, indirme veya silme işlemi
              yapılmaz.
            </p>
          </section>
        )}

        {activeTab === "history" && (
          <section className={baseStyles.detailSection}>
            <h3>Yönetici notları</h3>
            <div className={baseStyles.noteList}>
              {notes.length ? (
                notes.map((note) => (
                  <article key={note.id}>
                    <p>{note.text}</p>
                    <footer>
                      <strong>{note.adminName}</strong>
                      <time>{note.date}</time>
                    </footer>
                  </article>
                ))
              ) : (
                <Empty text="Henüz yönetici notu eklenmedi." />
              )}
            </div>
            <label className={baseStyles.noteField}>
              <span>Yeni yönetici notu</span>
              <textarea
                rows={3}
                value={noteText}
                placeholder="Dahili bir not yazın..."
                onChange={(event) => setNoteText(event.target.value)}
              />
            </label>
            <div className={baseStyles.noteActions}>
              <small>Not yalnızca frontend mock state’ine eklenir.</small>
              <button
                type="button"
                disabled={!noteText.trim()}
                onClick={submitNote}
              >
                Notu Ekle
              </button>
            </div>
            <h3 className={styles.historyTitle}>Durum değişikliği geçmişi</h3>
            <ol className={styles.timeline}>
              {history.map((entry, index) => (
                <li key={`${entry.title}-${index}`}>
                  <span />
                  <div>
                    <strong>{entry.title}</strong>
                    <p>{entry.description}</p>
                    <small>{entry.date}</small>
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

function Detail({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
      {hint && <small>{hint}</small>}
    </div>
  );
}

function NeedsPanel({ record }: { record: B2BRecord }) {
  if (record.kind === "application") {
    const item = record.data;
    return (
      <dl className={baseStyles.detailGrid}>
        <Detail label="Başvuru numarası" value={item.applicationNumber} />
        <Detail
          label="Talep edilen çözümler"
          value={item.requestedSolutions.join(", ")}
        />
        <Detail label="Tahmini miktar" value={item.estimatedQuantity} />
        <Detail
          label="Tahmini bütçe"
          value={money.format(item.estimatedBudget)}
        />
        <Detail label="Talep açıklaması" value={item.description} />
        <Detail label="Hedef teslim" value={formatDate(item.targetDate)} />
        <Detail
          label="Başvuru tarihi"
          value={formatDate(item.applicationDate)}
        />
        <Detail label="Mevcut durum" value={item.status} />
      </dl>
    );
  }
  if (record.kind === "project") {
    const item = record.data;
    return (
      <dl className={baseStyles.detailGrid}>
        <Detail label="Talep/proje numarası" value={item.projectNumber} />
        <Detail label="Çözüm" value={item.solution} />
        <Detail label="Talep özeti" value={item.summary} />
        <Detail
          label="Tahmini bütçe"
          value={money.format(item.estimatedBudget)}
        />
        <Detail label="Oluşturulma" value={formatDate(item.createdAt)} />
        <Detail label="Hedef tarih" value={formatDate(item.targetDate)} />
        <Detail label="Mevcut durum" value={item.status} />
      </dl>
    );
  }
  const item = record.data;
  return (
    <dl className={baseStyles.detailGrid}>
      <Detail label="Firma numarası" value={item.companyNumber} />
      <Detail label="Aktif çözümler" value={item.activeSolutions.join(", ")} />
      <Detail
        label="Toplam sipariş/proje"
        value={String(item.totalOrdersProjects)}
      />
      <Detail label="Toplam ciro" value={money.format(item.totalRevenue)} />
      <Detail label="Son işlem" value={formatDate(item.lastActivityDate)} />
      <Detail label="Firma durumu" value={item.status} />
    </dl>
  );
}

function WorkRow({ item }: { item: B2BWorkItem }) {
  return (
    <tr>
      <td>
        <strong>{item.number}</strong>
      </td>
      <td>{item.type}</td>
      <td>{formatDate(item.createdAt)}</td>
      <td>{money.format(item.amount)}</td>
      <td>
        <span className={baseStyles.orderStatus}>{item.status}</span>
      </td>
    </tr>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className={baseStyles.emptyPanel}>
      <strong>Kayıt bulunamadı</strong>
      <p>{text}</p>
    </div>
  );
}
