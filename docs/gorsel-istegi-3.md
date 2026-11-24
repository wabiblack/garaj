# Garaj oyunu: görsel isteği, 3. parti (ChatGPT / Codex için)

Bu metni olduğu gibi ChatGPT'ye (Codex) yapıştır. Toplam 15 görsel. Bunlar yeni gelen açılış hikâyesi,
öğretici, piyasa, banka, borsa ve aile bölümleri için.

---

Garaj oyunu için üçüncü parti görselleri üretmeni istiyorum. Proje klasörü: `Oyunlar/Garaj`.
İlk iki partide ürettiğin görsellerin (`src/assets/models`, `places`, `scenes`, `badges`) stiliyle **birebir
aynı** olsun: yüksek kaliteli stilize 3D, yumuşak sinematik ışık, temiz kenarlar, mobil oyun kalitesi.

## Kurallar (hepsi için)

1. **Yazı, logo, gerçek marka yok.** Okunabilir hiçbir yazı, rakam ya da tabela olmasın.
2. **Ana karakter yok.** Oyunun kahramanı (oyuncunun tasarladığı çocuk/genç) oyun içinde ayrıca çiziliyor.
   Resimlerde onu çizme. Dede, anne, baba gibi diğer kişiler olabilir.
3. **Kod dosyalarına dokunma.** Yalnız aşağıdaki dosyaları ekle. Oyun dosyaları adından tanır.
4. Biçim **WebP**, kalite 85, en çok 400 KB (aşarsa kaliteyi 80'e düşür).
5. Dosya adı tam olarak listedeki gibi olsun: küçük harf, Türkçe harf yok. Gerekirse klasörü oluştur.
6. Bitince `npm test` ve `npm run build` çalıştır, hata olmadığını doğrula. Yayınlama (`npm run deploy`) yapma.

## A) Açılış hikâyesi: `src/assets/scenes/` (4 dosya)

Oyun ilk açıldığında art arda gösterilen tam ekran sahneler. 1080×1920 (dikey), tam dolu. Önemli kısım
**üstteki %55'te** olsun; alt kısım koyulaştırılıp üstüne yazı geliyor. Sıcak, umutlu, mahalle havası.

| Dosya | Sahne |
|---|---|
| acilis-1.webp | Akşamüstü, eski bir mahalle garajı; kapısı yarı açık, içeride tezgâh, aletler ve duvara asılı eski bir bisiklet |
| acilis-2.webp | Yakın plan: tezgâhta yaşlı bir dedenin elleri bir bisiklet zincirini tamir ediyor; yanında çay bardağı |
| acilis-3.webp | Akşam, sıcak ışıklı aile mutfağı: sofra kurulmuş, anne ile baba masada sohbet ediyor (yüzleri yandan, kameraya bakmıyor) |
| acilis-4.webp | Sabah, güneşli mahalle sokağı: kaldırımda satılık birkaç eski eşya (bisiklet, kafes, eski telefon), ilerde dükkânlar |

## B) Karakter büstleri: `src/assets/ui/` (3 dosya)

Öğretici ipuçlarında ve aile bölümünde konuşan kişiler. 512×512, **şeffaf arka plan**, göğüsten yukarı,
hafif yana dönük, sıcak ve sevimli ifade. Üçü aynı aileden, aynı stilde olsun.

| Dosya | Kişi |
|---|---|
| dede.webp | Bıyıklı, gözlüklü, yelekli, güler yüzlü yaşlı dede; elinde küçük bir anahtar (alet) |
| anne.webp | Kırklı yaşlarda, şefkatli ama kararlı bakışlı anne; sade kazak |
| baba.webp | Kırklı yaşlarda, kısa sakallı baba; iş gömleği, kolları sıvanmış |

## C) Bölüm afişleri: `src/assets/ui/` (4 dosya)

Yeni "Finans" sekmesindeki bölümlerin üst görselleri. 1200×600 (yatay 2:1), tam dolu sahne. Ortadaki
konu net, kenarlar sade (üstüne başlık yazısı gelecek).

| Dosya | Sahne |
|---|---|
| piyasa.webp | Hareketli bir ikinci el pazarı: tezgâhlarda bisiklet, motor parçaları, fiyatlar inip çıkıyor hissi (yükselen/düşen oklar ışık olarak, yazısız) |
| banka.webp | Modern, aydınlık bir banka şubesi içi: gişe, kasa kapısı, sakin mavi tonlar |
| borsa.webp | Akşam, büyük ekranlarında yazısız yükselen/düşen grafik çizgileri olan bir borsa salonu |
| aile.webp | Bahçeli bir evin önü, akşamüstü; kapıda bekleyen anne ile baba, sıcak ışık |

## D) Borsa şirket simgeleri: `src/assets/stocks/` (4 dosya)

Oyundaki uydurma şirketlerin simgeleri. 256×256, **şeffaf arka plan**, yuvarlak rozet içinde tek bir sade
simge. Yazı ve harf yok. Her biri farklı renkte olsun.

| Dosya | Şirket | Simge |
|---|---|---|
| lastik.webp | Lastik fabrikası | Lastik (kara, turuncu vurgulu) |
| parca.webp | Yedek parça üreticisi | Dişli çark ve İngiliz anahtarı (gri, mavi vurgulu) |
| galeri.webp | Oto galeri zinciri | Parlayan araba silueti (altın sarısı) |
| lojistik.webp | Kurye ve taşımacılık | Hızla giden kamyonet (yeşil) |
