"use client";

import { useState } from "react";
import { Icon, type IconName } from "./admin-icons";
import { SalesChart } from "./sales-chart";
import styles from "./admin-dashboard.module.css";

const navItems: { label: string; icon: IconName }[] = [
  { label: "Genel Bakış", icon: "home" },
  { label: "Ürünler", icon: "products" },
  { label: "Stok Yönetimi", icon: "stock" },
  { label: "Siparişler", icon: "orders" },
  { label: "Ödemeler", icon: "payments" },
  { label: "İade ve İptaller", icon: "returns" },
  { label: "B2C Müşteriler", icon: "customers" },
  { label: "B2B Yönetimi", icon: "b2b" },
  { label: "Entegrasyonlar", icon: "integrations" },
  { label: "+XTRA İçgörüleri", icon: "insights" },
  { label: "Raporlar", icon: "reports" },
  { label: "Ayarlar", icon: "settings" },
];

const metrics: {
  label: string;
  value: string;
  change: string;
  tone: string;
  icon: IconName;
}[] = [
  {
    label: "Net Satış",
    value: "₺248.650",
    change: "+%12,4",
    tone: "pink",
    icon: "sales",
  },
  {
    label: "Toplam Sipariş",
    value: "1.284",
    change: "+%8,7",
    tone: "orange",
    icon: "products",
  },
  {
    label: "Ortalama Sepet",
    value: "₺1.936",
    change: "+%4,2",
    tone: "green",
    icon: "cart",
  },
  {
    label: "Bekleyen İşlem",
    value: "23",
    change: "Aksiyon gerekli",
    tone: "purple",
    icon: "alert",
  },
];

const channels = [
  {
    name: "Sofistike.com",
    mark: "S",
    markClass: "sofistike",
    orders: "820",
    revenue: "₺156.000",
    status: "Güncel",
  },
  {
    name: "Trendyol",
    mark: "ty",
    markClass: "trendyol",
    orders: "310",
    revenue: "₺72.500",
    status: "Güncel",
  },
  {
    name: "Diğer Kanallar",
    mark: "•••",
    markClass: "other",
    orders: "154",
    revenue: "₺20.150",
    status: "Kontrol Gerekli",
  },
];

const stockAlerts = [
  { name: "Banyo Kokusu Seti", amount: "5 adet", art: "🌾" },
  { name: "Yüz Havlusu – Bej", amount: "8 adet", art: "▤" },
  { name: "Seramik Sabunluk", amount: "7 adet", art: "◒" },
];

const orders = [
  {
    id: "#SOF-2026-1284",
    channel: "Sofistike.com",
    mark: "S",
    customer: "Ayşe Yılmaz",
    amount: "₺2.450",
    status: "Hazırlanıyor",
  },
  {
    id: "#SOF-2026-1283",
    channel: "Trendyol",
    mark: "ty",
    customer: "Mehmet Demir",
    amount: "₺1.890",
    status: "Kargoda",
  },
  {
    id: "#SOF-2026-1282",
    channel: "Sofistike.com",
    mark: "S",
    customer: "Zeynep Kaya",
    amount: "₺3.750",
    status: "Teslim Edildi",
  },
  {
    id: "#SOF-2026-1281",
    channel: "Diğer Kanallar",
    mark: "•••",
    customer: "Fatma Çelik",
    amount: "₺950",
    status: "Kargoda",
  },
  {
    id: "#SOF-2026-1280",
    channel: "Sofistike.com",
    mark: "S",
    customer: "Emre Arslan",
    amount: "₺2.120",
    status: "Teslim Edildi",
  },
];

const actions: {
  label: string;
  count: number;
  icon: IconName;
  tone: string;
}[] = [
  {
    label: "Kargoya verilecek siparişler",
    count: 12,
    icon: "truck",
    tone: "pinkAction",
  },
  {
    label: "Bekleyen iadeler",
    count: 7,
    icon: "refresh",
    tone: "orangeAction",
  },
  { label: "Başarısız ödemeler", count: 4, icon: "card", tone: "purpleAction" },
];

