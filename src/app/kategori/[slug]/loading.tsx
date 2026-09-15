import styles from "@/features/catalog/category-products-page.module.css";

export default function Loading() {
  return (
    <main className={styles.page}>
      <div className={styles.loading} role="status">
        <span />
        Ürünler yükleniyor…
      </div>
    </main>
  );
}
