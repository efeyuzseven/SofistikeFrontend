"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type {
  ManagedCatalogCategory,
  CatalogProduct,
  CatalogProductDetails,
  PagedCatalogProducts,
} from "@/lib/catalog";
import styles from "./admin-products-page.module.css";

type AccessState = "loading" | "allowed" | "unauthorized" | "forbidden";

type ProductForm = {
  productCode: string;
  name: string;
  slug: string;
  categoryIds: string[];
  price: string;
  stockQuantity: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  isPopular: boolean;
  isXtra: boolean;
};

const emptyForm: ProductForm = {
  productCode: "",
  name: "",
  slug: "",
  categoryIds: [],
  price: "",
  stockQuantity: "",
  shortDescription: "",
  description: "",
  imageUrl: "",
  isPopular: false,
  isXtra: false,
};

function slugify(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/(^-|-$)/g, "");
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value);
}

async function readError(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as {
    message?: string;
  } | null;
  return payload?.message ?? fallback;
}

export function AdminProductsPage() {
  const [access, setAccess] = useState<AccessState>("loading");
  const [categories, setCategories] = useState<ManagedCatalogCategory[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [busyProductId, setBusyProductId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const response = await fetch(
        "/api/catalog/products?page=1&pageSize=100&sort=Newest",
        { cache: "no-store" },
      );
      if (!response.ok) {
        throw new Error(await readError(response, "Ürünler yüklenemedi."));
      }
      const payload = (await response.json()) as PagedCatalogProducts;
      setProducts(payload.items);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Ürünler yüklenemedi.",
      );
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function prepare() {
      try {
        const [meResponse, categoryResponse] = await Promise.all([
          fetch("/api/auth/me", { cache: "no-store" }),
          fetch("/api/admin/categories", { cache: "no-store" }),
        ]);
        if (!active) return;
        if (meResponse.status === 401) {
          setAccess("unauthorized");
          return;
        }
        if (!meResponse.ok) throw new Error("Oturum doğrulanamadı.");

        const me = (await meResponse.json()) as {
          user: { role: string };
        };
        if (me.user.role.toLocaleLowerCase("tr-TR") !== "admin") {
          setAccess("forbidden");
          return;
        }
        if (!categoryResponse.ok) throw new Error("Kategoriler yüklenemedi.");

        setCategories(
          ((await categoryResponse.json()) as ManagedCatalogCategory[]).filter(
            (category) => category.isActive,
          ),
        );
        setAccess("allowed");
        await loadProducts();
      } catch (reason) {
        if (active) {
          setError(
            reason instanceof Error ? reason.message : "Panel açılamadı.",
          );
          setAccess("forbidden");
        }
      }
    }

    void prepare();
    return () => {
      active = false;
    };
  }, [loadProducts]);

  function updateForm<K extends keyof ProductForm>(
    key: K,
    value: ProductForm[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingProductId(null);
    setError("");
  }

  async function startEditing(product: CatalogProduct) {
    if (busyProductId) return;
    setBusyProductId(product.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `/api/catalog/products/${encodeURIComponent(product.slug)}`,
        { cache: "no-store" },
      );
      if (!response.ok) {
        throw new Error(
          await readError(response, "Ürün detayları yüklenemedi."),
        );
      }

      const details = (await response.json()) as CatalogProductDetails;
      const variant =
        details.variants.find((item) => item.isDefault) ?? details.variants[0];
      const image =
        details.images.find((item) => item.isPrimary) ?? details.images[0];
      setForm({
        productCode: details.productCode,
        name: details.name,
        slug: details.slug,
        categoryIds: details.categories.map((category) => category.id),
        price: variant?.price?.listPrice.toString() ?? "",
        stockQuantity: variant?.stock.availableQuantity.toString() ?? "0",
        shortDescription: details.shortDescription,
        description: details.description,
        imageUrl: image?.url ?? "",
        isPopular: details.isPopular,
        isXtra: details.isXtra,
      });
      setEditingProductId(details.id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Ürün detayları yüklenemedi.",
      );
    } finally {
      setBusyProductId(null);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    if (form.categoryIds.length === 0) {
      setError("Ürün için en az bir kategori seçin.");
      return;
    }

    setSubmitting(true);
    setError("");
    setNotice("");
    const isEditing = editingProductId !== null;

    try {
      const response = await fetch(
        isEditing
          ? `/api/admin/products/${editingProductId}`
          : "/api/admin/products",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            price: Number(form.price),
            stockQuantity: Number(form.stockQuantity),
            imageUrl: form.imageUrl.trim() || null,
          }),
        },
      );
      if (!response.ok) {
        throw new Error(
          await readError(
            response,
            isEditing ? "Ürün güncellenemedi." : "Ürün eklenemedi.",
          ),
        );
      }

      resetForm();
      setNotice(
        isEditing
          ? "Ürün bilgileri güncellendi."
          : "Ürün yayınlandı ve mağaza kataloğuna eklendi.",
      );
      await loadProducts();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : isEditing
            ? "Ürün güncellenemedi."
            : "Ürün eklenemedi.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function archiveProduct(product: CatalogProduct) {
    if (
      busyProductId ||
      !window.confirm(
        `"${product.name}" mağazadan kaldırılacak. Geçmiş sipariş kayıtları korunacak. Devam edilsin mi?`,
      )
    ) {
      return;
    }

    setBusyProductId(product.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(await readError(response, "Ürün arşivlenemedi."));
      }

      if (editingProductId === product.id) resetForm();
      setNotice("Ürün mağazadan kaldırıldı ve güvenli şekilde arşivlendi.");
      await loadProducts();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Ürün arşivlenemedi.",
      );
    } finally {
      setBusyProductId(null);
    }
  }

  if (access === "loading") {
    return (
      <main className={styles.statePage}>Yönetim paneli hazırlanıyor…</main>
    );
  }

  if (access === "unauthorized") {
    return (
      <main className={styles.statePage}>
        <h1>Yönetici girişi gerekli</h1>
        <p>Ürün yönetimi için yönetici hesabıyla giriş yapın.</p>
        <Link href="/login?redirect=%2Fadmin%2Furunler">Giriş Yap</Link>
      </main>
    );
  }

  if (access === "forbidden") {
    return (
      <main className={styles.statePage}>
        <h1>Bu sayfaya erişim yetkiniz yok</h1>
        <p>{error || "Yalnızca Admin rolündeki kullanıcılar erişebilir."}</p>
        <Link href="/">Ana Sayfaya Dön</Link>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.intro}>
        <div>
          <span>SOFISTIKE +XTRA ADMIN</span>
          <h1>Ürün Yönetimi</h1>
          <p>Ürünleri yayınlayın, güncelleyin veya mağazadan kaldırın.</p>
        </div>
        <nav aria-label="Yönetim bağlantıları" className={styles.adminLinks}>
          <Link href="/admin/kategoriler">Kategoriler</Link>
          <Link href="/admin/bannerlar">Bannerlar</Link>
          <Link href="/">Mağazayı Gör</Link>
        </nav>
      </header>

      <div className={styles.workspace}>
        <section className={styles.formPanel}>
          <div className={styles.formHeading}>
            <div>
              <h2>{editingProductId ? "Ürünü düzenle" : "Yeni ürün ekle"}</h2>
              {editingProductId ? (
                <span className={styles.editingBadge}>Düzenleme modu</span>
              ) : null}
            </div>
            {editingProductId ? (
              <button
                className={styles.cancelEdit}
                type="button"
                onClick={resetForm}
              >
                Vazgeç
              </button>
            ) : null}
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <label>
                Ürün kodu
                <input
                  value={form.productCode}
                  onChange={(event) =>
                    updateForm("productCode", event.target.value.toUpperCase())
                  }
                  placeholder="AROMA-002"
                  required
                />
              </label>
              <label>
                Ürün adı
                <input
                  value={form.name}
                  onChange={(event) => {
                    const name = event.target.value;
                    setForm((current) => ({
                      ...current,
                      name,
                      slug: editingProductId ? current.slug : slugify(name),
                    }));
                  }}
                  placeholder="Sakin Oda Kokusu"
                  required
                />
              </label>
              <label>
                Bağlantı adı
                <input
                  value={form.slug}
                  onChange={(event) =>
                    updateForm("slug", slugify(event.target.value))
                  }
                  required
                />
              </label>
              <fieldset
                className={`${styles.categorySelector} ${styles.fullWidth}`}
              >
                <legend>Kategoriler</legend>
                <p>
                  Ürünün görüneceği çözüm, oda ve ürün kategorilerini seçin. İlk
                  seçilen kategori ana kategori olur.
                </p>
                <div>
                  {categories.map((category) => (
                    <label key={category.id}>
                      <input
                        checked={form.categoryIds.includes(category.id)}
                        onChange={(event) => {
                          const categoryIds = event.target.checked
                            ? [...form.categoryIds, category.id]
                            : form.categoryIds.filter(
                                (categoryId) => categoryId !== category.id,
                              );
                          updateForm("categoryIds", categoryIds);
                        }}
                        type="checkbox"
                      />
                      <span>{category.name}</span>
                      <small>
                        {category.menuGroup === "Solution"
                          ? "Solution"
                          : category.menuGroup === "Room"
                            ? "Room"
                            : "Category"}
                      </small>
                    </label>
                  ))}
                </div>
                {form.categoryIds.length === 0 ? (
                  <span className={styles.categoryWarning}>
                    En az bir kategori seçin.
                  </span>
                ) : null}
              </fieldset>
              <label>
                Fiyat (₺)
                <input
                  value={form.price}
                  onChange={(event) => updateForm("price", event.target.value)}
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                />
              </label>
              <label>
                Satılabilir stok
                <input
                  value={form.stockQuantity}
                  onChange={(event) =>
                    updateForm("stockQuantity", event.target.value)
                  }
                  type="number"
                  min="0"
                  required
                />
              </label>
              <label className={styles.fullWidth}>
                Kısa açıklama
                <input
                  value={form.shortDescription}
                  onChange={(event) =>
                    updateForm("shortDescription", event.target.value)
                  }
                  minLength={3}
                  required
                />
              </label>
              <label className={styles.fullWidth}>
                Detaylı açıklama
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    updateForm("description", event.target.value)
                  }
                  minLength={3}
                  rows={4}
                  required
                />
              </label>
              <label className={styles.fullWidth}>
                Görsel adresi
                <input
                  value={form.imageUrl}
                  onChange={(event) =>
                    updateForm("imageUrl", event.target.value)
                  }
                  placeholder="/images/urun.png veya https://…"
                />
              </label>
            </div>
            <div className={styles.options}>
              <label>
                <input
                  checked={form.isPopular}
                  onChange={(event) =>
                    updateForm("isPopular", event.target.checked)
                  }
                  type="checkbox"
                />{" "}
                Popüler ürün
              </label>
              <label>
                <input
                  checked={form.isXtra}
                  onChange={(event) =>
                    updateForm("isXtra", event.target.checked)
                  }
                  type="checkbox"
                />{" "}
                +XTRA ürünü
              </label>
            </div>
            {error ? <p className={styles.error}>{error}</p> : null}
            {notice ? <p className={styles.success}>{notice}</p> : null}
            <button
              className={styles.submitButton}
              disabled={submitting}
              type="submit"
            >
              {submitting
                ? "Kaydediliyor…"
                : editingProductId
                  ? "Değişiklikleri Kaydet"
                  : "Ürünü Yayınla"}
            </button>
          </form>
        </section>

        <section className={styles.catalogPanel}>
          <div className={styles.panelTitle}>
            <h2>Yayındaki ürünler</h2>
            <span>{products.length} ürün</span>
          </div>
          {loadingProducts ? <p>Ürünler yükleniyor…</p> : null}
          <div className={styles.productList}>
            {products.map((product) => (
              <article key={product.id}>
                <div
                  className={styles.productImage}
                  style={{
                    backgroundImage: `url(${product.primaryImage?.url ?? "/images/hero-home.png"})`,
                  }}
                />
                <div className={styles.productCopy}>
                  <small>{product.productCode}</small>
                  <h3>{product.name}</h3>
                  <p>{product.categories[0]?.name ?? "Kategorisiz"}</p>
                </div>
                <div className={styles.productNumbers}>
                  <strong>
                    {formatPrice(product.price?.effectivePrice ?? 0)}
                  </strong>
                  <span>{product.stock.availableQuantity} stok</span>
                </div>
                <div className={styles.productActions}>
                  <button
                    type="button"
                    disabled={busyProductId === product.id}
                    onClick={() => void startEditing(product)}
                  >
                    Düzenle
                  </button>
                  <button
                    type="button"
                    className={styles.archiveButton}
                    disabled={busyProductId === product.id}
                    onClick={() => void archiveProduct(product)}
                  >
                    Kaldır
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
