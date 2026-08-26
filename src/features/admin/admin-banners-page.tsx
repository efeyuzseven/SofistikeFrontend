"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { HomeBanner } from "@/lib/banners";
import styles from "./admin-banners-page.module.css";

type AccessState = "loading" | "allowed" | "unauthorized" | "forbidden";

type BannerForm = {
  imageUrl: string;
  altText: string;
  title: string;
  description: string;
  buttonText: string;
  linkUrl: string;
  displayOrder: string;
  isActive: boolean;
};

const emptyForm: BannerForm = {
  imageUrl: "",
  altText: "",
  title: "",
  description: "",
  buttonText: "",
  linkUrl: "",
  displayOrder: "1",
  isActive: true,
};

async function readError(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as {
    message?: string;
  } | null;
  return payload?.message ?? fallback;
}

export function AdminBannersPage() {
  const [access, setAccess] = useState<AccessState>("loading");
  const [banners, setBanners] = useState<HomeBanner[]>([]);
  const [form, setForm] = useState<BannerForm>(emptyForm);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [busyBannerId, setBusyBannerId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const loadBanners = useCallback(async () => {
    setLoadingBanners(true);
    try {
      const response = await fetch("/api/admin/banners", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(await readError(response, "Bannerlar yüklenemedi."));
      }
      setBanners((await response.json()) as HomeBanner[]);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Bannerlar yüklenemedi.",
      );
    } finally {
      setLoadingBanners(false);
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
        await loadBanners();
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
  }, [loadBanners]);

  function updateForm<K extends keyof BannerForm>(
    key: K,
    value: BannerForm[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setForm({ ...emptyForm, displayOrder: String(banners.length + 1) });
    setEditingBannerId(null);
    setError("");
  }

  function startEditing(banner: HomeBanner) {
    setForm({
      imageUrl: banner.imageUrl,
      altText: banner.altText,
      title: banner.title ?? "",
      description: banner.description ?? "",
      buttonText: banner.buttonText ?? "",
      linkUrl: banner.linkUrl ?? "",
      displayOrder: String(banner.displayOrder),
      isActive: banner.isActive,
    });
    setEditingBannerId(banner.id);
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const isEditing = editingBannerId !== null;
    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        isEditing
          ? `/api/admin/banners/${encodeURIComponent(editingBannerId)}`
          : "/api/admin/banners",
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
            isEditing ? "Banner güncellenemedi." : "Banner eklenemedi.",
          ),
        );
      }

      setNotice(isEditing ? "Banner güncellendi." : "Yeni banner eklendi.");
      setEditingBannerId(null);
      setForm(emptyForm);
      await loadBanners();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "İşlem tamamlanamadı.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteBanner(banner: HomeBanner) {
    if (
      busyBannerId ||
      !window.confirm(
        `“${banner.title || banner.altText}” bannerı silinsin mi?`,
      )
    ) {
      return;
    }

    setBusyBannerId(banner.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(
        `/api/admin/banners/${encodeURIComponent(banner.id)}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        throw new Error(await readError(response, "Banner silinemedi."));
      }
      if (editingBannerId === banner.id) resetForm();
      setNotice("Banner silindi.");
      await loadBanners();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Banner silinemedi.");
    } finally {
      setBusyBannerId(null);
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
        <p>Banner yönetimi için yönetici hesabıyla giriş yapın.</p>
        <Link href="/login?redirect=%2Fadmin%2Fbannerlar">Giriş Yap</Link>
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
          <h1>Banner Yönetimi</h1>
          <p>Ana sayfa bannerlarını, sıralarını ve metinlerini yönetin.</p>
        </div>
        <nav aria-label="Yönetim bağlantıları" className={styles.adminLinks}>
          <Link href="/admin/urunler">Ürünler</Link>
          <Link href="/">Mağazayı Gör</Link>
        </nav>
      </header>

      <div className={styles.workspace}>
        <section className={styles.formPanel}>
          <div className={styles.formHeading}>
            <div>
              <h2>
                {editingBannerId ? "Bannerı düzenle" : "Yeni banner ekle"}
              </h2>
              {editingBannerId ? (
                <span className={styles.editingBadge}>Düzenleme modu</span>
              ) : null}
            </div>
            {editingBannerId ? (
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
              <label className={styles.fullWidth}>
                Görsel adresi
                <input
                  maxLength={2000}
                  onChange={(event) =>
                    updateForm("imageUrl", event.target.value)
                  }
                  placeholder="/images/banner.webp veya https://…"
                  required
                  value={form.imageUrl}
                />
              </label>
              <label className={styles.fullWidth}>
                Görsel açıklaması (erişilebilirlik)
                <input
                  maxLength={300}
                  onChange={(event) =>
                    updateForm("altText", event.target.value)
                  }
                  placeholder="Banner görselini kısa ve net anlatın"
                  required
                  value={form.altText}
                />
              </label>
              <label>
                Başlık (isteğe bağlı)
                <input
                  maxLength={200}
                  onChange={(event) => updateForm("title", event.target.value)}
                  value={form.title}
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
                  maxLength={750}
                  onChange={(event) =>
                    updateForm("description", event.target.value)
                  }
                  rows={3}
                  value={form.description}
                />
              </label>
              <label>
                Buton metni
                <input
                  maxLength={100}
                  onChange={(event) =>
                    updateForm("buttonText", event.target.value)
                  }
                  placeholder="Ürünleri Keşfet"
                  value={form.buttonText}
                />
              </label>
              <label>
                Buton bağlantısı
                <input
                  maxLength={2000}
                  onChange={(event) =>
                    updateForm("linkUrl", event.target.value)
                  }
                  placeholder="/urunler veya https://…"
                  value={form.linkUrl}
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
              Ana sayfada göster
            </label>

            {form.imageUrl ? (
              <div
                aria-label="Banner önizlemesi"
                className={styles.formPreview}
                role="img"
                style={{
                  backgroundImage: `url(${JSON.stringify(form.imageUrl)})`,
                }}
              />
            ) : null}

            {error ? <p className={styles.error}>{error}</p> : null}
            {notice ? <p className={styles.success}>{notice}</p> : null}

            <button
              className={styles.submitButton}
              disabled={submitting}
              type="submit"
            >
              {submitting
                ? "Kaydediliyor…"
                : editingBannerId
                  ? "Değişiklikleri Kaydet"
                  : "Bannerı Ekle"}
            </button>
          </form>
        </section>

        <section className={styles.listPanel}>
          <div className={styles.panelTitle}>
            <div>
              <h2>Mevcut bannerlar</h2>
              <p>Düşük sıra numarası önce gösterilir.</p>
            </div>
            <span>{banners.length}</span>
          </div>

          {loadingBanners ? (
            <p>Bannerlar yükleniyor…</p>
          ) : banners.length === 0 ? (
            <p>Henüz banner eklenmedi.</p>
          ) : (
            <div className={styles.bannerList}>
              {banners.map((banner) => (
                <article key={banner.id}>
                  <div
                    aria-label={banner.altText}
                    className={styles.bannerImage}
                    role="img"
                    style={{
                      backgroundImage: `url(${JSON.stringify(banner.imageUrl)})`,
                    }}
                  />
                  <div className={styles.bannerDetails}>
                    <div className={styles.bannerMeta}>
                      <span>Sıra {banner.displayOrder}</span>
                      <span data-active={banner.isActive}>
                        {banner.isActive ? "Yayında" : "Gizli"}
                      </span>
                    </div>
                    <h3>{banner.title || banner.altText}</h3>
                    <p>{banner.description || banner.imageUrl}</p>
                  </div>
                  <div className={styles.bannerActions}>
                    <button
                      disabled={busyBannerId !== null}
                      onClick={() => startEditing(banner)}
                      type="button"
                    >
                      Düzenle
                    </button>
                    <button
                      className={styles.deleteButton}
                      disabled={busyBannerId !== null}
                      onClick={() => void deleteBanner(banner)}
                      type="button"
                    >
                      {busyBannerId === banner.id ? "Siliniyor…" : "Sil"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
