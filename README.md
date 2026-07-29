# SofistikeFrontend

Sofistike +XTRA'nın B2C mağaza, B2B çözüm ve marka/içerik deneyimlerini
sunacak web uygulaması.

## Teknoloji

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- ESLint ve Prettier

## Yerel geliştirme

Gereksinimler: Node.js `>=20.9.0` ve npm `>=10`.

```bash
cp .env.example .env.local
npm ci
npm run dev
```

Uygulama varsayılan olarak `http://localhost:3000` adresinde çalışır.
Backend'in varsayılan adresi `http://localhost:5118` olarak örnek env dosyasında
tanımlanmıştır.

## Komutlar

```bash
npm run dev          # geliştirme sunucusu
npm run build        # production derlemesi
npm run lint         # kod kalite kontrolü
npm run typecheck    # TypeScript kontrolü
npm run format       # dosyaları biçimlendir
npm run check        # lint + typecheck + format kontrolü
```

## Proje yapısı

```text
src/
├── app/          # route, layout ve sayfalar
├── components/   # tekrar kullanılabilir arayüz bileşenleri
├── config/       # navigasyon ve uygulama sabitleri
├── features/     # ürün, sepet, hesap, B2B gibi iş alanları
├── lib/          # API istemcisi ve ortak yardımcılar
└── types/        # paylaşılan TypeScript tipleri
```

Yeni özellikler mümkün olduğunca kendi `features/<özellik>` klasöründe tutulmalı.
`app` klasörü ağırlıklı olarak routing ve sayfa kompozisyonundan sorumlu olmalıdır.

## Ortam değişkenleri

Takip edilen örnek değerler `.env.example` içindedir. Yerel değerleri
`.env.local` dosyasına yazın; gerçek anahtar ve sırları repoya eklemeyin.

## Git akışı

- Çalışmalar kısa ömürlü feature branch'lerde yapılır.
- `main` ve `develop` branch'lerine pull request üzerinden gidilir.
- Pull request açılmadan önce `npm run check` ve `npm run build` çalıştırılır.
- Commit mesajları kısa, açıklayıcı ve tek bir değişiklik odağında tutulur.
