# Garaj oyunu: görsel isteği, 4. parti (ChatGPT / Codex için)

Bu metni olduğu gibi ChatGPT'ye (Codex) yapıştır. Toplam 94 görsel. Önce A ve B bölümlerini bitir.
Bunlar yeni eşya türleri, yeni tamir mini oyunu (söküm, parça siparişi, montaj), hayvan bakımı ve belgeler için.

---

Garaj oyunu için dördüncü parti görselleri üretmeni istiyorum. Proje klasörü: `Oyunlar/Garaj`.
Önceki partilerde ürettiğin görsellerin (`src/assets/models`, `categories`, `places`, `scenes`, `badges`, `ui`,
`stocks`) stiliyle **birebir aynı** olsun: yüksek kaliteli stilize 3D, yumuşak stüdyo ışığı, temiz kenarlar,
mobil oyun kalitesi.

## Kurallar (hepsi için)

1. **Yazı, logo, gerçek marka yok.** Okunabilir hiçbir yazı, rakam ya da tabela olmasın. Markalar hayalidir;
   gerçek bir ürüne benzemesin.
2. **Ana karakter yok.** Oyunun kahramanı oyun içinde ayrıca çiziliyor; resimlerde onu çizme.
3. **Kod dosyalarına dokunma.** Yalnız aşağıdaki dosyaları ekle. Oyun dosyaları adından tanır.
4. Biçim **WebP**, kalite 85, en çok 400 KB (aşarsa kaliteyi 80'e düşür).
5. Dosya adı tam olarak listedeki gibi olsun: küçük harf, Türkçe harf yok. Gerekirse klasörü oluştur.
6. Bitince `npm test` ve `npm run build` çalıştır. Yayınlama (`npm run deploy`) yapma.
   Not: Ben bu sırada aynı projede kod yazıyor olacağım. `npm test` görsellerle ilgisiz bir yerde hata verirse
   düzeltmeye çalışma, yalnız raporuna yaz.

## A) Yeni eşya türleri ve modelleri (43 dosya)

Mevcut `src/assets/categories/*.webp` ve `src/assets/models/*.webp` ile **aynı biçim**: 1200×800, şeffaf arka
plan, eşya ortada, hafif yandan, yere düşen yumuşak gölge. Hayvanlar sevimli ve sağlıklı görünsün.

### A1) Tür görselleri: `src/assets/categories/` (14 dosya)

| Dosya | Tür |
|---|---|
| kaykay.webp | Kaykay |
| scooter.webp | Çocuk scooter'ı (ayakla itilen) |
| kulaklik.webp | Kulak üstü kulaklık |
| kart.webp | Koleksiyon kartları destesi (kartların yüzünde yazı yok, yalnız renkli desen) |
| kus.webp | Kafeste muhabbet kuşu |
| balik.webp | Küçük akvaryumda süs balıkları |
| kopek.webp | Yavru köpek, oturur hâlde |
| escooter.webp | Elektrikli scooter |
| bilgisayar.webp | Oyun bilgisayarı kasası (yan kapağı cam, içi ışıklı) |
| kamera.webp | Aynasız fotoğraf makinesi ve objektif |
| gitar.webp | Akustik gitar |
| karavan.webp | Çekme karavan |
| tekne.webp | Küçük motorlu tekne (römork üstünde) |
| ismakinesi.webp | Kazı makinesi (ekskavatör) |

### A2) Model görselleri: `src/assets/models/` (29 dosya)

Aynı türün iki modeli birbirinden açıkça farklı görünsün (renk, biçim, boy).

| Dosya | Tür | Görünüm |
|---|---|---|
| dalga-street-31.webp | Kaykay | Geniş, grafiti desenli sokak kaykayı |
| dalga-pro-8.webp | Kaykay | İnce, profesyonel, sade koyu tabla |
| cekirge-mini.webp | Scooter | Küçük çocuk scooter'ı, üç tekerlekli, pastel |
| cekirge-trick.webp | Scooter | Akrobasi scooter'ı, kalın gidon, metal |
| sessiz-pro.webp | Kulaklık | Gürültü önleyici, siyah, şık |
| sessiz-bas.webp | Kulaklık | Büyük, renkli, oyuncu kulaklığı (mikrofonlu) |
| efsane-futbol-seti.webp | Kart | Futbol temalı kart albümü ve kartlar (yüzler sadece siluet, yazı yok) |
| ejder-birinci-seri.webp | Kart | Fantastik yaratık kartları, parlak holografik |
| muhabbet-yesil.webp | Kuş | Yeşil-sarı muhabbet kuşu, kafes içinde |
| kanarya-sari.webp | Kuş | Sarı kanarya, kafes içinde |
| japon-baligi.webp | Balık | Turuncu japon balıkları, yuvarlak fanus |
| lepistes-cift.webp | Balık | Renkli lepistes balıkları, küçük dikdörtgen akvaryum |
| kangal-sivas.webp | Köpek | Kangal yavrusu, krem rengi, kara maskeli |
| golden-retriever.webp | Köpek | Golden retriever yavrusu |
| karabas-melez.webp | Köpek | Sevimli melez sokak yavrusu, alacalı |
| volt-s1.webp | Elektrikli scooter | Şehir tipi, beyaz, ince |
| volt-max.webp | Elektrikli scooter | Kalın tekerli, güçlü, koyu gri |
| cip-oyun-kasasi.webp | Bilgisayar | RGB ışıklı oyun kasası |
| cip-ekran-karti.webp | Bilgisayar | Tek başına ekran kartı, üç fanlı |
| objektif-z50.webp | Kamera | Aynasız fotoğraf makinesi, siyah |
| objektif-aksiyon.webp | Kamera | Küçük aksiyon kamerası, su geçirmez kılıfta |
| tel-klasik.webp | Gitar | Klasik gitar, açık renk ahşap |
| tel-elektro.webp | Gitar | Kırmızı elektro gitar |
| yayla-cekme-4.webp | Karavan | Yuvarlak hatlı, retro çekme karavan |
| yayla-motokaravan.webp | Karavan | Kamyonet tabanlı motokaravan |
| marti-balikci-6.webp | Tekne | Ahşap balıkçı teknesi, mavi-beyaz |
| marti-surat-7.webp | Tekne | Beyaz sürat teknesi |
| toprak-kepce.webp | İş makinesi | Kazıcı yükleyici (kepçe), sarı |
| toprak-ekskavator.webp | İş makinesi | Paletli ekskavatör, sarı |

## B) Tamir mini oyunu: aletler ve parçalar (35 dosya)

Hepsi 256×256, **şeffaf arka plan**, tek nesne, hafif yukarıdan bakış, aynı ışık ve ölçek hissi. Küçükken de
anlaşılır olsun.

### B1) Aletler: `src/assets/tools/` (12 dosya)

| Dosya | Alet |
|---|---|
| tornavida-duz.webp | Düz uçlu tornavida |
| tornavida-yildiz.webp | Yıldız uçlu tornavida |
| anahtar.webp | İngiliz anahtarı |
| lokma.webp | Lokma takımı (cırcır kolu ve bir lokma) |
| pense.webp | Pense |
| vantuz.webp | Telefon ekranı vantuzu |
| isi-tabancasi.webp | Isı tabancası |
| yama-kiti.webp | Bisiklet iç lastik yama kiti |
| sprey-boya.webp | Sprey boya kutusu |
| ariza-cihazi.webp | Araç arıza tespit cihazı (kablolu, küçük ekranlı; ekranda yazı yok) |
| olcu-aleti.webp | Ölçü aleti (multimetre, problu) |
| tork-anahtari.webp | Tork anahtarı |

### B2) Parçalar: `src/assets/parts/` (23 dosya)

| Dosya | Parça |
|---|---|
| vida.webp | Birkaç vida ve somun |
| zincir.webp | Bisiklet/motor zinciri |
| ic-lastik.webp | Bisiklet iç lastiği |
| fren-balatasi.webp | Fren balatası |
| jant.webp | Bisiklet jantı |
| ekran.webp | Telefon ekranı (camı) |
| batarya.webp | Telefon bataryası |
| kamera-modulu.webp | Telefon kamera modülü |
| kol.webp | Oyun konsolu kolu |
| fan.webp | Küçük soğutma fanı |
| disk-okuyucu.webp | Konsol disk okuyucu |
| debriyaj.webp | Debriyaj balatası/diski |
| karburator.webp | Karbüratör |
| conta.webp | Motor contası |
| sanziman.webp | Şanzıman (dişli kutusu) |
| triger-kayisi.webp | Triger kayışı |
| motor-yagi.webp | Motor yağı bidonu (etiketsiz) |
| kaporta.webp | Araba kapı paneli (kaporta parçası) |
| aku.webp | Akü |
| buji.webp | Buji |
| anakart.webp | Bilgisayar anakartı |
| gitar-teli.webp | Gitar teli (sarılı set) |
| lens.webp | Fotoğraf makinesi objektifi |

## C) Hayvan bakımı: `src/assets/care/` (9 dosya)

256×256, şeffaf arka plan, tek nesne, sevimli ve sade.

| Dosya | Nesne |
|---|---|
| mama.webp | Mama kabı (dolu) |
| su.webp | Su kabı |
| yem.webp | Kuş yemi (küçük torba ve avuç dolusu tohum) |
| ilac.webp | Veteriner ilacı (damlalık şişesi, etiketsiz) |
| asi.webp | Veteriner aşı kartı ve küçük şırınga (korkutucu olmasın) |
| firca.webp | Tüy fırçası |
| sampuan.webp | Hayvan şampuanı (etiketsiz) |
| tasma.webp | Köpek tasması ve kayışı |
| kargo.webp | Kargo kutusu (internetten parça siparişi için) |

Ayrıca: `src/assets/ui/kedi.webp`: 512×512, şeffaf arka plan, garajda yaşayan tekir kedi, oturur hâlde,
göğüsten yukarı değil, tüm vücut. Dede, anne, baba büstleriyle aynı stil.

## D) Belgeler: `src/assets/docs/` (6 dosya)

256×256, şeffaf arka plan, hafif eğik duran belge/kart. **Üzerinde okunabilir yazı olmasın**: yalnız çizgiler,
kutular, mühür ve fotoğraf yeri gibi biçimler.

| Dosya | Belge |
|---|---|
| ruhsat.webp | Araç ruhsatı (katlanmış kart) |
| noter.webp | Noter satış sözleşmesi (mühürlü kâğıt) |
| ekspertiz.webp | Ekspertiz raporu (klasör içinde, araba şeması çizili) |
| ehliyet.webp | Sürücü belgesi kartı |
| sigorta.webp | Sigorta poliçesi (kalkan simgeli kâğıt) |
| karne.webp | Okul karnesi (kapaklı, yıldız çıkartmalı) |

## E) Mini oyun zeminleri ve sahne: `src/assets/scenes/` (4 dosya)

| Dosya | Ölçü | Sahne |
|---|---|---|
| tezgah.webp | 1080×1080 | Tam yukarıdan bakış: ahşap tamir tezgâhı, kenarlarda birkaç alet; **ortası boş** (parçalar oraya gelecek) |
| lift.webp | 1080×1080 | Garajda kaldırma liftine alınmış bir arabanın altı, aşağıdan bakış; ortası sade |
| bakim-masasi.webp | 1080×1080 | Tam yukarıdan bakış: hayvan bakım masası, havlu, ortası boş |
| ehliyet-sinavi.webp | 1080×1920 | Sürücü kursu sahası: konlar, çizgiler, bir eğitim arabası; üst %55'te önemli kısım |
