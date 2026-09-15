"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { CategoryMenuGroup, ManagedCatalogCategory } from "@/lib/catalog";
import styles from "./admin-categories-page.module.css";

type AccessState = "loading" | "allowed" | "unauthorized" | "forbidden";

type CategoryForm = {
  name: string;
  slug: string;
  description: string;
  menuGroup: CategoryMenuGroup;
  displayOrder: string;
  isActive: boolean;
};

const menuGroups: ReadonlyArray<{
  value: CategoryMenuGroup;
  title: string;
  description: string;
}> = [
  {
    value: "Solution",
    title: "Shop by Solution",
    description: "İhtiyaca ve çözüme göre alışveriş bağlantıları.",
  },
  {
    value: "Room",
    title: "Shop by Room",
    description: "Evin bölümlerine göre alışveriş bağlantıları.",
  },
  {
    value: "Category",
    title: "Shop by Category",
    description: "Ürün türüne göre alışveriş bağlantıları.",
  },
];

const emptyForm: CategoryForm = {
  name: "",
  slug: "",
  description: "",
  menuGroup: "Category",
  displayOrder: "1",
  isActive: true,
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

async function readError(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as {
    message?: string;
  } | null;
  return payload?.message ?? fallback;
}

export function AdminCategoriesPage() {
  const [access, setAccess] = useState<AccessState>("loading");
  const [categories, setCategories] = useState<ManagedCatalogCategory[]>([]);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [busyCategoryId, setBusyCategoryId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const loadCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch("/api/admin/categories", {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(await readError(response, "Kategoriler yüklenemedi."));
      }
      setCategories((await response.json()) as ManagedCatalogCategory[]);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Kategoriler yüklenemedi.",
      );
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function prepare() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        if (!active) return;
        if (response.status === 401) {
          setAccess("unauthorized");
          return;
        }
        if (!response.ok) throw new Error("Oturum doğrulanamadı.");

        const me = (await response.json()) as { user: { role: string } };
        if (me.user.role.toLocaleLowerCase("tr-TR") !== "admin") {
          setAccess("forbidden");
          return;
        }

        setAccess("allowed");
        await loadCategories();
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
  }, [loadCategories]);

  function updateForm<K extends keyof CategoryForm>(
    key: K,
    value: CategoryForm[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingCategoryId(null);
    setError("");
  }

  function startEditing(category: ManagedCatalogCategory) {
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      menuGroup: category.menuGroup,
      displayOrder: String(category.displayOrder),
      isActive: category.isActive,
    });
    setEditingCategoryId(category.id);
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const isEditing = editingCategoryId !== null;
    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        isEditing
          ? `/api/admin/categories/${encodeURIComponent(editingCategoryId)}`
          : "/api/admin/categories",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            displayOrder: Number(form.displayOrder),
          }),
        },
      );
      if (!response.ok) {
        throw new Error(
          await readError(
            response,
            isEditing ? "Kategori güncellenemedi." : "Kategori eklenemedi.",
          ),
        );
      }

      setNotice(isEditing ? "Kategori güncellendi." : "Yeni kategori eklendi.");
      setEditingCategoryId(null);
      setForm(emptyForm);
      await loadCategories();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "İşlem tamamlanamadı.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteCategory(category: ManagedCatalogCategory) {
    if (
      busyCategoryId ||
      !window.confirm(`“${category.name}” kategorisi silinsin mi?`)
    ) {
      return;
    }

    setBusyCategoryId(category.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(
        `/api/admin/categories/${encodeURIComponent(category.id)}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        throw new Error(await readError(response, "Kategori silinemedi."));
      }
      if (editingCategoryId === category.id) resetForm();
      setNotice("Kategori silindi.");
      await loadCategories();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Kategori silinemedi.",
      );
    } finally {
      setBusyCategoryId(null);
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
        <p>Kategori yönetimi için yönetici hesabıyla giriş yapın.</p>
        <Link href="/login?redirect=%2Fadmin%2Fkategoriler">Giriş Yap</Link>
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
          <h1>Kategori Yönetimi</h1>
          <p>Shop menüsündeki üç grubun bağlantılarını yönetin.</p>
        </div>
        <nav aria-label="Yönetim bağlantıları" className={styles.adminLinks}>
          <Link href="/admin/urunler">Ürünler</Link>
          <Link href="/admin/bannerlar">Bannerlar</Link>
          <Link href="/">Mağazayı Gör</Link>
        </nav>
      </header>

      <div className={styles.workspace}>
        <section className={styles.formPanel}>
          <div className={styles.formHeading}>
            <div>
              <h2>
                {editingCategoryId
                  ? "Kategoriyi düzenle"
                  : "Yeni kategori ekle"}
              </h2>
              {editingCategoryId ? (
                <span className={styles.editingBadge}>Düzenleme modu</span>
              ) : null}
            </div>
            {editingCategoryId ? (
              <button
                className={styles.cancelEdit}
                onClick={resetForm}
                type="button"
              >
                Vazgeç
              </button>
            ) : null}
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <label>
                Kategori adı
                <input
                  maxLength={150}
                  onChange={(event) => {
                    const name = event.target.value;
                    setForm((current) => ({
                      ...current,
                      name,
                      slug: editingCategoryId ? current.slug : slugify(name),
                    }));
                  }}
                  placeholder="Çalışma Odası"
                  required
                  value={form.name}
                />
              </label>
              <label>
                Menü grubu
                <select
                  onChange={(event) =>
                    updateForm(
                      "menuGroup",
                      event.target.value as CategoryMenuGroup,
                    )
                  }
                  value={form.menuGroup}
                >
                  {menuGroups.map((group) => (
                    <option key={group.value} value={group.value}>
                      {group.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Bağlantı adı
                <input
                  maxLength={180}
                  onChange={(event) =>
                    updateForm("slug", slugify(event.target.value))
                  }
                  required
                  value={form.slug}
                />
              </label>
              <label>
                Sıra
                <input
                  min="0"
                  onChange={(event) =>
                    updateForm("displayOrder", event.target.value)
                  }
                  required
                  type="number"
                  value={form.displayOrder}
                />
              </label>
              <label className={styles.fullWidth}>
                Açıklama (isteğe bağlı)
                <textarea
                  maxLength={1000}
                  onChange={(event) =>
                    updateForm("description", event.target.value)
                  }
                  rows={3}
                  value={form.description}
                />
              </label>
            </div>

            <label className={styles.activeOption}>
              <input
                checked={form.isActive}
                onChange={(event) =>
                  updateForm("isActive", event.target.checked)
                }
                type="checkbox"
              />
              Shop menüsünde ve ürün seçiminde göster
            </label>

            {error ? <p className={styles.error}>{error}</p> : null}
            {notice ? <p className={styles.success}>{notice}</p> : null}

            <button
              className={styles.submitButton}
              disabled={submitting}
              type="submit"
            >
              {submitting
                ? "Kaydediliyor…"
                : editingCategoryId
                  ? "Değişiklikleri Kaydet"
                  : "Kategoriyi Ekle"}
            </button>
          </form>
        </section>

        <section className={styles.listPanel}>
          <div className={styles.panelTitle}>
            <div>
              <h2>Shop menü yapısı</h2>
              <p>Düşük sıra numarası menüde önce görünür.</p>
            </div>
            <span>{categories.length}</span>
          </div>

          {loadingCategories ? (
            <p>Kategoriler yükleniyor…</p>
          ) : (
            <div className={styles.groupList}>
              {menuGroups.map((group) => {
                const groupCategories = categories.filter(
                  (category) => category.menuGroup === group.value,
                );
                return (
                  <section className={styles.categoryGroup} key={group.value}>
                    <header>
                      <div>
                        <h3>{group.title}</h3>
                        <p>{group.description}</p>
                      </div>
                      <span>{groupCategories.length}</span>
                    </header>
                    {groupCategories.length === 0 ? (
                      <p className={styles.emptyGroup}>
                        Bu grupta kategori yok.
                      </p>
                    ) : (
                      <div className={styles.categoryList}>
                        {groupCategories.map((category) => (
                          <article key={category.id}>
                            <div className={styles.categoryOrder}>
                              {category.displayOrder}
                            </div>
                            <div className={styles.categoryDetails}>
                              <div className={styles.categoryMeta}>
                                <span data-active={category.isActive}>
                                  {category.isActive ? "Yayında" : "Gizli"}
                                </span>
                                <span>{category.productCount} ürün</span>
                              </div>
                              <h4>{category.name}</h4>
                              <p>/kategori/{category.slug}</p>
                            </div>
                            <div className={styles.categoryActions}>
                              <button
                                disabled={busyCategoryId !== null}
                                onClick={() => startEditing(category)}
                                type="button"
                              >
                                Düzenle
                              </button>
                              <button
                                className={styles.deleteButton}
                                disabled={
                                  busyCategoryId !== null ||
                                  category.productCount > 0
                                }
                                onClick={() => void deleteCategory(category)}
                                title={
                                  category.productCount > 0
                                    ? "Ürüne bağlı kategoriyi silmek yerine gizleyin."
                                    : undefined
                                }
                                type="button"
                              >
                                {busyCategoryId === category.id
                                  ? "Siliniyor…"
                                  : "Sil"}
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
