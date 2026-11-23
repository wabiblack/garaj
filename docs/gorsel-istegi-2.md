# Garaj oyunu: görsel isteği, 2. parti (ChatGPT / Codex için)

Bu metni olduğu gibi ChatGPT'ye (Codex) yapıştır. Toplam 29 görsel; önce A, B, C bölümlerini bitir.

---

Garaj oyunu için ikinci parti görselleri üretmeni istiyorum. Proje klasörü: `Oyunlar/Garaj`.
İlk partide ürettiğin 45 görselin (`src/assets/models`, `categories`, `places`) stiliyle **birebir aynı**
olsun: yüksek kaliteli stilize 3D, yumuşak stüdyo ışığı, temiz kenarlar, mobil oyun kalitesi.

## Kurallar (hepsi için)

1. **Yazı, logo, gerçek marka yok.** Okunabilir hiçbir yazı olmasın.
2. **Ana karakter yok.** Oyunun kahramanı (oyuncunun tasarladığı çocuk/genç) oyun içinde ayrıca çiziliyor.
   Resimlerde onu çizme. Diğer kişiler (öğretmen, polis vb.) olabilir.
3. **Kod dosyalarına dokunma.** Yalnız aşağıdaki dosyaları ekle ya da değiştir. Oyun dosyaları adından tanır.
4. Biçim **WebP**, kalite 85, en çok 400 KB (aşarsa kaliteyi 80'e düşür). İstisna: A bölümündeki
   simgeler PNG olacak.
5. Dosya adı tam olarak listedeki gibi olsun: küçük harf, Türkçe harf yok. Gerekirse klasörü oluştur.
6. Bitince `npm test` ve `npm run build` çalıştır, hata olmadığını doğrula. Yayınlama (`npm run deploy`) yapma.

## A) Uygulama simgesi: `public/` (3 dosya, mevcutların üzerine yaz)

Telefonun ana ekranında görünen simge. Tek bir tasarım, üç boyutta:

- Tasarım: koyu lacivert-antrasit zemin (#0e1116 civarı) üzerinde altın sarısı (#f5b700) garaj kapısı
  simgesi; kapı yarı açık, içinden sıcak ışık ve bir arabanın ön farları seçiliyor. Sade, kalın hatlı,
  küçükken de okunur. Yazı yok.
- **Tam dolu kare**, şeffaflık yok, köşeleri yuvarlatma (telefon kendisi yuvarlatıyor).
- Önemli kısım ortadaki %70'lik alanda kalsın (Android simgeyi daireye kırpabiliyor).

| Dosya | Ölçü |
|---|---|
| public/icon-512.png | 512×512 |
| public/icon-192.png | 192×192 |
| public/apple-touch-icon.png | 180×180 |

## B) Ana menü arka planı: `src/assets/ui/menu.webp`

- 1080×1920 (dikey 9:16), tam dolu sahne.
- Akşam saatinde, sıcak ışıklı bir garaj/galeri önü; parlak ıslak zemin, kapı aralığından içerideki
  ışık, birkaç güzel araba silueti.
- **Üstteki %35 sakin ve koyu** olsun (gökyüzü/duvar): oyun logosu oraya gelecek.
- **Alttaki %40 koyu ve sade** olsun: menü düğmeleri oraya gelecek. Asıl ilgi çekici kısım ortada.

## C) Dönem geçiş sahneleri: `src/assets/scenes/` (3 dosya)

Kahraman büyüdükçe çıkan tam ekran sahneler. 1080×1920 (dikey), tam dolu. Önemli kısım **üstteki
%55'te** olsun; alt kısım koyulaştırılıp üstüne yazı geliyor.

| Dosya | Sahne |
|---|---|
| donem-2.webp | 16 yaş: gün batımında şehir yolunda duran kırmızı klasik bir motosiklet, arkada şehir |
| donem-3.webp | 18 yaş: sanayi sitesinde eski ama sevimli bir oto garajı, kapısı açık, içeride kaldırma lifti |
| donem-4.webp | 25 yaş: şehir merkezinde cam kaplı modern holding binası, akşam ışıkları, önünde lüks arabalar |

## D) Başarım rozetleri: `src/assets/badges/` (14 dosya)

- 512×512, **şeffaf arka plan**, madalya/rozet tarzı: yuvarlak ya da kalkan biçimli metal çerçeve, ortada
  konuyu anlatan sade bir simge. Hepsi aynı çerçeve ailesinden olsun; renkler değişebilir.
- Oyun kazanılmamış rozetleri otomatik griye çeviriyor; sen hepsini renkli üret.

| Dosya | Başarım | Ortadaki simge fikri |
|---|---|---|
| ilk-satis.webp | İlk satış | El sıkışma |
| pazarlikci.webp | Pazarlıkçı | Aşağı ok ve fiyat etiketi |
| durust-esnaf.webp | Dürüst esnaf | Kalp ya da onay işareti olan kalkan |
| koleksiyoncu.webp | Koleksiyoncu | Parlayan değerli taş |
| buyuk-vurgun.webp | Büyük vurgun | Altın para yığını |
| motorcu.webp | Motorcu | Motosiklet kaskı |
| galerici.webp | Galerici | Araba anahtarı |
| showroom.webp | Showroom sahibi | Spot ışığı altında araba |
| borcsuz.webp | Borçsuz | Kırık zincir |
| sampiyon.webp | Şehrin bir numarası | Kupa |
| mezatci.webp | Mezatçı | Mezat tokmağı |
| siparisci.webp | Sözünün eri | Teslim edilmiş paket ve onay işareti |
| rakip.webp | Rakibe geçit yok | Kalkan ve şimşek |
| holding.webp | Holding patronu | Üç gökdelen |

## E) Hikâye sahneleri: `src/assets/scenes/` (10 dosya)

Kısa hikâye anlarında arka plan. 1080×1920 (dikey), tam dolu, **üstteki %50'de** sahne, alt kısım sade.
Kişiler varsa doğal dursun, kameraya bakmasın; kahramanı çizme.

| Dosya | Sahne |
|---|---|
| hikaye-okul.webp | Sınıf: tahta, sıralar, öğretmen masasında karneler |
| hikaye-kardes.webp | Çocuk odası kapısı, küçük kız çocuğunun okul çantası ve gezi broşürü |
| hikaye-dede.webp | Bahçede çay bardakları, yaşlı bir dedenin elleri ve tespihi, eski bir at nalı |
| hikaye-ehliyet.webp | Akşam yol kenarı: trafik polisinin motosikleti ve dönen mavi ışık |
| hikaye-cirak.webp | Sanayide bir usta dükkânı: tezgâhta açılmış motor, aletler |
| hikaye-amca-borc.webp | Eski bir yedek parça dükkânı: raflar, tezgâhta açık bir veresiye defteri |
| hikaye-dugun.webp | Çiçeklerle süslenmiş beyaz bir gelin arabası, kurdeleler |
| hikaye-vergi.webp | Masada dosyalar, hesap makinesi, gözlük ve resmi evrak yığını |
| hikaye-cevdet-ortak.webp | Gece, iki galerinin karşı karşıya durduğu sokak; aralarında el sıkışmaya uzanmış iki el |
| hikaye-roportaj.webp | Modern ofis: masada mikrofon, kamera ve parlak bir gazete |
