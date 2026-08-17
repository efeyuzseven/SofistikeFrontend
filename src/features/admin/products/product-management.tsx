"use client";

import { useMemo, useState } from "react";
import { Icon } from "../admin-icons";
import { mockProducts } from "./product-data";
import { ProductActionsMenu } from "./product-actions-menu";
import { ProductDeleteModal } from "./product-delete-modal";
import { ProductDetailModal } from "./product-detail-modal";
import { ProductFormModal } from "./product-form-modal";
import {
  productCategories,
  type AdminProduct,
  type ProductFormValues,
  type ProductVisualTone,
} from "./product-types";
import styles from "./product-management.module.css";

type StockFilter = "Tümü" | "Stokta" | "Stokta Az" | "Tükendi";
type StatusFilter = "Tümü" | "Aktif" | "Pasif";

const currency = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 2,
});

const pageSize = 5;

const visualTones: ProductVisualTone[] = [
  "rose",
  "sand",
  "lavender",
  "peach",
  "mint",
];

const createVisual = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toLocaleUpperCase("tr-TR");

export function ProductManagement() {
  const [productList, setProductList] = useState<AdminProduct[]>(mockProducts);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tümü");
  const [status, setStatus] = useState<StatusFilter>("Tümü");
  const [stock, setStock] = useState<StockFilter>("Tümü");
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [notice, setNotice] = useState("");
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(
    null,
  );
  const [viewingProduct, setViewingProduct] = useState<AdminProduct | null>(
    null,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [openMenuProductId, setOpenMenuProductId] = useState<number | null>(
    null,
  );
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(
    null,
  );

  const summaryCards = useMemo(
    () => [
      {
        label: "Toplam Ürün",
        value: productList.length,
        icon: "products" as const,
        tone: "pink",
      },
      {
        label: "Aktif Ürün",
        value: productList.filter((product) => product.status === "Aktif")
          .length,
        icon: "trend" as const,
        tone: "green",
      },
      {
        label: "Stokta Azalan",
        value: productList.filter(
          (product) =>
            product.stock > 0 && product.stock <= product.minimumStock,
        ).length,
        icon: "alert" as const,
        tone: "orange",
      },
      {
        label: "Pasif Ürün",
        value: productList.filter((product) => product.status === "Pasif")
          .length,
        icon: "stock" as const,
        tone: "purple",
      },
    ],
    [productList],
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("tr-TR");
    return productList.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLocaleLowerCase("tr-TR").includes(query) ||
        product.sku.toLocaleLowerCase("tr-TR").includes(query);
      const matchesCategory =
        category === "Tümü" || product.category === category;
      const matchesStatus = status === "Tümü" || product.status === status;
      const matchesStock =
        stock === "Tümü" ||
        (stock === "Stokta" && product.stock > product.minimumStock) ||
        (stock === "Stokta Az" &&
          product.stock > 0 &&
          product.stock <= product.minimumStock) ||
        (stock === "Tükendi" && product.stock === 0);
      return matchesSearch && matchesCategory && matchesStatus && matchesStock;
    });
  }, [category, productList, search, status, stock]);

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const activePage = Math.min(currentPage, pageCount);
  const pageStart = (activePage - 1) * pageSize;
  const visibleProducts = filteredProducts.slice(
    pageStart,
    pageStart + pageSize,
  );
  const visibleIds = visibleProducts.map((product) => product.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));

  const clearFilters = () => {
    setSearch("");
    setCategory("Tümü");
    setStatus("Tümü");
    setStock("Tümü");
    setCurrentPage(1);
  };

  const toggleAll = () => {
    setSelected((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : [...new Set([...current, ...visibleIds])],
    );
  };

  const toggleProduct = (id: number) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const showNotice = (message: string) => setNotice(message);

  const openCreateForm = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const openEditForm = (product: AdminProduct) => {
    setViewingProduct(null);
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const saveProduct = (values: ProductFormValues) => {
    if (editingProduct) {
      setProductList((current) =>
        current.map((product) =>
          product.id === editingProduct.id
            ? { ...product, ...values }
            : product,
        ),
      );
      showNotice(`${values.name} başarıyla güncellendi.`);
    } else {
      const nextId =
        Math.max(0, ...productList.map((product) => product.id)) + 1;
      const newProduct: AdminProduct = {
        ...values,
        id: nextId,
        visual: createVisual(values.name),
        visualTone: visualTones[nextId % visualTones.length],
      };
      setProductList((current) => [newProduct, ...current]);
      clearFilters();
      showNotice(`${values.name} başarıyla eklendi.`);
    }
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const toggleProductStatus = (product: AdminProduct) => {
    const nextStatus = product.status === "Aktif" ? "Pasif" : "Aktif";
    setProductList((current) =>
      current.map((item) =>
        item.id === product.id ? { ...item, status: nextStatus } : item,
      ),
    );
    setOpenMenuProductId(null);

    const remainsInResults = status === "Tümü" || status === nextStatus;
    if (!remainsInResults) {
      const nextPageCount = Math.max(
        1,
        Math.ceil((filteredProducts.length - 1) / pageSize),
      );
      setCurrentPage((page) => Math.min(page, nextPageCount));
    }
    showNotice(
      `${product.name} başarıyla ${nextStatus.toLocaleLowerCase("tr-TR")} yapıldı.`,
    );
  };

  const requestProductDelete = (product: AdminProduct) => {
    setOpenMenuProductId(null);
    setProductToDelete(product);
  };

  const deleteProduct = () => {
    if (!productToDelete) return;

    const deletedProduct = productToDelete;
    setProductList((current) =>
      current.filter((product) => product.id !== deletedProduct.id),
    );
    setSelected((current) =>
      current.filter((productId) => productId !== deletedProduct.id),
    );

    const nextPageCount = Math.max(
      1,
      Math.ceil((filteredProducts.length - 1) / pageSize),
    );
    setCurrentPage((page) => Math.min(page, nextPageCount));
    setProductToDelete(null);
    showNotice(`${deletedProduct.name} başarıyla silindi.`);
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

      <div className={styles.pageActions}>
        <p>Ürün kataloğunuzu tek bir yerden takip edin.</p>
        <button
          type="button"
          className={styles.addButton}
          onClick={openCreateForm}
        >
          <span aria-hidden="true">＋</span> Yeni Ürün Ekle
        </button>
      </div>

      <section className={styles.summaryGrid} aria-label="Ürün özeti">
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

      <section
        className={styles.productsCard}
        aria-labelledby="product-list-title"
      >
        <div className={styles.cardHeading}>
          <div>
            <h2 id="product-list-title">Ürün Listesi</h2>
            <p>Fiyat, stok ve satış durumlarını görüntüleyin.</p>
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
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
              type="search"
              placeholder="Ürün adı veya SKU ara..."
            />
          </label>
          <label>
            <span>Kategori</span>
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option>Tümü</option>
              {productCategories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Durum</span>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as StatusFilter);
                setCurrentPage(1);
              }}
            >
              <option>Tümü</option>
              <option>Aktif</option>
              <option>Pasif</option>
            </select>
          </label>
          <label>
            <span>Stok</span>
            <select
              value={stock}
              onChange={(event) => {
                setStock(event.target.value as StockFilter);
                setCurrentPage(1);
              }}
            >
              <option>Tümü</option>
              <option>Stokta</option>
              <option>Stokta Az</option>
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
          {productList.length} üründen {filteredProducts.length} tanesi
          gösteriliyor
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
                <th>B2C Fiyat</th>
                <th>B2B Fiyat</th>
                <th>Stok</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {visibleProducts.map((product) => (
                <tr key={product.id}>
                  <td className={styles.checkboxCell}>
                    <input
                      type="checkbox"
                      aria-label={`${product.name} ürününü seç`}
                      checked={selected.includes(product.id)}
                      onChange={() => toggleProduct(product.id)}
                    />
                  </td>
                  <td>
                    <div className={styles.productIdentity}>
                      <span
                        className={`${styles.productVisual} ${styles[product.visualTone]}`}
                      >
                        {product.visual}
                      </span>
                      <strong>{product.name}</strong>
                    </div>
                  </td>
                  <td>
                    <code>{product.sku}</code>
                  </td>
                  <td>{product.category}</td>
                  <td className={styles.price}>
                    {currency.format(product.b2cPrice)}
                  </td>
                  <td className={styles.price}>
                    {currency.format(product.b2bPrice)}
                  </td>
                  <td>
                    {product.stock === 0 ? (
                      <span className={styles.outOfStock}>Tükendi</span>
                    ) : (
                      <span
                        className={
                          product.stock <= 10 ? styles.lowStock : styles.inStock
                        }
                      >
                        {product.stock} adet
                      </span>
                    )}
                  </td>
                  <td>
                    <span
                      className={
                        product.status === "Aktif"
                          ? styles.activeStatus
                          : styles.passiveStatus
                      }
                    >
                      {product.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        type="button"
                        onClick={() => setViewingProduct(product)}
                      >
                        Görüntüle
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditForm(product)}
                      >
                        Düzenle
                      </button>
                      <ProductActionsMenu
                        product={product}
                        isOpen={openMenuProductId === product.id}
                        onToggle={setOpenMenuProductId}
                        onStatusChange={toggleProductStatus}
                        onDeleteRequest={requestProductDelete}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className={styles.emptyState}>
              <span>
                <Icon name="search" />
              </span>
              <h3>Ürün bulunamadı</h3>
              <p>
                Arama ifadenizi veya filtrelerinizi değiştirerek tekrar deneyin.
              </p>
              <button type="button" onClick={clearFilters}>
                Filtreleri Temizle
              </button>
            </div>
          )}
        </div>
        {filteredProducts.length > 0 && (
          <nav
            className={styles.pagination}
            aria-label="Ürün listesi sayfaları"
          >
            <span>
              {pageStart + 1}–
              {Math.min(pageStart + pageSize, filteredProducts.length)} /{" "}
              {filteredProducts.length} ürün
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
      {isFormOpen && (
        <ProductFormModal
          product={editingProduct}
          usedSkus={productList
            .filter((product) => product.id !== editingProduct?.id)
            .map((product) => product.sku.toLocaleUpperCase("tr-TR"))}
          onClose={() => {
            setIsFormOpen(false);
            setEditingProduct(null);
          }}
          onSave={saveProduct}
        />
      )}
      {viewingProduct && (
        <ProductDetailModal
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
          onEdit={() => openEditForm(viewingProduct)}
        />
      )}
      {productToDelete && (
        <ProductDeleteModal
          product={productToDelete}
          onClose={() => setProductToDelete(null)}
          onConfirm={deleteProduct}
        />
      )}
    </div>
  );
}