export function AdminDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const placeholder = (label: string) =>
    setNotice(`${label} bölümü yakında kullanıma açılacak.`);

  return (
    <div className={styles.adminShell}>
      {menuOpen && (
        <button
          className={styles.scrim}
          aria-label="Menüyü kapat"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside
        className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ""}`}
      >
        <div className={styles.logo}>
          <span>SOFİSTİKE</span>
          <strong>
            <i>+</i>XTRA
          </strong>
        </div>
        <nav aria-label="Yönetim menüsü">
          {navItems.map((item, index) => (
            <button
              key={item.label}
              type="button"
              className={index === 0 ? styles.activeNav : ""}
              onClick={() => {
                if (index) placeholder(item.label);
                setMenuOpen(false);
              }}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button
          className={styles.helpBox}
          type="button"
          onClick={() => placeholder("Destek Merkezi")}
        >
          <Icon name="help" />
          <span>
            Yardıma mı ihtiyacınız var?<strong>Destek Merkezi ↗</strong>
          </span>
        </button>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.menuButton}
            aria-label="Menüyü aç"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <Icon name="menu" />
          </button>
          <div className={styles.titleBlock}>
            <h1>Genel Bakış</h1>
            <p>Tüm satış kanallarının merkezi özeti</p>
          </div>
          <time dateTime="2026-08-11">
            <Icon name="calendar" />
            11 Ağustos 2026, Salı
          </time>
          <div className={styles.tools}>
            <button
              type="button"
              className={styles.dateFilter}
              onClick={() => placeholder("Tarih filtresi")}
            >
              <Icon name="calendar" />
              <span>Son 30 Gün</span>
              <Icon name="chevron" />
            </button>
            <label className={styles.search}>
              <span className={styles.srOnly}>Ara</span>
              <input type="search" placeholder="Ara..." />
              <Icon name="search" />
            </label>
            <button
              type="button"
              className={styles.notification}
              aria-label="3 yeni bildirim"
              onClick={() => placeholder("Bildirimler")}
            >
              <Icon name="bell" />
              <span>3</span>
            </button>
            <button
              type="button"
              className={styles.profile}
              onClick={() => placeholder("Profil")}
            >
              <span className={styles.avatar}>A</span>
              <span>Admin</span>
              <Icon name="chevron" />
            </button>
          </div>
        </header>
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

        <section className={styles.metrics} aria-label="Satış özeti">
          {metrics.map((metric) => (
            <article
              className={`${styles.metricCard} ${styles[metric.tone]}`}
              key={metric.label}
            >
              <span className={styles.metricIcon}>
                <Icon name={metric.icon} />
              </span>
              <div>
                <p>{metric.label}</p>
                <strong>{metric.value}</strong>
                <small>{metric.change}</small>
              </div>
            </article>
          ))}
        </section>

        <div className={styles.topGrid}>
          <SalesChart />
          <section className={`${styles.card} ${styles.actionsCard}`}>
            <div className={styles.cardHeading}>
              <h2>Aksiyon Merkezi</h2>
            </div>
            <div className={styles.actionList}>
              {actions.map((action) => (
                <button
                  type="button"
                  key={action.label}
                  onClick={() => placeholder(action.label)}
                >
                  <span
                    className={`${styles.actionIcon} ${styles[action.tone]}`}
                  >
                    <Icon name={action.icon} />
                  </span>
                  <strong>{action.label}</strong>
                  <b>{action.count}</b>
                  <Icon name="chevron" />
                </button>
              ))}
            </div>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => placeholder("Tüm İşlemler")}
            >
              Tüm İşlemleri Gör <span>→</span>
            </button>
          </section>
        </div>

        <div className={styles.middleGrid}>
          <section className={`${styles.card} ${styles.channelsCard}`}>
            <div className={styles.cardHeading}>
              <h2>Satış Kanalları</h2>
            </div>
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Kanal</th>
                    <th>Sipariş</th>
                    <th>Ciro</th>
                    <th>Stok Durumu</th>
                  </tr>
                </thead>
                <tbody>
                  {channels.map((channel) => (
                    <tr key={channel.name}>
                      <td>
                        <span
                          className={`${styles.channelMark} ${styles[channel.markClass]}`}
                        >
                          {channel.mark}
                        </span>
                        {channel.name}
                      </td>
                      <td>{channel.orders}</td>
                      <td>{channel.revenue}</td>
                      <td>
                        <span
                          className={`${styles.stockStatus} ${channel.status === "Güncel" ? styles.current : styles.needsCheck}`}
                        >
                          {channel.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className={`${styles.card} ${styles.stockCard}`}>
            <div className={styles.cardHeading}>
              <h2>Stok Uyarıları</h2>
            </div>
            <div className={styles.stockList}>
              {stockAlerts.map((item) => (
                <button
                  type="button"
                  key={item.name}
                  onClick={() => placeholder(item.name)}
                >
                  <span className={styles.productThumb}>{item.art}</span>
                  <strong>{item.name}</strong>
                  <b>{item.amount}</b>
                  <Icon name="chevron" />
                </button>
              ))}
            </div>
          </section>
          <section className={`${styles.card} ${styles.insightCard}`}>
            <div className={styles.insightHeading}>
              <div>
                <h2>+XTRA İçgörüleri</h2>
                <p>Veriye dayalı ürün fırsatları</p>
              </div>
            </div>
            <div className={styles.insightContent}>
              <div
                className={styles.productVisual}
                role="img"
                aria-label="Leke tutmayan masa örtüsü ürün görseli"
              >
                <span>✦</span>
              </div>
              <div className={styles.insightInfo}>
                <span className={styles.futureBadge}>Gelecek Faz</span>
                <small>Geliştirme Adayı:</small>
                <h3>Leke Tutmayan Masa Örtüsü</h3>
                <div className={styles.insightStats}>
                  <span>
                    <Icon name="comment" />
                    <b>128</b>
                    <small>müşteri yorumu</small>
                  </span>
                  <span>
                    <Icon name="trend" />
                    <b>%34</b>
                    <small>talep artışı</small>
                  </span>
                </div>
                <button type="button" onClick={() => placeholder("İçgörü")}>
                  İçgörüyü İncele <span>→</span>
                </button>
              </div>
            </div>
          </section>
        </div>

        <section className={`${styles.card} ${styles.ordersCard}`}>
          <div className={styles.cardHeading}>
            <h2>Son Siparişler</h2>
          </div>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Sipariş</th>
                  <th>Kanal</th>
                  <th>Müşteri</th>
                  <th>Tutar</th>
                  <th>Durum</th>
                  <th>
                    <span className={styles.srOnly}>Detay</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.id}</strong>
                    </td>
                    <td>
                      <span
                        className={`${styles.channelMark} ${order.channel === "Trendyol" ? styles.trendyol : order.channel === "Sofistike.com" ? styles.sofistike : styles.other}`}
                      >
                        {order.mark}
                      </span>
                      {order.channel}
                    </td>
                    <td>{order.customer}</td>
                    <td>{order.amount}</td>
                    <td>
                      <span
                        className={`${styles.orderStatus} ${styles[order.status.replaceAll(" ", "").toLocaleLowerCase("tr-TR")]}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        aria-label={`${order.id} detayını aç`}
                        onClick={() => placeholder(order.id)}
                      >
                        <Icon name="chevron" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
