"use client";

import { FormEvent, useMemo, useState } from "react";
import { Icon } from "../admin-icons";
import { productCategories } from "../products/product-data";
import {
  initialStockItems,
  initialStockMovements,
  type StockItem,
  type StockMovementType,
} from "./inventory-data";
import styles from "./inventory-management.module.css";

type StockStatus = "Yeterli" | "Azalıyor" | "Tükendi";
type StockStatusFilter = "Tümü" | StockStatus;
type MovementFormType = "add" | "remove";

function getStockStatus(item: StockItem): StockStatus {
  if (item.stock === 0) return "Tükendi";
  if (item.stock <= item.minimumStock) return "Azalıyor";
  return "Yeterli";
}

function formatNow() {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

export function InventoryManagement() {
  const [items, setItems] = useState(initialStockItems);
  const [movements, setMovements] = useState(initialStockMovements);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tümü");
  const [status, setStatus] = useState<StockStatusFilter>("Tümü");
  const [selected, setSelected] = useState<number[]>([]);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [movementType, setMovementType] = useState<MovementFormType>("add");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  const summary = useMemo(
    () => ({
      total: items.reduce((total, item) => total + item.stock, 0),
      low: items.filter((item) => getStockStatus(item) === "Azalıyor").length,
      out: items.filter((item) => getStockStatus(item) === "Tükendi").length,
      pending: items.filter((item) => item.pending).length,
    }),
    [items],
  );

  const filteredItems = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("tr-TR");
    return items.filter((item) => {
      const matchesSearch =
        !query ||
        item.name.toLocaleLowerCase("tr-TR").includes(query) ||
        item.sku.toLocaleLowerCase("tr-TR").includes(query);
      const matchesCategory = category === "Tümü" || item.category === category;
      const matchesStatus =
        status === "Tümü" || getStockStatus(item) === status;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [category, items, search, status]);

  const visibleIds = filteredItems.map((item) => item.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));

  const summaryCards = [
    {
      label: "Toplam Stok",
      value: summary.total.toLocaleString("tr-TR"),
      icon: "stock" as const,
      tone: "pink",
    },
    {
      label: "Stokta Azalan",
      value: summary.low.toString(),
      icon: "alert" as const,
      tone: "orange",
    },
    {
      label: "Tükenen Ürün",
      value: summary.out.toString(),
      icon: "products" as const,
      tone: "red",
    },
    {
      label: "Stok Bekleyen",
      value: summary.pending.toString(),
      icon: "truck" as const,
      tone: "purple",
    },
  ];

  const clearFilters = () => {
    setSearch("");
    setCategory("Tümü");
    setStatus("Tümü");
  };

  const toggleAll = () => {
    setSelected((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : [...new Set([...current, ...visibleIds])],
    );
  };

  const toggleItem = (id: number) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id],
    );
  };

  const openUpdate = (item: StockItem) => {
    setEditingItem(item);
    setMovementType("add");
    setAmount("");
    setNote("");
    setFormError("");
  };

  const closeUpdate = () => {
    setEditingItem(null);
    setFormError("");
  };

  const saveMovement = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingItem) return;

    const numericAmount = Number(amount);
    if (!Number.isInteger(numericAmount) || numericAmount <= 0) {
      setFormError("Lütfen 1 veya daha büyük bir tam sayı girin.");
      return;
    }
    if (movementType === "remove" && numericAmount > editingItem.stock) {
      setFormError(`En fazla ${editingItem.stock} adet stok çıkarabilirsiniz.`);
      return;
    }

    const updatedStock =
      movementType === "add"
        ? editingItem.stock + numericAmount
        : editingItem.stock - numericAmount;
    const movementLabel: StockMovementType =
      movementType === "add" ? "Stok Girişi" : "Stok Çıkışı";
    const movementDate = formatNow();

    setItems((current) =>
      current.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              stock: updatedStock,
              lastUpdated: movementDate,
              pending: false,
            }
          : item,
      ),
    );
    setMovements((current) => [
      {
        id: Date.now(),
        productId: editingItem.id,
        productName: editingItem.name,
        type: movementLabel,
        amount: numericAmount,
        note: note.trim() || "Manuel stok güncellemesi",
        date: movementDate,
        user: "Admin",
      },
      ...current,
    ]);
    setNotice(
      `${editingItem.name} stoğu ${updatedStock} adet olarak güncellendi.`,
    );
    closeUpdate();
  };

  return (
    <div className={styles.page}>
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

      <p className={styles.intro}>
        Depo seviyelerini ve kritik stokları tek bir yerden yönetin.
      </p>

      <section className={styles.summaryGrid} aria-label="Stok özeti">
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
              <strong>{card.value}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.card} aria-labelledby="inventory-list-title">
        <div className={styles.cardHeading}>
          <div>
            <h2 id="inventory-list-title">Stok Listesi</h2>
            <p>Mevcut ve minimum stok seviyelerini karşılaştırın.</p>
          </div>
          {selected.length > 0 && (
            <span className={styles.selectionCount}>
              {selected.length} ürün seçildi
            </span>
          )}
        </div>

        <div className={styles.filters}>
          <label className={styles.searchField}>
            <span className={styles.srOnly}>Ürün adı veya SKU ara</span>
            <Icon name="search" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              type="search"
              placeholder="Ürün adı veya SKU ara..."
            />
          </label>
          <label>
            <span>Kategori</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option>Tümü</option>
              {productCategories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Stok durumu</span>
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as StockStatusFilter)
              }
            >
              <option>Tümü</option>
              <option>Yeterli</option>
              <option>Azalıyor</option>
              <option>Tükendi</option>
            </select>
          </label>
          <button
            type="button"
            className={styles.clearButton}
            onClick={clearFilters}
          >
            Filtreleri Temizle
          </button>
        </div>

        <div className={styles.resultLine}>
          {items.length} üründen {filteredItems.length} tanesi gösteriliyor
        </div>
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th className={styles.checkboxCell}>
                  <input
                    type="checkbox"
                    aria-label="Görünen tüm ürünleri seç"
                    checked={allVisibleSelected}
                    onChange={toggleAll}
                  />
                </th>
                <th>Ürün</th>
                <th>SKU</th>
                <th>Kategori</th>
                <th>Mevcut stok</th>
                <th>Minimum stok</th>
                <th>Stok durumu</th>
                <th>Son güncelleme</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const itemStatus = getStockStatus(item);
                return (
                  <tr key={item.id}>
                    <td className={styles.checkboxCell}>
                      <input
                        type="checkbox"
                        aria-label={`${item.name} ürününü seç`}
                        checked={selected.includes(item.id)}
                        onChange={() => toggleItem(item.id)}
                      />
                    </td>
                    <td>
                      <div className={styles.productIdentity}>
                        <span
                          className={`${styles.productVisual} ${styles[item.visualTone]}`}
                        >
                          {item.visual}
                        </span>
                        <strong>{item.name}</strong>
                      </div>
                    </td>
                    <td>
                      <code>{item.sku}</code>
                    </td>
                    <td>{item.category}</td>
                    <td>
                      <strong
                        className={
                          itemStatus === "Tükendi"
                            ? styles.stockEmpty
                            : itemStatus === "Azalıyor"
                              ? styles.stockLow
                              : styles.stockEnough
                        }
                      >
                        {item.stock} adet
                      </strong>
                    </td>
                    <td>{item.minimumStock} adet</td>
                    <td>
                      <span
                        className={
                          itemStatus === "Tükendi"
                            ? styles.statusEmpty
                            : itemStatus === "Azalıyor"
                              ? styles.statusLow
                              : styles.statusEnough
                        }
                      >
                        {itemStatus}
                      </span>
                    </td>
                    <td className={styles.updatedAt}>{item.lastUpdated}</td>
                    <td>
                      <button
                        type="button"
                        className={styles.updateButton}
                        onClick={() => openUpdate(item)}
                      >
                        Stok Güncelle
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredItems.length === 0 && (
            <div className={styles.emptyState}>
              <span>
                <Icon name="search" />
              </span>
              <h3>Stok kaydı bulunamadı</h3>
              <p>Aramanızı veya filtrelerinizi değiştirerek tekrar deneyin.</p>
              <button type="button" onClick={clearFilters}>
                Filtreleri Temizle
              </button>
            </div>
          )}
        </div>
      </section>

      <section
        className={`${styles.card} ${styles.movementsCard}`}
        aria-labelledby="movements-title"
      >
        <div className={styles.cardHeading}>
          <div>
            <h2 id="movements-title">Son Stok Hareketleri</h2>
            <p>Depoya giren ve depodan çıkan son ürün hareketleri.</p>
          </div>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.movementsTable}>
            <thead>
              <tr>
                <th>Ürün</th>
                <th>İşlem türü</th>
                <th>Miktar</th>
                <th>Açıklama</th>
                <th>Tarih</th>
                <th>İşlemi yapan</th>
              </tr>
            </thead>
            <tbody>
              {movements.slice(0, 8).map((movement) => (
                <tr key={movement.id}>
                  <td>
                    <strong>{movement.productName}</strong>
                  </td>
                  <td>
                    <span
                      className={
                        movement.type === "Stok Girişi"
                          ? styles.movementIn
                          : styles.movementOut
                      }
                    >
                      {movement.type}
                    </span>
                  </td>
                  <td
                    className={
                      movement.type === "Stok Girişi"
                        ? styles.amountIn
                        : styles.amountOut
                    }
                  >
                    {movement.type === "Stok Girişi" ? "+" : "−"}
                    {movement.amount} adet
                  </td>
                  <td>{movement.note}</td>
                  <td className={styles.updatedAt}>{movement.date}</td>
                  <td>{movement.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {editingItem && (
        <div className={styles.modalLayer}>
          <button
            className={styles.modalScrim}
            type="button"
            aria-label="Stok güncelleme penceresini kapat"
            onClick={closeUpdate}
          />
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="stock-modal-title"
          >
            <div className={styles.modalHeading}>
              <div>
                <span
                  className={`${styles.productVisual} ${styles[editingItem.visualTone]}`}
                >
                  {editingItem.visual}
                </span>
                <div>
                  <h2 id="stock-modal-title">Stok Güncelle</h2>
                  <p>
                    {editingItem.name} · Mevcut stok:{" "}
                    <strong>{editingItem.stock} adet</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Pencereyi kapat"
                onClick={closeUpdate}
              >
                ×
              </button>
            </div>
            <form onSubmit={saveMovement}>
              <fieldset>
                <legend>İşlem türü</legend>
                <div className={styles.typeOptions}>
                  <label
                    className={
                      movementType === "add" ? styles.selectedType : ""
                    }
                  >
                    <input
                      type="radio"
                      name="movementType"
                      value="add"
                      checked={movementType === "add"}
                      onChange={() => {
                        setMovementType("add");
                        setFormError("");
                      }}
                    />
                    <span>＋</span>
                    <strong>Stok Ekle</strong>
                  </label>
                  <label
                    className={
                      movementType === "remove" ? styles.selectedType : ""
                    }
                  >
                    <input
                      type="radio"
                      name="movementType"
                      value="remove"
                      checked={movementType === "remove"}
                      onChange={() => {
                        setMovementType("remove");
                        setFormError("");
                      }}
                    />
                    <span>−</span>
                    <strong>Stok Çıkar</strong>
                  </label>
                </div>
              </fieldset>
              <label className={styles.formField}>
                <span>Miktar</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(event) => {
                    setAmount(event.target.value);
                    setFormError("");
                  }}
                  placeholder="Örn. 12"
                  required
                />
              </label>
              <label className={styles.formField}>
                <span>Kısa açıklama / not</span>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Stok hareketiyle ilgili kısa bir not yazın..."
                  rows={3}
                />
              </label>
              {formError && (
                <p className={styles.formError} role="alert">
                  {formError}
                </p>
              )}
              <div className={styles.modalActions}>
                <button type="button" onClick={closeUpdate}>
                  Vazgeç
                </button>
                <button type="submit">İşlemi Kaydet</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
