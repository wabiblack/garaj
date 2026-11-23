# Garaj — Tasarım Belgesi

Tarih: 2026-11-23

## Amaç ve neden

Garaj, telefonda oynanan basit bir ikinci el alım-satım oyunu. Oyuncu, 12 yaşındaki Kerem'i oynar. Kerem mahallede küçük eşya alıp satarak başlar, motora geçer, sonunda şehrin en büyük galericisi olmaya çalışır. Oyun hızlı ilerlemeli, sıkmamalı ve profesyonel görünmeli.

## Hedefler

- Telefonda tarayıcıdan açılan, "Ana ekrana ekle" ile uygulama gibi çalışan bir oyun.
- Hızlı tempo: bir oyun günü 1–2 dakika sürer. Bekleme süresi ya da gerçek zamanlı zamanlayıcı olmaz.
- Üç aşamalı hayat hikâyesi: mahalle çocuğu, motorcu, galerici.
- Profesyonel görünen, tutarlı bir arayüz.
- Oyun telefonda otomatik kaydedilir, kapatıp açınca kaldığı yerden devam eder.

## Hedef dışı (ilk sürümde yok)

- App Store veya Google Play'de yayın.
- Çok oyunculu oyun, sunucu, hesap sistemi, bulut kaydı.
- Reklam ve uygulama içi satın alma.
- Birden fazla şehir.
- Ses ve müzik.

## Kaçınılacaklar (bunlar olursa oyun başarısız sayılır)

- Bekletme, enerji sistemi gibi oyuncuyu sıkan mekanikler.
- Gerçek araç markası isimleri veya logoları. Markalar hayali olacak.
- Telefonda taşan, küçük kalan ya da dokunması zor arayüz.

## Kısıtlar

- Hedef cihaz: telefon, dikey ekran, 360–430 px genişlik. Masaüstünde ortada telefon genişliğinde görünür.
- Bilgisayarda yalnızca Node.js var (v26). Xcode yok, kurulmayacak.
- Kayıt cihazdaki tarayıcı deposunda (localStorage) tutulur.
- Dil: Türkçe. Para birimi: TL.

## Yaklaşımlar

| Yol | Artısı | Eksisi |
|-----|--------|--------|
| A) Düz HTML/JavaScript | Kurulum yok, en basit | Çok ekranlı oyunda kod dağılır |
| **B) React + Vite + TypeScript (seçilen)** | Menü/kart ağırlıklı oyuna uygun, düzenli, PWA kolay | Node gerekiyor (zaten kurulu) |
| C) Phaser gibi oyun motoru | Animasyon güçlü | Bu oyun menü ağırlıklı, gereksiz ağır, arayüz zorlaşır |

Kullanıcı B'yi seçti.

## Oyun tasarımı (kullanıcının kararları)

- Karakter Kerem, 12 yaşında başlar.
- İlk ticaret: bisiklet, güvercin gibi ikinci el eşyalar.
- Sonra motor alıp satar.
- Kazanılan para tekrar ticarete yatırılır. Amaç işi büyütmek.
- Oyun hızlı ilerler.

## Oyun tasarımı (Claude'un önerileri, kullanıcı itiraz etmedi)

### Aşamalar

| Aşama | Yaş | Mallar | Geçiş hedefi | Hedef süre |
|-------|-----|--------|--------------|------------|
| 1. Mahalle çocuğu | 12 | Bisiklet, güvercin, oyun konsolu, telefon | 50.000 TL | 10–15 dk |
| 2. Motorcu | 16 | İkinci el motor | 500.000 TL | ~20 dk |
| 3. Galerici | 18+ | Araba | Açık uçlu | — |

