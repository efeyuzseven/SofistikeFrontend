"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "../admin-icons";
import baseStyles from "../customers/customer-management.module.css";
import { ApplicationReviewModal } from "./application-review-modal";
import { B2BActionsMenu, type B2BMenuAction } from "./b2b-actions-menu";
import {
  initialB2BApplications,
  initialB2BCompanies,
  initialB2BProjects,
} from "./b2b-data";
import { B2BDetailModal } from "./b2b-detail-modal";
import styles from "./b2b-management.module.css";
import { ManagerAssignmentModal } from "./manager-assignment-modal";
import {
  applicationStatuses,
  b2bMarkets,
  b2bSolutions,
  businessTypes,
  companyStatuses,
  mockManagers,
  projectStatuses,
  type ApplicationDecision,
  type ApplicationStatus,
  type B2BApplication,
  type B2BCompany,
  type B2BDetailTab,
  type B2BDocument,
  type B2BManager,
  type B2BProject,
  type B2BRecord,
  type B2BTab,
} from "./b2b-types";

type ActiveModal =
  | {
      kind: "detail";
      recordKind: B2BRecord["kind"];
      id: number;
      tab: B2BDetailTab;
    }
  | { kind: "review"; id: number }
  | { kind: "assign"; recordKind: B2BRecord["kind"]; id: number };

type FilterRecord = B2BApplication | B2BCompany | B2BProject;
const pageSize = 5;
const money = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
});

