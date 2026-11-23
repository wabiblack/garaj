# Garaj oyunu: görsel isteği (ChatGPT / Codex için)

Bu metni olduğu gibi ChatGPT'ye (Codex) yapıştır.

---

Garaj adlı bir mobil oyun için görsel üretmeni istiyorum. Oyun Türkçe; 12 yaşında bir çocuğun ikinci el
eşya alıp satarak büyüyüp galerici olmasını anlatıyor. Proje klasörü: `Oyunlar/Garaj`.

## Kurallar (hepsi için)

1. **Tek ve tutarlı stil:** "yüksek kaliteli stilize 3D oyun varlığı, yumuşak stüdyo ışığı, hafif parlak
   yüzeyler, temiz kenarlar, mobil oyun kalitesi". Bütün resimler aynı oyundan çıkmış gibi görünsün.
2. **Yazı, logo ve gerçek marka yok.** Markalar hayalî. Plaka, amblem, marka adı ya da okunabilir yazı koyma.
3. **Kod dosyalarına dokunma.** Yalnız aşağıdaki klasörlere resim dosyası ekle. Oyun bu dosyaları adından tanır.
4. Dosya adı tam olarak listedeki gibi olsun: küçük harf, Türkçe harf yok.
5. Her dosya en çok 400 KB olsun. Gerekirse sıkıştır ya da `.webp` olarak kaydet (aynı ad, `.webp` uzantısı).
6. Bitince şunu çalıştır ve hata olmadığını doğrula: `npm test` ve `npm run build`. Yayınlama (`npm run deploy`) yapma.

## A) Eşya resimleri: `src/assets/models/<dosya>.png`

- 1200×800 piksel (3:2), **şeffaf arka plan**, gölge yok, zemin yok.
- Nesne ortada, genişliğin yaklaşık %80'ini kaplasın.
- Araç, motor, bisiklet ve güvercin **yandan görünüşte, burnu sağa bakacak**. Konsol ve telefon hafif
  açılı önden görünüş.
- Yeni, temiz ve bakımlı görünsünler. Kir, pas ve hasar oyunda ayrıca gösteriliyor.