- Başlangıç sermayesi 2.000 TL.
- Depolama sınırı: 1. aşamada 3 eşya (Kerem'in odası), 2. aşamada 2 motor (apartman altı), 3. aşamada garaj kapasitesi. (Claude'un kararı.)
- Tamir ve bakım aynı gün içinde anında yapılır. Satış gün sonundaki tekliflerle gerçekleşir. (Claude'un kararı.)
- Hedefe ulaşınca kısa bir geçiş ekranı çıkar ("4 yıl sonra…"), yaş ve aşama ilerler. Yaş günlerle değil, aşama geçişleriyle ilerler. (Hızlı tempo için Claude'un kararı.)
- 3. aşamada amcanın sanayideki garajı devralınır.

### Bir oyun günü

1. **İlanlar:** Telefon içinde hayali bir ilan uygulaması. Her gün 4–6 yeni ilan çıkar.
2. **Alım ve pazarlık:** Teklif verilir. Satıcının gizli bir en düşük fiyatı ve sabrı vardır (örneğin 3 teklif hakkı). Sabır biterse satıcı vazgeçer.
3. **Hazırlama:** Tamir, temizlik, bakım. Her işin maliyeti var, durumu yükseltir. Güvercinde bakım işlemi değeri zamanla artırır.
4. **Satış:** Mal ilana konur, fiyat oyuncu tarafından belirlenir. Gün sonunda alıcılar teklif getirir. Oyuncu kabul eder, reddeder ya da karşı teklif verir.
5. **Gün sonu özeti:** Alınanlar, satılanlar, kâr/zarar, aşama hedefine ilerleme.

### Mallar ve değer

- Her malın piyasa değeri, durumu (0–100) ve gizli kusurları var.
- Satış değeri = temel değer × durum etkisi × mevsim/piyasa etkisi.
- Gizli kusur, ekspertiz yaptırılmadan görünmez. Ekspertiz 2. aşamada (motor) açılır ve ücretlidir.
- 1. aşamada ekspertiz yok. Kusurlar küçüktür, satıcıya "Bir bakayım" denerek ücretsiz ama yüzde 50 ihtimalle görülür. (Claude'un kararı.)
- Piyasa dalgalanır. Örnek: kışın 4x4 değerlenir, yazın üstü açık arabalar.

### Büyüme (3. aşama)

- **Garaj kapasitesi:** 1 → 2 → 4 → 8 araç.
- **Mekân:** sanayi garajı → mahalle galerisi → ana cadde showroom'u. Daha iyi mekân, daha zengin alıcı getirir.
- **Ustalık:** Kerem'in tamir becerisi tamir yaptıkça artar, maliyeti ve kayıp riskini düşürür.
- **Çalışanlar:** usta, boyacı, satış elemanı. Günlük maaş alırlar, işleri hızlandırır ya da otomatikleştirirler.
- **İtibar:** Dürüst satış itibarı artırır, daha çok ve daha iyi alıcı getirir. Kusur saklayarak satarsan yakalanma ihtimali var, yakalanırsan itibar düşer.
- **Banka kredisi:** Hızlı sermaye, günlük faiz.
- **Özel fırsatlar:** Mezat, hurdalık, nadir klasik araçlar.

### Nihai amaç

Şehrin en büyük galericisi olmak: en üst mekân ve en yüksek itibar. Ulaşınca bitiş ekranı çıkar, oyuncu isterse devam eder.

## Teknik yapı (Claude'un kararları)

- **Yığın:** Vite + React + TypeScript.
- **Durum yönetimi:** Tek bir oyun durumu nesnesi ve saf fonksiyonlarla güncellenen bir reducer. Oyun kuralları React'ten ayrı, `src/game/` altında, test edilebilir saf TypeScript olarak yazılır.
- **Kayıt:** Her işlemden sonra durum localStorage'a yazılır. Kayıtta sürüm numarası tutulur. Bozuk ya da eski kayıt oyunu çökertmez, oyuncuya "Yeni oyun" önerilir.
- **Rastgelelik:** Tohumlu rastgele sayı üretici. Böylece testler tekrarlanabilir.
- **PWA:** Web manifest ve service worker (vite-plugin-pwa). Çevrimdışı çalışır, ana ekrana eklenir.
- **Test:** Vitest ile oyun kuralları testleri (fiyat, pazarlık, gün akışı, aşama geçişi, kayıt).
- **Telefonda deneme:** `npm run dev -- --host` ile aynı Wi-Fi'deki telefondan açılır. Kalıcı yayın (ör. GitHub Pages) sonraki adımda konuşulur.

## Görsel tasarım (Claude'un kararları)

- Arayüz (butonlar, kartlar, menüler, ikonlar) kodla çizilir, dış görsel gerekmez.
- Tarz: koyu tema, kart tabanlı, modern bankacılık/ilan uygulamalarına benzer temiz görünüm. Tek vurgu rengi, büyük dokunma alanları (en az 44 px).
- Alt sekme çubuğu: İlanlar, Garaj, Satış, Profil.
- Mal görselleri ilk sürümde yer tutucu: basit SVG çizimler ya da ikonlar. Sonra kullanıcının getireceği (ör. Grok) görsellerle değiştirilir. Görseller `public/images/` altında, mal türüne göre adlandırılır, böylece sadece dosyayı değiştirmek yeter.

## Builder'a kalanlar

- Tam sayısal denge (fiyat aralıkları, olasılıklar). İlk değerler belgeye uygun olsun. Aşama süreleri hedefi tutturacak şekilde oynayarak ayarlanır.
- Mal listesinin tamamı ve hayali marka isimleri.
- Animasyon ve geçiş ayrıntıları.