function formatDate(value: string) {
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

function statusClass(status: string) {
  const key = status
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
  return styles[`status${key}`];
}

export function B2BManagement() {
  // Tüm işlemler yalnızca frontend mock state'ini günceller ve sayfa yenilenince sıfırlanır.
  const [applications, setApplications] = useState(initialB2BApplications);
  const [companies, setCompanies] = useState(initialB2BCompanies);
  const [projects, setProjects] = useState(initialB2BProjects);
  const [activeTab, setActiveTab] = useState<B2BTab>("applications");
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [businessType, setBusinessType] = useState("Tümü");
  const [solution, setSolution] = useState("Tümü");
  const [status, setStatus] = useState("Tümü");
  const [location, setLocation] = useState("");
  const [market, setMarket] = useState("Tümü");
  const [manager, setManager] = useState("Tümü");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [activeModal, setActiveModal] = useState<ActiveModal | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 450);
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
    const previousBody = document.body.style.overflow;
    const previousShell = shell?.style.overflow ?? "";
    document.body.style.overflow = "hidden";
    if (shell) shell.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBody;
      if (shell) shell.style.overflow = previousShell;
    };
  }, [activeModal]);

  const summary = useMemo(() => {
    const currentMonth = new Intl.DateTimeFormat("sv-SE", {
      year: "numeric",
      month: "2-digit",
      timeZone: "Europe/Istanbul",
    }).format(new Date());
    return {
      totalCompanies: companies.length,
      pending: applications.filter((item) =>
        ["Yeni Başvuru", "İnceleniyor", "Belge Bekleniyor"].includes(
          item.status,
        ),
      ).length,
      active: companies.filter((item) => item.status === "Aktif").length,
      openProjects: projects.filter(
        (item) => !["Tamamlandı", "İptal Edildi"].includes(item.status),
      ).length,
      approvedThisMonth: applications.filter(
        (item) =>
          item.status === "Onaylandı" &&
          item.approvalDate?.startsWith(currentMonth),
      ).length,
    };
  }, [applications, companies, projects]);

  const filteredRecords = useMemo(() => {
    const currentRecords: FilterRecord[] =
      activeTab === "applications"
        ? applications
        : activeTab === "companies"
          ? companies
          : projects;
    const query = search.trim().toLocaleLowerCase("tr-TR");
    const place = location.trim().toLocaleLowerCase("tr-TR");
    return currentRecords.filter((record) => {
      const identifier =
        "applicationNumber" in record
          ? record.applicationNumber
          : "projectNumber" in record
            ? record.projectNumber
            : record.companyNumber;
      const recordSolutions =
        "requestedSolutions" in record
          ? record.requestedSolutions
          : "activeSolutions" in record
            ? record.activeSolutions
            : [record.solution];
      const recordDate =
        "applicationDate" in record
          ? record.applicationDate
          : "approvedAt" in record
            ? record.approvedAt
            : record.createdAt;
      const searchable = [
        record.profile.companyName,
        record.profile.contactName,
        identifier,
        record.profile.email,
        record.profile.taxNumber,
      ];
      return (
        (!query ||
          searchable.some((value) =>
            value.toLocaleLowerCase("tr-TR").includes(query),
          )) &&
        (businessType === "Tümü" ||
          record.profile.businessType === businessType) &&
        (solution === "Tümü" || recordSolutions.includes(solution as never)) &&
        (status === "Tümü" || record.status === status) &&
        (!place ||
          record.profile.city.toLocaleLowerCase("tr-TR").includes(place) ||
          record.profile.country.toLocaleLowerCase("tr-TR").includes(place)) &&
        (market === "Tümü" || record.profile.market === market) &&
        (manager === "Tümü" || record.manager === manager) &&
        (!startDate || recordDate.slice(0, 10) >= startDate) &&
        (!endDate || recordDate.slice(0, 10) <= endDate)
      );
    });
  }, [
    activeTab,
    applications,
    businessType,
    companies,
    endDate,
    location,
    manager,
    market,
    projects,
    search,
    solution,
    startDate,
    status,
  ]);

  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const activePage = Math.min(currentPage, pageCount);
  const visibleRecords = filteredRecords.slice(
    (activePage - 1) * pageSize,
    activePage * pageSize,
  );
  const statusOptions =
    activeTab === "applications"
      ? applicationStatuses
      : activeTab === "companies"
        ? companyStatuses
        : projectStatuses;

  const resetFilters = () => {
    setSearch("");
    setBusinessType("Tümü");
    setSolution("Tümü");
    setStatus("Tümü");
    setLocation("");
    setMarket("Tümü");
    setManager("Tümü");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };
  const changeTab = (tab: B2BTab) => {
    setActiveTab(tab);
    setStatus("Tümü");
    setCurrentPage(1);
    setOpenMenuId(null);
  };

  const getRecord = (
    kind: B2BRecord["kind"],
    id: number,
  ): B2BRecord | undefined => {
    if (kind === "application") {
      const data = applications.find((item) => item.id === id);
      return data ? { kind, data } : undefined;
    }
    if (kind === "company") {
      const data = companies.find((item) => item.id === id);
      return data ? { kind, data } : undefined;
    }
    const data = projects.find((item) => item.id === id);
    return data ? { kind, data } : undefined;
  };
  const activeRecord =
    activeModal && activeModal.kind !== "review"
      ? getRecord(activeModal.recordKind, activeModal.id)
      : undefined;
  const reviewApplication =
    activeModal?.kind === "review"
      ? applications.find((item) => item.id === activeModal.id)
      : undefined;

  const menuAction = (record: B2BRecord, action: B2BMenuAction) => {
    setOpenMenuId(null);
    if (action === "review" && record.kind === "application")
      setActiveModal({ kind: "review", id: record.data.id });
    else if (action === "assign")
      setActiveModal({
        kind: "assign",
        recordKind: record.kind,
        id: record.data.id,
      });
    else
      setActiveModal({
        kind: "detail",
        recordKind: record.kind,
        id: record.data.id,
        tab:
          action === "company"
            ? "company"
            : action === "project"
              ? "work"
              : action === "note"
                ? "history"
                : "company",
      });
  };

  const updateRecord = (
    record: B2BRecord,
    updater: (data: typeof record.data) => typeof record.data,
  ) => {
    if (record.kind === "application")
      setApplications((items) =>
        items.map((item) =>
          item.id === record.data.id ? (updater(item) as B2BApplication) : item,
        ),
      );
    if (record.kind === "company")
      setCompanies((items) =>
        items.map((item) =>
          item.id === record.data.id ? (updater(item) as B2BCompany) : item,
        ),
      );
    if (record.kind === "project")
      setProjects((items) =>
        items.map((item) =>
          item.id === record.data.id ? (updater(item) as B2BProject) : item,
        ),
      );
  };
  const addNote = (record: B2BRecord, text: string) => {
    updateRecord(record, (data) => ({
      ...data,
      notes: [
        ...data.notes,
        { id: `note-${Date.now()}`, text, adminName: "Admin", date: nowText() },
      ],
    }));
    setNotice("Yönetici notu frontend mock kaydına eklendi.");
  };
  const assignManager = (
    record: B2BRecord,
    nextManager: B2BManager,
    note: string,
  ) => {
    const stamp = nowText();
    updateRecord(record, (data) => ({
      ...data,
      manager: nextManager,
      notes: note
        ? [
            ...data.notes,
            {
              id: `note-${Date.now()}`,
              text: note,
              adminName: "Admin",
              date: stamp,
            },
          ]
        : data.notes,
      history: [
        ...data.history,
        {
          title: "Sorumlu yönetici değiştirildi",
          description: `${data.manager} → ${nextManager}`,
          date: stamp,
        },
      ],
    }));
    setActiveModal(null);
    setNotice(
      `${record.data.profile.companyName} için sorumlu yönetici güncellendi.`,
    );
  };

  const review = (
    application: B2BApplication,
    decision: ApplicationDecision,
    note: string,
    missingDocuments: B2BDocument["name"][],
  ) => {
    const stamp = nowText();
    const iso = new Date().toISOString();
    const nextStatus: ApplicationStatus =
      decision === "approve"
        ? "Onaylandı"
        : decision === "reject"
          ? "Reddedildi"
          : "Belge Bekleniyor";
    setApplications((items) =>
      items.map((item) =>
        item.id === application.id
          ? {
              ...item,
              status: nextStatus,
              approvalDate: decision === "approve" ? iso : item.approvalDate,
              documents:
                decision === "request-documents"
                  ? item.documents.map((document) =>
                      missingDocuments.includes(document.name)
                        ? { ...document, status: "Eksik" }
                        : document,
                    )
                  : item.documents,
              notes: note
                ? [
                    ...item.notes,
                    {
                      id: `note-${Date.now()}`,
                      text: note,
                      adminName: "Admin",
                      date: stamp,
                    },
                  ]
                : item.notes,
              history: [
                ...item.history,
                {
                  title:
                    decision === "approve"
                      ? "Başvuru onaylandı"
                      : decision === "reject"
                        ? "Başvuru reddedildi"
                        : "Belge talep edildi",
                  description: note || "İşlem yönetici tarafından tamamlandı.",
                  date: stamp,
                },
              ],
            }
          : item,
      ),
    );
    if (
      decision === "approve" &&
      !companies.some(
        (item) =>
          item.sourceApplicationNumber === application.applicationNumber,
      )
    ) {
      const nextId = Math.max(0, ...companies.map((item) => item.id)) + 1;
      setCompanies((items) => [
        ...items,
        {
          id: nextId,
          companyNumber: `B2B-2026-${String(220 + nextId).padStart(4, "0")}`,
          sourceApplicationNumber: application.applicationNumber,
          profile: application.profile,
          activeSolutions: application.requestedSolutions,
          totalOrdersProjects: 0,
          totalRevenue: 0,
          lastActivityDate: iso,
          approvedAt: iso,
          manager: application.manager,
          status: "Aktif",
          documents: application.documents,
          notes: note
            ? [
                ...application.notes,
                {
                  id: `note-${Date.now()}`,
                  text: note,
                  adminName: "Admin",
                  date: stamp,
                },
              ]
            : application.notes,
          history: [
            ...application.history,
            {
              title: "Aktif firma oluşturuldu",
              description: "Başvuru frontend mock state'inde onaylandı.",
              date: stamp,
            },
          ],
          relatedWork: application.relatedWork,
        },
      ]);
    }
    setActiveModal(null);
    setNotice(
      decision === "approve"
        ? "Başvuru onaylandı ve firma Aktif Firmalar sekmesine eklendi."
        : decision === "reject"
          ? "Başvuru frontend mock state'inde reddedildi."
          : "Eksik belge talebi frontend mock state'ine kaydedildi.",
    );
  };

  if (isLoading) return <Loading />;
  return (
    <section className={baseStyles.page}>
      <p className={baseStyles.intro}>
        Kurumsal başvuruları, iş ortaklarını ve projeleri tek merkezden yönetin.
      </p>
      <div className={baseStyles.summaryGrid}>
        <Summary
          title="Toplam B2B firma"
          value={summary.totalCompanies}
          tone="pink"
          icon="customers"
        />
        <Summary
          title="Bekleyen başvurular"
          value={summary.pending}
          tone="orange"
          icon="orders"
        />
        <Summary
          title="Aktif iş ortakları"
          value={summary.active}
          tone="green"
          icon="insights"
        />
        <Summary
          title="Açık talepler"
          value={summary.openProjects}
          tone="blue"
          icon="reports"
        />
        <Summary
          title="Bu ay onaylanan"
          value={summary.approvedThisMonth}
          tone="purple"
          icon="calendar"
        />
      </div>

      <div className={baseStyles.card}>
        <div className={baseStyles.cardHeading}>
          <div>
            <h2>B2B Yönetimi</h2>
            <p>
              Başvurular, firmalar ve talepler frontend mock verileriyle
              gösterilir.
            </p>
          </div>
          <span className={baseStyles.crmBadge}>Kurumsal Satış · B2B CRM</span>
        </div>
        <div
          className={styles.mainTabs}
          role="tablist"
          aria-label="B2B yönetimi bölümleri"
        >
          <Tab
            active={activeTab === "applications"}
            onClick={() => changeTab("applications")}
            label="Başvurular"
            count={applications.length}
          />
          <Tab
            active={activeTab === "companies"}
            onClick={() => changeTab("companies")}
            label="Aktif Firmalar"
            count={companies.length}
          />
          <Tab
            active={activeTab === "projects"}
            onClick={() => changeTab("projects")}
            label="Talepler ve Projeler"
            count={projects.length}
          />
        </div>
        <div className={baseStyles.filters}>
          <label className={baseStyles.searchField}>
            <Icon name="search" />
            <span className={baseStyles.srOnly}>B2B kayıtlarında ara</span>
            <input
              type="search"
              value={search}
              placeholder={
                activeTab === "applications"
                  ? "Firma, yetkili, başvuru no, e-posta veya vergi no..."
                  : activeTab === "companies"
                    ? "Firma, yetkili, firma no, e-posta veya vergi no..."
                    : "Firma, yetkili, proje no, e-posta veya vergi no..."
              }
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
            />
          </label>
          <Filter
            label="İşletme türü"
            value={businessType}
            onChange={(value) => {
              setBusinessType(value);
              setCurrentPage(1);
            }}
            options={businessTypes}
          />
          <Filter
            label="Talep edilen çözüm"
            value={solution}
            onChange={(value) => {
              setSolution(value);
              setCurrentPage(1);
            }}
            options={b2bSolutions}
          />
          <Filter
            label={
              activeTab === "applications"
                ? "Başvuru durumu"
                : activeTab === "companies"
                  ? "Firma durumu"
                  : "Talep/proje durumu"
            }
            value={status}
            onChange={(value) => {
              setStatus(value);
              setCurrentPage(1);
            }}
            options={statusOptions}
          />
          <label>
            Ülke veya şehir
            <input
              value={location}
              placeholder="Şehir veya ülke"
              onChange={(event) => {
                setLocation(event.target.value);
                setCurrentPage(1);
              }}
            />
          </label>
          <Filter
            label="Satış pazarı"
            value={market}
            onChange={(value) => {
              setMarket(value);
              setCurrentPage(1);
            }}
            options={b2bMarkets}
          />
          <Filter
            label="Sorumlu yönetici"
            value={manager}
            onChange={(value) => {
              setManager(value);
              setCurrentPage(1);
            }}
            options={mockManagers}
          />
          <label>
            Başlangıç tarihi
            <input
              type="date"
              value={startDate}
              onChange={(event) => {
                setStartDate(event.target.value);
                setCurrentPage(1);
              }}
            />
          </label>
          <label>
            Bitiş tarihi
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(event) => {
                setEndDate(event.target.value);
                setCurrentPage(1);
              }}
            />
          </label>
          <button
            type="button"
            className={baseStyles.clearButton}
            onClick={resetFilters}
          >
            Filtreleri Temizle
          </button>
        </div>
        <p className={baseStyles.resultLine}>
          {filteredRecords.length} kayıttan {visibleRecords.length} tanesi
          gösteriliyor
        </p>
        {visibleRecords.length ? (
          <RecordsTable
            tab={activeTab}
            records={visibleRecords}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
            onAction={menuAction}
          />
        ) : (
          <EmptyState onReset={resetFilters} />
        )}
        <div className={baseStyles.pagination}>
          <span>
            {filteredRecords.length
              ? `${(activePage - 1) * pageSize + 1}-${Math.min(activePage * pageSize, filteredRecords.length)} / ${filteredRecords.length} kayıt`
              : "0 kayıt"}
          </span>
          <div>
            <button
              type="button"
              aria-label="Önceki sayfa"
              disabled={activePage === 1}
              onClick={() => setCurrentPage(activePage - 1)}
            >
              <Icon name="chevron" />
            </button>
            <strong>{activePage}</strong>
            <span>/ {pageCount}</span>
            <button
              type="button"
              aria-label="Sonraki sayfa"
              disabled={activePage === pageCount}
              onClick={() => setCurrentPage(activePage + 1)}
            >
              <Icon name="chevron" />
            </button>
          </div>
        </div>
      </div>

      {activeModal?.kind === "detail" && activeRecord && (
        <B2BDetailModal
          record={activeRecord}
          initialTab={activeModal.tab}
          onClose={() => setActiveModal(null)}
          onAddNote={(text) => addNote(activeRecord, text)}
        />
      )}
      {activeModal?.kind === "assign" && activeRecord && (
        <ManagerAssignmentModal
          label={activeRecord.data.profile.companyName}
          currentManager={activeRecord.data.manager}
          onClose={() => setActiveModal(null)}
          onConfirm={(nextManager, note) =>
            assignManager(activeRecord, nextManager, note)
          }
        />
      )}
      {activeModal?.kind === "review" && reviewApplication && (
        <ApplicationReviewModal
          application={reviewApplication}
          onClose={() => setActiveModal(null)}
          onConfirm={(decision, note, documents) =>
            review(reviewApplication, decision, note, documents)
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

function Summary({
  title,
  value,
  tone,
  icon,
}: {
  title: string;
  value: number;
  tone: "pink" | "orange" | "green" | "blue" | "purple";
  icon: Parameters<typeof Icon>[0]["name"];
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
        <small>Mock kayıtlardan hesaplandı</small>
      </div>
    </article>
  );
}

function Tab({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={active ? styles.activeMainTab : ""}
      onClick={onClick}
    >
      <span>{label}</span>
      <b>{count}</b>
    </button>
  );
}

function Filter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
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

function RecordsTable({
  tab,
  records,
  openMenuId,
  setOpenMenuId,
  onAction,
}: {
  tab: B2BTab;
  records: FilterRecord[];
  openMenuId: number | null;
  setOpenMenuId: (id: number | null) => void;
  onAction: (record: B2BRecord, action: B2BMenuAction) => void;
}) {
  return (
    <div className={baseStyles.tableWrap}>
      {tab === "applications" ? (
        <ApplicationsTable
          records={records as B2BApplication[]}
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
          onAction={onAction}
        />
      ) : tab === "companies" ? (
        <CompaniesTable
          records={records as B2BCompany[]}
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
          onAction={onAction}
        />
      ) : (
        <ProjectsTable
          records={records as B2BProject[]}
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
          onAction={onAction}
        />
      )}
    </div>
  );
}

type TableActions = Pick<
  Parameters<typeof RecordsTable>[0],
  "openMenuId" | "setOpenMenuId" | "onAction"
>;
function ApplicationsTable({
  records,
  openMenuId,
  setOpenMenuId,
  onAction,
}: { records: B2BApplication[] } & TableActions) {
  return (
    <table>
      <thead>
        <tr>
          <th>Başvuru numarası</th>
          <th>Firma adı</th>
          <th>İşletme türü</th>
          <th>Yetkili kişi</th>
          <th>Şehir / ülke</th>
          <th>Talep edilen çözümler</th>
          <th>Başvuru tarihi</th>
          <th>Sorumlu yönetici</th>
          <th>Durum</th>
          <th>İşlemler</th>
        </tr>
      </thead>
      <tbody>
        {records.map((item) => {
          const record: B2BRecord = { kind: "application", data: item };
          return (
            <tr key={item.id}>
              <td>
                <strong>{item.applicationNumber}</strong>
              </td>
              <td>{item.profile.companyName}</td>
              <td>{item.profile.businessType}</td>
              <td>
                <Contact item={item.profile} />
              </td>
              <td>
                {item.profile.city}, {item.profile.country}
              </td>
              <td>
                <Solutions values={item.requestedSolutions} />
              </td>
              <td>{formatDate(item.applicationDate)}</td>
              <td>{item.manager}</td>
              <td>
                <Status value={item.status} />
              </td>
              <td>
                <B2BActionsMenu
                  id={item.id}
                  label={item.profile.companyName}
                  tab="applications"
                  canReview={!["Onaylandı", "Reddedildi"].includes(item.status)}
                  isOpen={openMenuId === item.id}
                  onToggle={setOpenMenuId}
                  onAction={(action) => onAction(record, action)}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
function CompaniesTable({
  records,
  openMenuId,
  setOpenMenuId,
  onAction,
}: { records: B2BCompany[] } & TableActions) {
  return (
    <table>
      <thead>
        <tr>
          <th>Firma numarası</th>
          <th>Firma adı</th>
          <th>İşletme türü</th>
          <th>Yetkili kişi</th>
          <th>Şehir / ülke</th>
          <th>Aktif çözümler</th>
          <th>Toplam sipariş/proje</th>
          <th>Toplam ciro</th>
          <th>Son işlem tarihi</th>
          <th>Durum</th>
          <th>İşlemler</th>
        </tr>
      </thead>
      <tbody>
        {records.map((item) => {
          const record: B2BRecord = { kind: "company", data: item };
          return (
            <tr key={item.id}>
              <td>
                <strong>{item.companyNumber}</strong>
              </td>
              <td>{item.profile.companyName}</td>
              <td>{item.profile.businessType}</td>
              <td>
                <Contact item={item.profile} />
              </td>
              <td>
                {item.profile.city}, {item.profile.country}
              </td>
              <td>
                <Solutions values={item.activeSolutions} />
              </td>
              <td>{item.totalOrdersProjects}</td>
              <td className={baseStyles.amount}>
                {money.format(item.totalRevenue)}
              </td>
              <td>{formatDate(item.lastActivityDate)}</td>
              <td>
                <Status value={item.status} />
              </td>
              <td>
                <B2BActionsMenu
                  id={item.id}
                  label={item.profile.companyName}
                  tab="companies"
                  isOpen={openMenuId === item.id}
                  onToggle={setOpenMenuId}
                  onAction={(action) => onAction(record, action)}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
function ProjectsTable({
  records,
  openMenuId,
  setOpenMenuId,
  onAction,
}: { records: B2BProject[] } & TableActions) {
  return (
    <table>
      <thead>
        <tr>
          <th>Talep/proje numarası</th>
          <th>Firma adı</th>
          <th>Çözüm türü</th>
          <th>Talep özeti</th>
          <th>Tahmini bütçe</th>
          <th>Oluşturulma</th>
          <th>Hedef tarih</th>
          <th>Sorumlu yönetici</th>
          <th>Durum</th>
          <th>İşlemler</th>
        </tr>
      </thead>
      <tbody>
        {records.map((item) => {
          const record: B2BRecord = { kind: "project", data: item };
          return (
            <tr key={item.id}>
              <td>
                <strong>{item.projectNumber}</strong>
              </td>
              <td>{item.profile.companyName}</td>
              <td>
                <Solutions values={[item.solution]} />
              </td>
              <td className={styles.summaryCell}>{item.summary}</td>
              <td className={baseStyles.amount}>
                {money.format(item.estimatedBudget)}
              </td>
              <td>{formatDate(item.createdAt)}</td>
              <td>{formatDate(item.targetDate)}</td>
              <td>{item.manager}</td>
              <td>
                <Status value={item.status} />
              </td>
              <td>
                <B2BActionsMenu
                  id={item.id}
                  label={item.profile.companyName}
                  tab="projects"
                  isOpen={openMenuId === item.id}
                  onToggle={setOpenMenuId}
                  onAction={(action) => onAction(record, action)}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
function Contact({ item }: { item: B2BApplication["profile"] }) {
  return (
    <span className={styles.contact}>
      <strong>{item.contactName}</strong>
      <small>{item.contactRole}</small>
    </span>
  );
}
function Solutions({ values }: { values: readonly string[] }) {
  return (
    <span className={styles.solutionList}>
      {values.slice(0, 2).map((value) => (
        <span key={value}>{value}</span>
      ))}
      {values.length > 2 && <b>+{values.length - 2}</b>}
    </span>
  );
}
function Status({ value }: { value: string }) {
  return (
    <span className={`${styles.statusBadge} ${statusClass(value)}`}>
      {value}
    </span>
  );
}
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className={baseStyles.emptyState}>
      <span>
        <Icon name="search" />
      </span>
      <h3>Kayıt bulunamadı</h3>
      <p>Arama veya filtre ölçütlerini değiştirin.</p>
      <button type="button" onClick={onReset}>
        Filtreleri Temizle
      </button>
    </div>
  );
}
function Loading() {
  return (
    <section className={baseStyles.page} aria-label="B2B kayıtları yükleniyor">
      <div className={baseStyles.loadingIntro} />
      <div className={baseStyles.loadingSummary}>
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className={baseStyles.skeletonCard} />
        ))}
      </div>
      <div className={baseStyles.loadingTable}>
        <div className={baseStyles.loadingHeading} />
        <div className={baseStyles.loadingFilters} />
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className={baseStyles.loadingRow} />
        ))}
      </div>
    </section>
  );
}
