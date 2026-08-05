export default function Home() {
  return (
    <main className="relative flex flex-1 items-center overflow-hidden">
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