| Dosya | Tür | Ne çizilecek |
|---|---|---|
| serce-sehir-26.png | Bisiklet | Turkuaz şehir bisikleti, önde hasır sepet, çamurluklar, zil |
| serce-dag-pro.png | Bisiklet | Turuncu dağ bisikleti, kalın dişli lastikler, ön amortisör, matara |
| kanat-bmx.png | Bisiklet | Kırmızı BMX, küçük tekerler, alçak sele, peg'ler |
| kanat-katlanir.png | Bisiklet | Gümüş-beyaz katlanır bisiklet, küçük tekerler, uzun sele borusu |
| ruzgargulu-yaris-28.png | Bisiklet | Sarı yol yarış bisikleti, ince lastikler, koç boynuzu gidon |
| taklaci-ankara.png | Güvercin | Beyaz-gri taklacı güvercin, kanatta koyu gri çizgiler |
| donek-edirne.png | Güvercin | Kızıl-kahve dönek güvercin, benekli tüyler |
| posta-belcika-tipi.png | Güvercin | Mavi-gri posta güverci, boynunda yeşil-mor yanardöner tüyler |
| hunkari-gosteri.png | Güvercin | Bembeyaz gösteri güverci, yelpaze kuyruk, başta tepelik |
| kelebek-konya.png | Güvercin | Beyaz gövde, siyah kanatlı ve siyah kuyruklu güvercin |
| oynat-box-4.png | Oyun konsolu | Siyah, yatay kutu konsol ve yanında siyah oyun kolu |
| oynat-box-5-slim.png | Oyun konsolu | Beyaz ince konsol ve yanında beyaz oyun kolu |
| piksel-go.png | Oyun konsolu | El konsolu: koyu gövde, iki yanı turuncu, ortada ekran |
| piksel-station.png | Oyun konsolu | Siyah, dik duran, mavi ışık şeritli büyük konsol, yanında kol |
| tusla-mini.png | Oyun konsolu | Lacivert-gri küçük retro konsol, yeşil ışıklar, yanında kol |
| piril-p12.png | Telefon | Mavi akıllı telefon, arkada çift kamera |
| piril-p14-pro.png | Telefon | Grafit gri telefon, arkada üçlü kamera, gümüş çerçeve |
| nokta-mini-5.png | Telefon | Pembe küçük telefon, tek kamera |
| nokta-max.png | Telefon | Siyah büyük telefon, dört kamera, altın detay |
| ekran-lite.png | Telefon | Mint yeşili telefon, hap biçimli çift kamera |
| kartal-k125.png | Motosiklet | Kırmızı klasik 125 cc naked motor, yuvarlak far |
| kartal-sport-250.png | Motosiklet | Mavi spor motor, kaporta, alçak gidon |
| yildirim-scooter-150.png | Motosiklet | Mint yeşili retro scooter, küçük tekerler |
| yildirim-tour-650.png | Motosiklet | Antrasit touring motor, altın jantlar, yan çantalar |
| bozkir-enduro-300.png | Motosiklet | Turuncu enduro motor, dişli arazi lastikleri, yüksek çamurluk |
| doruk-sedan-1-6.png | Araba | Mavi 4 kapılı aile sedanı |
| doruk-hatchback.png | Araba | Kırmızı 5 kapılı hatchback |
| tunca-arazi-4x4.png | Araba | Yeşil kutu biçimli arazi aracı, tavan rayı, kalın arazi lastikleri |
| tunca-station.png | Araba | Gümüş gri station wagon |
| akdag-roadster.png | Araba | Sarı iki kişilik üstü açık spor araba |
| marmara-gt-coupe.png | Araba | Siyah GT coupe, yanlarda altın şerit |
| doruk-klasik-1972.png | Araba | Krem rengi 1970'ler klasik sedanı, krom tamponlar |
| marmara-klasik-coupe-1968.png | Araba | Turkuaz 1960'lar klasik coupe, krom detaylar |

## B) Tür resimleri: `src/assets/categories/<dosya>.png`

Aynı kurallar (1200×800, şeffaf). Her türün tipik, sade bir örneği:
`bisiklet.png`, `guvercin.png`, `konsol.png`, `telefon.png`, `motor.png`, `araba.png`.

## C) Mekân resimleri: `src/assets/places/<dosya>.png`

- 1600×700 piksel (16:7), **tam dolu sahne** (şeffaf değil), aynı 3D stil, gündüz.
- Okunabilir yazı ve tabela yazısı yok. Oyun, oyuncunun adını **üst ortadaki** alana kendisi yazıyor:
  resmin yatayda %30–%70, dikeyde %5–%20 arası bölgesine önemli bir şey koyma.
- Sahne alttan kırpılabilir; önemli kısım ortada olsun.

| Dosya | Ne çizilecek |
|---|---|
| oda.png | Çocuk odası: yatak, masa, duvarda poster, köşede bisiklet ve oyun konsolu |
| apartman.png | Apartmanın altındaki küçük dükkân/garaj; önünde bir scooter ve motor |
| sanayi.png | Sanayi sitesinde eski bir oto tamir garajı; kaldırma lifti, alet duvarı |
| galeri.png | Mahalle oto galerisi; camlı cephe, önünde ve içinde birkaç araba, bayraklar |
| showroom.png | Ana caddede modern, büyük camlı lüks oto showroom; parlak zemin, spot ışıklar |
| holding.png | Şehir merkezinde cam kaplı modern holding binası; önünde lüks arabalar |

## Gerekmeyenler

- **Karakter portreleri:** üretme. Oyuncu ten, saç, renk ve gözlük seçiyor. Portreler bu seçimlere göre
  kodda çiziliyor; hazır resim bu seçimleri bozar.
- Uygulama simgesi ve arayüz düğmeleri.
