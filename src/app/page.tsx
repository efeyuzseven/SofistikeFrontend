export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--brand-orange)_0_16.6%,var(--brand-lavender)_16.6%_33.2%,var(--brand-olive)_33.2%_49.8%,var(--brand-gold)_49.8%_66.4%,var(--brand-navy)_66.4%_83%,var(--brand-teal)_83%_100%)]"
      />

      <section className="mx-auto w-full max-w-3xl px-6 py-20 text-center">
        <p className="text-brand-orange text-sm font-semibold tracking-[0.24em] uppercase">
          Sofistike +XTRA
        </p>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
          Frontend başlangıç yapısı hazır.
        </h1>
        <p className="text-muted mx-auto mt-5 max-w-xl text-lg leading-8">
          Next.js, TypeScript, Tailwind CSS ve kod kalite araçları
          yapılandırıldı. Ürün deneyimi ekip tarafından geliştirilecek.
        </p>
        <div className="border-border bg-surface text-brand-olive mt-9 inline-flex rounded-full border px-5 py-2 text-sm">
          Smart ideas for better living
        </div>
      </section>
    </main>
  );
}
